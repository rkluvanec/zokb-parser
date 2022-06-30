let fs = require("fs");
let pdflib = require("pdf-lib");
let header = require("./header.json");
let crypto = require("crypto");
let path = require("path");

// Konfiguracne premenne na enkrypciu
const keypath_public = "./keys/public.pem";
const algorithm = "aes-256-cbc";
const inputEncoding = "hex";
const keySize = 256 / 8;
const ivSize = 128 / 8;
const iterations = 100;

// Pomocna funkcia na nahradenie znakov
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

// Pomocna funkcia na RSA encryption stringov
function encryptRSA(toEncrypt, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toEncrypt, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

// Pomocna funkcia na AES enkrypciu suborov
function encryptFileAES(key, iv, inputFile, outputFile) {
  const inputData = fs.readFileSync(inputFile);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const output = Buffer.concat([cipher.update(inputData), cipher.final()]);
  fs.writeFileSync(outputFile, output);
}

// Funkcia na enkrypciu suboru
function encryptFileGenerateKey(folder, file) {
  // Vygenerovanie nahodneho hesla a soli
  var masterKey = crypto.randomBytes(8).toString("hex");
  var salt = crypto.randomBytes(4).toString("hex");
  var masterKeyBuffer = Buffer.from(masterKey, "hex");
  var saltBuffer = Buffer.from(salt, "hex");
  var outputKey = crypto.pbkdf2Sync(
    masterKeyBuffer,
    saltBuffer,
    iterations,
    keySize + ivSize,
    "sha1"
  );

  // Ziskat kluc a IV z hesla a soli
  var buffer = Buffer.from(outputKey, inputEncoding);
  var secretKey = buffer.slice(0, keySize);
  var iv = buffer.slice(keySize, keySize + ivSize);

  // Enkrypcia suboru
  encryptFileAES(
    secretKey,
    iv,
    folder + file,
    folder + "archive/" + file + ".asc"
  );

  // Enkrypcia klucov
  const enc = encryptRSA(file + "," + masterKey + "," + salt, keypath_public);
  fs.writeFileSync(folder + "archive/" + file + ".key", enc, "utf8");

  // Odstranenie raw subora
  try {
    fs.unlinkSync(folder + file);
    //file removed
  } catch (err) {
    console.error(err);
  }
}

// Archivovat subor
function archiveFile(folder, file, success = false) {
  if (success) {
    // archivacia spracovaneho suboru
    console.log("Súbor " + file + " spracovaný");
    /*fs.rename(file, file + "_done", function(err) {
            if (err) throw err;
        });    */
    encryptFileGenerateKey(folder, file);
  } else {
    // archivacia chybneho suboru
    console.log("Súbor " + file + " preskočený");
    if (file.endsWith(".pdf")) {
      fs.rename(folder + file, folder + file + "_retry", function (err) {
        if (err) throw err;
      });
    } else {
      fs.rename(
        folder + file,
        folder + "archive/" + file + "_error",
        function (err) {
          if (err) throw err;
        }
      );
    }
  }
}

// Funkcia na spracovanie PDF formularu
function parseFile(folder, file, export_file) {
  // Otvorenie filestreamu
  var filesync = fs.readFileSync(folder + file);

  // Nacitanie pdf
  pdflib.PDFDocument.load(filesync).then((document) => {
    // Nacitanie formu
    var form = document.getForm();
    var form_fields = form.getFields();
    var data = [];

    // Nacitat header PDF formu
    for (var item in form_fields) {
      data.push(form_fields[item].getName());
    }

    // kontrola, ci ide o formular ZoKB
    for (var field in data) {
      // Kontrola ci existuje pole z formularu v ocakavanom headeru
      var answer = header.find((x) => x.id == data[field]);
      if (!answer) {
        console.log("Chýbajúce políčko " + data[field]);
        console.log("Súbor " + file + " nie je formulár ZoKB, preskakujem...");
        archiveFile(file, false);
        return;
      }
    }

    // Spracovanie zadanych odpovedi
    var data_export = "";
    for (var field in header) {
      // Spracovat odpoved podla typu vstupneho pola
      if (header[field].type == "text") {
        try {
          var answer = form.getTextField(header[field].id).getText();
          data_export += '"' + replaceAll(answer, '"', '""') + '",';
        } catch (err) {
          data_export += '"",';
        }
      } else if (header[field].type == "dropdown") {
        try {
          var answer = form.getDropdown(header[field].id).getSelected()[0];
          data_export += '"' + replaceAll(answer, '"', '""') + '",';
        } catch (err) {
          data_export += '"",';
        }
      } else if (header[field].type == "radio") {
        try {
          var answer = form.getRadioGroup(header[field].id).getSelected();
          if (answer) {
            data_export += '"' + replaceAll(answer, '"', '""') + '",';
          } else {
            data_export += '"",';
          }
        } catch (err) {
          data_export += '"",';
        }
      } else if (header[field].type == "ignore") {
        data_export += '"",';
      }
    }

    // Zapisat spracovane odpovede do CSV suboru
    fs.appendFile(export_file, data_export + "\r\n", "utf8", function (err) {
      if (err) throw err;
    });

    archiveFile(folder, file, true);
  });

  return;
}

// Funkcia na zapis hlavicky s otazkami do CSV suboru
function printHeader(export_file) {
  // Zostavenie hlavicky
  var data_header = [];
  for (var field in header) {
    data_header += '"' + replaceAll(header[field].id, '"', '""') + '",';
  }

  // zapis hlavicky + uft8 BOM symbolu pre potreby MS Excel
  fs.writeFile(
    export_file,
    "\uFEFF" + data_header + "\r\n",
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
}

// Vyziadanie zoznamu vsetkych PDF suborov v priecinku na import
function getPdfFiles(import_folder) {
  var pdf_files = [];

  fs.readdirSync(import_folder).forEach((file) => {
    if (file.endsWith(".pdf") || file.endsWith(".pdf_retry")) {
      pdf_files.push(file);
    }
  });
  return pdf_files;
}

// Hlavna fukncia
function main() {
  console.log("Script has been activated");
  // definicia pouzitych suborov a priecinkov
  let date_ob = new Date();
  let import_folder = "./import/";
  //let export_file = './export/zokb_export_' + replaceAll(date_ob.toISOString(),":","-").slice(0,16) + '.csv'
  let export_file = "./export/zokb_export.csv";

  // tlac hlavicky ak databaza neexistuje
  try {
    if (!fs.existsSync(export_file)) {
      printHeader(export_file);
    }
  } catch (err) {
    console.error(err);
  }

  // spracovanie jednotlivych PDF suborov
  const files = getPdfFiles(import_folder);
  for (const file of files) {
    // Spracovanie suboru
    //var file_direct = import_folder + file;
    console.log("Spracovavam subor " + file + "...");
    var success = parseFile(import_folder, file, export_file);
  }
}

main();

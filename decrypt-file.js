const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// Load keys

const algorithm = "aes-256-cbc";
const inputEncoding = "hex";
const keySize = 256 / 8;
const ivSize = 128 / 8;
const iterations = 100;

function decryptRSA(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
  const privateKey = fs.readFileSync(absolutePath, "utf8");
  const buffer = Buffer.from(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
    },
    buffer
  );
  return decrypted.toString("utf8");
}

function decryptFileAES(key, iv, inputFile, outputFile) {
  const inputData = fs.readFileSync(inputFile);
  const cipher = crypto.createDecipheriv(algorithm, key, iv);
  const output = Buffer.concat([cipher.update(inputData), cipher.final()]);
  fs.writeFileSync(outputFile, output);
}

function decryptFile(key, path) {
  const fs = require("fs");
  fs.readFile(path.slice(0, -4)  + ".key", "utf8", (err, rawdata) => {
    if (err) {
      console.log(err);
    } else {
      data = decryptRSA(rawdata, key);

      data = data.split(","); // split the document into lines
      data.length = 3; // set the total number of lines to 2

      var pathCheck = data[0];
      var masterKey = Buffer.from(data[1], "hex");
      var salt = Buffer.from(data[2], "hex");
      var outputKey = crypto.pbkdf2Sync(
        masterKey,
        salt,
        iterations,
        keySize + ivSize,
        "sha1"
      );

      // obtain key and IV  splitting outputKey
      var buffer = Buffer.from(outputKey, inputEncoding);
      var secretKey = buffer.slice(0, keySize);
      var iv = buffer.slice(keySize, keySize + ivSize);

      decryptFileAES(secretKey, iv, path, path.slice(0, -4));
    }
  });
}

const args = process.argv.slice(2);
const keypath = args[0];
const filepath = args[1];
decryptFile(keypath, filepath);

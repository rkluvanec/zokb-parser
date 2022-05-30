let fs = require('fs');
let pdflib = require('pdf-lib')
let header = require('./header.json')

// Pomocna funkcia na nahradenie znakov
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
  

function archiveFile(file, success = false){
    if(success){
        // archivacia spracovaneho suboru
        console.log("Súbor " + file + " spracovaný")
        fs.rename(file, file + "_done", function(err) {
            if (err) throw err;
        });    
    } else {
        // archivacia chybneho suboru
        console.log("Súbor " + file + " preskočený")
        if(file.endsWith(".pdf")){
            fs.rename(file, file + "_retry", function(err) {
                if (err) throw err;
            }); 
        } else {
            fs.rename(file, file + "_error", function(err) {
                if (err) throw err;
            }); 
        }
    }
}

// Funkcia na spracovanie PDF formularu
function parseFile(file, export_file){

    // Otvorenie filestreamu
    var filesync = fs.readFileSync(file)

    // Nacitanie pdf
    pdflib.PDFDocument.load(filesync)
    .then((document) => {

        // Nacitanie formu
        var form = document.getForm()
        var form_fields = form.getFields();
        var data = [];
        
        // Nacitat header PDF formu
        for(var item in form_fields){
            data.push(form_fields[item].getName())
        }

        // kontrola, ci ide o formular ZoKB
        for(var field in data){

            // Kontrola ci existuje pole z formularu v ocakavanom headeru
            var answer = header.find(x => x.id == data[field]);
            if(! answer){
                console.log("Chýbajúce políčko " + data[field])
                console.log("Súbor " + file + " nie je formulár ZoKB, preskakujem...")
                archiveFile(file, false)
                return
            }          
        }

        // Spracovanie zadanych odpovedi
        var data_export = ""
        for(var field in header){

            // Spracovat odpoved podla typu vstupneho pola
            if (header[field].type == "text"){
                try {
                    var answer = form.getTextField(header[field].id).getText();
                    data_export += '"' + replaceAll(answer,'"','""') + '",';
                } catch(err) {
                    data_export += '"",';
                }
            } else if (header[field].type == "dropdown") {
                try {
                    var answer = form.getDropdown(header[field].id).getSelected()[0];
                    data_export += '"' + replaceAll(answer,'"','""') + '",';
                } catch(err) {
                    data_export += '"",';
                }
            } else if (header[field].type == "radio") {
                try {
                    var answer = form.getRadioGroup(header[field].id).getSelected();
                    if(answer) {
                        data_export += '"' + replaceAll(answer,'"','""') + '",';
                    } else {
                        data_export += '"",';
                    }
                } catch(err) {
                    data_export += '"",';
                }
            } else if (header[field].type == "ignore") {
                data_export += '"",';
            }
        }

        // Zapisat spracovane odpovede do CSV suboru
        fs.appendFile(export_file, data_export + '\r\n', 'utf8', function(err) {
            if (err)throw err;
        });

        archiveFile(file, true)  

    })

    return
}

// Funkcia na zapis hlavicky s otazkami do CSV suboru
function printHeader(export_file){

    // Zostavenie hlavicky
    var data_header = [];
    for(var field in header){
        data_header += '"' + replaceAll(header[field].id,'"','""') + '",';
    }
    
    // zapis hlavicky + uft8 BOM symbolu pre potreby MS Excel
    fs.writeFile(export_file, '\uFEFF' + data_header + '\r\n', 'utf8', function(err) {
        if (err) throw err;
    });
}

// Vyziadanie zoznamu vsetkych PDF suborov v priecinku na import
function getPdfFiles(import_folder){
    var pdf_files = []

    fs.readdirSync(import_folder).forEach(file => {
        if(file.endsWith(".pdf") || file.endsWith(".pdf_retry")){
            pdf_files.push(file)
        }
    });
    return pdf_files;
      
}

// Hlavna fukncia
function main(){

    console.log("Script has been activated");
    // definicia pouzitych suborov a priecinkov
    let date_ob = new Date();
    let import_folder = "./import/";
    //let export_file = './export/zokb_export_' + replaceAll(date_ob.toISOString(),":","-").slice(0,16) + '.csv'
    let export_file = "./export/zokb_export.csv";
    
    // tlac hlavicky ak databaza neexistuje
    try {
        if (! fs.existsSync(export_file)) {
            printHeader(export_file)
        }
      } catch(err) {
        console.error(err)
      }

    // spracovanie jednotlivych PDF suborov
    const files = getPdfFiles(import_folder)
    for(const file of files){

        // Spracovanie suboru
        var file_direct = import_folder + file;
        console.log("Spracovavam subor " + file_direct + "...")
        var success = parseFile(file_direct, export_file)

    }
}

main()

let fs = require('fs');
let pdflib = require('pdf-lib')

// Definicia otazok v PDF formulari vo verzii 1.4
/*let header = ["a1Meno","a2Sidlo_addr_line1_","a2Sidlo_addr_line2_","a2Sidlo_city_","a2Sidlo_postal_","a3Ico","a4Meno",
"a5Datum","b1Nazov1","b2Sektor1","b3Podsektor1","b4Datum1","b1Nazov2","b2Sektor2","b3Podsektor2","b4Datum2","c3","c3",
"b1Nazov3","b2Sektor3","b3Podsektor3","b4Datum3","c1Meno","c2Datum","d1Nazov1","d2Zakladny1","d3Nazov1","d4Kategoria1",
"d1Nazov2","d2Zakladny2","d3Nazov2","d4Kategoria2","d1Nazov3","d2Zakladny3","d3Nazov3","d4Kategoria3","d1Nazov4",
"d2Zakladny4","d3Nazov4","d4Kategoria4","e1","e1","e1","d1Nazov5","d2Zakladny5","d3Nazov5","d4Kategoria5","e1dokument",
"f1","f1","f1","f2","f2","f2","f3","f3","f3","f4","f4","f4","f5","f5","f5","f6","f6","f6","f7","f7","f7","f1document",
"f2document","f3document","f4document","f5document","f6document","f7document","g1","g1","g1","g2","g2","g2","h1","h1",
"h1","h2","h2","h2","g1document","g2document","h1document","h2document","i1","i1","i1","i2","i2","i2","j1","j1","j1",
"j2","j2","j2","i1document","i2document","j1document","j2document","k1","k1","k1","l1","l1","l1","l2","l2","l2",
"k1document","l1document","l2document","m1","m1","m1","m2","m2","m2","n1","n1","n1","n2","n2","n2","m1document",
"m2document","n1document","n2document","o1","o1","o1","o2","o2","o2","o3","o3","o3","o4","o4","o4","p1","p1","p1",
"o1document","o2document","o3document","o4document","p1document","datumVyplnenia"]*/

let header = [
    {id: "a1Meno", type: "text"},
    {id: "a2Sidlo[addr_line1]", type: "text"},
    {id: "a2Sidlo[addr_line2]", type: "text"},
    {id: "a2Sidlo[city]", type: "text"},
    {id: "a2Sidlo[postal]", type: "text"},
    {id: "a3Ico", type: "text"},
    {id: "a4Meno", type: "text"},
    {id: "a5Datum", type: "text"},
    {id: "b1Nazov1", type: "text"},
    {id: "b2Sektor1", type: "dropdown"},
    {id: "b3Podsektor1", type: "dropdown"},
    {id: "b4Datum1", type: "text"},
    {id: "b1Nazov2", type: "text"},
    {id: "b2Sektor2", type: "dropdown"},
    {id: "b3Podsektor2", type: "dropdown"},
    {id: "b4Datum2", type: "text"},
    {id: "c3", type: "radio"},
    {id: "b1Nazov3", type: "text"},
    {id: "b2Sektor3", type: "dropdown"},
    {id: "b3Podsektor3", type: "dropdown"},
    {id: "b4Datum3", type: "text"},
    {id: "c1Meno", type: "text"},
    {id: "c2Datum", type: "text"},
    {id: "d1Nazov1", type: "text"},
    {id: "d2Zakladny1", type: "text"},
    {id: "d3Nazov1", type: "text"},
    {id: "d4Kategoria1", type: "dropdown"},
    {id: "d1Nazov2", type: "text"},
    {id: "d2Zakladny2", type: "text"},
    {id: "d3Nazov2", type: "text"},
    {id: "d4Kategoria2", type: "dropdown"},
    {id: "d1Nazov3", type: "text"},
    {id: "d2Zakladny3", type: "text"},
    {id: "d3Nazov3", type: "text"},
    {id: "d4Kategoria3", type: "dropdown"},
    {id: "d1Nazov4", type: "text"},
    {id: "d2Zakladny4", type: "text"},
    {id: "d3Nazov4", type: "text"},
    {id: "d4Kategoria4", type: "dropdown"},
    {id: "d1Nazov5", type: "text"},
    {id: "d2Zakladny5", type: "text"},
    {id: "d3Nazov5", type: "text"},
    {id: "d4Kategoria5", type: "dropdown"},
    {id: "e1", type: "radio"},
    {id: "e1dokument", type: "text"},
    {id: "f1", type: "radio"},
    {id: "f1document", type: "text"},
    {id: "f2", type: "radio"},
    {id: "f2document", type: "text"},
    {id: "f3", type: "radio"},
    {id: "f3document", type: "text"},
    {id: "f4", type: "radio"},
    {id: "f4document", type: "text"},
    {id: "f5", type: "radio"},
    {id: "f5document", type: "text"},
    {id: "f6", type: "radio"},
    {id: "f6document", type: "text"},
    {id: "f7", type: "radio"},
    {id: "f7document", type: "text"},
    {id: "g1", type: "radio"},
    {id: "g1document", type: "text"},
    {id: "g2", type: "radio"},
    {id: "g2document", type: "text"},    
    {id: "h1", type: "radio"},
    {id: "h1document", type: "text"},
    {id: "h2", type: "radio"},
    {id: "h2document", type: "text"},       
    {id: "i1", type: "radio"},
    {id: "i1document", type: "text"},
    {id: "i2", type: "radio"},
    {id: "i2document", type: "text"},    
    {id: "j1", type: "radio"},
    {id: "j1document", type: "text"},
    {id: "j2", type: "radio"},
    {id: "j2document", type: "text"},
    {id: "k1", type: "radio"},
    {id: "k1document", type: "text"},
    {id: "l1", type: "radio"},
    {id: "l1document", type: "text"},
    {id: "l2", type: "radio"},
    {id: "l2document", type: "text"},
    {id: "m1", type: "radio"},
    {id: "m1document", type: "text"},
    {id: "m2", type: "radio"},
    {id: "m2document", type: "text"},
    {id: "n1", type: "radio"},
    {id: "n1document", type: "text"},
    {id: "n2", type: "radio"},
    {id: "n2document", type: "text"}, 
    {id: "o1", type: "radio"},
    {id: "o1document", type: "text"},
    {id: "o2", type: "radio"},
    {id: "o2document", type: "text"},  
    {id: "o3", type: "radio"},
    {id: "o3document", type: "text"},
    {id: "o4", type: "radio"},
    {id: "o4document", type: "text"},                             
    {id: "p1", type: "radio"},
    {id: "p1document", type: "text"},
    {id: "podpis", type: "ignore"},
    {id: "datumVyplnenia", type: "text"},
]
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

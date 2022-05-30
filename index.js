let fs = require('fs');
PDFParser = require("pdf2json");

// Definicia otazok v PDF formulari vo verzii 1.4
let header = ["a1Meno","a2Sidlo_addr_line1_","a2Sidlo_addr_line2_","a2Sidlo_city_","a2Sidlo_postal_","a3Ico","a4Meno",
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
"o1document","o2document","o3document","o4document","p1document","datumVyplnenia"]

// Pomocna funkcia na nahradenie znakov
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
  
// Funkcia na spracovanie PDF formularu
function parseFile(file, export_file){

    let pdfParser = new PDFParser(this,1);
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
    
        // extrakt dat z PDF formularu
        var data = pdfParser.getAllFieldsTypes();

        // kontrola, ci ide o formular ZoKB
        for(var field in data){
            if(header.indexOf(data[field].id) < 0){
                console.log("Súbor nie je formulár ZoKB, preskakujem...")
                return;
            }
        }
    
        console.log("Spracovávam súbor " + file + "...")

        // mapovanie odpovedi na zadane otazky
        var data_export = ""
        for(var field in header){
            var answer = data.find(x => x.id == header[field]);
            if(answer){
                data_export += '"' + replaceAll(answer.value,'"','""') + '",';
            } else {
                data_export += '"",';
            }
        }
    
        // zapis jednoriadkovej odpovede
        fs.appendFile(export_file, data_export + '\r\n', 'utf8', function(err) {
            if (err) throw err;
        });
    

        // ukoncenie spracovania
        console.log("Súbor spracovaný")
        fs.rename(file, file + "_done", function(err) {
            if (err) throw err;
        });

        return;
    });    

    // spustenie parsovania
    pdfParser.loadPDF(file);
    return;
}

// Funkcia na zapis hlavicky s otazkami do CSV suboru
function printHeader(export_file){
    var data_header = [];
    for(var field in header){
        data_header += '"' + replaceAll(header[field],'"','""') + '",';
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
        console.log(file)
        if(file.endsWith(".pdf")){
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
    let export_file = './export/zokb_export_' + replaceAll(date_ob.toISOString(),":","-").slice(0,16) + '.csv'
    const files = getPdfFiles(import_folder)
    
    // tlac hlavicky
    printHeader(export_file)

    // spracovanie jednotlivych PDF suborov
    for(const file of files){
        console.log("Spracovavam subor " + file + "...")
        parseFile(import_folder + file, export_file)
    }
}

main()

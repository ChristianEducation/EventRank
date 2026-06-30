const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

async function extract() {
  const pdfPath = path.join(__dirname, "../agentdocs/BASES ANIVERSARIO 110 (1).pdf");
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const data = await pdf(dataBuffer);
  
  fs.writeFileSync(path.join(__dirname, "pdf-text.txt"), data.text);
  console.log("PDF text extracted successfully to scripts/pdf-text.txt");
}

extract().catch(console.error);

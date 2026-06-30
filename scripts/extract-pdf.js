const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

async function extract() {
  const inPath = process.argv[2] || "../agentdocs/BASES ANIVERSARIO 110 (1).pdf";
  const outPath = process.argv[3] || "pdf-text.txt";
  const pdfPath = path.join(process.cwd(), inPath);
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const data = await pdf(dataBuffer);
  
  fs.writeFileSync(path.join(process.cwd(), outPath), data.text);
  console.log(`PDF text extracted successfully to ${outPath}`);
}

extract().catch(console.error);

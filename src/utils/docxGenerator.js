// src/utils/docxGenerator.js
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs =  require("fs");
const path = require("path");

module.exports = function generateDocx(templateName, data) {
  // Load template
  const content = fs.readFileSync(
    path.resolve(__dirname, `../templates-docx/${templateName}.docx`),
    "binary"
  );

  // Parse and render
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "" // Replace missing tags with empty string
  });

  doc.render(data);
  return doc.getZip().generate({ type: "nodebuffer" });
};
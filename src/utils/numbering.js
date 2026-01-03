// src/utils/numbering.js
const Document = require("../models/Document");

const PREFIXES = {
  invoice: "INV",
  quotation: "QTN",
  letterhead: "LET"
};

exports.generateNumber = async (docType) => {
  const prefix = PREFIXES[docType] || "DOC";
  const year = new Date().getFullYear();
  
  const lastDoc = await Document.findOne({
    type: docType,
    number: { $regex: `^${prefix}-${year}` }
  }).sort({ createdAt: -1 });

  let counter = 1;
  if (lastDoc && lastDoc.number) {
    const match = lastDoc.number.match(/-(\d+)$/);
    if (match) {
      counter = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${year}-${String(counter).padStart(4, "0")}`;
};
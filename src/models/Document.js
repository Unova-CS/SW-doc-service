// src/models/Document.js
const mongoose = require("mongoose");

const DocSchema = new mongoose.Schema({
  type: { type: String, enum: ["letterhead", "invoice", "quotation"], required: true },
  number: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  data: Object,
  status: { type: String, enum: ["draft", "approved"], default: "draft" },
  history: Array,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Document", DocSchema);

// src/models/Brand.js
const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  pacraNumber: String,
  logoPath: String,
  signaturePath: String, // << added
  primaryColor: { type: String, default: "#F59A23" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Brand", BrandSchema);
// src/controllers/brandController.js
const Brand = require("../models/Brand");
const fs = require("fs");
const path = require("path");

// Helper to delete old file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, "../../public", filePath.replace(/^\//, ""));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

exports.getBrand = async (req, res) => {
  const brand = await Brand.findOne();
  res.json(brand || {});
};

exports.updateBrand = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      pacraNumber: req.body.pacraNumber,
      primaryColor: req.body.primaryColor
    };

    let brand = await Brand.findOne();
    if (!brand) brand = new Brand(updateData);
    else Object.assign(brand, updateData);

    // Handle logo upload
    if (req.file && req.body.field === "logo") {
      if (brand.logoPath) deleteFile(brand.logoPath);
      brand.logoPath = `/uploads/${req.file.filename}`;
    }

    // Handle signature upload
    if (req.file && req.body.field === "signature") {
      if (brand.signaturePath) deleteFile(brand.signaturePath);
      brand.signaturePath = `/uploads/${req.file.filename}`;
    }

    await brand.save();
    res.json({ message: "Brand updated", brand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update brand" });
  }
};
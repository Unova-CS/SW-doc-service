// src/routes/brandRoutes.js (updated upload logic)
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const brandController = require("../controllers/brandController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `brand_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  }
});

router.get("/", auth, roles(["admin"]), brandController.getBrand);
router.put("/", auth, roles(["admin"]), upload.single("file"), brandController.updateBrand);

module.exports = router;
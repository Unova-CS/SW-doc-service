// src/routes/documentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const documentController = require("../controllers/documentController");

// Only include routes that exist in the minimal controller
router.get("/test-letterhead", auth, roles(["admin", "staff", "finance"]), documentController.testLetterhead);
router.get("/new", auth, documentController.newDocumentForm);
router.post("/generate", auth, roles(["admin", "finance", "staff"]), documentController.createDocument);

module.exports = router;
// src/routes/viewRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const documentController = require("../controllers/documentController");

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

// Dashboards
router.get("/dashboard", auth, documentController.renderDashboard);
router.get("/admin/dashboard", auth, documentController.adminDashboard);

// Document UI
router.get("/docs/new", auth, documentController.newDocumentForm);

// User Management (admin-only)
router.get("/admin/users", auth, roles(["admin"]), documentController.adminUserManagement);
router.post("/admin/users/:id", auth, roles(["admin"]), documentController.updateUserRole);
router.post("/admin/users/::id/password", auth, roles(["admin"]), documentController.resetUserPassword);
router.post("/admin/users/:id/delete", auth, roles(["admin"]), documentController.deleteUser);

module.exports = router;
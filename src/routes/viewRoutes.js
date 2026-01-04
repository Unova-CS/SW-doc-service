// src/routes/viewRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const documentController = require("../controllers/documentController");

// Login page
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
router.post("/admin/users/:id/password", auth, roles(["admin"]), documentController.resetUserPassword);
router.post("/admin/users/:id/delete", auth, roles(["admin"]), documentController.deleteUser);

// ====== TEMPORARY: Seed Data Endpoint (REMOVE AFTER USE) ======
router.get("/seed-data-now", async (req, res) => {
  try {
    const Brand = require("../models/Brand");
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");

    // Create Brand
    let brand = await Brand.findOne();
    if (!brand) {
      const logoPath = "/uploads/logo.png";
      brand = new Brand({
        name: "Smart-Ways Solutions",
        email: "smartwayssolutions1@gmail.com",
        phone: "+260 777 644 161",
        address: "Plot 9812/15a, Godfrey Chitalu Road, Nyumba Yanga, Lusaka",
        pacraNumber: "320200015637",
        logoPath
      });
      await brand.save();
    }

    // Create Users
    const users = [
      { username: "admin", password: "SuperSecurePass2025!", role: "admin" },
      { username: "brian", password: "SuperSecurePass2025!", role: "admin" },
      { username: "majory", password: "SuperSecurePass2025!", role: "finance" }
    ];

    for (const u of users) {
      const existing = await User.findOne({ username: u.username });
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 10);
        await new User({ ...u, password: hash }).save();
      }
    }

    res.send(`
      <div style="font-family: Arial; padding: 30px; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="color: #F59A23;">✅ Database Seeded Successfully</h2>
        <p><strong>Users created:</strong> admin, brian, majory</p>
        <p><strong>Default password:</strong> SuperSecurePass2025!</p>
        <p style="margin: 20px 0;">
          <a href="/auth/login" style="display: inline-block; padding: 10px 20px; background: #F59A23; color: white; text-decoration: none; border-radius: 4px;">
            Go to Login
          </a>
        </p>
        <p style="margin-top: 30px; color: #e74c3c; font-size: 14px;">
          ⚠️ <strong>Important:</strong> Delete the '/seed-data-now' route from viewRoutes.js after use!
        </p>
      </div>
    `);
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).send("Seeding failed: " + err.message);
  }
});

module.exports = router;
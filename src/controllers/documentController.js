// src/controllers/documentController.js
const Brand = require("../models/Brand");
const Document = require("../models/Document");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const generatePDF = require("../utils/pdfGenerator");
const { generateNumber } = require("../utils/numbering");
const hbs = require("handlebars");
const bcrypt = require("bcryptjs");

// ====== DATE FORMATTING HELPER ======
const formatDateForPDF = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB'); // e.g., "10/08/2025"
};

// ====== DASHBOARDS ======
exports.renderDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("username role").lean();
    const isAdmin = user.role === "admin";
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Dashboard</title></head>
      <body style="font-family: Arial; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1>Welcome, ${user.username}!</h1>
          <p><strong>Role:</strong> ${user.role}</p>
          ${isAdmin ? '<p><a href="/admin/dashboard" style="color:#F59A23; text-decoration:none; font-weight:bold;">Go to Admin Dashboard</a></p>' : ''}
          <p><a href="/docs/new" style="display:inline-block; padding:8px 16px; background:#F59A23; color:white; text-decoration:none; border-radius:4px;">Create New Document</a></p>
          <p><a href="/auth/logout" style="color:#e74c3c; text-decoration:none;">Logout</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Dashboard error");
  }
};

exports.adminDashboard = async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Admin Dashboard</title></head>
    <body style="font-family: Arial; padding: 20px; background: #f9f9f9;">
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1>Admin Dashboard</h1>
        <p>
          <a href="/docs/new" style="display:inline-block; padding:8px 16px; background:#F59A23; color:white; text-decoration:none; border-radius:4px; margin-right:10px;">Create Document</a>
          <a href="/admin/users" style="display:inline-block; padding:8px 16px; background:#2ecc71; color:white; text-decoration:none; border-radius:4px; margin-right:10px;">User Settings</a>
        </p>
        <p><a href="/docs/test-letterhead" style="display:inline-block; padding:8px 16px; background:#3498db; color:white; text-decoration:none; border-radius:4px; margin-right:10px;">Test Letterhead</a></p>
        <p><a href="/dashboard" style="color:#F59A23; text-decoration:none;">← Back to Dashboard</a></p>
        <p><a href="/auth/logout" style="color:#e74c3c; text-decoration:none;">Logout</a></p>
      </div>
    </body>
    </html>
  `);
};

// ====== DOCUMENT FORM ======
exports.newDocumentForm = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/new-document.html"));
};

// ====== TEST PDF ======
exports.testLetterhead = async (req, res) => {
  try {
    const brand = await Brand.findOne().lean();
    const brandName = brand?.name || "Smart-Ways Solutions";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, padding: 30px; }
          .header { border-bottom: 2px solid #F59A23; padding-bottom: 10px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${brandName}</h2>
        </div>
        <p>This is a test PDF to verify the service is working.</p>
        <p>✅ Server is running. PDF generation works.</p>
      </body>
      </html>
    `;
    const pdf = await generatePDF(html);
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
};

// ====== REAL DOCUMENT GENERATION ======
exports.createDocument = async (req, res) => {
  try {
    const { type } = req.body;
    if (!["letterhead", "invoice", "quotation"].includes(type)) {
      return res.status(400).send("Invalid document type");
    }

    let data = {};

    if (type === "letterhead") {
      data = {
        first_name: req.body.clientFirstName || "",
        last_name: req.body.clientLastName || "",
        phone: req.body.clientPhone || "",
        address: req.body.clientAddress || "",
        date: formatDateForPDF(req.body.date),
        sender_first_name: req.body.senderFirstName || "",
        sender_last_name: req.body.senderLastName || "",
        company_name: req.body.senderCompany || "Smart-Ways Solutions",
        company_description_1: req.body.content || "",
        company_description_2: ""
      };
    } 
    else if (type === "invoice") {
      // === SERVER-SIDE DATE VALIDATION ===
      if (req.body.dueDate && req.body.date) {
        const invoiceDate = new Date(req.body.date);
        const dueDate = new Date(req.body.dueDate);
        if (dueDate < invoiceDate) {
          return res.status(400).send("Due date cannot be earlier than invoice date.");
        }
      }

      const items = (req.body.itemDesc || []).map((desc, i) => ({
        description: desc,
        price: parseFloat(req.body.itemPrice?.[i] || 0)
      })).filter(item => item.description && !isNaN(item.price) && item.price >= 0);

      const subtotal = items.reduce((sum, i) => sum + i.price, 0);
      data = {
        first_name: req.body.clientFirstName || "",
        last_name: req.body.clientLastName || "",
        phone: req.body.clientPhone || "",
        invoice_number: "auto",
        invoice_date: formatDateForPDF(req.body.date),
        due_date: formatDateForPDF(req.body.dueDate),
        items,
        total_price: subtotal.toFixed(2),
        tax: (subtotal * 0.2).toFixed(2),
        final_price: (subtotal * 1.2).toFixed(2)
      };
    } 
    else if (type === "quotation") {
      // === SERVER-SIDE DATE VALIDATION ===
      if (req.body.validUntil && req.body.dateQ) {
        const quoteDate = new Date(req.body.dateQ);
        const validUntil = new Date(req.body.validUntil);
        if (validUntil < quoteDate) {
          return res.status(400).send("Valid until date cannot be earlier than quotation date.");
        }
      }

      const items = (req.body.quoteDesc || []).map((desc, i) => ({
        description: desc,
        price: parseFloat(req.body.quoteAmount?.[i] || 0)
      })).filter(item => item.description && !isNaN(item.price) && item.price >= 0);

      data = {
        quote_number: "auto",
        date: formatDateForPDF(req.body.dateQ),
        valid_date: formatDateForPDF(req.body.validUntil),
        client_company_name: req.body.clientName || "",
        client_company_address: req.body.clientAddress || "",
        items,
        total_price: items.reduce((sum, i) => sum + i.price, 0).toFixed(2)
      };
    }

    const brand = await Brand.findOne().lean();
    if (!brand) return res.status(500).send("Brand not configured");

    const number = await generateNumber(type);

    const doc = new Document({
      type,
      number,
      createdBy: req.user.userId,
      data,
      status: "draft"
    });
    await doc.save();

    const templatePath = path.join(__dirname, `../templates/${type}.hbs`);
    const template = fs.readFileSync(templatePath, "utf8");
    const compiled = hbs.compile(template);

    const html = compiled({
      logoPath: `${process.env.BASE_URL}${brand.logoPath}`,
      number,
      data,
      company: {
        name: brand.name,
        email: brand.email,
        phone: brand.phone,
        address: brand.address,
        pacraNumber: brand.pacraNumber
      }
    });

    const pdf = await generatePDF(html);
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).send("Failed to generate document");
  }
};

// ====== USER MANAGEMENT ======
exports.adminUserManagement = async (req, res) => {
  try {
    const users = await User.find().select("username role").lean();
    
    let alert = "";
    if (req.query.success) {
      const messages = {
        "1": "User role updated.",
        "2": "Password reset.",
        "3": "User deleted.",
        "4": "User created."
      };
      alert = `<div style="padding:10px; background:#d4edda; color:#155724; border-radius:4px; margin-bottom:20px;">${messages[req.query.success] || "Success"}</div>`;
    }
    if (req.query.error) {
      alert = `<div style="padding:10px; background:#f8d7da; color:#721c24; border-radius:4px; margin-bottom:20px;">${req.query.error}</div>`;
    }

    let usersHtml = "";
    users.forEach(user => {
      usersHtml += `
        <tr>
          <td>${user.username}</td>
          <td>
            <form method="POST" action="/admin/users/${user._id}" style="display:inline;">
              <select name="role" onchange="this.form.submit()" style="padding:4px; font-size:14px;">
                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                <option value="finance" ${user.role === "finance" ? "selected" : ""}>Finance</option>
                <option value="staff" ${user.role === "staff" ? "selected" : ""}>Staff</option>
              </select>
            </form>
          </td>
          <td>
            <form method="POST" action="/admin/users/${user._id}/password" style="display:inline;" onsubmit="return confirm('Reset to default password?')">
              <button type="submit" style="padding:4px 8px; background:#F59A23; color:white; border:none; border-radius:3px; font-size:12px;">Reset PWD</button>
            </form>
            ${user.username !== "admin" ? `
            <form method="POST" action="/admin/users/${user._id}/delete" style="display:inline;" onsubmit="return confirm('Delete user?')">
              <button type="submit" style="padding:4px 8px; background:#e74c3c; color:white; border:none; border-radius:3px; font-size:12px; margin-left:5px;">Delete</button>
            </form>
            ` : ""}
          </td>
        </tr>
      `;
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>User Management</title></head>
      <body style="font-family: Arial; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1>User Management</h1>
          ${alert}
          <p><a href="/admin/dashboard" style="color:#F59A23; text-decoration:none;">← Back to Admin Dashboard</a></p>
          <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
              <tr style="background:#fdf6f0; color:#d35400;">
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${usersHtml}
            </tbody>
          </table>
          <p><a href="/auth/logout" style="color:#e74c3c; text-decoration:none; margin-top:20px; display:inline-block;">Logout</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("User management failed");
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "finance", "staff"].includes(role)) {
      return res.redirect("/admin/users?error=Invalid role");
    }
    await User.findByIdAndUpdate(req.params.id, { role });
    res.redirect("/admin/users?success=1");
  } catch (err) {
    console.error(err);
    res.redirect("/admin/users?error=Update failed");
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const hash = bcrypt.hashSync("password", 10);
    await User.findByIdAndUpdate(req.params.id, { password: hash });
    res.redirect("/admin/users?success=2");
  } catch (err) {
    console.error(err);
    res.redirect("/admin/users?error=Password reset failed");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user.userId.toString()) {
      return res.redirect("/admin/users?error=Cannot delete yourself");
    }

    const userToDelete = await User.findById(userId);
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.redirect("/admin/users?error=Cannot delete last admin");
      }
    }

    await User.findByIdAndDelete(userId);
    res.redirect("/admin/users?success=3");
  } catch (err) {
    console.error(err);
    res.redirect("/admin/users?error=Deletion failed");
  }
};
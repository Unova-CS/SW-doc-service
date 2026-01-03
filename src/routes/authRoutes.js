// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.send("Please enter username and password");

    const user = await User.findOne({ username });
    if (!user) return res.send("Invalid username or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.send("Invalid username or password");

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    // Determine redirect based on role
    let redirectUrl = "/dashboard";
    if (user.role === "admin") {
      redirectUrl = "/admin/dashboard";
    } else if (user.role === "finance") {
      redirectUrl = "/docs/new?default=invoice";
    } else if (user.role === "staff") {
      redirectUrl = "/docs/new?default=letterhead";
    }

    // Redirect after form login
    if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
      return res.redirect(redirectUrl);
    }

    // API response
    return res.json({ message: "Logged in", role: user.role, redirect: redirectUrl });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong on login");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
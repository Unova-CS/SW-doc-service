// test-users.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find();
    console.log("=== ALL USERS ===");
    users.forEach(u => {
      console.log(`Username: ${u.username} | Role: ${u.role} | ID: ${u._id}`);
    });
    process.exit(0);
  })
  .catch(err => console.error("DB Error:", err));
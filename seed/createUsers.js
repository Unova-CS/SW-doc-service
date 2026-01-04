// seed/createUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("DB connected");

  // Create team members
  const users = [
    { username: "admin", password: "password", role: "admin" },
    { username: "brian", password: "SuperSecurePass2025!s", role: "admin" },        // CEO
    { username: "majory", password: "SuperSecurePass2025!", role: "finance" },     // Finance Director
    { username: "chibotu", password: "SuperSecurePass2025!", role: "admin" }       // You (Tech Lead)
  ];

  for (const u of users) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      const user = new User(u);
      await user.save();
      console.log(`Created user: ${u.username} (${u.role})`);
    }
  }

  process.exit(0);
});
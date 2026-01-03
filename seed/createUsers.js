// seed/createUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("DB connected");

  // Create team members
  const users = [
    { username: "admin", password: "password", role: "admin" },
    { username: "brian", password: "password", role: "admin" },        // CEO
    { username: "majory", password: "password", role: "finance" },     // Finance Director
    { username: "chibotu", password: "password", role: "admin" }       // You (Tech Lead)
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
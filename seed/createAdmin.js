require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("DB connected");

  await User.deleteMany({}); // optional: reset users

  const admin = new User({
    username: "admin",
    password: "password",
    role: "admin"
  });

  await admin.save();
  console.log("Admin user created!");
  process.exit(0);
});

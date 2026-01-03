require("dotenv").config();
const mongoose = require("mongoose");
const Brand = require("../src/models/Brand");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("DB connected");

  await Brand.deleteMany({}); // reset brand if needed

  const brand = new Brand({
    name: "Smart-Ways Solutions",
    email: "smartwayssolutions1@gmail.com",
    phone: "+260 777 644 161",
    address: "Plot 9812/15a, Godfrey Chitalu Road, Nyumba Yanga, Lusaka",
    pacraNumber: "320200015637",
    logoPath: "/uploads/logo.png",
    primaryColor: "#F59A23"
  });

  await brand.save();
  console.log("Brand config saved!");
  process.exit(0);
});

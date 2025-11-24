const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
  const mongoURL = process.env.MONGO_URL;

  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDb;

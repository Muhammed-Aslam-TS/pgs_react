const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amex_config";
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected:", MONGODB_URI);
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

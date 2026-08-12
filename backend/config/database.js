const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not configured");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    throw error;
  }
};

module.exports = connectDatabase;

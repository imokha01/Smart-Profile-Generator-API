import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB connected");

  // ✅ START SERVER HERE
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

})
.catch((err) => {
  console.error("❌ DB connection error:", err);

  if (err.message.includes("ETIMEDOUT")) {
    console.log("👉 HINT: Check your MongoDB Atlas IP Whitelist!");
  }

  process.exit(1);
});

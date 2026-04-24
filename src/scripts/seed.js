import fs from "fs";
import mongoose from "mongoose";
import Profile from "../src/models/profile.model.js";

await mongoose.connect(process.env.MONGO_URI);

const data = JSON.parse(fs.readFileSync("./data/profiles.json"));

for (const item of data) {
  await Profile.updateOne(
    { name: item.name },
    item,
    { upsert: true }
  );
}

console.log("Seeding completed");
process.exit();

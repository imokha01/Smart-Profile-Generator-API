import fs from "fs";
import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import Profile from "../src/models/profile.model.js";

await mongoose.connect(process.env.MONGO_URI);

const data = JSON.parse(fs.readFileSync("./data/profiles.json", "utf-8"));

for (const item of data) {
  const normalized = {
    id: uuidv7(),
    name: item.name?.toLowerCase().trim(),
    gender: item.gender?.toLowerCase(),
    gender_probability: item.gender_probability ?? 0,
    sample_size: item.sample_size ?? item.count ?? 0,
    age: item.age,
    age_group: item.age_group?.toLowerCase(),
    country_id: item.country_id?.toUpperCase(),
    country_name: item.country_name ?? item.country ?? "",
    country_probability: item.country_probability ?? 0,
    created_at: new Date()
  };

  await Profile.updateOne(
    { name: normalized.name },
    { $set: normalized },
    { upsert: true }
  );
}

console.log("Seeding completed successfully");
process.exit(0);

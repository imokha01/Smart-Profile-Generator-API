import fs from "fs";
import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import Profile from "../src/models/profile.model.js";

const SEED_FILE = "./data/profiles.json";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Stream or Read file
    if (!fs.existsSync(SEED_FILE)) {
      throw new Error(`Seed file not found at ${SEED_FILE}`);
    }
    const data = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));

    // 2. Prepare Bulk Operations
    console.log(`Preparing ${data.length} records...`);
    const operations = data.map((item) => {
      const normalized = {
        id: uuidv7(), // Sortable UUID
        name: item.name?.toLowerCase().trim(),
        gender: item.gender?.toLowerCase(),
        gender_probability: item.gender_probability ?? 0,
        sample_size: item.sample_size ?? item.count ?? 0,
        age: item.age,
        age_group: item.age_group?.toLowerCase(),
        country_id: item.country_id?.toUpperCase(),
        country_name: item.country_name ?? item.country ?? "",
        country_probability: item.country_probability ?? 0,
        updated_at: new Date() 
      };

      return {
        updateOne: {
          filter: { name: normalized.name },
          update: { 
            $set: normalized,
            $setOnInsert: { created_at: new Date() } // Only set created_at on new docs
          },
          upsert: true
        }
      };
    });

    // 3. Execute Bulk Write
    console.log("Executing bulk write...");
    const result = await Profile.bulkWrite(operations, { ordered: false });

    console.log("--- Seeding Results ---");
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Upserted: ${result.upsertedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    
  } catch (error) {
    console.error("Critical seeding error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

seedDatabase();
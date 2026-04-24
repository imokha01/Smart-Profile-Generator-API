// src/controllers/profile.controller.js
import Profile from "../models/profile.model.js";
import { fetchExternalData } from "../services/external.service.js";
import getAgeGroup from "../utils/ageGroup.js";
import getTopCountry from "../utils/country.js";
import externalError from "../utils/error.js";
import { v7 as uuidv7 } from "uuid";
import { parseQuery } from "../utils/parser.js";

// CREATE NEW PROFILE
export const createProfile = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name"
      });
    }

    name = name.trim().toLowerCase();

    const existing = await Profile.findOne({ name });

    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing
      });
    }

    let apiData;
    try {
      apiData = await fetchExternalData(name);
    } catch (err) {
      return res.status(502).json(externalError(err.message));
    }

    const topCountry = getTopCountry(apiData.nation.country);

    const profile = await Profile.create({
      id: uuidv7(),
      name,
      gender: apiData.gender.gender,
      gender_probability: apiData.gender.probability,
      sample_size: apiData.gender.count,
      age: apiData.age.age,
      age_group: getAgeGroup(apiData.age.age),
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      status: "success",
      data: profile
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

// READ SINGLE PROFILE BY ID
export const getProfile = async (req, res) => {
  const profile = await Profile.findOne({ id: req.params.id });

  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }

  return res.status(200).json({
    status: "success",
    data: profile
  });
};

export const getAllProfiles = async (req, res) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by = "created_at",
      order = "asc",
      page = "1",
      limit = "10"
    } = req.query;

    // 1. STRICT VALIDATION (Requirement: 422 for invalid types)
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    const safeLimit = Math.min(50, Math.max(1, limitNum));
    const skip = (pageNum - 1) * safeLimit;

    // 2. BUILD FILTER
    const filter = {};
    if (gender) filter.gender = gender.toLowerCase();
    if (age_group) filter.age_group = age_group.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();

    // Numerical Ranges
    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    // Probability Filters (From Task Detail)
    if (min_gender_probability) {
      filter.gender_probability = { $gte: parseFloat(min_gender_probability) };
    }
    if (min_country_probability) {
      filter.country_probability = { $gte: parseFloat(min_country_probability) };
    }

    // 3. SORT WHITELIST
    const allowedSort = ["age", "created_at", "gender_probability"];
    const sortField = allowedSort.includes(sort_by) ? sort_by : "created_at";
    const sortOrder = order === "desc" ? -1 : 1;

    // 4. EXECUTION
    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(safeLimit)
        .select("-__v")
        .lean(),
      Profile.countDocuments(filter)
    ]);

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: safeLimit,
      total,
      data: profiles
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};



// SEARCH PROFILES BY QUERY

export const searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    // 1. Check if 'q' is missing (Requirement: 400 Bad Request)
    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty parameter"
      });
    }

    const parsed = parseQuery(q);

    // 2. Interpret check (Requirement: Specific error message)
    if (!parsed) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query"
      });
    }

    // 3. Construct Mongoose Filter
    const filter = {};
    if (parsed.gender)     filter.gender = parsed.gender;
    if (parsed.age_group)  filter.age_group = parsed.age_group;
    if (parsed.country_id) filter.country_id = parsed.country_id;

    if (parsed.min_age || parsed.max_age) {
      filter.age = {};
      if (parsed.min_age) filter.age.$gte = parsed.min_age;
      if (parsed.max_age) filter.age.$lte = parsed.max_age;
    }

    // 4. Pagination & Validation (Requirement: 422 for invalid types)
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);

    if (isNaN(p) || isNaN(l) || p < 1) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    const safeLimit = Math.min(50, l); // Task says max 50
    const skip = (p - 1) * safeLimit;

    // 5. Execute
    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select("-__v")
        .lean(),
      Profile.countDocuments(filter)
    ]);

    // 6. Success Response (Exact Match to Task Schema)
    return res.status(200).json({
      status: "success",
      page: p,
      limit: safeLimit,
      total,
      data: profiles
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}




// DELETE PROFILE BY ID
export const deleteProfile = async (req, res) => {
  const deleted = await Profile.findOneAndDelete({ id: req.params.id });

  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found"
    });
  }

  return res.status(204).send();
};

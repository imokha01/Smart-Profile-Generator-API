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
    // 1️⃣ Extract query params
    let {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      sort_by = "created_at",
      order = "asc",
      page = 1,
      limit = 10
    } = req.query;

    // 2️⃣ VALIDATE pagination FIRST
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    // 3️⃣ Build filter
    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (age_group) filter.age_group = age_group.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();

    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    // 4️⃣ Build sort
    const sortOptions = {};
    sortOptions[sort_by] = order === "desc" ? -1 : 1;

    // 5️⃣ 👉 PAGINATION CODE GOES HERE
    const skip = (pageNum - 1) * limitNum;

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Profile.countDocuments(filter)
    ]);

    // 6️⃣ Final response
    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
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

    const parsed = parseQuery(q);

    if (!parsed) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query"
      });
    }

    const filter = {};

    if (parsed.gender) filter.gender = parsed.gender;
    if (parsed.age_group) filter.age_group = parsed.age_group;
    if (parsed.country_id) filter.country_id = parsed.country_id;

    if (parsed.min_age || parsed.max_age) {
      filter.age = {};
      if (parsed.min_age) filter.age.$gte = parsed.min_age;
      if (parsed.max_age) filter.age.$lte = parsed.max_age;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 50);

    const skip = (pageNum - 1) * limitNum;

    const profiles = await Profile.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      data: profiles
    });

  } catch {
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};



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

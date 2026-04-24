// src/controllers/profile.controller.js
import Profile from "../models/profile.model.js";
import { fetchExternalData } from "../services/external.service.js";
import getAgeGroup from "../utils/ageGroup.js";
import getTopCountry from "../utils/country.js";
import externalError from "../utils/error.js";
import { v7 as uuidv7 } from "uuid";
import  parseQuery  from "../utils/parser.js";

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
      sort_by = "created_at",
      order = "asc",
      page = "1",
      limit = "10"
    } = req.query;

    // -----------------------
    // VALIDATION (STRICT)
    // -----------------------
    const pageNum = Number(page);
    let limitNum = Number(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 50) limitNum = 50;

    // -----------------------
    // BUILD FILTER
    // -----------------------
    const filter = {};

    if (gender) {
      filter.gender = new RegExp(`^${gender}$`, "i");
    }

    if (age_group) {
      filter.age_group = new RegExp(`^${age_group}$`, "i");
    }

    if (country_id) {
      filter.country_id = country_id.toUpperCase();
    }

    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    // -----------------------
    // SORT VALIDATION
    // -----------------------
    const allowedSort = ["age", "created_at", "gender_probability"];
    const safeSort = allowedSort.includes(sort_by)
      ? sort_by
      : "created_at";

    const sortOptions = {
      [safeSort]: order === "desc" ? -1 : 1
    };

    // -----------------------
    // PAGINATION
    // -----------------------
    const skip = (pageNum - 1) * limitNum;

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Profile.countDocuments(filter)
    ]);

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

    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty parameter"
      });
    }

    const filters = parseQuery(q);

    if (!filters) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query"
      });
    }

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Profile.find(filters).skip(skip).limit(limitNum).lean(),
      Profile.countDocuments(filters)
    ]);

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      data
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server failure"
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

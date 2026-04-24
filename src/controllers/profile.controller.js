// src/controllers/profile.controller.js
import Profile from "../models/profile.model.js";
import { fetchExternalData } from "../services/external.service.js";
import getAgeGroup from "../utils/ageGroup.js";
import getTopCountry from "../utils/country.js";
import externalError from "../utils/error.js";
import { v7 as uuidv7 } from "uuid";

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


// VALIDATE EXTERNAL API RESPONSES
if (!apiData.gender.gender || apiData.gender.count === 0) {
  return res.status(502).json({
    status: "error",
    message: "Genderize returned an invalid response"
  });
}

if (!apiData.age.age) {
  return res.status(502).json({
    status: "error",
    message: "Agify returned an invalid response"
  });
}

const topCountry = getTopCountry(apiData.nation.country);

if (!topCountry) {
  return res.status(502).json({
    status: "error",
    message: "Nationalize returned an invalid response"
  });
}


// READ ALL PROFILES WITH OPTIONAL FILTERS
export const getAllProfiles = async (req, res) => {
  try {
    let {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by = "created_at",
      order = "asc",
      page = 1,
      limit = 10
    } = req.query;

    // --- VALIDATION ---
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    if (limit > 50) limit = 50;

    const filter = {};

    // --- FILTERS ---
    if (gender) filter.gender = gender.toLowerCase();
    if (age_group) filter.age_group = age_group.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();

    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    if (min_gender_probability) {
      filter.gender_probability = { $gte: Number(min_gender_probability) };
    }

    if (min_country_probability) {
      filter.country_probability = { $gte: Number(min_country_probability) };
    }

    // --- SORT ---
    const sortOptions = {};
    const allowedSort = ["age", "created_at", "gender_probability"];

    if (!allowedSort.includes(sort_by)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    sortOptions[sort_by] = order === "desc" ? -1 : 1;

    // --- PAGINATION ---
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Profile.countDocuments(filter)
    ]);

    return res.status(200).json({
      status: "success",
      page,
      limit,
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

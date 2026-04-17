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


// READ ALL PROFILES WITH OPTIONAL FILTERS
export const getAllProfiles = async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();
    if (age_group) filter.age_group = age_group.toLowerCase();

    const profiles = await Profile.find(filter)
      .select("id name gender age age_group country_id")
      .lean();

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles
    });

  } catch {
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

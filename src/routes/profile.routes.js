// src/routes/profile.routes.js
import express from "express";
import {
  createProfile,
  getAllProfiles,
  getProfile,
  searchProfiles,
  deleteProfile
} from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/profiles", createProfile);
router.get("/profiles", getAllProfiles);
router.get("/profiles/search", searchProfiles);
router.get("/profiles/:id", getProfile);
router.delete("/profiles/:id", deleteProfile);

export default router;

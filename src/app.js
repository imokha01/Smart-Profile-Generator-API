// src/app.js
import express from "express";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(express.json());

// CORS (REQUIRED)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/api", profileRoutes);

export default app;

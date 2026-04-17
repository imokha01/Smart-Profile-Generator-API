import express from "express";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(express.json());

// CORS (REQUIRED)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  next();
});


// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api", profileRoutes);

export default app;

import express from "express";
import profileRoutes from "./routes/profile.routes.js";
import cors from "cors"


const app = express();

app.use(cors());  
app.use(express.json());


// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api", profileRoutes)
export default app;

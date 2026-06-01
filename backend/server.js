import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import marketDataRoutes from "./routes/marketDataRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/marketdata", marketDataRoutes);
app.use("/api", predictionRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import marketDataRoutes from "./routes/marketDataRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/marketdata", marketDataRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

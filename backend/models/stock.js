import mongoose from "mongoose";
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g., AAPL, TSLA
  name: { type: String, required: true }, // Apple Inc.
  sector: { type: String }, // Technology, Banking, etc.
  country: { type: String }, // Where it’s listed
  marketCap: { type: Number }, // optional
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Stock", stockSchema);
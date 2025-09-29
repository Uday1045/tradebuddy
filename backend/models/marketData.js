import mongoose from "mongoose";
const marketDataSchema = new mongoose.Schema({
  stock: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
  
  // Time information
  timestamp: { type: Date, required: true },   // exact time of the data point
  interval: { type: String, required: true },   // 2m, 30m, 1d
  source: { type: String, default: "live" },   // live, yesterday, week, yearAgo

  // OHLCV
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
  
  // Optional technical indicators (can add as needed)
  movingAverage: { type: Number },    // e.g., 20-period MA
  ema: { type: Number },              // Exponential Moving Average
  rsi: { type: Number },              // Relative Strength Index
  macd: { type: Number },             // MACD value
  bollingerUpper: { type: Number },   // Upper Bollinger Band
  bollingerLower: { type: Number },   // Lower Bollinger Band

  // For AI predictions / real-time signals later
 

  createdAt: { type: Date, default: Date.now }
});
marketDataSchema.index({ stock: 1, timestamp: 1, interval: 1 }, { unique: true });

export default mongoose.model("MarketData", marketDataSchema);
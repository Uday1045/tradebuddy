// scripts/exportData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import connectDB from "../../backend/config/db.js";
import Stock from "../../backend/models/stock.js";
import MarketData from "../../backend/models/marketData.js";

dotenv.config();

// CLI arg
const symbol = process.argv[2]; // e.g., AAPL
if (!symbol) {
  console.error("Usage: node exportData.js SYMBOL");
  process.exit(1);
}

// Intervals to export
const INTERVALS = ["2m", "15m", "30m", "1d"]; 

(async function main() {
  try {
    // Connect to DB
    await connectDB();

    // Find stock
    const stockDoc = await Stock.findOne({ symbol });
    if (!stockDoc) {
      console.error("❌ Stock not found:", symbol);
      process.exit(1);
    }

    // Ensure ./data folder exists
    const dir = path.resolve("./data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    // Loop through intervals
    for (const interval of INTERVALS) {
      const data = await MarketData.find({
        stock: stockDoc._id,
        interval,
      }).sort({ timestamp: 1 });

      if (!data.length) {
        console.log(`⚠️ No data found for ${symbol} with interval ${interval}`);
        continue;
      }

      // CSV
      const csvData = [
        [
          "timestampUTC",
          "localTime",
          "open",
          "high",
          "low",
          "close",
          "volume",
          "movingAverage",
          "ema",
          "rsi",
          "macd",
          "bollingerUpper",
          "bollingerLower",
        ],
        ...data.map(doc => {
          const utc = doc.timestamp.toISOString();
          const local = new Date(doc.timestamp).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
          });
          return [
            utc,
            local,
            doc.open,
            doc.high,
            doc.low,
            doc.close,
            doc.volume,
            doc.movingAverage ?? "",
            doc.ema ?? "",
            doc.rsi ?? "",
            doc.macd ?? "",
            doc.bollingerUpper ?? "",
            doc.bollingerLower ?? "",
          ];
        }),
      ]
        .map(row => row.join(","))
        .join("\n");

      const OUT_PATH = path.resolve(`./data/${symbol}_${interval}.csv`);
      fs.writeFileSync(OUT_PATH, csvData);
      console.log(`✅ Exported ${data.length} rows to ${OUT_PATH}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error exporting data:", err);
    process.exit(1);
  }
})();

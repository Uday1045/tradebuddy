import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import connectDB from "../../backend/config/db.js";
import Stock from "../../backend/models/stock.js";
import MarketData from "../../backend/models/marketData.js";

dotenv.config();

// CLI arg
const symbol = process.argv[2]; // e.g., EURUSD
if (!symbol) {
  console.error("Usage: node exportData.js SYMBOL");
  process.exit(1);
}

// Intervals to export
const INTERVALS = ["2m", "5m", "15m", "30m", "1h", "1d"];

(async function main() {
  try {
    await connectDB();

    // Find stock document
    const stockDoc = await Stock.findOne({ symbol });
    if (!stockDoc) {
      console.error("❌ Stock not found:", symbol);
      process.exit(1);
    }

    //  Create ./data/<symbol> folder if not exists
    const symbolDir = path.resolve(`./data/${symbol}`);
    if (!fs.existsSync(symbolDir)) fs.mkdirSync(symbolDir, { recursive: true });

    // Loop through intervals
    for (const interval of INTERVALS) {
      let data = await MarketData.find({
        stock: stockDoc._id,
        interval,
      }).sort({ timestamp: 1 });

      if (!data.length) {
        console.log(` No data found for ${symbol} with interval ${interval}`);
        continue;
      }

      // Remove rows missing indicators (except daily)
      if (interval !== "1d") {
        data = data.filter(
          (doc) =>
            doc.movingAverage != null &&
            doc.ema != null &&
            doc.rsi != null &&
            doc.macd != null &&
            doc.bollingerUpper != null &&
            doc.bollingerLower != null
        );

        if (!data.length) {
          console.log(
            ` No complete rows (indicators) for ${symbol} at ${interval}`
          );
          continue;
        }
      }

      // Convert to CSV
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
        ...data.map((doc) => {
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
            doc.movingAverage,
            doc.ema,
            doc.rsi,
            doc.macd,
            doc.bollingerUpper,
            doc.bollingerLower,
          ];
        }),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Save as data/<symbol>/<symbol>_<interval>.csv
      const outPath = path.resolve(`${symbolDir}/${symbol}_${interval}.csv`);
      fs.writeFileSync(outPath, csvData);
      console.log(` Exported ${data.length} rows to ${outPath}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error exporting data:", err);
    process.exit(1);
  }
})();

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../../backend/config/db.js";
import Stock from "../../backend/models/stock.js";
import MarketData from "../../backend/models/marketData.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env")
});
// CLI arg
const symbol = process.argv[2];

if (!symbol) {
  console.error("Usage: node exportData.js SYMBOL");
  process.exit(1);
}

// This resolves to:
// D:/TradeBuddy/ml-service/data/EURUSD=X
const symbolDir = path.resolve(
  __dirname,
  "../data",
  symbol
);

console.log("Export folder:", symbolDir);

// Intervals to export
const INTERVALS = [
  "5m",
  "15m",
  "30m",
  "1h",
  "1d"
];

(async function main() {
  try {
    await connectDB();

    const stockDoc = await Stock.findOne({
      symbol
    });

    if (!stockDoc) {
      console.error(
        "❌ Stock not found:",
        symbol
      );
      process.exit(1);
    }

    // Create:
    // ml-service/data/EURUSD=X
    if (!fs.existsSync(symbolDir)) {
      fs.mkdirSync(symbolDir, {
        recursive: true
      });
    }

    for (const interval of INTERVALS) {
      let data = await MarketData.find({
        stock: stockDoc._id,
        interval
      }).sort({ timestamp: 1 })
      .lean();

      if (!data.length) {
        console.log(
          `No data found for ${symbol} with interval ${interval}`
        );
        continue;
      }

      if (interval !== "1d") {
        data = data.filter(
          doc =>
            doc.movingAverage != null &&
            doc.ema != null &&
            doc.rsi != null &&
            doc.macd != null &&
            doc.bollingerUpper != null &&
            doc.bollingerLower != null
        );

        if (!data.length) {
          console.log(
            `No complete rows (indicators) for ${symbol} at ${interval}`
          );
          continue;
        }
      }

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
          "bollingerLower"
        ],
        ...data.map(doc => {
          const utc =
            doc.timestamp.toISOString();

          const local = new Date(
            doc.timestamp
          ).toLocaleString(
            "en-IN",
            {
              timeZone: "Asia/Kolkata",
              hour12: false
            }
          );

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
            doc.bollingerLower
          ];
        })
      ]
        .map(row => row.join(","))
        .join("\n");

      const outPath = path.join(
        symbolDir,
        `${symbol}_${interval}.csv`
      );

      fs.writeFileSync(
        outPath,
        csvData
      );

      console.log(
        `✅ Exported ${data.length} rows to ${outPath}`
      );
    }

    await mongoose.connection.close();

    console.log(
      "✅ Export completed successfully"
    );

    process.exit(0);

  } catch (err) {

    console.error(
      "❌ Error exporting data:",
      err
    );

    process.exit(1);
  }
})();
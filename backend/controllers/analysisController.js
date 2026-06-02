import { exec } from "child_process";
import util from "util";
import { updateLive,updateMonth,updateWeek,updateYearAgo,updateYesterday } from "./marketDataController.js";
import Stock from "../models/stock.js";
import MarketData from "../models/marketData.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

  const exportScript = path.resolve(
  __dirname,
  "../../ml-service/scripts/exportData.js"
);

const pipelineScript = path.resolve(
  __dirname,
  "../../ml-service/ai/data_pipeline.py"
);

const predictScript = path.resolve(
  __dirname,
  "../../ml-service/ai/predict.py"
);

const execPromise = util.promisify(exec);

const getChartData = async (
  symbol,
  interval = "5m"
) => {

  const stock = await Stock.findOne({
    symbol
  });

  if (!stock) {
    return [];
  }

  const candles =
    await MarketData.find({
      stock: stock._id,
      interval
    })
    .sort({ timestamp: -1 })
    .limit(300);

  return candles
    .reverse()
    .map(candle => ({
      time: candle.timestamp,
      price: candle.close
       
         
    
    }));
};






export const analyzeAsset = async (
  req,
  res
) => {

  try {

    console.log("Step 1: Fetch Data");

    await updateLive();
    await updateYesterday();
    await updateWeek();
    await updateMonth();
    await updateYearAgo();

    console.log("Step 2: Export CSV");
console.log(
  `node "${exportScript}" EURUSD=X`
);
    await execPromise(
  `node "${exportScript}" EURUSD=X`
);

await execPromise(
  `python "${pipelineScript}"`
);
    console.log("Step 4: Predict");

   const { stdout } =
  await execPromise(
    `python "${predictScript}"`
  );
  const prediction =
  JSON.parse(
    stdout.trim().split("\n").pop()
  );

  
  const chartData =
  await getChartData(
    prediction.symbol
  );
  const currentPrice =
  chartData.length
    ? chartData[
        chartData.length - 1
      ].price
    : null;

const lastUpdated =
  new Date().toISOString();

return res.json({

  ...prediction,

  currentPrice,

  lastUpdated,

  chartData

});
  
 


  }


    catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }};
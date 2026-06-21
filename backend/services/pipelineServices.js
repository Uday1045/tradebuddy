import { exec } from "child_process";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import Prediction from "../models/Prediction.js";

import {
  updateLive,
  updateMonth,
  updateWeek,
  updateYearAgo,
  updateYesterday
} from "../controllers/marketDataController.js";

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function runAnalysisPipeline() {

  try {

    console.log("========== PIPELINE START ==========");

    console.log("Step 1: Updating market data");

    await updateLive();
    await updateYesterday();
    await updateWeek();
    await updateMonth();
    await updateYearAgo();


    console.log("Step 2: Exporting CSV");

    await execPromise(
      `node "${exportScript}" EURUSD=X`,
      {
        maxBuffer: 1024 * 1024 * 50
      }
    );


    console.log("Step 3: Processing ML data");

    await execPromise(
      `python "${pipelineScript}" EURUSD=X`,
      {
        maxBuffer: 1024 * 1024 * 50
      }
    );


    console.log("Step 4: Running prediction");

    const { stdout } = await execPromise(
      `python "${predictScript}"`,
      {
        maxBuffer: 1024 * 1024 * 50
      }
    );


    const prediction =
      JSON.parse(
        stdout.trim().split("\n").pop()
      );


    console.log(
      "Prediction generated:",
      prediction
    );

console.log("Prediction generated:", prediction);
await Prediction.create(prediction);


    console.log("========== PIPELINE FINISHED ==========");

    return prediction;

  }
  catch(error) {

    console.error(
      "PIPELINE ERROR:",
      error
    );

    throw error;
  }
}
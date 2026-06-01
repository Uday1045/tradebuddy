import { exec } from "child_process";
import util from "util";
import { updateLive,updateMonth,updateWeek,updateYearAgo,updateYesterday } from "./marketDataController.js";
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
    const result =
      JSON.parse(
        stdout.trim().split("\n").pop()
      );

    return res.json(result);

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
};
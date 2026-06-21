import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Current directory:", __dirname);
export const predictAsset = async (req, res) => {
  try {
    const scriptPath = path.join(
      __dirname,
      "../../ml-service/ai/predict.py"
    );

    exec(
      `python "${scriptPath}"`,
      (error, stdout, stderr) => {

        if (error) {
          return res.status(500).json({
            error: error.message,
          });
        }

        if (stderr) {
          console.error(stderr);
        }

        try {
          const lines = stdout
            .trim()
            .split("\n");

          const lastLine =
            lines[lines.length - 1];

          const result =
            JSON.parse(lastLine);

          return res.json(result);

        } catch (err) {
          return res.status(500).json({
            error: "Failed to parse prediction output",
          });
        }
      }
    );

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
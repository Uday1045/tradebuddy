import express from "express";
import {
  predictAsset,

} from "../controllers/predictionController.js";
import { analyzeAsset } from "../controllers/analysisController.js";
const router = express.Router();

router.post("/predict", predictAsset);
router.get("/analyze", analyzeAsset);

export default router;
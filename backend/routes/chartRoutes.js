import express from "express";

import {
  getChartData
} from "../controllers/chartController.js";

const router =
  express.Router();

router.get(
  "/:symbol",
  getChartData
);

export default router;
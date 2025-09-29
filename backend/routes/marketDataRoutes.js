
import express from "express";
import {
  fetchLiveAAPL,
  fetchYesterdayAAPL,
  fetchWeekAAPL,
  fetchMonthAAPL,
  fetchYearAgoAAPL,
} from "../controllers/marketDataController.js";

const router = express.Router();

router.get("/live", fetchLiveAAPL);
router.get("/yesterday", fetchYesterdayAAPL);
router.get("/week", fetchWeekAAPL);
router.get("/month", fetchMonthAAPL);
router.get("/year-ago", fetchYearAgoAAPL);

export default router;
// import express from "express";
// import { fetchAndStoreMarketData ,fetchAndStoreHistoricalData} from "../controllers/marketDataController.js";

// const router = express.Router();

// // GET /api/marketdata/fetch
// router.get("/fetch", fetchAndStoreMarketData);
// router.get("/fetch/historical", fetchAndStoreHistoricalData);

// export default router;

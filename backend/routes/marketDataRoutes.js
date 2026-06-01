
import express from "express";
import {
  fetchLive,
  fetchYesterday,
  fetchWeek,
  fetchMonth,
  fetchYearAgo,
} from "../controllers/marketDataController.js";

const router = express.Router();

router.get("/live", fetchLive);
router.get("/yesterday", fetchYesterday);
router.get("/week", fetchWeek);
router.get("/month", fetchMonth);
router.get("/year-ago", fetchYearAgo);

export default router;
// import express from "express";
// import { fetchAndStoreMarketData ,fetchAndStoreHistoricalData} from "../controllers/marketDataController.js";

// const router = express.Router();

// // GET /api/marketdata/fetch
// router.get("/fetch", fetchAndStoreMarketData);
// router.get("/fetch/historical", fetchAndStoreHistoricalData);

// export default router;

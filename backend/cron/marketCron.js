import cron from "node-cron";

import {
  updateLive,
  updateYesterday,
  updateWeek,
  updateMonth,
  updateYearAgo
} from "../controllers/marketDataController.js";


export const startMarketCron = () => {

  // Runs every 5 minutes
  cron.schedule("*/5 * * * *", async () => {

    console.log("Starting market data update...");

    try {

      await updateLive();
      console.log("5m data updated");

      await updateYesterday();
      console.log("15m data updated");

      await updateWeek();
      console.log("30m data updated");

      await updateMonth();
      console.log("1h data updated");

      await updateYearAgo();
      console.log("1d data updated");

      console.log("Market update completed");

    } catch (error) {

      console.error(
        "Market cron failed:",
        error.message
      );

    }

  });

};
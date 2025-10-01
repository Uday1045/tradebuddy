import { fetchOHLCV } from "../config/yahoofinance.js";
import { EMA, BollingerBands, MACD, RSI } from "technicalindicators";

// Helper to calculate date ranges
// const getDateRange = (type) => {
//   const now = new Date();
//   let startDate;
//   let endDate = now;

//   const isWeekend = (date) => [0, 6].includes(date.getDay());
//   const previousTradingDay = (date) => {
//     let d = new Date(date);
//     while (isWeekend(d)) d.setDate(d.getDate() - 1);
//     return d;
//   };

//   switch (type) {
//     case "live":
//   case "live":
//       // 🔹 New logic for live: full session or at least 1 hour window
//       const marketOpen = new Date(now);
//       marketOpen.setUTCHours(13, 30, 0, 0); // 13:30 UTC
//       const marketClose = new Date(now);
//       marketClose.setUTCHours(20, 0, 0, 0); // 20:00 UTC

//       startDate = marketOpen;
//       endDate = now > marketClose ? marketClose : now;

//       // ensure minimum 1 hour window
//       if (endDate.getTime() - startDate.getTime() < 60 * 60 * 1000) {
//         startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
//       }
//       break;

//     case "yesterday":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(now);
//       endDate.setDate(now.getDate() - 1);
//       endDate.setHours(23, 59, 59, 999);
//       break;

//     case "week":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 7);
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     case "month":
//       startDate = new Date(now);
//       startDate.setMonth(now.getMonth() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     case "yearAgo":
//       startDate = new Date(now);
//       startDate.setFullYear(now.getFullYear() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       startDate = previousTradingDay(startDate);
//       endDate = new Date(startDate);
//       endDate.setHours(23, 59, 59, 999);
//       break;

//     default:
//       startDate = new Date(now);
//   }

//   if (!startDate) startDate = new Date(now);
//   if (!endDate) endDate = new Date(now);

//   return { startDate, endDate };
// };
const getDateRange = (interval) => {
  const now = new Date();
  let startDate = new Date(now);
    let endDate= new Date(now);


  switch (interval) {
    case "live":
       startDate.setDate(now.getDate() - 59); // last 60 days max
      break;
    case "yesterday":
      startDate.setDate(now.getDate() - 60); // last 60 days max
      break;
    case "week":
      startDate.setDate(now.getDate() - 60); // last 60 days max
      break;
    case "month":
    startDate.setDate(now.getDate() - 729); 
      break;
    case "yearAgo":
      endDate.setFullYear(now.getFullYear() - 1); // e.g., 2024-09-30
       // e.g., 2024-08-01
startDate.setDate(endDate.getDate() - 150); // e.g., 2024-08-01
      break;
  
    default:
      startDate.setFullYear(now.getFullYear() - 1);
  }

  // Ensure startDate < now
  if (startDate.getTime() >= now.getTime()) {
    startDate.setMinutes(now.getMinutes() - 1);
  }

  return { startDate, endDate: now };
};
// 🔹 Fetch live data for AAPL with indicators
export const fetchLiveAAPL = async (req, res) => {
  

      const { startDate, endDate } = getDateRange("live");
  const result = await fetchOHLCV("EURUSD=X", { startDate, endDate, interval: "5m", source:"live" });
  res.json({ success: !!result, dataPoints: result?.quotes?.length || 0,result });
};
// 🔹 Fetch yesterday's data
export const fetchYesterdayAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("yesterday");
  const result = await fetchOHLCV("EURUSD=X", { startDate, endDate, interval: "15m", source:"yesterday" });
  res.json({ success: !!result, dataPoints: result?.quotes?.length || 0,result });
};

// 🔹 Fetch last week's data
export const fetchWeekAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("week");
  const result = await fetchOHLCV("EURUSD=X", {startDate, endDate, interval: "30m", source:"week"});
  res.json({ success: !!result, dataPoints: result?.quotes?.length || 0 ,result });
};

// 🔹 Fetch last month's data
export const fetchMonthAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("month");
  const result = await fetchOHLCV("EURUSD=X", {startDate, endDate, interval: "1h", source:"month"});
const dataPoints = result?.quotes?.length ?? result?.indicators?.quote?.[0]?.close?.length ?? 0;
res.json({ success: !!result, dataPoints ,result });
};

// 🔹 Fetch same day last year
export const fetchYearAgoAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("yearAgo");
  const result = await fetchOHLCV("EURUSD=X", {startDate, endDate, interval: "1d", source:"yearAgo"});
const dataPoints = result?.quotes?.length ?? result?.indicators?.quote?.[0]?.close?.length ?? 0;
res.json({ success: !!result, dataPoints ,result });
};

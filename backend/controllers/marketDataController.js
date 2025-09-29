import { fetchOHLCV } from "../config/yahoofinance.js";
import { EMA, BollingerBands, MACD, RSI } from "technicalindicators";

// Helper to calculate date ranges
const getDateRange = (type) => {
  const now = new Date();
  let startDate;
  let endDate = now;

  const isWeekend = (date) => [0, 6].includes(date.getDay());
  const previousTradingDay = (date) => {
    let d = new Date(date);
    while (isWeekend(d)) d.setDate(d.getDate() - 1);
    return d;
  };

  switch (type) {
    case "live":
      startDate = new Date(now);
      startDate.setUTCHours(13, 30, 0, 0);
      if (endDate < startDate) endDate = new Date(startDate);
      break;

    case "yesterday":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "month":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "yearAgo":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      startDate = previousTradingDay(startDate);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(now);
  }

  if (!startDate) startDate = new Date(now);
  if (!endDate) endDate = new Date(now);

  return { startDate, endDate };
};

// 🔹 Fetch live data for AAPL with indicators
export const fetchLiveAAPL = async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange("live");
    const lookback = 50; // Enough for EMA, Bollinger, RSI

    const result = await fetchOHLCV("AAPL", {
      startDate,
      endDate,
      interval: "2m",
      source: "live",
      lookback,
    });

    if (!result?.quotes?.length) {
      return res.json({ success: false, dataPoints: 0, message: "No data returned" });
    }

    const quotes = result.quotes;
    const closePrices = quotes.map(q => q.close);

    // Compute indicators
    const emaValues = EMA.calculate({ period: 20, values: closePrices });
    const bbValues = BollingerBands.calculate({ period: 20, values: closePrices, stdDev: 2 });
    const rsiValues = RSI.calculate({ period: 14, values: closePrices });
    const macdValues = MACD.calculate({
      values: closePrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });

    // Enrich each quote with indicators
    const enrichedQuotes = quotes.map((q, i) => {
      const emaIndex = i - (closePrices.length - emaValues.length);
      const bbIndex = i - (closePrices.length - bbValues.length);
      const rsiIndex = i - (closePrices.length - rsiValues.length);
      const macdIndex = i - (closePrices.length - macdValues.length);

      return {
        ...q,
        ema: emaValues[emaIndex] ?? null,
        bollingerLower: bbValues[bbIndex]?.lower ?? null,
        bollingerUpper: bbValues[bbIndex]?.upper ?? null,
        rsi: rsiValues[rsiIndex] ?? null,
        macd: macdValues[macdIndex]?.MACD ?? null,
        // signal: macdValues[macdIndex]?.signal ?? null,
        // histogram: macdValues[macdIndex]?.histogram ?? null,
      };
    });

    res.json({ success: true, dataPoints: enrichedQuotes.length, quotes: enrichedQuotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Fetch yesterday's data
export const fetchYesterdayAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("yesterday");
  const result = await fetchOHLCV("AAPL", { startDate, endDate, interval: "15m", source:"yesterday" });
  res.json({ success: !!result, dataPoints: result?.quotes?.length || 0 });
};

// 🔹 Fetch last week's data
export const fetchWeekAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("week");
  const result = await fetchOHLCV("AAPL", {startDate, endDate, interval: "30m", source:"week"});
  res.json({ success: !!result, dataPoints: result?.quotes?.length || 0 });
};

// 🔹 Fetch last month's data
export const fetchMonthAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("month");
  const result = await fetchOHLCV("AAPL", {startDate, endDate, interval: "30m", source:"month"});
const dataPoints = result?.quotes?.length ?? result?.indicators?.quote?.[0]?.close?.length ?? 0;
res.json({ success: !!result, dataPoints });
};

// 🔹 Fetch same day last year
export const fetchYearAgoAAPL = async (req, res) => {
  const { startDate, endDate } = getDateRange("yearAgo");
  const result = await fetchOHLCV("AAPL", {startDate, endDate, interval: "1d", source:"yearAgo"});
const dataPoints = result?.quotes?.length ?? result?.indicators?.quote?.[0]?.close?.length ?? 0;
res.json({ success: !!result, dataPoints });
};

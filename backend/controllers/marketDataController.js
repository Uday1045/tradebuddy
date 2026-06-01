import Stock from "../models/stock.js";
import MarketData from "../models/marketData.js";
import { fetchOHLCV } from "../config/yahoofinance.js";

const getIncrementalRange = async (
  symbol,
  interval,
  fallbackDays
) => {

  const stock = await Stock.findOne({
    symbol
  });

  if (!stock) {
    throw new Error(
      `Stock ${symbol} not found`
    );
  }

  const latestCandle =
    await MarketData.findOne({
      stock: stock._id,
      interval
    })
    .sort({ timestamp: -1 });

  const endDate = new Date();

  let startDate;

  if (latestCandle) {

    console.log(
      `Latest ${interval} candle:`,
      latestCandle.timestamp
    );

    startDate = new Date(
      latestCandle.timestamp
    );

  } else {

    console.log(
      `No ${interval} candles found.`
    );

    startDate = new Date();

    startDate.setDate(
      startDate.getDate() - fallbackDays
    );
  }

  return {
    startDate,
    endDate
  };
};

// =========================
// 5 Minute Data
// =========================


export const updateLive = async () => {

  const {
    startDate,
    endDate
  } = await getIncrementalRange(
    "EURUSD=X",
    "5m",
    14
  );

  const result =
    await fetchOHLCV(
      "EURUSD=X",
      {
        startDate,
        endDate,
        interval: "5m",
        source: "live"
      }
    );

  return {
   
    result
  };
};




export const fetchLive = async (
  req,
  res
) => {

  try {

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "5m", 
      14
      
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "5m",
          source: "live"
        }
      );

    return res.json({
      success: true,
      dataPoints:
        result?.quotes?.length || 0,
      startDate,
      endDate,
      result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
};

// =========================
// 15 Minute Data
// =========================


export const updateYesterday =
async () => {

  

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "15m",
      60
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "15m",
          source: "yesterday"
        }
      );

    return {
      result
    };
  };





export const fetchYesterday =
async (req, res) => {

  try {

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "15m",
      60
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "15m",
          source: "yesterday"
        }
      );

    return res.json({
      success: true,
      dataPoints:
        result?.quotes?.length || 0,
      result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
};

// =========================
// 30 Minute Data
// =========================


export const updateWeek =
async () => {

  

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "30m",
      120
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "30m",
          source: "week"
        }
      );

    return {
      
      result
    };
  };





export const fetchWeek =
async (req, res) => {

  try {

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "30m",
      120
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "30m",
          source: "week"
        }
      );

    return res.json({
      success: true,
      dataPoints:
        result?.quotes?.length || 0,
      result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
};

// =========================
// 1 Hour Data
// =========================


export const updateMonth =
async () => {

  

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "1h",
      365
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "1h",
          source: "month"
        }
      );

    return {
     
      result
    };
  };






export const fetchMonth =
async (req, res) => {

  try {

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "1h",
      365
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "1h",
          source: "month"
        }
      );

    return res.json({
      success: true,
      dataPoints:
        result?.quotes?.length || 0,
      result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
};

// =========================
// Daily Data
// =========================


export const updateYearAgo =
async () => {

  

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "1d",
      365 * 3
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "1d",
          source: "yearAgo"
        }
      );

    return {
      
      result
    };
  };




export const fetchYearAgo =
async (req, res) => {

  try {

    const {
      startDate,
      endDate
    } = await getIncrementalRange(
      "EURUSD=X",
      "1d",
      365 * 3
    );

    const result =
      await fetchOHLCV(
        "EURUSD=X",
        {
          startDate,
          endDate,
          interval: "1d",
          source: "yearAgo"
        }
      );

    return res.json({
      success: true,
      dataPoints:
        result?.quotes?.length || 0,
      result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
};
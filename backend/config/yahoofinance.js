import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();
import MarketData from "../models/marketData.js";
import Stock from "../models/stock.js";
import { SMA, EMA, RSI, MACD, BollingerBands } from "technicalindicators";

/**
 * Fetch OHLCV data from Yahoo Finance and store in MongoDB.
 * @param {string} symbol - Stock symbol
 * @param {Object} options
 * @param {Date} options.startDate - Start date for fetching
 * @param {Date} options.endDate - End date for fetching
 * @param {string} options.interval - Candle interval (e.g., "5m", "15m", "30m","1h", "1d")
 * @param {String} source - Source of data ("live", "yesterday", "week", "month", "yearAgo", etc.)

 */
export const fetchOHLCV = async (symbol, { startDate, endDate, interval,source }) => {
  try {


    const stockDoc = await Stock.findOne({ symbol });
    if (!stockDoc) return null;

const queryOptions = {
  period1: Math.floor(startDate.getTime() / 1000), // convert to seconds
  period2: Math.floor(endDate.getTime() / 1000),
  interval
};
    const result = await yahooFinance.chart(symbol, queryOptions);
    const closes = result.quotes.map(q => q.close);

    // Indicators
    const ma20 = SMA.calculate({ period: 20, values: closes });
    const ema20 = EMA.calculate({ period: 20, values: closes });
    const rsi14 = RSI.calculate({ period: 14, values: closes });
    const macdArr = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
    });
    const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });

   for (let i = 0; i < result.quotes.length; i++) {
  const q = result.quotes[i];

  await MarketData.findOneAndUpdate(
    { stock: stockDoc._id, timestamp: q.date, interval }, // match existing
    {
      stock: stockDoc._id,
      timestamp: q.date,
      interval,
      source,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
      movingAverage: ma20[i - (closes.length - ma20.length)] || null,
      ema: ema20[i - (closes.length - ema20.length)] || null,
      rsi: rsi14[i - (closes.length - rsi14.length)] || null,
      macd: macdArr[i - (closes.length - macdArr.length)]?.MACD || null,
      bollingerUpper: bb[i - (closes.length - bb.length)]?.upper || null,
      bollingerLower: bb[i - (closes.length - bb.length)]?.lower || null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true } // ✅ insert if missing, update if exists
  );
}

    console.log(`✅ Inserted ${result.quotes.length} candles for ${symbol}`);
    return result;

  } catch (err) {
    console.error(`❌ Error fetching stock data: ${symbol}`, err.message);
    return null;
  }
};


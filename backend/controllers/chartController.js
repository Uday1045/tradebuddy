import Stock from "../models/stock.js";
import MarketData from "../models/marketData.js";

export const getChartData = async (
  req,
  res
) => 
{

  try {

    const { symbol } = req.params;

    const stock =
      await Stock.findOne({
        symbol
      });

    if (!stock) {

      return res.status(404).json({
        error: "Stock not found"
      });

    }

    const candles =
      await MarketData.find({
        stock: stock._id,
        interval: "5m"
      })
      .sort({ timestamp: 1 })
      .select(
        "timestamp close -_id"
      )
      .limit(500);

    const chartData = candles.map(candle => ({
  timestamp: candle.timestamp,
  price: candle.close
}));

    return res.json(
      chartData
    );

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
};
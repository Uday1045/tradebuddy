import { useState } from "react";
import api from "../services/api";

import SymbolSelector from "../components/SymbolSelector";
import PredictionCard from "../components/PredictionCard";
import PriceChart from "../components/PriceChart";

function Dashboard() {
  const [symbol, setSymbol] = useState("EURUSD=X");

  const [predictionData, setPredictionData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const chartData = [
    {
      time: "10:00",
      price: 1.12,
    },
    {
      time: "11:00",
      price: 1.13,
    },
    {
      time: "12:00",
      price: 1.15,
    },
  ];

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/analyze",
      
      );

      setPredictionData(response.data);
    } catch (error) {
      console.error(error);

      alert("Failed to analyze market");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>TradeBuddy AI</h1>

      <SymbolSelector
        symbol={symbol}
        setSymbol={setSymbol}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading
          ? "Analyzing..."
          : "Analyze"}
      </button>

      {predictionData && (
        <div>
          <h2>
            Symbol: {predictionData.symbol}
          </h2>

          <PredictionCard
            title="30 Minute Prediction"
            prediction={
              predictionData.prediction30m
            }
            confidence={
              predictionData.confidence30m
            }
          />

          <PriceChart
            data={chartData}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
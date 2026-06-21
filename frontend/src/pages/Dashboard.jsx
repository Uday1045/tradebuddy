import { useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import MarketCard from "../components/MarketCard";
import SymbolSelector from "../components/SymbolSelector";
import PredictionCard from "../components/PredictionCard";
import PriceChart from "../components/PriceChart";

function Dashboard() {
  const [symbol, setSymbol] = useState("EURUSD=X");

  const [predictionData, setPredictionData] =
    useState(null);

    const [loading, setLoading] =
  useState(false);


  

  

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/analyze",
        { symbol }
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
  <div className="min-h-screen bg-slate-950">

    <Header />

    <div className="max-w-7xl mx-auto p-6">

      <div className="mb-6">
        <SymbolSelector
          symbol={symbol}
          setSymbol={setSymbol}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <MarketCard
  title="Last Updated"
  value={
    predictionData?.createdAt
      ? new Date(predictionData.createdAt).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        )
      : "-"
  }
/>

        <MarketCard
          title="Prediction"
          value={
            predictionData?.prediction30m ||
            "-"
          }
        />

        <MarketCard
          title="Confidence"
          value={
            predictionData
              ? `${predictionData.confidence30m}%`
              : "-"
          }
        />

      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="
            bg-blue-600
            hover:bg-blue-700
            px-8
            py-3
            rounded-lg
            text-white
            font-semibold
            disabled:opacity-50
          "
        >
          {
            loading
              ? "Analyzing Market..."
              : "Analyze Market"
          }
        </button>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

  <div className="lg:col-span-2">

    <PriceChart
      data={predictionData?.chartData || []}
    />

  </div>

  <div>

    <PredictionCard
      title="AI Signal"
      prediction={
        predictionData?.prediction30m
      }
      confidence={
        predictionData?.confidence30m
      }
    />

  </div>

</div>

    </div>

  </div>
);
};
export default Dashboard;
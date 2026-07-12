import { useState } from "react";
import mlApi from "../services/mlApi";

import Header from "../components/Header";
import MarketCard from "../components/MarketCard";
import SymbolSelector from "../components/SymbolSelector";
import PredictionCard from "../components/PredictionCard";
import LiveChart from "../components/livechart";

function Dashboard() {
  const [symbol, setSymbol] = useState("EURUSD=X");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await mlApi.get(`/predict/${symbol}`);

      setPredictionData(response.data);
    } catch (error) {
      console.error(error);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">

      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              AI Forex Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Real-time market analysis powered by TradeBuddy AI
            </p>
          </div>

          <div className="flex items-center gap-4">

            <SymbolSelector
              symbol={symbol}
              setSymbol={setSymbol}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="
                bg-blue-600
                hover:bg-blue-700
                transition
                px-6
                py-3
                rounded-xl
                font-semibold
                shadow-lg
                disabled:opacity-50
              "
            >
              {loading ? "Analyzing..." : "Analyze Market"}
            </button>

          </div>

        </div>

        {/* Market Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <MarketCard
            title="Prediction"
            value={predictionData?.prediction30m || "-"}
          />

          <MarketCard
            title="Confidence"
            value={
              predictionData
                ? `${predictionData.confidence30m}%`
                : "-"
            }
          />

          <MarketCard
            title="Current Price"
            value={
              predictionData?.currentPrice
                ? predictionData.currentPrice
                : "-"
            }
          />

          <MarketCard
            title="Last Updated"
            value={
              predictionData?.createdAt
                ? new Date(
                    predictionData.createdAt
                  ).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })
                : "-"
            }
          />

        </div>

        {/* Main Dashboard */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Chart */}

          <div className="lg:col-span-2">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5">

              <div className="flex justify-between items-center mb-4">

                <div>

                  <h2 className="text-xl font-semibold">
                    Live EUR/USD Chart
                  </h2>

                  <p className="text-slate-400 text-sm">
                    Powered by TradingView
                  </p>

                </div>

                <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  ● Live
                </div>

              </div>

              <LiveChart />

            </div>

          </div>

          {/* Right Panel */}

          <div className="space-y-6">

            <PredictionCard
              title="AI Signal"
              prediction={predictionData?.prediction30m}
              confidence={predictionData?.confidence30m}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="text-xl font-semibold mb-4">
                Market Summary
              </h2>

              <div className="space-y-3 text-slate-300">

                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-400">
                    Forex Market
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Symbol</span>
                  <span>{symbol}</span>
                </div>

                <div className="flex justify-between">
                  <span>Prediction</span>
                  <span>
                    {predictionData?.prediction30m || "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>
                    {predictionData
                      ? `${predictionData.confidence30m}%`
                      : "-"}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
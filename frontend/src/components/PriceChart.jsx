import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

function PriceChart({ data }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl">

      <h2 className="text-white mb-4">
        EURUSD Price
      </h2>

      <ResponsiveContainer
        width="100%"
        height={400}
      >
        <LineChart data={data}>
          <XAxis
  dataKey="timestamp"
  tickFormatter={(value) =>
    new Date(value).toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit"
      }
    )
  }
/>
          <YAxis />
         <Tooltip
  labelFormatter={(value) =>
    new Date(value).toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata"
      }
    )
  }
/>

          <Line
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default PriceChart;
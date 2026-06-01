import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PriceChart({ data }) {
  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
function PredictionCard({
  title,
  prediction,
  confidence,
}) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <h2>
        {prediction === "UP"
          ? "📈 UP"
          : "📉 DOWN"}
      </h2>

      <p>
        Confidence: {confidence}%
      </p>
    </div>
  );
}

export default PredictionCard;
function MarketCard({
  title,
  value
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-white text-2xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}

export default MarketCard;
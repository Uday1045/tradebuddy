function SymbolSelector({
  symbol,
  setSymbol,
}) {
  return (
    <select
      value={symbol}
      onChange={(e) =>
        setSymbol(e.target.value)
      }
    >
      <option value="EURUSD=X">
        EUR/USD
      </option>
    </select>
  );
}

export default SymbolSelector;
function LiveChart() {
  return (
    <iframe
      title="EURUSD"
      src="https://s.tradingview.com/widgetembed/?symbol=FX:EURUSD&interval=30&theme=dark&style=1&locale=en"
      className="w-full h-[600px] rounded-xl"
    />
  );
}

export default LiveChart;
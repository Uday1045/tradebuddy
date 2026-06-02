function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            TradeBuddy AI
          </h1>

          <p className="text-slate-400 text-sm">
            Institutional Trading Intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 bg-green-500 rounded-full"></div>

          <span className="text-slate-300">
            Online
          </span>

        </div>

      </div>
    </header>
  );
}

export default Header;
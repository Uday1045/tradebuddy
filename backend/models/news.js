const newsSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  content: { type: String }, // full article or summary
  source: { type: String }, // e.g., Bloomberg, Reuters
  url: { type: String }, 
  sentiment: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" }, // later AI can classify this
  relatedStocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }], // link to stocks impacted
  publishedAt: { type: Date, required: true },
  collectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("News", newsSchema);

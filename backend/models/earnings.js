const earningsSchema = new mongoose.Schema({
  stock: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
  quarter: { type: String }, // Q1 2025
  revenue: Number,
  profit: Number,
  eps: Number, // earnings per share
  guidance: String, // company’s forward-looking statement
  publishedAt: { type: Date, required: true },
  collectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Earnings", earningsSchema);

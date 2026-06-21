import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
    },

    prediction30m: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
    },

    confidence30m: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Prediction", predictionSchema);
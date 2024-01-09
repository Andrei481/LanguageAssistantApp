const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: Buffer, required: true },
  className: { type: String, required: true },
  probability: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Detection = mongoose.model("Detection", detectionSchema);

module.exports = Detection;

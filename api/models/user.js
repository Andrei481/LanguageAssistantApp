const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: Buffer },
  joinedDate: { type: Date, default: Date.now },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  progressPoints: { type: Number, required: true, default: 0 },
  level: { type: Number, required: true, default: 1 }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
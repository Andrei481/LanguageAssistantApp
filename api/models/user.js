const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  joinedDate: { type: Date, default: Date.now },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
});


const User = mongoose.model("User",userSchema);

module.exports = User;
const mongoose = require("mongoose");

const InvigilatorSchema = new mongoose.Schema({
  invigilatorId: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  loginStatus: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
});

module.exports = mongoose.model("Invigilator", InvigilatorSchema);
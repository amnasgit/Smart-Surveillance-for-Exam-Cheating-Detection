const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  caseNo: {type: String, required: true, unique: true},
  caseId: {type: String, required: true},
  alertType: {type: String, required: true},
  severity: {type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true},
  timestamp: {type: Date,default: Date.now},
  status: {type: String, enum: ['New', 'Reviewing', 'Resolved'], default: 'New'},
  roomId: {type: String, required: true},
  details: {type: String},
  location: {type: String}
});

module.exports = mongoose.model('Alert', AlertSchema);
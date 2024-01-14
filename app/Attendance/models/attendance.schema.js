const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  in: {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    late: {
      type: Boolean,
      default: false,
    },
  },
  out: {
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
  },
  lastScan: {
    type: String,
    enum: ['in', 'out'],
    required: true,
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  in: {
    date: {
      type: String,
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
      type: String,
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

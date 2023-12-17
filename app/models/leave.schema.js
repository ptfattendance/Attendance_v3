const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    email: String,
    leaveId: {
      type: String,
      required: true,
      unique: true,
  },
    requestDate: String,
    toDate: String,
    reason: String,
    requestStatus: {
        type: String,
        enum: ['requested', 'approved', 'rejected'],
        required: true,
      },
    requestedOn: String,
    approvedOrRejectedOn: String,
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports=Leave
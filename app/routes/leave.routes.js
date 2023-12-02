const controller = require("../controllers/leave.controller");
const express = require('express');

const router = express.Router();


// API to request leave
router.post('/requestLeave', controller.requestLeave);

// API to get all the leave requests
router.get('/getAll',controller.listLeaveRequests);

// API to get all the leave requests by status
router.get('/getByStatus/:requestStatus',controller.listLeaveRequestsByStatus);

// API to approve or decline the leave request
router.post('/changeStatus', controller.changeLeaveStatus);


module.exports = router;
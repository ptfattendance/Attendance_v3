const controller = require("../controllers/attendance.controller");
const express = require('express')

const router = express.Router()

// API to list attendances for a single user
router.route("/get/:email").get(controller.listAttendances);

// API to list attendances for all users on a specific date
router.post('/getByDate', controller.listAttendancesByDate);  // "12/2/2023"

//API to list attendnce by ppassing month and year
router.post('/getByMonth', controller.listAttendancesByMonth); //2023 //12

//API to list attendnce by ppassing month and year
router.post('/getByMonthAndBatch', controller.listAttendancesByMonthAndBatch); //2023 //12 // batch

//API to get attenfance status of s user
router.get('/getStatus/:email',controller.getLatestAttendanceStatus);

module.exports = router
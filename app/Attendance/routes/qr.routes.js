const controller = require("../controllers/qr.controller");
const express = require('express')

const router = express.Router()

// API to generate qr
router.route("/get").get(controller.generate);

// API to verify qr (marks attendance)
router.route("/verify").post(controller.verify);

// API to get resp string to refresh qr page (if resp == 100, then refresh -> call generate qr and if resp == 0 , the qr is not scanned)
router.route("/response").get(controller.resp);

module.exports = router
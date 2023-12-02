const controller = require("../controllers/qr.controller");
const express = require('express')

const router = express.Router()

// API to generate qr
router.route("/get").get(controller.generate);

// API to verify qr (marks attendance)
router.route("/verify").post(controller.verify);

module.exports = router
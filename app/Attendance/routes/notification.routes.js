const controller = require("../controllers/notification.controller");
const express = require('express');

const router = express.Router();

// API to save token
router.route("/save-token").post(controller.saveToken);

// API to delete token
router.route("/delete-token/:email").get(controller.removeToken);

module.exports = router;
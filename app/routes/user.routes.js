const controller = require("../controllers/user.controller");
const express = require('express');
const router = express.Router();

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// API to get a single user
router.route("/get/:email").get(controller.getUser);

// API to get image
router.route("/image-get").post(controller.getImageByEmail);

// API to upload image
router.route("/image-add").post(upload.single('image'), controller.uploadImage);

// API to update user details
router.route("/update").post(controller.updateUser);

// API to get OTP
router.route("/get-otp").post(controller.getOtp);

// API to verify OTP
router.route("/verify-otp").post(controller.verifyOtp);

// API to reset password
router.route("/reset-password").post(controller.resetPassword);



module.exports = router
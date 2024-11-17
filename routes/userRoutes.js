const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  updateProfileController,
  userprofileController,
  verifyEmailController
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply Doctor || POST
// router.post("/apply-interviewer", authMiddleware, applyDoctorController);

router.post("/updateProfile", authMiddleware, updateProfileController);

//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllInterviewers", authMiddleware, getAllDocotrsController);

//BOOK APPOINTMENT
router.post("/book-interview", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availability",
  authMiddleware,
  bookingAvailabilityController
);
router.post("/getuserprofileById",authMiddleware,userprofileController)
//Appointments List
router.get("/user-interviews", authMiddleware, userAppointmentsController);


// Email Verification Route
router.get('/verify-email/:token', verifyEmailController);
const multer = require('multer');
const storage = multer.memoryStorage(); // Using memory storage
const upload = multer({ dest: 'uploads/' });

router.post("/apply-interviewer", upload.single('proof'),authMiddleware, applyDoctorController);

module.exports = router;
  
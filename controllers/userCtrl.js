const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

const nodemailer = require("nodemailer");

// Register Controller
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }

    // Hash the password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    // Create a new user
    const newUser = new userModel(req.body);
    await newUser.save();

    // Generate a verification token
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set up Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or another email service
      auth: {
        user: "ciripuramvarshith@gmail.com",
        pass: "wmyokiybrjyzerwi",
        tls: {
          rejectUnauthorized: false,
        },
      },
      
    });

    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;    

    console.log(verificationLink)
    const mailOptions = {
      from: "ciripuramvarshith@gmail.com",
      to: newUser.email,
      subject: "Verify Your Email",
      text: `Dear user,
    
    Thank you for registering with us! To complete your registration and activate your account, please verify your email address by clicking the link below:
    
    ${verificationLink}
    
    If you did not create an account, no further action is required.
    
    Best regards,
    InterviewConnect Team`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #1a73e8;
            margin: 0;
          }
          .content {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.5;
          }
          .button {
            display: inline-block;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #0f59a8;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to InterviewConnect</h1>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>Thank you for registering with us! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
          </div>
          <a href="${verificationLink}" class="button">Verify Your Email</a>
          <div class="footer">
            <p>If you did not create an account, no further action is required.</p>
            <p>Best regards, <br>InterviewConnect Team</p>
          </div>
        </div>
      </body>
      </html>
      `,
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });

    res.status(201).send({ message: "Registered successfull! Check your email for verification.", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: `Register Controller Error: ${error.message}` });
  }
};



const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    if (!user.isVerified) {
      return res.status(200).send({ message: "Email not verified. Please check your email.", success: false });
    }
    
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};


const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
// const applyDoctorController = async (req, res) => {
//   try {
//     const newDoctor = await doctorModel({ ...req.body, status: "pending" });
//     await newDoctor.save();
//     const adminUser = await userModel.findOne({ isAdmin: true });
//     const notifcation = adminUser.notifcation;
//     notifcation.push({
//       type: "apply-doctor-request",
//       message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Interviewer Account`,
//       data: {
//         doctorId: newDoctor._id,
//         name: newDoctor.firstName + " " + newDoctor.lastName,
//         onClickPath: "/admin/docotrs",
//       },
//     });
//     await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
//     res.status(201).send({
//       success: true,
//       message: "Doctor Account Applied Successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       error,
//       message: "Error While Applying As Interviewer",
//     });
//   }
// };

const multer=require('multer')
const storage = multer.memoryStorage();


const fs = require('fs');
// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {

    console.log(req)
    const filePath = req.file.path;
  const fileBuffer = fs.readFileSync(filePath); // Read the file as a buffer
  const base64File = fileBuffer.toString('base64');
//   const fileBuffer = req.file.buffer; // Read the file buffer directly
// const base64File = fileBuffer.toString('base64');
    const { firstName, lastName, phone, email, address, company, role, experience, feesPerCunsaltation, timings } = req.body;

    // Check if a file was uploaded
    console.log(req.proof)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Proof of certification is required." });
    }

    const newDoctor = new doctorModel({
      firstName,
      lastName,
      phone,
      email,
      address,
      company,
      role,
      experience,
      feesPerCunsaltation,
      timings,
      proof: base64File,  // Save file as buffer in the proof field
      status: "pending",
    });

    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Interviewer Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/interviewers",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Applied As Interviewer Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Applying As Interviewer",
    });
  }
};


const userprofileController=async (req,res) => {
  try{

    const user = await userModel.findOne({ _id: req.body.userId });
    if (user.isDoctor===true){
      const doctor=await doctorModel.findOne({userId:user._id})
      res.status(200).send({
        success:true,
        message:"single doc info fetched",
        data:doctor,
      });
    }
    else{
    
    res.status(200).send({
      success: true,
      message: "Sigle Doc Info Fetched",
      data: user,
    });
  }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Erro in Single docot info",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Interviewers Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro While Fetching Interviewer",
    });
  }
};

//BOOK APPOINTMENT
const bookeAppointmnetController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const doc = await doctorModel.findOne({ _id: req.body.doctorId });
    req.body.doctorName=doc.firstName;

    
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A new interview request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/interviews",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Booked Succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  console.log("hello")
  try {
    const doctorId = req.body.doctorId;
    const doc = await doctorModel.findOne({ _id: doctorId });
    //const doctor = await doctorModel.find({ _id: doctorId });
    // const doctor = await doctorModel.findById({
    //   doctorId
    //   })
    let start=moment(doc.timings[0], "HH:mm").toISOString();
    let end=moment(doc.timings[1], "HH:mm").toISOString();
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();

    const t=moment(req.body.time, "HH:mm").toISOString();

    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gt: fromTime,
        $lt: toTime,
      },
    });
    // console.log(appointments)

    if (start>t || toTime>end || appointments.length > 0) {
      // console.log("hi")
      return res.status(200).send({
        message: "Slot is not available at this time",
        success: false,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Slot is available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};
// send({ message: "User Already Exist", success: false });

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });

    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};
const updateProfileController = async (req, res) => {
  try {
    const doctor = await userModels.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Your profile has been updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Profile Update issue",
      error,
    });
  }
};

// userController.js
const verifyEmailController = async (req, res) => {
  console.log("Entered verifyEmailController"); // Check if the controller is reached
  try {
    const token = req.params.token;
    // console.log("Received token:", token); // Debugging token output
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded); // Debugging decoded output

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(400).send({ message: "Invalid link", success: false });
    }

    if (user.isVerified) {
      return res.status(200).send({ message: "Email already verified", success: true });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).send({ message: "Email verified successfully", success: true });
  } catch (error) {
    console.log("Verification error:", error.message); // Error log
    res.status(500).send({ success: false, message: `Error in Email Verification: ${error.message}` });
  }
};





module.exports = {
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
  verifyEmailController,
  
};

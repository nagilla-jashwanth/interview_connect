const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");


const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message:  "Your profile has been updated",
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

//get single docotor
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Sigle Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Erro in Single docot info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doc Appointments",
    });
  }
};


const google=require('googleapis')
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ciripuramvarshith@gmail.com",
    pass: "wmyokiybrjyzerwi",
  },
  tls: {
    rejectUnauthorized: false,
  },
});


const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    
    const appointed = await appointmentModel.findOne({ _id: appointmentsId });
    const user = await userModel.findOne({ _id: appointments.userInfo });
    const doctor = await doctorModel.findOne({ _id: appointed.doctorId });
    const patemail = user.email;
    const doctemail = doctor.email;
     
    console.log(patemail,doctemail,req.session)



    const sendMail = (to, subject, html) => {
      transporter.sendMail({
        to,
        subject,
        html,
      });
    };

    const links=["https://meet.google.com/kag-udyf-rjk",
      "https://meet.google.com/vue-iaij-pgk",
      "https://meet.google.com/mgs-ysib-byi",
      "https://meet.google.com/zdr-nczf-ssd",
    "https://meet.google.com/biw-ukxs-cpa"]

    const randomIndex = Math.floor(Math.random() * links.length);
    if (status === 'reject') {
      // Send a cancellation email if the status is 'reject'
      sendMail(
        [patemail],
        'Your Appointment is Cancelled',
        `<p>We regret to inform you that your interview with <b>Mr. ${doctor.firstName} ${doctor.lastName}</b>, initially scheduled has been cancelled. We understand that this may come as an inconvenience, and we apologize for any disruption this may cause.
  
  Please know that this cancellation may be due to unforeseen circumstances or scheduling conflicts. We encourage you to reschedule your interview at a time convenient for you. Our team is here to assist with booking a new appointment or providing any additional information you may need.
  
  To reschedule, please log in to our platform or contact our office directly. We're committed to providing you with the best interview experience and are looking forward to accommodating your needs as soon as possible.
  
  Thank you for your understanding and patience.</p>`
      );
    }
    else {
      // If the status is not 'reject', assume it is a confirmation
      const meetLink = links[randomIndex];
      sendMail(
        [patemail, doctemail],
        'Your Interview Confirmation',
        `<p>Dear <b> ${user.name},<b></p> <p>We are pleased to confirm your interview with <b>Mr. ${doctor.firstName} ${doctor.lastName}</b>. Your Interview has been successfully scheduled on time. To provide you with a convenient and accessible experience, this interview will be held virtually through Google Meet.</p> <p>Please use the following link to join the meeting at your scheduled time: <a href="${meetLink}">Join the Google Meet</a>.</p> <p><strong>Important Reminders:</strong></p> <ul> <li>Please ensure that you have a stable internet connection and a quiet, private space for your consultation.</li> <li>We recommend joining the meeting a few minutes early to test your audio and video settings.</li> </ul> <p>If you need to reschedule or have any questions about your appointment, feel free to contact our office at interview connect office.</p> <p>Thank you for choosing us for your interview experience needs. We look forward to your interview!.Your interview feedback results will be communicated further</p> <p>Warm regards,<br> Tech Team interview connect</p>`
      );
    }
    res.status(200).send({
    success: true,
    message: 'Appointment Status Updated and Email Sent',
  });
} 
  
   catch (error) {
    console.log('Error in updateStatusController:', error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error In Update Status',
    });
  }
};



module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
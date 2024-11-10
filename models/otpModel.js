const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: [true, "email is require"],
  },
  otp:{
    type:String,
    default: "",
  },
  verified:{
    type:Boolean,
    default: false,
  }
  
  
});

const otpModel = mongoose.model("otp", otpSchema);

module.exports = otpModel;
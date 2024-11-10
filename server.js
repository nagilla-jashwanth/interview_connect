// import path from 'path';
// import {fileURLToPath} from "url";
const express = require("express");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require('cors');
const path=require('path')

// const __filename=fileURLTOPath(import.meta.url)
// const __dirname=path.dirname(__filename)

//dotenv conig
dotenv.config();

//mongodb connection
connectDB();

//rest obejct
const app = express();
app.use(cors());
//middlewares
app.use(express.json());
app.use(moragan("dev"));
 
//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/interviewer", require("./routes/doctorRoutes"));
app.use(express.static(path.join(__dirname,'./client/build')))
app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'./client/build/index.html'));
});
//port
const port = process.env.PORT || 8080;
//listen port
app.listen(port, () => {
  console.log(
    `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
      .bgCyan.white
  );
});

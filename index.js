require("dotenv").config();
const express = require("express")
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser'); 
//cors middleware 
app.use(cors(
    {
      origin: "*",  // Allows all origins
      methods: ["GET", "POST", "PUT", "DELETE"],  
    }
  ));
// we are using body-parser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// For Db connection
require("./src/utils/db");

//Routes
const userRoutes = require("./src/routes/userRoutes")
const bannerRoutes = require("./src/routes/bannerRoutes")
const adminRoutes = require("./src/routes/adminRoutes")
const partnerRoutes = require("./src/routes/partnerRoutes")
const uploadRoutes = require("./src/routes/uploadRoutes")
const serviceRoutes = require("./src/routes/serviceRoutes")
const categoryRoutes = require("./src/routes/categoryRoutes")
const bookingRoutes = require("./src/routes/bookingRoutes")
const offerRoutes = require("./src/routes/offerRoutes")


app.use("/v1/admin",adminRoutes);
app.use("/v1/user",userRoutes);
app.use("/v1/banner",bannerRoutes);
app.use("/v1/partner",partnerRoutes);
app.use("/v1/upload",uploadRoutes);
app.use("/v1/service",serviceRoutes);
app.use("/v1/category",categoryRoutes);
app.use("/v1/booking",bookingRoutes);
app.use("/v1/offer",offerRoutes);


//server creating
const PORT  =  process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
// For cheking server working on brower
app.get("/", (req,res)=>{
    res.send("Server is Active")
})







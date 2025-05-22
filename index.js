require("dotenv").config();
const express = require("express")
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser'); 
// const cron = require("node-cron");
// const expireAndReassign = require("./src/utils/expireAndReaasign");
//cors middleware 
// Use raw body parser for webhook route only
app.use('/v1/payment/webhook', bodyParser.raw({ type: '*/*' }));
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


// cron.schedule("*/1 * * * *", async () => {
//   console.log("Running partner request expiry check...");
//   await expireAndReassign();
// });


//Routes
const userRoutes = require("./src/routes/userRoutes")
const bannerRoutes = require("./src/routes/bannerRoutes")
const adminRoutes = require("./src/routes/adminRoutes")
const partnerRoutes = require("./src/routes/partnerRoutes")
const uploadRoutes = require("./src/routes/uploadRoutes")
const categoryRoutes = require("./src/routes/categoryRoutes")
const subCategoryRoutes = require("./src/routes/subCategoryRoutes")
const serviceRoutes = require("./src/routes/serviceRoutes")
const bookingRoutes = require("./src/routes/bookingRoutes")
const offerRoutes = require("./src/routes/offerRoutes")
const feedbackRoutes = require("./src/routes/feedbackRoutes")
const notificationRoutes = require("./src/routes/notificationRoutes")
const jobStatusRoutes = require("./src/routes/JobStatusRoute")
const reviewRoutes = require("./src/routes/reviewRoutes")
const cliclAndViewsRoutes = require("./src/routes/clicksAndViewsRoutes")
const paymentRoutes = require("./src/routes/paymentRoutes")
const cartRoutes = require("./src/routes/cartRoutes")


app.use("/v1/admin",adminRoutes);
app.use("/v1/user",userRoutes);
app.use("/v1/banner",bannerRoutes);
app.use("/v1/partner",partnerRoutes);
app.use("/v1/upload",uploadRoutes);
app.use("/v1/category",categoryRoutes);
app.use("/v1/subCategory",subCategoryRoutes);
app.use("/v1/service",serviceRoutes);
app.use("/v1/booking",bookingRoutes);
app.use("/v1/offer",offerRoutes);
app.use("/v1/feedback",feedbackRoutes);
app.use("/v1/notification",notificationRoutes);
app.use("/v1/jobStatus",jobStatusRoutes);
app.use("/v1/review",reviewRoutes);
app.use("/v1/activity",cliclAndViewsRoutes);
app.use("/v1/payment",paymentRoutes);
app.use("/v1/cart",cartRoutes);


//server creating
const PORT  =  process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
// For cheking server working on brower
app.get("/", (req,res)=>{
    res.send("Server is Active")
})







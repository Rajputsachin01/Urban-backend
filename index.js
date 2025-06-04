
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("./src/utils/db");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(bodyParser.json()); // normal JSON parsing for other routes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// const cron = require("node-cron");
// const expireAndReassign = require("./src/utils/expireAndReaasign");

// cron.schedule("*/1 * * * *", async () => {
//   console.log("Running partner request expiry check...");
//   await expireAndReassign();
// });

const runVerifyPaymentCron = require("./src/jobs/verifyPaymentStatus");
runVerifyPaymentCron();



const userRoutes = require("./src/routes/userRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const partnerRoutes = require("./src/routes/partnerRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const subCategoryRoutes = require("./src/routes/subCategoryRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const offerRoutes = require("./src/routes/offerRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const jobStatusRoutes = require("./src/routes/JobStatusRoute");
const reviewRoutes = require("./src/routes/reviewRoutes");
const cliclAndViewsRoutes = require("./src/routes/clicksAndViewsRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");

app.use("/v1/admin", adminRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/banner", bannerRoutes);
app.use("/v1/partner", partnerRoutes);
app.use("/v1/upload", uploadRoutes);
app.use("/v1/category", categoryRoutes);
app.use("/v1/subCategory", subCategoryRoutes);
app.use("/v1/service", serviceRoutes);
app.use("/v1/booking", bookingRoutes);
app.use("/v1/offer", offerRoutes);
app.use("/v1/feedback", feedbackRoutes);
app.use("/v1/notification", notificationRoutes);
app.use("/v1/jobStatus", jobStatusRoutes);
app.use("/v1/review", reviewRoutes);
app.use("/v1/activity", cliclAndViewsRoutes);
app.use("/v1/payment", paymentRoutes);
app.use("/v1/cart", cartRoutes);
app.use("/v1/analytics", analyticsRoutes);
app.use("/v1/leave", leaveRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Server is Active");
});








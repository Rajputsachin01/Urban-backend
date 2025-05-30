const UserModel = require("../models/userModel");
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper");

const fetchAnalytics = async (req, res) => {
  try {
   
    const totalUsers = await UserModel.countDocuments({ isDeleted: false });

    const totalBookings = await BookingModel.countDocuments({ isDeleted: false });

  
    const paidResult = await BookingModel.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalRevenue = paidResult[0]?.total || 0;

    const dueResult = await BookingModel.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ["unpaid", "pending"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const toBeCollected = dueResult[0]?.total || 0;

    return Helper.success(res, "Analytics fetched successfully", {
      totalUsers,
      totalBookings,
      totalRevenue,
      toBeCollected,
    });
  } catch (error) {
    console.error("[Analytics Error]", error.message);
    return Helper.fail(res, "Failed to fetch analytics");
  }
};

module.exports = { fetchAnalytics };

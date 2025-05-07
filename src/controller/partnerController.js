const PartnerModel = require("../models/partnerModel");
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper");
const BookingModel = require("../models/bookingModel");
const { ObjectId } = require("mongodb");

async function getPartnerWithToken(partnerId, type) {
  try {
    let partnerDetail = await partnerProfile(partnerId);
    //partnerDetail.first_name + " " + partnerDetail.last_name, if we want to send then use it
    const token = signInToken(partnerId, type);
    return { token: token, partnerDetail: partnerDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const partnerProfile = async (partnerId) => {
  try {
    let partnerProfile = await PartnerModel.findById(partnerId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return partnerProfile;
  } catch (error) {
    return false;
  }
};
//for generating 4 digit random otp
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
//For creating Partner
const createPartner = async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      email,
      address,
      location,
      image,
      idProof,
      vehicleImage,
      drivingLicence,
      identityCard,
      createdBy,
      serviceId,
    } = req.body;
    console.log(req.body);

    // Validation for required fields
    if (!name) {
      return Helper.fail(res, "Name is required!");
    }
    if (!phoneNo) {
      return Helper.fail(res, "PhoneNo is required!");
    }
    if (!email) {
      return Helper.fail(res, "Email is required!");
    }
    if (!address) {
      return Helper.fail(res, "Address is required!");
    }
    if (!location) {
      return Helper.fail(res, "location is required!");
    }
    if (!image) {
      return Helper.fail(res, "Image is required!");
    }
    if (!idProof) {
      return Helper.fail(res, "IdProof is required!");
    }
    if (!vehicleImage) {
      return Helper.fail(res, "VehicleImage is required!");
    }
    if (!drivingLicence) {
      return Helper.fail(res, "DrivingLicence is required!");
    }
    if (!identityCard) {
      return Helper.fail(res, "IdentityCard is required!");
    }
    if (!createdBy) {
      return Helper.fail(res, "CreatedBy is required!");
    }
    if (!serviceId) {
      return Helper.fail(res, "serviceId is required!");
    }

    if (createdBy === "admin") {
      const data = {
        name,
        phoneNo,
        email,
        address,
        location,
        image,
        idProof,
        vehicleImage,
        drivingLicence,
        identityCard,
        isVerified: true,
        serviceId,
      };
      const create = await PartnerModel.create(data);

      if (!create) {
        return Helper.fail({ error: "data not saved" });
      }
      const type = "partner";
      const { token, partnerDetail } = await getPartnerWithToken(
        create._id,
        type
      );
      if (!token || !partnerDetail) {
        return Helper.error("Failed to generate token or get partner profile");
      }

      return Helper.success(res, "Partner created successfully", {
        token,
        partnerDetail,
      });
    }

    if (createdBy === "partner") {
      // const otp = generateOTP();
      const otp = "1234";
      const data = {
        name,
        phoneNo,
        email,
        address,
        location,
        image,
        idProof,
        vehicleImage,
        drivingLicence,
        identityCard,
        isVerified: false,
        otp,
        serviceId,
      };

      const create = await PartnerModel.create(data);
      if (!create) {
        return res.status(400).json({ error: "data not saved" });
      }
      return Helper.success(res, "OTP sent successfully!", create);
    }
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
// For Verifing OTP
const verifyOTP = async (req, res) => {
  // try {
  const { phoneNo, otp } = req.body;
  if (!otp) {
    return Helper.fail(res, "OTP are required");
  }
  // Validating phone no.
  if (phoneNo) {
    const phoneRegex = /^\d{6,14}$/;
    if (!phoneRegex.test(phoneNo)) {
      return Helper.fail(res, " Number is not valid!");
    }
  }
  const partner = await PartnerModel.findOne({
    $or: [{ phoneNo: phoneNo }],
    otp,
  });

  if (!partner) {
    return Helper.fail(res, "Invalid OTP");
  }
  // generateOtp()
  newOtp = "1234";
  partner.isVerified = true;
  partner.otp = newOtp; // set new otp
  await partner.save();
  // Generate JWT token and user details
  const type = "partner";
  const { token, partnerDetail } = await getPartnerWithToken(partner._id, type);
  if (!token || !partnerDetail) {
    return Helper.error("Failed to generate token or get partner profile");
  }

  return Helper.success(res, "OTP verified successfully", {
    token,
    partnerDetail,
  });
  // return Helper.success(res, "Partner verified successfully", partner);
};
// For resend OTP
const resendOTP = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return Helper.fail(res, "Please provide phone number.");
    }
    // Find partner using phone number
    const partner = await PartnerModel.findOne({ phoneNo });

    if (!partner) {
      return Helper.fail(res, "Partner not found!");
    }
    // Generate new OTP and set expiry
    // generateOTP();
    const otp = 1234;
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await PartnerModel.updateOne(
      { _id: partner._id },
      { $set: { otp, otpExpires } }
    );
    return Helper.success(res, "OTP resent successfully.");
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
// Delete partner permanantly
const deletePartner = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!id) {
      return Helper.fail(res, "Partner id required");
    }
    const isDeleted = await PartnerModel.findByIdAndDelete(id);
    console.log(isDeleted);

    if (!isDeleted) {
      return Helper.fail(res, "Partner not found!");
    }

    return Helper.success(res, "Partner deleted Successfully", {
      deletedPartner: isDeleted,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// Partner soft delete
const removePartner = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!id) {
      return Helper.fail(res, "Partner id required");
    }
    const isRemoved = await PartnerModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "Partner remove Successfully", {
      deletedPartner: isRemoved,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//login with phone number
const loginPartner = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    const partner = await PartnerModel.findOne({
      $or: [phoneNo ? { phoneNo } : null].filter(Boolean),
      isDeleted: false,
    });
    if (!partner) {
      return Helper.fail(res, "Partner not found ");
    }
    // generateOTP();
    const newotp = "1234";
    partner.otp = newotp;
    await partner.save();

    // here code for send the otp to user's phone number

    return Helper.success(res, "OTP sent successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to send OTP");
  }
};
//For partner current location
const getPartnerLocation = async (req, res) => {
  try {
    const partnerId = req.userId; //Coming from JWT token via isAuth middleware
    const { location } = req.body;
    const partner = await PartnerModel.findById(partnerId);
    // console.log(partner)
    if (!partner) {
      return Helper.fail(res, "partner not found");
    }
    if (!location) {
      return Helper.fail(res, "Please select your location");
    }
    let updatedLocation = await PartnerModel.findByIdAndUpdate(
      partnerId,
      { location: location },
      {
        new: true,
      }
    );
    console.log({ updatedLocation });
    if (!updatedLocation) {
      return Helper.fail(res, "partner location not updated");
    }
    return Helper.success(res, "location updated successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update location");
  }
};
//For fetching profile
const fetchProfile = async (req, res) => {
  try {
    const partnerId = req.userId;
    if (!partnerId) {
      return Helper.fail(res, "partnerId is required!");
    }
    const partnerProfile = await PartnerModel.findById(partnerId).select(
      "-idProof -vehicleImage -drivingLicence -identityCard -isDeleted -otp -createdAt -updatedAt"
    );

    if (!partnerProfile) {
      return Helper.fail(res, "Partner not found");
    }

    return Helper.success(res, "Profile fetched successfully", partnerProfile);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch profile");
  }
};
// const servicesForPartner = async (req, res) =>{
//     try {
//         const {partnerId} = req.body
//         if(!partnerId){
//             return Helper.fail(res, "partner id is required")
//         }
//         const services = await PartnerModel.find({_id:partnerId})
//         .select("-isDeleted -createdAt -updatedAt -__v")
//         .populate("serviceId", "name")
//         if(!services){
//             return Helper.fail(res, "no service available for this partner")
//         }
//         return Helper.success(res, "service fetched for the partner", services)
//     } catch (error) {
//         console.log(error);
//         return Helper.fail(res, error.message);
//     }
// };

const partnerListing = async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Build match stage
    const matchStage = {
      isDeleted: false,
    };

    const partnerList = await PartnerModel.find(matchStage)
      .skip(skip)
      .limit(limitVal);

    // Aggregation pipeline
    // const partnerList = await PartnerModel.aggregate([
    //   { $match: matchStage },
    //   { $skip: skip },
    //   { $limit: limitVal }
    // ]);

    const totalPartners = await PartnerModel.countDocuments(matchStage);

    if (partnerList.length === 0) {
      return Helper.fail(res, "No partners found");
    }

    const data = {
      partners: partnerList,
      totalPartners,
      totalPages: Math.ceil(totalPartners / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    };

    return Helper.success(res, "Partner listing", data);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const partnerListingWithServices = async (req, res) => {
  try {
    const listing = await PartnerModel.find({ isDeleted: false }).populate(
      "serviceId",
      "name"
    );
    // .select("serviceId, name -_id")
    if (!listing) {
      return Helper.fail(res, "no partner and service available");
    }
    return Helper.success(res, "partners listed with services", listing);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const myAnalytics = async (req, res) => {
  // for calculating runnig and request orders
  try {
    const partnerId = req.userId;

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    const runningOrderCount = await BookingModel.countDocuments({
      partnerId: partnerId,
      bookingStatus: "Progress",
    });
    // Count Request Orders (bookingStatus: 'Pending')
    const requestOrderCount = await BookingModel.countDocuments({
      partnerId: partnerId,
      bookingStatus: "Pending",
    });

    if (runningOrderCount === 0 && requestOrderCount === 0) {
      return Helper.fail(res, "No running or request orders found");
    }

    return Helper.success(res, "Partner order analytics", {
      runningOrders: runningOrderCount,
      requestOrders: requestOrderCount,
    });
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

// const requestOrdersList = async (req, res) => {
//     try {
//       const partnerId = req.userId;

//       if (!partnerId) {
//         return Helper.fail(res, "Partner ID is required");
//       }

//       // If partnerId is stored as ObjectId in BookingModel, convert it:
//       // const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

//       const requestOrders = await BookingModel.find({
//         partnerId: partnerId, // or use `partner: partnerId` if that's the field name
//         bookingStatus: 'Pending',
//       });

//       if (!requestOrders || requestOrders.length === 0) {
//         return Helper.fail(res, "No request orders found");
//       }

//       return Helper.success(res, "Request orders list", requestOrders);

//     } catch (error) {
//       return Helper.fail(res, error.message);
//     }
//   };
const requestOrdersList = async (req, res) => {
  try {
    const partnerId = req.userId;
    const { page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    const matchStage = {
      partnerId: partnerId,
      bookingStatus: "Pending",
    };

    const requestOrders = await BookingModel.find(matchStage)
      .sort({ createdAt: -1 }) // latest pending orders first
      .skip(skip)
      .limit(limitVal);

    const totalOrders = await BookingModel.countDocuments(matchStage);

    if (requestOrders.length === 0) {
      return Helper.fail(res, "No request orders found");
    }

    const data = {
      requestOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    };

    return Helper.success(res, "Request orders list", data);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

// const fetchPartnerAnalytics = async (req, res) => {
//   try {
//     const partnerId = req.userId;
//     if (!partnerId) {
//       return Helper.fail(res, "Partner ID is required");
//     }

//     // 1) Cast to ObjectId so Mongo can match correctly
//     const partnerObjectId = new ObjectId(partnerId);

//     // 2) Aggregate safely with a default of 0
//     const [ { totalAmount: Earnings = 0,
//               completedJobs: CompletedJobs = 0,
//      } = {} ] =
//       await BookingModel.aggregate([
//         {
//           $match: {
//             partnerId:     partnerObjectId,
//             bookingStatus: 'Completed',
//           }
//         },
//         {
//           $group: {
//             _id:         null,
//             totalAmount: { $sum: '$totalPrice' },
//             completedJobs: { $sum: 1 }
//           }
//         }
//       ]);

// const [ { totalAmount: PendingEarnings = 0 } = {} ] =
//       await BookingModel.aggregate([
//         { $match: { partnerId: partnerObjectId, bookingStatus: 'Pending' } },
//         { $group: {
//             _id: null,
//             totalAmount: { $sum: '$totalPrice' }
//         } }
//       ]);
//     // 3) Respond with the total
//     return Helper.success(res, "Partner Earning Analytics", {
//       TotalEarnings: Earnings,
//       completedJobs:  CompletedJobs,
//       PendingEarnings:  PendingEarnings
//     });

//   } catch (error) {
//     return Helper.fail(res, error.message);
//   }
// };

// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Types;
const fetchPartnerAnalytics = async (req, res) => {
  try {
    const partnerId = req.userId;
    const duration = req.body.duration; // 'week' or 'month'

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    if (!["week", "month"].includes(duration)) {
      return Helper.fail(res, "Duration must be 'week' or 'month'");
    }

    const partnerObjectId = new ObjectId(partnerId);
    const now = new Date();

    // Calculate date range based on duration
    const startDate = new Date(now);
    if (duration === "week") {
      startDate.setDate(now.getDate() - 7); // Last 7 days
    } else if (duration === "month") {
      startDate.setDate(now.getDate() - 30); // Last 30 days
    }

    // ===== Filtered Completed Earnings in Time Range =====
    const [
      { totalAmount: TotalEarnings = 0, completedJobs: CompletedJobs = 0 } = {},
    ] = await BookingModel.aggregate([
      {
        $match: {
          partnerId: partnerObjectId,
          bookingStatus: "Completed",
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
          completedJobs: { $sum: 1 },
        },
      },
    ]);

    // ===== Pending Earnings within duration =====
    const [{ totalAmount: PendingEarnings = 0 } = {}] =
      await BookingModel.aggregate([
        {
          $match: {
            partnerId: partnerObjectId,
            bookingStatus: "Pending",
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalPrice" },
          },
        },
      ]);

    return Helper.success(res, `Partner Earning Analytics for ${duration}`, {
      Duration: duration,
      TotalEarnings,
      CompletedJobs,
      PendingEarnings,
    });
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

// const listRecentJobs = async (req, res) => {
//   try {
//     const partnerId = req.userId;

//     if (!partnerId) {
//       return Helper.fail(res, "Partner ID is required");
//     }

//     const partnerObjectId = new ObjectId(partnerId);

//     const RecentJobs = await BookingModel.find({
//       partnerId: partnerObjectId,
//       bookingStatus: 'Completed'
//     })
//     .sort({ createdAt: -1 }); // newest first

//     return Helper.success(res, "Recent Jobs fetched successfully", {
//       RecentJobs
//     });

//   } catch (error) {
//     return Helper.fail(res, error.message);
//   }
// };
const listRecentJobs = async (req, res) => {
  try {
    const partnerId = req.userId;
    const { page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    const partnerObjectId = new ObjectId(partnerId);

    const matchStage = {
      partnerId: partnerObjectId,
      bookingStatus: "Completed",
    };

    const RecentJobs = await BookingModel.find(matchStage)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limitVal);

    const totalJobs = await BookingModel.countDocuments(matchStage);

    if (RecentJobs.length === 0) {
      return Helper.fail(res, "No recent jobs found");
    }

    const data = {
      RecentJobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    };

    return Helper.success(res, "Recent Jobs fetched successfully", data);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createPartner,
  deletePartner,
  removePartner,
  verifyOTP,
  resendOTP,
  loginPartner,
  getPartnerLocation,
  fetchProfile,
  partnerListing,
  partnerListingWithServices,
  myAnalytics,
  requestOrdersList,
  fetchPartnerAnalytics,
  listRecentJobs,
};

const PartnerModel = require("../models/partnerModel");
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper");
const BookingModel = require("../models/bookingModel");
const { ObjectId } = require("mongodb");
const PartnerRequestModel = require("../models/partnerRequestModel");
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
// const createPartner = async (req, res) => {
//   try {
//     const {
//       name,
//       phoneNo,
//       email,
//       address,
//       location,
//       image,
//       idProof,
//       vehicleImage,
//       drivingLicence,
//       identityCard,
//       createdBy,
//       services
//     } = req.body;

//     // Validation for required fields
//     if (!name) {
//       return Helper.fail(res, "Name is required!");
//     }
//     if (!phoneNo) {
//       return Helper.fail(res, "PhoneNo is required!");
//     }
//     if (!email) {
//       return Helper.fail(res, "Email is required!");
//     }
//     if (!address) {
//       return Helper.fail(res, "Address is required!");
//     }
//     if (!location) {
//       return Helper.fail(res, "location is required!");
//     }
//     if (!image) {
//       return Helper.fail(res, "Image is required!");
//     }
//     if (!idProof) {
//       return Helper.fail(res, "IdProof is required!");
//     }
//     if (!vehicleImage) {
//       return Helper.fail(res, "VehicleImage is required!");
//     }
//     if (!drivingLicence) {
//       return Helper.fail(res, "DrivingLicence is required!");
//     }
//     if (!identityCard) {
//       return Helper.fail(res, "IdentityCard is required!");
//     }
//     if (!createdBy) {
//       return Helper.fail(res, "CreatedBy is required!");
//     }
//     if (!services) {
//       return Helper.fail(res, "services is required!");
//     }

//     if (createdBy === "admin") {
//       const data = {
//         userName,
//         name,
//         phoneNo,
//         email,
//         address,
//         location,
//         image,
//         idProof,
//         vehicleImage,
//         drivingLicence,
//         identityCard,
//         isVerified: true,
//         services,
//       };
//       const create = await PartnerModel.create(data);

//       if (!create) {
//         return Helper.fail({ error: "data not saved" });
//       }
//       const type = "partner";
//       const { token, partnerDetail } = await getPartnerWithToken(
//         create._id,
//         type
//       );
//       if (!token || !partnerDetail) {
//         return Helper.error("Failed to generate token or get partner profile");
//       }

//       return Helper.success(res, "Partner created successfully", {
//         token,
//         partnerDetail,
//       });
//     }

//     if (createdBy === "partner") {
//       // const otp = generateOTP();
//       const otp = "1234";
//       const data = {
//                 userName,
//         name,
//         phoneNo,
//         email,
//         address,
//         location,
//         image,
//         idProof,
//         vehicleImage,
//         drivingLicence,
//         identityCard,
//         isVerified: false,
//         otp,
//         services,
//       };

//       const create = await PartnerModel.create(data);
//       if (!create) {
//         return res.status(400).json({ error: "data not saved" });
//       }
//       return Helper.success(res, "OTP sent successfully!", create);
//     }
//   } catch (error) {
//     return Helper.fail(res, error.message);
//   }
// };
//new one
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
      services,
    } = req.body;

    // Validation for required fields
    if (!name) return Helper.fail(res, "Name is required!");
    if (!phoneNo) return Helper.fail(res, "PhoneNo is required!");
    if (!email) return Helper.fail(res, "Email is required!");
    if (!address) return Helper.fail(res, "Address is required!");
    if (!location) return Helper.fail(res, "Location is required!");
    if (!image) return Helper.fail(res, "Image is required!");
    if (!idProof) return Helper.fail(res, "IdProof is required!");
    if (!vehicleImage) return Helper.fail(res, "VehicleImage is required!");
    if (!drivingLicence) return Helper.fail(res, "DrivingLicence is required!");
    if (!identityCard) return Helper.fail(res, "IdentityCard is required!");
    if (!createdBy) return Helper.fail(res, "CreatedBy is required!");
    if (!services) return Helper.fail(res, "Services is required!");

    // Validate email and phoneNo uniqueness
    const existingPartner = await PartnerModel.findOne({
      $or: [{ email }, { phoneNo }],
      isDeleted: false, // if you soft-delete partners
    });
    if (existingPartner) {
      return Helper.fail(res, "Partner already exists with this email or phone number!");
    }

    // Generate userName: name + last 3 digits of phoneNo in lowercase
const last3Digits = String(phoneNo).slice(-3); // FIX here
let userNameBase = `${name.trim().replace(/\s+/g, '').toLowerCase()}${last3Digits}`;

// Ensure userName uniqueness (append number suffix if needed)
let userName = userNameBase;
let count = 0;
while (await PartnerModel.findOne({ userName })) {
  count++;
  userName = `${userNameBase}${count}`;
}


    if (createdBy === "admin") {
      const data = {
        userName,
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
        services,
      };
      const create = await PartnerModel.create(data);

      if (!create) {
        return Helper.fail(res, { error: "Data not saved" });
      }
      const type = "partner";
      const { token, partnerDetail } = await getPartnerWithToken(create._id, type);
      if (!token || !partnerDetail) {
        return Helper.fail(res, "Failed to generate token or get partner profile");
      }

      return Helper.success(res, "Partner created successfully", { token, partnerDetail });
    }

    if (createdBy === "partner") {
      const otp = "1234"; // replace with generateOTP() in prod
      const data = {
        userName,
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
        services,
      };

      const create = await PartnerModel.create(data);
      if (!create) {
        return Helper.fail(res, { error: "Data not saved" });
      }
      return Helper.success(res, "OTP sent successfully!", create);
    }
  } catch (error) {
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
    return Helper.fail(res, error.message);
  }
};
// Partner soft delete
const removePartner = async (req, res) => {
  try {
    const id = req.params.id;
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
    return Helper.fail(res, "failed to send OTP");
  }
};
//For partner current location
const getPartnerLocation = async (req, res) => {
  try {
    const partnerId = req.userId; //Coming from JWT token via isAuth middleware
    const { location } = req.body;
    const partner = await PartnerModel.findById(partnerId);
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
    if (!updatedLocation) {
      return Helper.fail(res, "partner location not updated");
    }
    return Helper.success(res, "location updated successfully");
  } catch (error) {
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
    return Helper.fail(res, "Failed to fetch profile");
  }
};

const partnerListing = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const matchStage = { isDeleted: false };
    if (req.type === "user") {
      matchStage.isPublished = true;
    }
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const partnerList = await PartnerModel.find(matchStage)
      .populate({ path: "services", select: "name" }) 
      .skip(skip)
      .limit(limitVal)
      .sort({ createdAt: -1 });

    const totalPartners = await PartnerModel.countDocuments(matchStage);

    const data = {
      partners: partnerList,
      totalPartners,
      totalPages: Math.ceil(totalPartners / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    };

    return Helper.success(res, "Partner listing", data);
  } catch (error) {
    console.log(error);
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
    return Helper.fail(res, error.message);
  }
};

const partnerAnalyticsAndOrders = async (req, res) => {
  try {
    const partnerId = req.userId;
    const { page = 1, limit = 3 } = req.body;

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Get analytics data
    const [runningOrderCount, requestOrderCount] = await Promise.all([
      BookingModel.countDocuments({ partnerId, bookingStatus: "Progress" }),
      BookingModel.countDocuments({ partnerId, bookingStatus: "Pending" }),
    ]);

    // Fetch paginated request orders
    const matchStage = { partnerId, bookingStatus: "Pending" };

    const [requestOrders, totalOrders] = await Promise.all([
      BookingModel.find(matchStage)
        .sort({ createdAt: -1 })      // latest pending orders first    
        .skip(skip)
        .limit(limitVal),
      BookingModel.countDocuments(matchStage),
    ]);

    const data = {
      analytics: {
        runningOrders: runningOrderCount,
        requestOrders: requestOrderCount,
      },
      requestOrdersList: {
        requestOrders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitVal),
        currentPage: parseInt(page),
        limit: limitVal,
      },
    };

    return Helper.success(res, "Partner analytics and request orders list", data);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

const partnerAnalyticsEarningsWithJobs = async (req, res) => {
  try {
    const partnerId = req.userId;
    let { duration = "week", page = 1, limit = 3 } = req.body;

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    duration = duration.toLowerCase();
    if (!["week", "month"].includes(duration)) {
      return Helper.fail(res, "Invalid duration. Must be 'week' or 'month'");
    }

    const partnerObjectId = new ObjectId(partnerId);
    const now = new Date();
    const startDate = new Date(now);

    // Calculate start date based on duration
    if (duration === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (duration === "month") {
      startDate.setDate(now.getDate() - 30);
    }

    // Match conditions to apply for all queries
    const baseMatch = {
      partnerId: partnerObjectId,
      createdAt: { $gte: startDate, $lte: now },
    };

    // ===== Earnings Analytics =====
    const [completedData = {}] = await BookingModel.aggregate([
      {
        $match: {
          ...baseMatch,
          bookingStatus: "Completed",
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

    const [pendingData = {}] = await BookingModel.aggregate([
      {
        $match: {
          ...baseMatch,
          bookingStatus: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    // ===== Recent Completed Jobs List =====
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const matchStage = {
      ...baseMatch,
      bookingStatus: "Completed",
    };

    const [RecentJobs, totalJobs] = await Promise.all([
      BookingModel.find(matchStage)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookingModel.countDocuments(matchStage),
    ]);

    const data = {
      analytics: {
        duration,
        TotalEarnings: completedData.totalAmount || 0,
        CompletedJobs: completedData.completedJobs || 0,
        PendingEarnings: pendingData.totalAmount || 0,
      },
      recentJobsList: {
        RecentJobs,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
        limit,
      },
    };

    return Helper.success(res, `Partner earnings and jobs for ${duration}`, data);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
//for partner to accept the booking if req not autoAssign
const acceptBookingRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await PartnerRequestModel.findById(requestId).populate("bookingId");
    if (!request || request.status !== "pending") {
      return Helper.fail(res, "Invalid or expired request");
    }

    const booking = request.bookingId;
    booking.partnerId = request.partnerId;
    booking.status = "Progress";
    await booking.save();

    request.status = "accepted";
    await request.save();

    return Helper.success(res, "Booking accepted by partner", booking);
  } catch (err) {
    console.error("Accept Error:", err);
    return Helper.fail(res, "Failed to accept booking");
  }
};
//for rejecting the booking request by partner
const rejectBookingRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const partnerId = req.partnerId; // Assume partner is authenticated via middleware

    const request = await PartnerRequestModel.findOne({
      _id: requestId,
      partnerId,
      status: "pending",
      isDeleted: false,
    });

    if (!request) {
      return Helper.fail(res, "Request not found or already handled");
    }

    request.status = "rejected";
    await request.save();

    return Helper.success(res, "Booking request rejected successfully", request);
  } catch (error) {
    console.error("Reject Booking Request Error:", error);
    return Helper.error(res, "Failed to reject booking request");
  }
};
//for listing bookings requests for partner
const listPartnerBookingRequests = async (req, res) => {
  try {
    const partnerId = req.userId; 
    const { page = 1, limit = 10 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {
      partnerId,
      status: "pending",
      isDeleted: false,
    };

    const [requests, total] = await Promise.all([
      PartnerRequestModel.find(query)
        .populate({
          path: "bookingId",
          populate: {
            path: "serviceId",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PartnerRequestModel.countDocuments(query),
    ]);

    return Helper.success(res, "Pending booking requests fetched", {
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("List booking requests error:", error);
    return Helper.fail(res, "Unable to fetch partner booking requests");
  }
};
// Partner isPublished toggle 
const toggleIsPublished = async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return Helper.fail(res, "Partner ID is required");
    }

    const partner = await PartnerModel.findById(partnerId);

    if (!partner) {
      return Helper.fail(res, "Partner not found");
    }

    const newStatus = !partner.isPublished;

    partner.isPublished = newStatus;
    await partner.save();

    return Helper.success(res, `Partner is now ${newStatus ? 'Published' : 'Unpublished'}`, {
      partnerId: partner._id,
      isPublished: partner.isPublished,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Something went wrong while toggling publish status");
  }
};

const findAllPartners = async (req, res) => {
  try {
    const partners = await PartnerModel.find({
      isDeleted: false,
    })
      .sort({ _id: -1 })
      .select("name _id"); // Only return name and _id

    if (!partners || partners.length === 0)
      return Helper.fail(res, "Partners not found");

    return Helper.success(res, "Partners found", partners);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch partners");
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
  partnerAnalyticsAndOrders,
  partnerAnalyticsEarningsWithJobs,
  acceptBookingRequest,
  rejectBookingRequest,
  listPartnerBookingRequests,
  toggleIsPublished,
  findAllPartners
};

const PartnerModel = require("../models/partnerModel")
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper")

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
const generateOTP = () => 
  Math.floor(1000 + Math.random() * 9000).toString(); 
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
      serviceId

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
        serviceId
      };
      const create = await PartnerModel.create(data);

      if (!create) {
        return Helper.fail({ error: "data not saved" })
      }
      const type = "partner";
      const { token, partnerDetail } = await getPartnerWithToken(create._id, type);
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
        serviceId
      };

      const create = await PartnerModel.create(data);
      if (!create) {
        return res.status(400).json({ error: "data not saved" })
      }
      return Helper.success(res, "OTP sent successfully!", create);
    }


  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
}
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
  newOtp = "1234"
  partner.isVerified = true;
  partner.otp = newOtp; // set new otp
  await partner.save();
    // Generate JWT token and user details
    const type= "partner"
      const { token, partnerDetail } = await getPartnerWithToken(partner._id, type);
      if (!token || !partnerDetail) {
        return Helper.error("Failed to generate token or get partner profile");
      }

      return Helper.success(res, "OTP verified successfully", {
        token,
        partnerDetail,
      });
  // return Helper.success(res, "Partner verified successfully", partner);
}
// For resend OTP
const resendOTP = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return Helper.fail(res, "Please provide phone number.");
    }
    // Find partner using phone number
    const partner = await PartnerModel.findOne( {phoneNo} );

    if (!partner) {
      return Helper.fail(res, "Partner not found!");
    }
    // Generate new OTP and set expiry
    // generateOTP();
    const otp = 1234;
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await PartnerModel.updateOne({ _id: partner._id }, { $set: { otp, otpExpires } });
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

    return Helper.success(res, "Partner deleted Successfully", { deletedPartner: isDeleted });

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
      return Helper.fail(res, "Partner id required")
    }
    const isRemoved = await PartnerModel.findByIdAndUpdate(
      id,
      { isDeleted: true }
    )
    return Helper.success(res, "Partner remove Successfully", { deletedPartner: isRemoved });


  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);

  }
};
//login with phone number
const loginPartner = async (req, res) => {
  try {
    const { phoneNo } = req.body
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    const partner = await PartnerModel.findOne({
      $or: [phoneNo ? { phoneNo } : null].filter(
        Boolean
      ),
      isDeleted: false
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
  } 
  catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to send OTP");
  }
};
//For partner current location
const getPartnerLocation = async (req, res) =>{
  try {
    const partnerId = req.userId; //Coming from JWT token via isAuth middleware
    const { location } = req.body
    const partner = await PartnerModel.findById(partnerId)
    // console.log(partner)
    if (!partner) {
      return Helper.fail(res, "partner not found");
    }
    if(!location){
      return Helper.fail(res, "Please select your location");
    }
    let updatedLocation =  await PartnerModel.findByIdAndUpdate(
      partnerId,
      {location : location},
      {
        new: true,
      }
    );
    console.log({updatedLocation})
    if(!updatedLocation){
      return Helper.fail(res, "partner location not updated");
    }
    return Helper.success(res, "location updated successfully")
  } 
  catch (error) {
    console.log(error)
    return Helper.fail(res, "failed to update location");
  }
};
//For fetching profile 
const fetchProfile = async (req, res) =>{
  try{
    const partnerId = req.userId;
    if (!partnerId) {
      return Helper.fail(res, "partnerId is required!");
    }
    const partnerProfile = await PartnerModel.findById(partnerId).select('-idProof -vehicleImage -drivingLicence -identityCard -isDeleted -otp -createdAt -updatedAt');
    
    if (!partnerProfile) {
      return Helper.fail(res, "Partner not found");
    }

    return Helper.success(res, "Profile fetched successfully", partnerProfile);

  }catch(error){
    console.log(error)
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

const partnerListingWithServices = async (req, res) =>{
 try { 
   const listing = await PartnerModel.find({isDeleted: false})
     .populate("serviceId", "name")
  // .select("serviceId, name -_id")
    if(!listing){
    return Helper.fail(res, "no partner and service available")
  }
  return Helper.success(res, "partners listed with services", listing)
}
catch(error){
  console.log(error)
  return Helper.fail(res, error.message);
}
}

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
  partnerListingWithServices
};
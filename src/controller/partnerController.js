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
      createdBy

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
        isVerified: true
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
      //for generating 4 digit random otp
      const generateOTP = () => 
        Math.floor(1000 + Math.random() * 9000).toString();      
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
        type,
        isVerified: false,
        otp
      };

      const create = await PartnerModel.create(data);
      if (!create) {
        return res.status(400).json({ error: "data not saved" })
      }
      return Helper.success(res, "OTP sent successfully!");
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
    return Helper.fail(res, " OTP are required");
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
  partner.isVerified = true;
  partner.otp = null; // clear OTP after verification
  await partner.save();
    // Generate JWT token and user details
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
module.exports = {
  createPartner,
  deletePartner,
  removePartner,
  verifyOTP,
  resendOTP

};
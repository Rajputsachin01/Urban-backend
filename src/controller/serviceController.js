const ServiceModel = require("../models/serviceModel")

const createService = async (req, res) => {

  try {
    const {
      name,
      size,
      price,
      time,
      images,
      description,
      type
    } = req.body;
    console.log(req.body);

    // Validation for required fields
    if (!name) {
      return Helper.fail(res, "Name is required!");
    }
    if (!size) {
      return Helper.fail(res, "Size is required!");
    }
    if (!price) {
      return Helper.fail(res, "Price is required!");
    }
    if (!time) {
      return Helper.fail(res, "Time is required!");
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




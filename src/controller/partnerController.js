const PartnerModel = require("../models/partnerModel") 
const Helper = require("../utils/helper")

const createPartner = async (req, res) => {
    
   try{
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
        };
        const create = await PartnerModel.create(data);

        if(!create) {
            return res.status(400).json({error: "data not saved"})
        }

        return Helper.success(res, "partner created successfully!", create);
    

} catch (error){
    console.error(error);
    return Helper.fail(res, error.message);
}
}

module.exports = {  
    createPartner

};
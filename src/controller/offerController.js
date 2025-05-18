const OfferModel = require("../models/offerModel");
const Helper = require("../utils/helper");

const createOffer = async (req, res) => {
  try {
    const adminId = req.userId;
    const { serviceId, image, title, startDate, endDate} = req.body;
    if (!serviceId) {
      return Helper.fail(res, "ServiceId is required!");
    }
    const data = { adminId, serviceId, image, title, startDate, endDate};
    const create = await OfferModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "Offer created successfully!", create);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

const removeOffer = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "Offer id required");
    }
    const isRemoved = await OfferModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "Offer remove Successfully", isRemoved);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

const listingOffer = async (req,res) =>{
  try{
    const { page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

     const matchStage = {
          isDeleted: false,
        };

     const offerList = await OfferModel.find(matchStage)
          .skip(skip)
          .limit(limitVal);
     const totalOffers = await OfferModel.countDocuments(matchStage);

     if (offerList.length === 0) {
           return Helper.fail(res, "No Offers found");
         }
    
         const data = {
          offers: offerList,
          totalOffers,
          totalPages: Math.ceil(totalOffers / limitVal),
          currentPage: parseInt(page),
          limit: limitVal,
        };

        return Helper.success(res, "Offers listing", data);

  } catch(error){
        return Helper.fail(res, error.message);

  }
}

module.exports = {
  createOffer,
  removeOffer,
  listingOffer
};

const OfferModel = require("../models/offerModel");
const Helper = require("../utils/helper");

const createOffer = async (req, res) => {
  try {
    const { serviceId, adminId } = req.body;
    console.log(req.body);
    if (!serviceId) {
      return Helper.fail(res, "ServiceId is required!");
    }
    if (!adminId) {
      return Helper.fail(res, "AdminId is required!");
    }
    const data = { serviceId, adminId };
    const create = await OfferModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "Offer created successfully!", create);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createOffer,
};

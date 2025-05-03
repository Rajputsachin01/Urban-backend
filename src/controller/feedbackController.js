const feedbackModel = require("../models/feedbackModel");
const Helper = require("../utils/helper");

const givefeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const { serviceId, rating, review} = req.body;
    console.log(req.body);
    if (!serviceId) {
      return Helper.fail(res, "ServiceId is required!");
    }
    const data = { userId, serviceId, rating, review};
    const create = await feedbackModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "feedback submitted successfully!", create);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const removefeeback = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "feedback id required");
    }
    const isRemoved = await feedbackModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "feedback remove Successfully", isRemoved);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};



module.exports = {
    givefeedback,
    removefeeback
  
};
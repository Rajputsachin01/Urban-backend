const FeedbackModel = require("../models/feedbackModel");
const Helper = require("../utils/helper");

const giveFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const { serviceId, rating, review} = req.body;
    console.log(req.body);
    if (!serviceId) {
      return Helper.fail(res, "ServiceId is required!");
    }
    const data = { userId, serviceId, rating, review};
    const create = await FeedbackModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "feedback submitted successfully!", create);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const removeFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "feedback id required");
    }
    const isRemoved = await FeedbackModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "feedback remove Successfully", isRemoved);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const listingFeedback = async (req,res) =>{
  try{
    const { page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

     const matchStage = {
          isDeleted: false,
        };

     const feedbackList = await FeedbackModel.find(matchStage)
          .skip(skip)
          .limit(limitVal);
     const totalfeedback = await FeedbackModel.countDocuments(matchStage);

     if (feedbackList.length === 0) {
           return Helper.fail(res, "No feedback found");
         }
    
         const data = {
          feedback: feedbackList,
          totalfeedback,
          totalPages: Math.ceil(totalfeedback / limitVal),
          currentPage: parseInt(page),
          limit: limitVal,
        };

        return Helper.success(res, "feedback listing", data);

  } catch(error){
    console.error(error);
        return Helper.fail(res, error.message);

  }
}

const updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { serviceId, rating, review } = req.body;
    const isExist = await FeedbackModel.findById(feedbackId);
    if (isExist && isExist.isDeleted == true) {
      return Helper.fail(res, "Feedback no longer exist");
    }
    if (!isExist) {
      return Helper.fail(res, "feedback not exist");
    }
    let updatedFeedback = {};
    if (serviceId) {
      updatedFeedback.serviceId = serviceId;
    }
    if (rating) {
      updatedFeedback.rating = rating;
    }
    if (review) {
      updatedFeedback.review = review;
    }
    console.log(updatedFeedback);
    const feedbackUpdate = await FeedbackModel.findByIdAndUpdate(
      feedbackId,
      updatedFeedback,
      {
        new: true,
      }
    );
    if (!feedbackUpdate) {
      return Helper.fail(res, "feedback not updated");
    }
    return Helper.success(res, "Feedback updated successfully", feedbackUpdate);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update feedback");
  }
};


module.exports = {
    giveFeedback,
    removeFeedback,
    listingFeedback,
    updateFeedback
  
};
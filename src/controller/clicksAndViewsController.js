const ClicksAndViewsModel = require("../models/clicksAndViewsModel");
const Helper = require("../utils/helper");
// for Create 
const createClickOrView = async (req, res) => {
  try {
    const { activity, purpose, activityDate } = req.body;
    if (!activity) return Helper.fail(res, "Activity is required");
    const newActivity = await ClicksAndViewsModel.create({
      partnerId: req.userId,
      userId: req.body.userId || null,
      activity,
      purpose,
      activityDate: activityDate || new Date(),
    });
    return Helper.success(res, "Activity logged successfully", newActivity);
  } catch (error) {
    console.error("Create Click/View Error:", error);
    return Helper.fail(res, error.message || "Internal server error");
  }
};
//for  remove (soft Delete) 
const removeClickOrView = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await ClicksAndViewsModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      if (!deleted) return Helper.fail(res, "Activity not found");
      return Helper.success(res, "Activity deleted successfully");
    } catch (error) {
      console.error("Delete Click/View Error:", error);
      return Helper.fail(res, error.message || "Internal server error");
    }
};
// List Clicks/Views
const listClicksAndViews = async (req, res) => {
    try {
      const { partnerId, page = 1, limit = 10 } = req.body;
  
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const skip = (parsedPage - 1) * parsedLimit;
  
      let matchStage = { isDeleted: false }; // <-- Filter out deleted activities
      if (partnerId) matchStage.partnerId = partnerId;
  
      const activities = await ClicksAndViewsModel.find(matchStage)
        .populate("userId", "name email phone")
        .populate("partnerId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);
  
      const total = await ClicksAndViewsModel.countDocuments(matchStage);
  
      const data = {
        activities,
        pagination: {
          total,
          totalPages: Math.ceil(total / parsedLimit),
          currentPage: parsedPage,
          limit: parsedLimit,
        },
      };
  
      return Helper.success(res, "Activities fetched successfully", data);
    } catch (error) {
      console.error("List Click/View Error:", error);
      return Helper.fail(res, error.message || "Internal server error");
    }
  };
  
module.exports = {
  createClickOrView,
  removeClickOrView,
  listClicksAndViews,
};

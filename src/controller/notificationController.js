const NotificationModel = require("../models/notificationModel")
const Helper = require("../utils/helper")

const createNotification = async (req, res) =>{
    try {
        const userId = req.userId
        const type = req.type
        const {icon, title, description} = req.body
        if(!userId){
            return Helper.fail(res, "userId is required")
        }
        if(!type){
            return Helper.fail(res, "type required")
        }
        if(!title){
            return Helper.fail(res, "title is required")
        }
        if(!description){
            return Helper.fail(res, "description is required")
        }
        if(!userId){
            return Helper.fail(res, "userId is required")
        }
        const notification = await NotificationModel.create({
            title,
            description,
            userId
        })
        if(!notification){
            return Helper.fail(res, "notification not created")
        }
        return Helper.success(res, "notification created successfully", notification)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to create notification")
    }
}
// lising notifications
const listingNotrification = async (req, res) => {
    try {
        // const userId = req.userId
        const { userId , limit = 3, page = 1, search} = req.body;
            if(!userId){
                return Helper.fail(res, "user Id is required")
            }
              const skip = (parseInt(page) - 1) * parseInt(limit);
              let matchStage = { isDeleted: false, userId: userId };
              if (search) {
                matchStage.$or = [
                  { title: { $regex: search, $options: "i" } },
                  { description: { $regex: search, $options: "i" } },
                ];
              }
              const notificationList = await NotificationModel.find(matchStage)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
              const totalNotifications = await NotificationModel.countDocuments(matchStage);
              if (notificationList.length === 0) {
                return res.status(404).json({
                  success: false,
                  message: "No notifiation found matching the criteria",
                });
              }  
              const data = {
                notifications: notificationList,
                pagination: {
                    totalNotifications,
                    totalPages: Math.ceil(totalNotifications / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                  },
              };
          
              return Helper.success(res, "notification listing fetched", data);
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to fetched")
    }
}

module.exports = {
    createNotification,
    listingNotrification
}
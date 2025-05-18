const NotificationModel = require("../models/notificationModel")
const Helper = require("../utils/helper")

const createNotification = async (req, res) => {
    try {
        // const userId = req.userId
        // const type = req.type
        const { icon, title, description, objectId, type, serviceId } = req.body
        if (!objectId) {
            return Helper.fail(res, "objectId is required")
        }
        if (!serviceId) {
            return Helper.fail(res, "serviceId is required")
        }
        if (!type) {
            return Helper.fail(res, "type required")
        }
        if (!title) {
            return Helper.fail(res, "title is required")
        }
        if (!icon) {
            return Helper.fail(res, "icon is required")
        }
        if (!description) {
            return Helper.fail(res, "description is required")
        }
        const notificationData = {
            icon,
            title,
            description,
            serviceId
        };
        if (type === "user") {
            notificationData.userId = objectId;
        } else if (type === "partner") {
            notificationData.partnerId = objectId;
        }
        const notification = await NotificationModel.create(notificationData);
        if (!notification) {
            return Helper.fail(res, "Notification not created");
        }

        return Helper.success(res, "Notification created successfully", notification);
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to create notification")
    }
}
// lising notifications
const listingNotification = async (req, res) => {
    try {
        const userId = req.userId
        const type = req.type
        const { limit = 3, page = 1, search } = req.body;
        if (!userId) {
            return Helper.fail(res, "user Id is required")
        }
        if (!type) {
            return Helper.fail(res, "type is required")
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let matchStage = { isDeleted: false};
        if (type === "user") {
            matchStage.userId = userId;
        } else if (type === "partner") {
            matchStage.partnerId = userId;
        }
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const notifications = await NotificationModel.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const totalNotifications = await NotificationModel.countDocuments(matchStage);
        if (notifications.length === 0) {
            return Helper.fail(res, "No notification found matching the criteria");
        }
        const data = {
            notifications,
            pagination: {
                totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        };
        return Helper.success(res, "Notification listing fetched", data);
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to fetched")
    }
}

// notification isRead
const readNotification = async (req, res) =>{
    try {
        const { notificationId } = req.body
        if(!notificationId){
            return Helper.fail(res, "notification id is required")
        }
        const readNotification = await NotificationModel.findOneAndUpdate(
            {_id:notificationId, isDeleted:false},
            {$set:{isRead:true}}, 
            {new: true});
        if(!readNotification){
            return Helper.fail(res, "notifiaction not available")
        }
        return Helper.success(res, "notification read", readNotification)
    } catch (error) {
        return Helper.fail(res, "failed to read")
    }
}
module.exports = {
    createNotification,
    listingNotification,
    readNotification
}
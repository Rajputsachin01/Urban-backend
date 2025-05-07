const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
    icon:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required : true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "partner",
        required : true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted:  {
        type: Boolean,
        default: false
    }
},
{ timestamps: true })

module.exports = mongoose.model("notification", NotificationSchema);
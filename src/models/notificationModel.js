const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
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
    isDeleted:  {
        type: Boolean,
        default: false
    }
},
{ timestamps: true })

module.exports = mongoose.model("notification", NotificationSchema);
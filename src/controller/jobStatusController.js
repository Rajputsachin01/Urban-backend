const jobStatutsModel = require("../models/jobStatutsModel")
const Helper = require("../utils/helper")

const createJobStatus = async (req, res) => {
    try {
        const { partnerId, serviceId, beforeImage, afterImage, notes } = req.body
        if (!partnerId) {
            return Helper.fail(res, "partner id is required")
        }
        if (!serviceId) {
            return Helper.fail(res, "service id is required")
        }
        if (!beforeImage) {
            return Helper.fail(res, "beforeImage is required")
        }
        if (!afterImage) {
            return Helper.fail(res, "afterImage is required")
        }
        const jobStatus = await jobStatutsModel.create({
            partnerId,
            serviceId,
            beforeImage,
            afterImage,
            notes
        })
        if (!jobStatus) {
            return Helper.fail(res, "job status not created")
        }
        return Helper.success(res, "job status created", jobStatus)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to create job status")
    }
}


const listingJobStatus = async (req, res) => {
    try {
        const { partnerId, limit = 3, page = 1 } = req.body;
        if(!partnerId){
            return Helper.fail(res, "partner id is required")
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let matchStage = { isDeleted: false, partnerId: partnerId };
        const jobStatusList = await jobStatutsModel.find(matchStage)
            .skip(skip)
            .limit(parseInt(limit));
        const totalJobStatus = await jobStatutsModel.countDocuments(matchStage);
        if (jobStatusList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No job status found matching the criteria",
            });
        }
        const data = {
             jobStatusList,
            pagination: {
                totalJobStatus,
                totalPages: Math.ceil(totalJobStatus / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        };

        return Helper.success(res, "users listing fetched", data);
    } catch (error) {
        return Helper.fail(res, "failed to listing job status")
    }
}

module.exports = {
    createJobStatus,
    listingJobStatus
}
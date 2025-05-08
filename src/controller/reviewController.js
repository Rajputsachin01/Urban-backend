const ReviewModel = require("../models/reviewModel")
const PartnerModel = require("../models/partnerModel")
const Helper = require("../utils/helper")

const createReview = async (req, res) => {
    try {
        const userId = req.userId
        const { categoryId, partnerId, rating, review } = req.body
        if (!userId) {
            return Helper.fail(res, "userId is required")
        }
        if (!categoryId) {
            return Helper.fail(res, "categoryId is required")
        }
        if (!partnerId) {
            return Helper.fail(res, "partnerId is required")
        }
        if (!rating) {
            return Helper.fail(res, "rating is required")
        }
        if (rating < 1 || rating > 5) {
            return Helper.fail(res, "Rating must be between 1 and 5.");
        }
        if (!review) {
            return Helper.fail(res, "review is required")
        }
        const addreview = await ReviewModel.create({
            userId,
            partnerId,
            categoryId,
            review,
            rating
        })
        if (!addreview) {
            return Helper.fail(res, "review not created")
        }
        const countPartner = await ReviewModel.find({ partnerId: partnerId, isDeleted: false })
        if (!countPartner) {
            return Helper.fail(res, "no rating available for the partner")
        }
        const totalRating =  countPartner.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / countPartner.length).toFixed(1);        
        const saveAverageRating = await PartnerModel.findOneAndUpdate({_id: partnerId, isDeleted: false}, { $set: {avgRating: averageRating }}, {new: true})
        if(!saveAverageRating){
            return Helper.fail(res, "average rating not saved")
        }
        return Helper.success(res, "review added", addreview)
    } catch (error) {
        return Helper.fail(res, "failed to create review")
    }
}

const updateReview = async (req, res) => {
    try {
        const userId = req.userId
        const { reviewId, rating, review } = req.body
        if (!userId) {
            return Helper.fail(res, "userId is required")
        }
        if (!reviewId) {
            return Helper.fail(res, "review id is required")
        }
        const isExist = await ReviewModel.findOne({ _id: reviewId, isDeleted: false, userId: userId })
        if (!isExist) {
            return Helper.fail(res, "review not exist")
        }
        let query = {}
        if (rating) {
            query.rating = rating
        }
        if (review) {
            query.review = review
        }
        const update = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: query }, { new: true })
        if (!update) {
            return Helper.fail(res, "review not updated")
        }
        return Helper.success(res, "review updated", update)
    } catch (error) {
        return Helper.fail(res, "failed to update")
    }
}

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body
        if (!reviewId) {
            return Helper.fail(res, "review id is required")
        }
        const removed = await ReviewModel.findByIdAndUpdate(reviewId, { isDeleted: true })
        if (!removed) {
            return Helper.fail(res, "review not delete")
        }
        return Helper.success(res, "review deleted successfully")
    } catch (error) {
        return Helper.fail(res, "failed to delete")
    }
}

// const listingReview = async (req, res) => {
//     try {
//         const userId = req.userId
//         const type = req.type
//         const { limit = 3, page = 1, search, partnerId } = req.body;
//         const skip = (parseInt(page) - 1) * parseInt(limit);
//         let matchStage = { isDeleted: false };
//         if (userId && type === "user") {
//             matchStage.userId = userId
//         }
//         if (partnerId) {
//             matchStage.partnerId = partnerId
//         }
//         if (search) {
//             matchStage.$or = [
//                 { review: { $regex: search, $options: "i" } }
//             ];
//         }
//         const reviews = await ReviewModel.find(matchStage)
//             .populate("partnerId", "avgRating")
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(parseInt(limit));
//         const totalReviews = await ReviewModel.countDocuments(matchStage);
//         if (reviews.length === 0) {
//             return Helper.fail(res, "No reviews found matching the criteria");
//         }
//         console.log(reviews.partnerId.avgRating)
//         const data = {
//             reviews,
            
//             pagination: {
//                 totalReviews,
//                 totalPages: Math.ceil(totalReviews / limit),
//                 currentPage: parseInt(page),
//                 limit: parseInt(limit),
//             },
//         };
//         return Helper.success(res, "review listing fetched", data);
//     } catch (error) {
//         return Helper.fail(res, "failed to listing reviews")
//     }
// }

const listingReview = async (req, res) => {
    try {
        const userId = req.userId;
        const type = req.type;
        const { limit = 3, page = 1, search, partnerId } = req.body;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let matchStage = { isDeleted: false };
        if (userId && type === "user") {
            matchStage.userId = userId;
        }
        if (partnerId) {
            matchStage.partnerId = partnerId;
        }
        if (search) {
            matchStage.$or = [
                { review: { $regex: search, $options: "i" } }
            ];
        }
        const reviews = await ReviewModel.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await ReviewModel.countDocuments(matchStage);
        if (reviews.length === 0) {
            return Helper.fail(res, "No reviews found matching the criteria");
        }
        // If a specific partner is queried, fetch its avgRating
        let averageRating = null;
        if (partnerId) {
            const partnerData = await PartnerModel.findOne({ _id: partnerId, isDeleted: false }, { avgRating: 1 });
            averageRating = partnerData?.avgRating || 0;
        }
        const data = {
            averageRating: partnerId ? averageRating : undefined,
            reviews,
            pagination: {
                totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        };

        return Helper.success(res, "Review listing fetched", data);
    } catch (error) {
        console.error(error);
        return Helper.fail(res, "Failed to list reviews");
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    listingReview
}
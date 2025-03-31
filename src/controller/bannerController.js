const BannerModel = require("../models/bannerModel") 
const Helper = require("../utils/helper")
//For creating banner
const createBanner = async (req, res) =>{
    try{
        const {
            title,
            description,
            images,
            type
        } = req.body;
    console.log(req.body)
    // Validation for required fields
    if (!title) {
        return Helper.fail(res, "Title is required!");
    }
      if (!description) {
        return Helper.fail(res, "description is required!");
    }
      if (!images) {
        return Helper.fail(res, "images is required!");
    }
      if (!type) {
        return Helper.fail(res, "type is required!");
    }

     const data = {
        title,
        description,
        images,
        type
    };
     const create = await BannerModel.create(data);


    if(!create) {
        return res.status(400).json({error: "data not saved"})
    }

    return Helper.success(res, "admin created successfully!", create);

    } catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// Delete banner permanantly
const deleteBanner = async (req,res) =>{
    try{
        const id  = req.params.id;
        console.log(id)
        if(!id){
            return Helper.fail(res, "banner id required")
        }
        const isDeleted = await BannerModel.findByIdAndDelete(id);
        console.log(isDeleted);

        if (!isDeleted) {
            return Helper.fail(res, "Banner not found!");
        }

        return Helper.success(res, " Banner deleted Successfully", {deletedBanner: isDeleted});

    } catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// Banner soft delete
const removeBanner = async (req,res) =>{
    try{
        const id = req.params.id;
        console.log(id);
        if(!id){
            return Helper.fail(res, "banner id required")
        }
        const isRemoved = await BannerModel.findByIdAndUpdate(
            id,
        {isDeleted: true}
    )
    return Helper.success(res, " Banner remove Successfully", {deletedBanner: isRemoved});


    } catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};

// Get Banner Listing with Filters
const getBannersWithFilters = async (req, res) => {
    try {
      const { search, limit = 10, page = 1, type } = req.body;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      let matchStage = { isDeleted: false };
      if (search) {
        matchStage.title = { $regex: search, $options: "i" };
      }
      if (type) {
        matchStage.type = type;
      }
      
      const banners = await BannerModel.find(matchStage)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await BannerModel.countDocuments(matchStage);
      
      if (!banners.length) return Helper.fail(res, "No Banners Found with given Filter");
      return Helper.success(res, "Banners Found Successfully", {
        banners,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  };

module.exports = {  
    createBanner,
    deleteBanner,
    removeBanner,
    getBannersWithFilters

};
// {
//     "search": "urban", 
//     "type": "user",
//     "limit": 5,
//     "page": 1
//   }


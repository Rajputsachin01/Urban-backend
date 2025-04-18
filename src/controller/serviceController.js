const ServiceModel = require("../models/serviceModel");
<<<<<<< HEAD
=======
const { subscribe } = require("../routes/serviceRoutes");
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
const Helper = require("../utils/helper")
const mongoose = require("mongoose")
mongoose.set("strictPopulate", false);

const createService = async (req, res) => {

  try {
    const {
<<<<<<< HEAD
=======
      icon,
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
      name,
      size,
      price,
      time,
      images,
      description,
<<<<<<< HEAD
      type,
      categories
    } = req.body;
    console.log(req.body);

=======
      type
    } = req.body;
    console.log(req.body);
    if (!icon) {
      return Helper.fail(res, "Icon is required!");
    }
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
    if (!name) {
      return Helper.fail(res, "Name is required!");
    }
    if (!size) {
      return Helper.fail(res, "Size is required!");
    }
    if (!price) {
      return Helper.fail(res, "Price is required!");
    }
    if (!time) {
      return Helper.fail(res, "Time is required!");
    }
    if (!images) {
      return Helper.fail(res, "images is required!");
    }
    if (!description) {
      return Helper.fail(res, "Description is required!");
    }
    if (!type) {
      return Helper.fail(res, "Type is required!");
    }
<<<<<<< HEAD
    if (!categories) {
      return Helper.fail(res, "Categories is required!");
    }
      const data = {
=======
      const data = {
        icon,
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
        name,
        size,
        price,
        time,
        images,
        description,
<<<<<<< HEAD
        type,
        categories
=======
        type
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
      };
      const create = await ServiceModel.create(data);
      if (!create) {
        return Helper.fail({ error: "data not saved" })
      }
      return Helper.success(res, "service created successfully!", create);

    } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const removeService = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "Service id required")
    }
    const isRemoved = await ServiceModel.findByIdAndUpdate(
      id,
      { isDeleted: true }
    )
    return Helper.success(res, "Service remove Successfully", isRemoved );

  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);

  }
};
<<<<<<< HEAD

=======
 
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
 const listingService = async (req, res) => {
  try {
    const { search, limit = 3, page = 1 } = req.body;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);
    // Building the query with search and isDeleted filter
    let matchStage = { isDeleted: false };
    if (search) {
      const isNumber = !isNaN(search);
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        ...(isNumber ? [{ price: Number(search) }] : [])
      ];
    }
    
    // Fetch paginated services matching the search criteria
<<<<<<< HEAD
    // Aggregation pipeline
    const serviceList = await ServiceModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",   // name of the categories collection
          localField: "categories",   // field in ServiceModel
          foreignField: "_id",       // _id in categories collection
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails"},
      { $skip: skip},
      { $limit: limitVal}
    ]);
    // const serviceList = await ServiceModel.find(matchStage)
    //   .populate('categories')
    //   .skip(skip)
    //   .limit(parseInt(limit));
    // Fetch total count for pagination info
    const totalServices = await ServiceModel.countDocuments(matchStage);
    if (serviceList.length === 0) {
      return res.status(404).json({
=======
    const serviceList = await ServiceModel.find(matchStage)
      // .populate('categories')
      .skip(skip)
      .limit(parseInt(limit));
    // Fetch total count for pagination info
    const totalServices = await ServiceModel.countDocuments(matchStage);
    if (serviceList.length === 0) {
      return Helper.fail({
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
        success: false,
        message: "No service found matching the criteria"
      });
    }
    
    const data = {
      services: serviceList,
      totalServices,
      totalPages: Math.ceil(totalServices / limitVal),
      currentPage: parseInt(page),
      limit: limitVal
    }
    return Helper.success(res, "services listing fetched", data)
  }
  catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const updateService = async(req, res)=>{
  try {
    const serviceId = req.params.id
    const { 
      name,
      size,
      price,
      time,
      images,
      description,
<<<<<<< HEAD
      type,
      categories } = req.body
=======
      type } = req.body
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
    const isExist = await ServiceModel.findById(serviceId)
    if(isExist && isExist.isDeleted == true){
        return Helper.fail(res, "Service no longer exist")
    }
    if(!isExist){
        return Helper.fail(res, "Service not exist")
    }
    let updatedService ={}
    if(name){
        updatedService.name = name
    }
    if(size){
      updatedService.size = size
    }
    if(price){
      updatedService.price = price
    }
    if(time){
      updatedService.time = time
    }
    if(images){
      updatedService.time = time
    }
    if(description){
      updatedService.description = description
    }
    if(type){
      updatedService.description = description
    }
<<<<<<< HEAD
    if(categories){
      updatedService.categories = categories
    }
=======
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
    console.log(updatedService)
    const serviceUpdate = await ServiceModel.findByIdAndUpdate(
        serviceId,
        updatedService,
        {
            new: true
        }
    )
    if(!serviceUpdate){
        return  Helper.fail(res, "service not updated")
    }
    return  Helper.success(res, "Service updated successfully", serviceUpdate)
  } 
  catch (error) {
    console.log(error);
        return Helper.fail(res, "failed to update service");
  }
};
<<<<<<< HEAD
=======



>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
module.exports = {
  createService,
  removeService,
  listingService,
  updateService
};




<<<<<<< HEAD
=======

>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f

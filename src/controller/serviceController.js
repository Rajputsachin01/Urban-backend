const ServiceModel = require("../models/serviceModel");
const Helper = require("../utils/helper")

const createService = async (req, res) => {

  try {
    const {
      name,
      size,
      price,
      time,
      images,
      description,
      type,
      categories
    } = req.body;
    console.log(req.body);

    // Validation for required fields
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
    if (!categories) {
      return Helper.fail(res, "Categories is required!");
    }
      const data = {
        name,
        size,
        price,
        time,
        images,
        description,
        type,
        categories
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
}
// Delete service
const deleteService = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!id) {
      return Helper.fail(res, "service id required");
    }
    const isDeleted = await ServiceModel.findByIdAndDelete(id);
    console.log(isDeleted);

    if (!isDeleted) {
      return Helper.fail(res, "service not found!");
    }

    return Helper.success(res, "Service deleted Successfully", { deletedService: isDeleted });

  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);i

  }
};
// Service soft delete
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
// listing Services
 const listingService = async (req, res) => {
  try {
    const { search, limit = 3, page = 1 } = req.body;
    // console.log(search)
    const skip = (parseInt(page) - 1) * parseInt(limit);
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
    const serviceList = await ServiceModel.find(matchStage)
      .skip(skip)
      .limit(parseInt(limit));
    // Fetch total count for pagination info
    const totalServices = await ServiceModel.countDocuments(matchStage);
    if (serviceList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No service found matching the criteria"
      });
    }
    
    const data = {
      services: serviceList,
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    }
    return Helper.success(res, "services listing fetched", data)
  }
  catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
}
//update service
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
      type } = req.body
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
}
module.exports = {
  createService,
  deleteService,
  removeService,
  listingService,
  updateService
};
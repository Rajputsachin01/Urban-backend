const ServiceModel = require("../models/serviceModel");
const SubCategoryModel = require("../models/subCategoryModel"); // for populate category too
const Helper = require("../utils/helper");
const mongoose = require("mongoose");
mongoose.set("strictPopulate", false);


const createService = async (req, res) => {
  try {
    const {
      name,
      price,
       time,
      description,
      subCategoryId,
      sellingType,
      size,
      seat,
      piece,
      icon,
    } = req.body;

    // Validate required fields
    if (!name) return Helper.fail(res, "Name is required!");
    if (!sellingType) return Helper.fail(res, "Selling type is required!");
    if (!time) return Helper.fail(res, "Please fill the time to complete the service");
    if (!subCategoryId)
      return Helper.fail(res, "SubCategory ID is required!");

    // Optional: You can add more validation if needed

    const data = {
      name,
      price,
      time,
      description,
      subCategoryId,
      sellingType,
      size: size || "",
      seat: seat || 0,
      piece: piece || 0,
      icon: icon || "",
    };

    const createdService = await ServiceModel.create(data);
    if (!createdService)
      return Helper.fail(res, "Failed to create service");

    return Helper.success(res, "Service created successfully!", createdService);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

const removeService = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return Helper.fail(res, "Service id required");

    const removed = await ServiceModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });

    return Helper.success(res, "Service removed successfully", removed);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const {
      name,
      price,
      time,
      description,
      subCategoryId,
      sellingType,
      size,
      seat,
      piece,
      icon,
    } = req.body;

    const service = await ServiceModel.findById(serviceId);
    if (!service) return Helper.fail(res, "Service not exist");
    if (service.isDeleted) return Helper.fail(res, "Service no longer exists");

    let updatedService = {};
    if (name) updatedService.name = name;
    if (price !== undefined) updatedService.price = price;
    if (time !== undefined) updatedService.time = time;
    if (description) updatedService.description = description;
    if (subCategoryId) updatedService.subCategoryId = subCategoryId;
    if (sellingType) updatedService.sellingType = sellingType;
    if (size !== undefined) updatedService.size = size;
    if (seat !== undefined) updatedService.seat = seat;
    if (piece !== undefined) updatedService.piece = piece;
    if (icon !== undefined) updatedService.icon = icon;

    const updated = await ServiceModel.findByIdAndUpdate(serviceId, updatedService, {
      new: true,
    });

    if (!updated) return Helper.fail(res, "Service not updated");

    return Helper.success(res, "Service updated successfully", updated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update service");
  }
};

const listingService = async (req, res) => {
  try {
    const { search, page = 1, limit = 10} = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    let matchStage = { isDeleted: false };

    if (search) {
      const isNumber = !isNaN(search);
      if (isNumber) {
        matchStage.price = Number(search);
      } else {
        matchStage.$or = [
          { name: { $regex: search, $options: "i" } },
          { sellingType: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
    }

    const services = await ServiceModel.find(matchStage)
      .populate({
        path: "subCategoryId",
        select: "name categoryId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .skip(skip)
      .limit(limitVal);

    const total = await ServiceModel.countDocuments(matchStage);

    if (services.length === 0) {
      return Helper.fail(res, "No services found matching the criteria");
    }

    return Helper.success(res, "Services listing fetched", {
      services,
      total,
      totalPages: Math.ceil(total / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};



const serviceBySubCategoryId = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    if (!subCategoryId) return Helper.fail(res, "SubCategory ID is required");

    const services = await ServiceModel.find({
      subCategoryId,
      isDeleted: false,
    }).populate({
      path: "subCategoryId",
      select: "name categoryId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    if (!services.length) return Helper.fail(res, "No services found for this SubCategory");

    return Helper.success(res, "Services fetched by SubCategory", services);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createService,
  removeService,
  listingService,
  updateService,
  serviceBySubCategoryId,
};

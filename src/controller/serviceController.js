const ServiceModel = require("../models/serviceModel");
const Helper = require("../utils/helper");
const mongoose = require("mongoose");
mongoose.set("strictPopulate", false);

const createService = async (req, res) => {
  try {
    const { name, price, time, images, description, type, categories } = req.body;

    if (!name) {
      return Helper.fail(res, "Name is required!");
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
      price,
      time,
      images,
      description,
      type,
      categories,
    };
    const create = await ServiceModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "service created successfully!", create);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

const removeService = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "Service id required");
    }
    const isRemoved = await ServiceModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "Service remove Successfully", isRemoved);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};


const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, price, time, images, description, type, categories } =
      req.body;
    const isExist = await ServiceModel.findById(serviceId);
    if (isExist && isExist.isDeleted == true) {
      return Helper.fail(res, "Service no longer exist");
    }
    if (!isExist) {
      return Helper.fail(res, "Service not exist");
    }
    let updatedService = {};
    if (name) {
      updatedService.name = name;
    }
    if (price) {
      updatedService.price = price;
    }
    if (time) {
      updatedService.time = time;
    }
    if (images) {
      updatedService.images = images;
    }
    if (description) {
      updatedService.description = description;
    }
    if (type) {
      updatedService.type = type;
    }
    if (categories) {
      updatedService.categories = categories;
    }
    console.log(updatedService);
    const serviceUpdate = await ServiceModel.findByIdAndUpdate(
      serviceId,
      updatedService,
      {
        new: true,
      }
    );
    if (!serviceUpdate) {
      return Helper.fail(res, "service not updated");
    }
    return Helper.success(res, "Service updated successfully", serviceUpdate);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update service");
  }
};

const listingService = async (req, res) => {
  try {
    const { search, page = 1, limit = 3 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Build match stage
    const matchStage = {
      isDeleted: false,
    };

    if (search) {
      const isNumber = !isNaN(search);
      if (isNumber) {
        matchStage.price = Number(search);
      } else {
        matchStage.$or = [
          { name: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
        ];
      }
    }

    const serviceList = await ServiceModel.find(matchStage)
      .skip(skip)
      .limit(limitVal);;

    const totalServices = await ServiceModel.countDocuments(matchStage);

    if (serviceList.length === 0) {
      return Helper.fail(res, "No service found matching the criteria");
    }

    const data = {
      services: serviceList,
      totalServices,
      totalPages: Math.ceil(totalServices / limitVal),
      currentPage: parseInt(page),
      limit: limitVal,
    };

    return Helper.success(res, "Services listing fetched", data);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const findAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.find({
      isDeleted: false,
    })
      .sort({ _id: -1 })
      .select("name _id"); // Only return name and _id

    if (!services || services.length === 0)
      return Helper.fail(res, "Services not found");

    return Helper.success(res, "Services found", services);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch services");
  }
};


module.exports = {
  createService,
  removeService,
  listingService,
  updateService,
  findAllServices
};

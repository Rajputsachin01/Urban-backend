const ServiceModel = require("../models/serviceModel");
const Helper = require("../utils/helper");
const mongoose = require("mongoose");
mongoose.set("strictPopulate", false);

const createService = async (req, res) => {
  try {
    const { name, size, price, time, images, description, type, categories } =
      req.body;
    console.log(req.body);

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
      categories,
    };
    const create = await ServiceModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
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
//  const listingService = async (req, res) => {

//   try {
//     const { search, limit = 3, page = 1 } = req.body;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const limitVal = parseInt(limit);
//     // Building the query with search and isDeleted filter
//     let matchStage = { isDeleted: false };
//     if (search) {
//       const isNumber = !isNaN(search);
//       matchStage.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { type: { $regex: search, $options: "i" } },
//         ...(isNumber ? [{ price: Number(search) }] : [])
//       ];
//     }

//     // Fetch paginated services matching the search criteria
//     // Aggregation pipeline
//     const serviceList = await ServiceModel.aggregate([
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "categories",   // name of the categories collection
//           localField: "categories",   // field in ServiceModel
//           foreignField: "_id",       // _id in categories collection
//           as: "categoryDetails"
//         }
//       },
//       { $unwind: "$categoryDetails"},
//       { $skip: skip},
//       { $limit: limitVal}
//     ]);
//     // const serviceList = await ServiceModel.find(matchStage)
//     //   .populate('categories')
//     //   .skip(skip)
//     //   .limit(parseInt(limit));
//     // Fetch total count for pagination info
//     const totalServices = await ServiceModel.countDocuments(matchStage);
//     if (serviceList.length === 0) {
//       return Helper.fail(res, {message: "No service found matching the criteria"});
//     }

//     const data = {
//       services: serviceList,
//       totalServices,
//       totalPages: Math.ceil(totalServices / limitVal),
//       currentPage: parseInt(page),
//       limit: limitVal
//     }
//     return Helper.success(res, "services listing fetched", data)
//   }
//   catch (error) {
//     console.log(error);
//     return Helper.fail(res, error.message);
//   }
// };

const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, size, price, time, images, description, type, categories } =
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
    if (size) {
      updatedService.size = size;
    }
    if (price) {
      updatedService.price = price;
    }
    if (time) {
      updatedService.time = time;
    }
    if (images) {
      updatedService.time = time;
    }
    if (description) {
      updatedService.description = description;
    }
    if (type) {
      updatedService.description = description;
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
      .limit(limitVal);

    // Aggregation pipeline without category lookup
    // const serviceList = await ServiceModel.aggregate([
    //   { $match: matchStage },
    //   { $skip: skip },
    //   { $limit: limitVal }
    // ]);

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

module.exports = {
  createService,
  removeService,
  listingService,
  updateService,
};

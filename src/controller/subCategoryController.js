const mongoose = require("mongoose");
const SubCategoryModel = require("../models/subCategoryModel");
const Helper = require("../utils/helper");

// create subcategory
const createSubCategory = async (req, res) => {
  try {
    const { name, description, categoryId, images } = req.body;

    if (!name) return Helper.fail(res, "SubCategory name is required");
    if (!description) return Helper.fail(res, "SubCategory description is required");
    if (!categoryId) return Helper.fail(res, "Category ID is required");
    
    const subCategoryExists = await SubCategoryModel.findOne({ name });
    if (subCategoryExists) {
      return Helper.fail(res, "SubCategory already exists");
    }

    const newSubCategory = await SubCategoryModel.create({
      name,
      description,
      categoryId,
      images
    });

    return Helper.success(res, "SubCategory created successfully", newSubCategory);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// update subcategory
const updateSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    const { name, description, images ,categoryId} = req.body;

    if (!subCategoryId) return Helper.fail(res, "SubCategory ID is required");

    const subCategory = await SubCategoryModel.findById(subCategoryId);
    if (!subCategory || subCategory.isDeleted) {
      return Helper.fail(res, "SubCategory not found");
    }

    const updateObj = {};
    if (name) {
      const nameExists = await SubCategoryModel.findOne({ name, _id: { $ne: subCategoryId } });
      if (nameExists) return Helper.fail(res, "SubCategory name already in use");
      updateObj.name = name;
    }
    if (description) updateObj.description = description;
    if (images) updateObj.images = images;
    if (categoryId) updateObj.categoryId = categoryId;

    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(subCategoryId, updateObj, { new: true });
    return Helper.success(res, "SubCategory updated successfully", updatedSubCategory);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// find by id
const findSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return Helper.fail(res, "SubCategory ID is required");

    const subCategory = await SubCategoryModel.findOne({ _id: id, isDeleted: false });
    if (!subCategory) return Helper.fail(res, "SubCategory not found");

    return Helper.success(res, "SubCategory found", subCategory);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to find SubCategory");
  }
};

// soft delete
const removeSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.body;
    if (!subCategoryId) return Helper.fail(res, "SubCategory ID required");

    const removed = await SubCategoryModel.findOneAndUpdate(
      { _id: subCategoryId },
      { isDeleted: true },
      { new: true }
    );
    if (!removed) return Helper.fail(res, "No SubCategory found");

    return Helper.success(res, "SubCategory deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to delete SubCategory");
  }
};

// listing with search
const listingSubCategory = async (req, res) => {
  try {
    const { search, limit = 3, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchStage = { isDeleted: false };
     if (req.type === "user") {
      matchStage.isPublished = true;
    }
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const dataList = await SubCategoryModel.find(matchStage)
      .populate("categoryId", "name") // Only fetch category name
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubCategoryModel.countDocuments(matchStage);

    if (!dataList.length) return Helper.fail(res, "No SubCategories found");

    const data = {
      subCategories: dataList,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };

    return Helper.success(res, "SubCategory listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};


// get subcategory by categoryId
const subCategoryByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) return Helper.fail(res, "Category ID is required");

    const subCategories = await SubCategoryModel.find({ categoryId, isDeleted: false });
    return Helper.success(res, "SubCategories fetched", subCategories);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch subcategories by category");
  }
};

const toggleIsPublished = async (req, res) => {
  try {
    const { subCategoryId } = req.body;

    if (!subCategoryId) {
      return Helper.fail(res, "SubCategory ID is required");
    }

    const subCategory = await SubCategoryModel.findById(subCategoryId);

    if (!subCategory) {
      return Helper.fail(res, "subCategory not found");
    }

    const newStatus = !subCategory.isPublished;

    subCategory.isPublished = newStatus;
    await subCategory.save();

    return Helper.success(res, `subCategory is now ${newStatus ? 'Published' : 'Unpublished'}`, {
      subCategoryId: subCategory._id,
      isPublished: subCategory.isPublished,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Something went wrong while toggling publish status");
  }
};

const findAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategoryModel.find({ isDeleted: false }).select("name");
    return Helper.success(res, "All subCategories fetched", subCategories);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createSubCategory,
  updateSubCategory,
  removeSubCategory,
  listingSubCategory,
  findSubCategoryById,
  subCategoryByCategoryId,
  toggleIsPublished,
  findAllSubCategories
};
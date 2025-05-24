const CategoryModel = require("../models/categoryModel");
const Helper = require("../utils/helper");

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, images, description } = req.body;

    if (!name) return Helper.fail(res, "Category name is required");
    if (!description) return Helper.fail(res, "Category description is required");

    const existingCategory = await CategoryModel.findOne({ name, isDeleted: false });
    if (existingCategory) {
      return Helper.fail(res, "Category already exists");
    }

    const newCategory = await CategoryModel.create({
      name,
      images: Array.isArray(images) ? images : [], // Fallback if not array
      description,
    });

    return Helper.success(res, "Category created successfully", newCategory);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, images, description, } = req.body;

    if (!id) return Helper.fail(res, "Category ID is required");

    const existing = await CategoryModel.findById(id);
    if (!existing || existing.isDeleted) {
      return Helper.fail(res, "Category not found");
    }

    const duplicateName = await CategoryModel.findOne({
      name,
      _id: { $ne: id },
      isDeleted: false,
    });
    if (name && duplicateName) {
      return Helper.fail(res, "Category name already exists");
    }

    const updated = await CategoryModel.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(images && Array.isArray(images) && { images }),
      },
      { new: true }
    );

    return Helper.success(res, "Category updated successfully", updated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Find Category by ID
const findCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return Helper.fail(res, "Category ID is required");

    const category = await CategoryModel.findOne({ _id: id, isDeleted: false });
    if (!category) return Helper.fail(res, "Category not found");

    return Helper.success(res, "Category found successfully", category);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Soft Delete Category
const removeCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) return Helper.fail(res, "Category ID is required");

    const deleted = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return Helper.fail(res, "Category not found");

    return Helper.success(res, "Category deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// List Categories with Search
const listingCategory = async (req, res) => {
  try {
    const { search, limit = 10, page = 1, isPublished } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isDeleted: false };
if (req.type === "user") {
      query.isPublished = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isPublished === "boolean") {
      query.isPublished = isPublished;
    }

    const categories = await CategoryModel.find(query).skip(skip).limit(parseInt(limit));
    const total = await CategoryModel.countDocuments(query);

    if (!categories.length) return Helper.fail(res, "No categories found");

    return Helper.success(res, "Categories fetched successfully", {
      categories,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Fetch All Categories
const findAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ isDeleted: false }).select("name");
    return Helper.success(res, "All categories fetched", categories);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const toggleIsPublished = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return Helper.fail(res, "Category ID is required");
    }

    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return Helper.fail(res, "category not found");
    }

    const newStatus = !category.isPublished;

    category.isPublished = newStatus;
    await category.save();

    return Helper.success(res, `category is now ${newStatus ? 'Published' : 'Unpublished'}`, {
      categoryId: category._id,
      isPublished: category.isPublished,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Something went wrong while toggling publish status");
  }
};

module.exports = {
  createCategory,
  updateCategory,
  removeCategory,
  listingCategory,
  findCategoryById,
  findAllCategories,
  toggleIsPublished
};

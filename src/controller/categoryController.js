const CategoryModel = require("../models/categoryModel")
const Helper = require("../utils/helper")

// create category
const createCategory = async (req, res) =>{
    try {
        const {icon, name, description, sellingType, size, price, seat, serviceId } = req.body
        console.log(name, description, sellingType, size, price, seat,serviceId )
        if(!icon) return Helper.fail(res, "Category icon is required")
        if(!name) return Helper.fail(res, "Category name is required")
        if(!description) return Helper.fail(res, "Category description is required")
        if(!sellingType) return Helper.fail(res, "Category sellingType is required")
        if(!serviceId) return Helper.fail(res, "Category serviceId is required")
        // check if category already exist
        const categoryCheck = await CategoryModel.findOne({name})
        if(categoryCheck){
            return Helper.fail(res, "category already exist")
        }
        const createCategory = await CategoryModel.create({
            icon,
            name,
            description,
            sellingType,
            serviceId,
            size,
            price,
            seat
        })
        if(!createCategory){
            return Helper.fail(res, "category not create")
        }
        return Helper.success(res, "category created successfuly", createCategory)
    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, error.message)
    }
}
// update category
const updateCategory = async (req, res) =>{
    try {
        const categoryId = req.params.id
        const { icon, name, description, sellingType, size, price, seat } = req.body
        if(!categoryId){
            return Helper.fail(res, "category id is required")
        }
        const categoryCheck = await CategoryModel.findById(categoryId) 
        if(categoryCheck && categoryCheck.isDeleted == true){
            return Helper.fail(res, "category not found")
        }
        if(!categoryCheck){
            return Helper.fail(res, "category not found")
        }
        const updateObj = {}
        if(name){
            const isExist = await CategoryModel.findOne({name: name})
            if(isExist){
                return Helper.fail(res, "category name is already used")
            }
            updateObj.name = name
        }
        if(description){
            updateObj.description = description
        }
        if(icon){
            updateObj.icon = icon
        }
        if(sellingType){
            updateObj.sellingType = sellingType
        }
        if(size){
            updateObj.size = size
        }
        if(price){
            updateObj.price = price
        }
        if(seat){
            updateObj.seat = seat
        }
        const categoryUpdate = await CategoryModel.findByIdAndUpdate(
            categoryId,
            updateObj,
            { new: true }
        )
        if(!categoryUpdate){
                return  Helper.fail(res, "category not updated")
            }
        return  Helper.success(res, "category updated successfully", categoryUpdate)
    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, error.error)
    }
}
// find category by id
const findCategoryById = async (req, res) =>{
    try {
        const { id } = req.params
        if(!id){
            return Helper.fail(res, "categoryId is required")
        }
        const category = await CategoryModel.findOne({_id: id, isDeleted:false})
        if(!category){
            return Helper.fail(res, "category not found")
        }
        return Helper.success(res, "category found successfuly", category)
    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to find")
    }
}
// soft delete category
const removeCategory = async (req, res) =>{
    try {
        const { categoryId } = req.body;
        if(!categoryId){
            return Helper.fail(res, "category id required")
        }
        let id = { _id: categoryId };
        const isRemoved = await CategoryModel.findOneAndUpdate(
            id,
            {isDeleted : true},
            { new: true }
        )
        if(!isRemoved){
            return Helper.fail(res, "no category found")
        }
        return Helper.success(res, "category deleted successfully")
    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to delete category")
    }
}
// listing and search by sellingType category 
const listingCategory = async (req, res) => {
    try {
      const { search, limit = 3, page = 1, sellingType } = req.body;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      let matchStage = { isDeleted: false };
      if (search) {
        matchStage.$or = [
          { sellingType: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ];
      }
      if (sellingType && sellingType.length > 0) {
        matchStage.sellingType = sellingType;
      }
      const categoryList = await CategoryModel.find(matchStage)
        .skip(skip)
        .limit(parseInt(limit));
      const totalcategories = await CategoryModel.countDocuments(matchStage);
      if (categoryList.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No category found matching the criteria",
        });
      }  
      const data = {
        categories: categoryList,
        pagination: {
            totalcategories,
            totalPages: Math.ceil(totalcategories / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit),
          },
      };
  
      return Helper.success(res, "category listing fetched", data);
    } catch (error) {
      console.log(error);
      return Helper.fail(res, error.message);
    }
  };

// fetch categories for service
const categoriesForService = async (req, res) =>{
    try {
        const {serviceId} = req.body
        if(!serviceId){
            return Helper.fail(res, "service id is required")
        }
        const categories = await CategoryModel.find({serviceId})
        .select("-isDeleted -createdAt -updatedAt -__v")
        .populate("serviceId", "name ")
        if(!categories){
            return Helper.fail(res, "no category available for this service")
        }
        return Helper.success(res, "categories fetched for the service", categories)
    } catch (error) {
        console.log(error);
        return Helper.fail(res, error.message);
    }
}  

module.exports = {
    createCategory,
    updateCategory,
    removeCategory,
    listingCategory,
    findCategoryById,
    categoriesForService
}


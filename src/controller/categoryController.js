const CategoryModel = require("../models/categoryModel")
const Helper = require("../utils/helper")

// create category
const createCategory = async (req, res) =>{
    try {
        const { name, description, sellingType, size, price, seat } = req.body
        console.log(name, description, sellingType, size, price, seat)
        if(!name) return Helper.fail(res, "Category name is required")
        if(!description) return Helper.fail(res, "Category description is required")
        if(!sellingType) return Helper.fail(res, "Category sellingType is required")
        // check if category already exist
        const categoryCheck = await CategoryModel.findOne({name})
        if(categoryCheck){
            return Helper.fail(res, "category already exist")
        }
        const createCategory = await CategoryModel.create({
            name,
            description,
            sellingType,
            size,
            price,
            seat
        })
        console.log(createCategory)
        if(!createCategory){
            return Helper.fail(res, "category not create")
        }
        return Helper.success(res, "category created successfuly", createCategory)

    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, error.error)
    }
}

// update category
const updateCategory = async (req, res) =>{
    try {
        const categoryId = req.params.id
        const { name, description, sellingType, size, price, seat } = req.body
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
        const {id} = req.params
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
        const {categoryId} = req.body;
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
// listing category
const  listingCategory = async (req, res) =>{
    try {
        const { search, limit = 3, page = 1 , sellinType} = req.body;
        // console.log(search)
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Building the query with search and isDeleted filter
        let matchStage = { isDeleted: false };
        if (search) {
          matchStage.$or = [
            { sellingType: { $regex: search, $options: "i" } },      
            { name: { $regex: search, $options: "i" } }     
          ];
        }
        // Fetch paginated category matching the search criteria
        const categoryList = await CategoryModel.find(matchStage)
        .skip(skip)
        .limit(parseInt(limit));
        // Fetch total count for pagination info
        const totalcategories = await CategoryModel.countDocuments(matchStage);
        if (categoryList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No category found for matching the criteria"
                });
            }
        // Pagination metadata
        const pagination = {
        totalcategories,
        totalPages: Math.ceil(totalcategories / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
        };
        const data = {
            categories: categoryList,
            pagination
        }
        return Helper.success(res, "category listing fetched", data)
    } 
    catch (error) {
        console.log(error)
        return Helper.fail(res, error.error)
    }
}
// search category by sellingType
const searchCategory = async (req, res) =>{
    try {
       const { sellingType } = req.body
       if(sellingType.length>0){
        const search = await CategoryModel.find({sellingType} )
        if(!search){
            return Helper.fail(res, "no match found")
        }
        return Helper.success(res, "data fetched", search)
       }
       if(!sellingType){
        const search = await CategoryModel.find()
        if(!search){
            return Helper.fail(res, "no any data exist")
        }
        return Helper.success(res, "data fetched", search)
       }

    } catch (error) {
        console.log(error)
        return Helper.fail(res, error.error)
    }
}

module.exports = {
    createCategory,
    updateCategory,
    removeCategory,
    listingCategory,
    findCategoryById,
    searchCategory
}

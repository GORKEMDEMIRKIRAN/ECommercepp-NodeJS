


const CategoryModel = require('../Models/categoryModel');
const Category=require('../../Models/Category');

class categpryRepository{

    //==========================================
    // ALL CATEGORIES
    async findAll(){
        const categories=await CategoryModel.find({});
        return categories.map(category=>new Category(
            category._id.toString(),
            category.name,
            category.description
        ));
    }
    //==========================================
    async findCategoryById(id){
        const category=await CategoryModel.findById(id);
        if(!category){
            return null;
        }
        return new Category(
            category.id.toString(),
            category.name,
            category.description
        );
    }
    //==========================================
    // COUNT CATEGORIES
    async countCategories(){
        return await CategoryModel.countDocuments({});
    }
    //==========================================
    // INSERT CATEGORIES
    async insertManyCategories(categories){
        const result=await CategoryModel.insertMany(categories);
        return result;
    }
    //==========================================
    async insertOneCategory(category){
        try{
            
            // _id alanına mongodb'nin otomatik oluşturmasına izin verme
            const newCategory=new CategoryModel({
                name:category.name,
                description:category.description
            });
            const result=await newCategory.save();
            return new Category(
                result._id.toString(),
                result.name,
                result.description
            );
        }
        catch(error){
            throw new Error(`Error insert category: ${error.message} `);
        }

    }
    //==========================================
    async deleteCategory(id){
        try{
            const category=await CategoryModel.findByIdAndDelete(id);
            if(!category){
                throw new Error('Category not found');
            }
            return category;
        }
        catch(error){
            console.error(error);
        }
    }
    //==========================================
    async updateCategory(id,categoryData){
        const category=await CategoryModel.findByIdAndUpdate(id,categoryData,{new:true});
        if(!category){
            return null;
        }
        return new Category(
            category._id.toString(),
            category.name,
            category.description
        );
    }
    //==========================================
    //==========================================
    //==========================================

}
module.exports=new categpryRepository();
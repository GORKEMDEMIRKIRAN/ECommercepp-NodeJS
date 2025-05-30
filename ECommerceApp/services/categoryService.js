

const categoryRepository=require('../Data/Repositories/categoryRepository');

class categoryService{

    //================================
    async getAllCategories(){
        return await categoryRepository.findAll();
    }
    //================================
    async getCategoryById(id){
        return await categoryRepository.findCategoryById(id);
    }
    //================================
    async getCountCategories(){
        return await categoryRepository.countCategories();
    }
    //================================
    async getInsertManyCategories(categoryData){
        return await categoryRepository.insertManyCategories(categoryData);
    }
    //================================
    async getInsertOneCategory(category){
        return await categoryRepository.insertOneCategory(category);
    }
    //================================
    async getDeleteCategory(id){
        return await categoryRepository.deleteCategory(id);
    }
    //================================
    async getCategoryUpdate(id,categoryData){
        return await categoryRepository.updateCategory(id,categoryData);
    }
    //================================
}
module.exports=new categoryService();
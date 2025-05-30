

const productRepository=require('../Data/Repositories/productRepository');


class productService{
    //=======================================
    // ALL PRODUCTS
    async getAllProducts(){
        return await productRepository.findAll();
    }
    //=======================================
    // Get One Product
    async getProductById(id){
        return await productRepository.findProductById(id);
    }
    //=======================================
    async getProductsByCategoryId(id){
        return await productRepository.productsByCategoryId(id);
    }
    //=======================================
    // COUNT PRODUCTS
    async getCountProducts(){
        return await productRepository.countProducts();
    }
    //=======================================
    async getUpdateProduct(id,productData){
        return await productRepository.updateProduct(id,productData);
    }
    //=======================================
    // ALL INSERT PRODUCTS
    async getInsertManyProducts(productData){
        return await productRepository.insertManyProducts(productData);
    }
    //=======================================
    async getInsertOneProduct(product){
        return await productRepository.insertOneProduct(product);
    }
    //=======================================
    async getDeleteProduct(id){
        return await productRepository.DeleteProduct(id);
    }
    //=======================================
    async getProductsByIds(productIds){
        return await productRepository.productsByIds(productIds);
    }
    //=======================================
    //=======================================
}

module.exports=new productService();

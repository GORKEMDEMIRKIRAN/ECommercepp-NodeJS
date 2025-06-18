

const productRepository=require('../Data/Repositories/productRepository');


class productService{
    constructor(productRepository){
        this.productRepository=productRepository;
    }
    //=======================================
    // ALL PRODUCTS
    async getAllProducts(){
        return await productRepository.findAll();
    }
    //=======================================
    async userFilterProducts(id){
        return await productRepository.filterProducts(id);
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
    // BUSINESS LOGIC
    async getInsertOneProduct(product){
        try {
            // Business logic kontrolları
            //await this.validateBusinessRules(product);
            
            const result = await productRepository.insertOneProduct(product);
            
            console.log('Service: Ürün başarıyla kaydedildi:', result.id);
            return result;
        } catch (error) {
            console.error('Service Error:', error.message);
            throw error; // Error'ı controller'a fırlat
        }

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
    async findByName(value){
        return await productRepository.getFindByName(value);
    }
    //=======================================
}

module.exports=new productService();

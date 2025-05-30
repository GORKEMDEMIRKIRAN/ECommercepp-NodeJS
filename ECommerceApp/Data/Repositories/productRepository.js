



const ProductModel=require('../Models/productModel');
const Product=require('../../Models/Product');

class productRepository{
    //==========================================
    // ALL PRODUCTS
    async findAll(){
        const products=await ProductModel.find({});
        return products.map(product=>new Product(
            product._id.toString(),
            product.name,
            product.brand,
            product.price,
            product.description,
            product.imageUrl,
            product.categories
        ));
    }
    //==========================================
    async findProductById(id){
        const product=await ProductModel.findById(id);
        if(!product){
            return null;
        }
        return new Product(
            product._id.toString(),
            product.name,
            product.brand,
            product.price,
            product.description,
            product.imageUrl,
            product.categories
        );
    }
    //==========================================
    async findProductsByCategory(category){
        const products=await ProductModel.find({category});
        return products.map(product=>new Product(
            product._id.toString(),
            product.name,
            product.brand,
            product.price,
            product.description,
            product.imageUrl,
            product.categories
        ));
    }
    //==========================================
    async productsByCategoryId(id){
        const products=await ProductModel.find({
            categories:id
        });
        if(!products){
            return null;
        }
        return products.map(product=>new Product(
            product._id.toString(),
            product.name,
            product.brand,
            product.price,
            product.description,
            product.imageUrl,
            product.categories
        ));
    }
    //==========================================
    // update product
    async updateProduct(id,productData){
        // {new: true} seçeneğini kullanarak güncellenmiş ürünü döndürüyorsunuz
        const product=await ProductModel.findByIdAndUpdate(id,productData,{new:true});
        if(!product){
            return null;
        }
        return new Product(
            product._id.toString(),
            product.name,
            product.brand,
            product.price,
            product.description,
            product.imageUrl,
            product.categories
        );
    }
    //==========================================
    async countProducts(){
        return await ProductModel.countDocuments({});
    }
    //==========================================
    async insertManyProducts(products){
        try{
            const result=await ProductModel.insertMany(products);
            return result;
        }
        catch(error){
            throw new Error(`Error inserting product: ${error.message}`);
        }
    }
    //==========================================
    // create product
    async insertOneProduct(product){
        try{
            const productmodel=await ProductModel({
                name:product.name,
                brand:product.brand,
                price:product.price,
                description:product.description,
                imageUrl:product.imageUrl,
                categories:product.categories
            });
            const result=await productmodel.save();
            return new Product(
                result._id.toString(),
                result.name,
                product.brand,
                result.price,
                result.description,
                result.imageUrl,
                result.categories
            );
        }
        catch(error){
            throw new Error(`Error inserting product: ${error.message}`);
        }
    }
    //==========================================
    // delete product
    async DeleteProduct(id){
        try{
            const product=await ProductModel.findByIdAndDelete(id);
            if(!product){
                throw new Error('Product not found');
            }
            return product;
        }
        catch(error){
            console.error(error);
        }

    }
    //==========================================
    // productIds dizisinde ürün id göre ürünleri getiren metot
    async productsByIds(productIds){
        try{
            // verilen id'lere göre ürünleri getirme
            const products=await ProductModel.find({
                _id:{$in:productIds}
            }).exec();
            return products;
        }catch(error){
            console.error('Error in getProductsByIds: ',error);
            throw error;
        }
    }

    //==========================================

    //==========================================
}
module.exports=new productRepository();
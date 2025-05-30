

const adminService=require('../services/adminService');
const categoryService=require('../services/categoryService');
const productService=require('../services/productService');
const Product=require('../Models/Product');
const Category=require('../Models/Category');

class adminController{
    constructor(adminService,categoryService,productService){
        this.adminService=adminService;
        this.categoryService=categoryService;
        this.productService=productService;
    }
    //---------------------------------------
    async getAddProduct(req,res,next){
        const categories=await categoryService.getAllCategories();

        res.render('admin/add-product',{
            title:'Add a New Product',
            path:'/admin/add-product',
            categories:categories
        });
    } 
    //---------------------------------------
    async postAddProduct(req,res,next){
        try{
            const name=req.body.name;
            const price=req.body.price;
            const imageUrl=req.body.imageUrl;
            const description=req.body.description;
            const categories=req.body.categoryIds;
            const product={
                name:name,
                price:price,
                description:description,
                imageUrl:imageUrl,
                categories:categories,
                date: Date.now
            };
            await productService.getInsertOneProduct(product);
            res.redirect('/admin/products');
        }
        catch(error){
            console.error(error);
        }
    }
    //---------------------------------------
    async getEditProduct(req,res,next){
        try{
            // take productId
            // get product by productId
            // get categories
            // product null control
            // categories select
            // render
            //====================
            const productId=req.params.productId;
            const [product,categories]=await Promise.all([
                productService.getProductById(productId),
                categoryService.getAllCategories()
            ]);
            //====================
            // Null kontrolü
            if(!product){
                return res.status(404).render('error/404',{
                    title:'Error',
                    message:'Ürün bulunamadi'
                });
            }
            //====================
            console.log("Product Categories:", product.categories);
            console.log("Categories:", categories.map(c => ({ id: c.id, name: c.name })));
            //====================
            // Kategorileri işaretleme
            if(product.categories && Array.isArray(product.categories)&& categories.length>0){
                categories.forEach(category=>{
                    // category.id kullanın (category._id değil)
                    if(product.categories.includes(category.id)){
                        category.selected=true;
                    }
                });
            }
            //====================
            res.render('admin/edit-product',{
                title:'Edit Product',
                product:product,
                categories:categories,
                path:'/edit-product'
            });
            //====================

        }
        catch(error){
            console.log('Error: ',error);
            // res.status(500).render('error/error',{
            //     title:'Error',
            //     message:'Bir hata oluştu',
            // });
            res.status(500).send(`
                <p>${error.message}</p>
                <pre>${error.stack}</pre>
            `);
        }

    }
    //---------------------------------------
    async postEditProduct(req,res,next){
        try{
            const productId = req.body.productId;
            //------------------------------
            const name = req.body.name;
            const price = req.body.price;
            const imageUrl = req.body.imageUrl;
            const description = req.body.description;
            const categories = req.body.categoryIds; 
            //------------------------------
            const updatedProduct=new Product({
                name:name,
                price:price,
                imageUrl:imageUrl,
                description:description,
                categories:categories,
            });
            //------------------------------
            await productService.getUpdateProduct(productId,updatedProduct);
            res.redirect('/admin/products');
        }
        catch(error){
            console.log(error);
        }
    }
    //---------------------------------------
    // ADMIN ALL PRODUCTS
    async getProducts(req,res,next){
        try{
            const products=await productService.getAllProducts();
            res.render('admin/products',{
                title:'Admin Products',
                productList:products,
                path:'/products',
                action:req.query.action
            });
        }
        catch(error){
            console.log(error);
        }
    }
    //---------------------------------------
    async postDeleteProduct(req,res,next){
        try{
            const productId=req.body.productId;
            await productService.getDeleteProduct(productId);
            res.redirect('/admin/products');
        }
        catch(error){
            console.log(error);
        }
    }
    //---------------------------------------
    //=================================================================
    //---------------------------------------
    async getAddCategory(req,res,next){
        res.render('admin/add-category',{
            title:'Add a New Category',
            path:'/admin/add-category',
        });
    }
    //---------------------------------------
    async postAddCategory(req,res,next){
        try{
            const name=req.body.name;
            const description=req.body.description;
            const category={
                name:name,
                description:description,
                date: Date.now
            };
            const result=await categoryService.getInsertOneCategory(category);
            console.log(result);
            res.redirect('/admin/categories?action=create');
        }
        catch(error){
            console.error('Error: ',error);
            res.status(500).send(`
                <p>${error.message}</p>
                <pre>${error.stack}</pre>
                `);
        }
    }
    //---------------------------------------
    // ADMIN ALL CATEGORIES
    async getCategories(req,res,next){
        const categories=await categoryService.getAllCategories();
        res.render('admin/categories',{
            title:'All Categories',
            path:'/categories',
            categoryList:categories
        })
    }
    //---------------------------------------
    async postDeleteCategory(req,res,next){
        try{
            const categoryId=req.body.categoryId;
            if(!categoryId){
                return res.status(400).send('Category ID is required');
            }
            await categoryService.getDeleteCategory(categoryId);
            res.redirect('/admin/category-list?action=delete');
        }
        catch(error){
            console.error(`Controller-Error deleting category: `,error);
            res.status(500).render('error/error',{
                title:'Error',
                message:`Kategori silinirken bir hata oluştu: ${error.message}`
            });
        }
    }
    //---------------------------------------
    async getEditCategory(req,res,next){
        try{
            const categoryId=req.params.categoryId;
            if(!categoryId){
                return res.status(400).send('Category ID is required');
            }
            const category=await categoryService.getCategoryById(categoryId);
            res.render('admin/edit-category',{
                title:'Edit Category',
                path:'/edit-category',
                category:category
            });
        }
        catch(error){
            res.status(500).render('error/error',{
                title:'Error',
                message:`Kategori güncellenirken bir hata oluştu: ${error.message}`
            });
        }
    }
    //---------------------------------------
    async postEditCategory(req,res,next){
        try{
            const categoryId=req.body.categoryId;
            const name=req.body.name;
            const description=req.body.description;
            const updatedCategory={
                name:name,
                description:description
            };
            await categoryService.getCategoryUpdate(categoryId,updatedCategory);
            res.redirect('/admin/categories');
        }
        catch(error){
            console.log(error);
        }



    }
    //---------------------------------------
}

module.exports=new adminController();




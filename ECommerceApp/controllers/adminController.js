




const categoryService=require('../services/categoryService');
const productService=require('../services/productService');
const Product=require('../Models/Product');

const logger=require('../config/logger');




class adminController{
    constructor(adminService,categoryService,productService){
        this.adminService=adminService;
        this.categoryService=categoryService;
        this.productService=productService;
    }
    //---------------------------------------
    async getAddProduct(req,res,next){
        // const categories=await this.categoryService.getAllCategories();

        // res.render('admin/add-product',{
        //     title:'Add a New Product',
        //     path:'/admin/add-product',
        //     categories:categories
        // });
        try {
            // Kategorileri getir (örnek)
            const categoriesList = await categoryService.getAllCategories();
            
            res.render('admin/add-product', {
                title:'Add a New Product',
                path:'/admin/add-product',
                categories:categoriesList,
            });
        } catch (error) {
            console.error('Get add product error:', error);
            res.render('admin/add-product', {
                dangerMessage: 'Sayfa yüklenirken hata oluştu',
                categories: categoriesList,
            });
        }
    } 
    //---------------------------------------
    async postAddProduct(req,res,next){
        try{   
            const requestId=Math.random().toString(36).substr(2,9);
            const startTime=Date.now();


            const { name, price, imageUrl, brand, description, categoryIds } = req.body;

            // categoryIds kontrolü ve düzeltmesi
            let processedCategoryIds = [];
            if (categoryIds) {
                if (Array.isArray(categoryIds)) {
                    processedCategoryIds = categoryIds;
                } else {
                    // Tek kategori seçilmişse string olarak gelir
                    processedCategoryIds = [categoryIds];
                }
            }

            console.log('Gelen categoryIds:', categoryIds);
            console.log('İşlenmiş categoryIds:', processedCategoryIds);

            const product={
                name:name,
                price:parseFloat(price),
                description:description,
                imageUrl:imageUrl,
                brand:brand,
                categories:[...categoryIds],
                isActive:true,
                tags:['smart phohe','smart computer'], //  this.generateTags(name, brand), // Otomatik tag oluştur
                userId:req.session.user.id,
                date: Date.now()
                
            };

            // logger.info('Product creation started by admin',{
            //     requestId,
            //     ...req.body,
            //     productName:req.body.name
            // });


            console.log('Controller: Ürün ekleme işlemi başlatılıyor:', product.name);
            const saveProductData=await productService.getInsertOneProduct(product);
            console.log('Controller: Ürün başarıyla eklendi:', saveProductData.id);

            // Başarılı kayıt - kategorileri tekrar getir
            //const categories = await this.categoryService.getAllActiveCategories();
            const categoryList=await categoryService.getAllCategories();


            res.render('admin/add-product',{
                successMessage:`"${saveProductData.name}" ürünü başarıyla eklendi!`,
                title:'Add a New Product',
                path:'/admin/add-product',
                categories:categoryList,
            });
        }
         catch (error) {
            console.error('Controller: Ürün ekleme hatası:', error.message);
            
            // Kategorileri tekrar getir (hata durumunda da form çalışabilsin)
            // let categoriesList = [];
            // try {
            //     const categoryIds = await this.categoryService.getAllCategories();
            //     categoriesList.add(categoryIds)
            // } catch (categoryError) {
            //     console.error('Kategori getirme hatası:', categoryError);
            // }
            
            // // Hata tipine göre farklı mesajlar ve HTTP status kodları
            // let errorMessage = 'Ürün eklenirken bir hata oluştu';
            // let statusCode = 500;
            
            // if (error.message.includes('Bu isimde bir ürününüz zaten mevcut')) {
            //     errorMessage = 'Bu isimde bir ürününüz zaten sistemde kayıtlı. Lütfen farklı bir isim seçin.';
            //     statusCode = 409; // Conflict
            // } else if (error.message.includes('Veritabanı validation hatası')) {
            //     errorMessage = `Veri doğrulama hatası: ${error.message.replace('Veritabanı validation hatası: ', '')}`;
            //     statusCode = 400; // Bad Request
            // } else if (error.message.includes('Seçilen kategorilerden bazıları geçersiz')) {
            //     errorMessage = 'Seçilen kategoriler geçersiz. Lütfen geçerli kategoriler seçin.';
            //     statusCode = 400;
            // } else if (error.message.includes('yasaklı kelimeler')) {
            //     errorMessage = 'Ürün adında uygunsuz kelimeler bulunuyor. Lütfen düzenleyin.';
            //     statusCode = 400;
            // } else if (error.message.includes('Veritabanı hatası')) {
            //     errorMessage = 'Veritabanı bağlantı sorunu. Lütfen daha sonra tekrar deneyin.';
            //     statusCode = 503; // Service Unavailable
            // } else if (error.message.includes('Ürün fiyatı çok yüksek')) {
            //     errorMessage = 'Ürün fiyatı çok yüksek. Maksimum 1.000.000 TL olabilir.';
            //     statusCode = 400;
            // }
            
            // res.status(statusCode).render('admin/add-product', {
            //     errorMessage: errorMessage,
            //     formData: req.body, // Form verilerini koru
            //     categories: categoriesList,
            // });
        }
    }
    //     // Yardımcı metodlar
    // generateTags(name, brand) {
    //     const tags = [];
        
    //     // Ürün adından tag oluştur
    //     const nameWords = name.toLowerCase().split(' ');
    //     tags.push(...nameWords.filter(word => word.length > 2));
        
    //     // Marka adını ekle
    //     tags.push(brand.toLowerCase());
        
    //     // Tekrarları kaldır
    //     return [...new Set(tags)];
    // }

    // getErrorType(errorMessage) {
    //     if (errorMessage.includes('zaten mevcut')) return 'duplicate';
    //     if (errorMessage.includes('validation')) return 'validation';
    //     if (errorMessage.includes('Veritabanı')) return 'database';
    //     if (errorMessage.includes('yasaklı')) return 'business';
    //     return 'general';
    // }
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
            const userId=req.session.user.id;
            console.log('session user id',userId);
            
            const products=await productService.userFilterProducts(userId);
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




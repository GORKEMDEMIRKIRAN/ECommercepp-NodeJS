



const productService=require('../services/productService');
const categoryService=require('../services/categoryService');
const userService=require('../services/userService');
const cartService=require('../services/cartService');
const orderService=require('../services/orderService');
const { ordersUserById } = require('../Data/Repositories/orderRepository');
// PRODUCT CONTROLLER

//=======================================

class shopController{
    //---------------------------------------
    constructor(productService,categoryService,cartService,orderService){
        this.productService=productService;
        this.categoryService=categoryService;
        this.cartService=cartService;
        this.orderService=orderService;
    }
    //---------------------------------------
    async getIndex(req,res,next){
        try{

            const [products,categories]=await Promise.all([
                productService.getAllProducts(),
                categoryService.getAllCategories()
            ]);
            res.render('shop/index',{
                title:'HOMEPAGE',
                productList: products,
                categories:categories,
                path:'/index',
            });

        }catch(error){
            console.log('Error: ',err);
            res.status(500).redirect('/error/error',{
                title:'Error',
                message:'Bir hata oluştu' 
            });
        }
    }
    //---------------------------------------
    async getProducts(req,res,next){
        try{
            const [products,categories]=await Promise.all([
                productService.getAllProducts(),
                categoryService.getAllCategories()
            ]);
            res.render('shop/products',{
                title:'PRODUCTS',
                productList: products,
                categories: categories,
                path:'/products',
            });

        }catch(error){
            console.log('Error: ',err);
            res.status(500).render('error',{
                title:'Error',
                message:'Bir hata oluştu'
            });
        }
    }
    //---------------------------------------
    async getProduct(req,res,next){
        try{
            const productId=req.params.productId;
            
            const product=await productService.getProductById(productId);
            
            res.render('shop/details',{
                title:'product details',
                product:product,
                //categoryName:category.name, 
                path:'/details',
                isAuthenticated:req.session.isAuthenticated
            });
        }
        catch(error){
            console.log('Error: ',error);
            res.status(500).render('error',{
                title:'Error',
                message:'Bir hata oluştu'
            });
        }
    }
    //---------------------------------------
    async getProductsByCategoryId(req,res,next){
        try{
            const categoryId=req.params.categoryId;
            const [products,categories]=await Promise.all([
                productService.getProductsByCategoryId(categoryId),
                categoryService.getAllCategories()
            ]);
            res.render('shop/products',{
                title:'products',
                productList:products,
                categories:categories,
                selectedCategory:categoryId,
                path:'/products',
                isAuthenticated:req.session.isAuthenticated
            });
        }
        catch(error){
            console.log('Error: ',error);
            res.status(500).render('error',{
                title:'Error',
                message:'Bir hata oluştu'
            });
        }
    }
    //---------------------------------------
    async getCart(req,res,next){
        try{
            // userId(session eklediğimiaz kullanıcı bilgisini alıyoruz.)
            const userId=req.session.user.id;
            console.log('User ID: ',userId);
            // 1-Kullanıcının sepetindeki ürün Id'lerini ve miktarlarını al
            const cartItems=await cartService.getUserCart(userId);
            console.log('Cart Items: ',cartItems);
            // 2-Ürün idlerini bir diziye topla
            const productIds=cartItems.map(item=>item.productId);
            console.log('Product IDs: ',productIds);
            // 3-Bu Id'lere göre ürünleri getirme
            const products=await productService.getProductsByIds(productIds)
            console.log('Products: ',products);
            // 4-ürünleri ve miktarları birleştirme
            const productsWithQuantity=cartItems.map(cartItem=>{
                const product=products.find(p=>
                    p._id.toString()===cartItem.productId.toString()
                );
                console.log('Mathing product for',cartItem.productId,':',product);
                if(!product){
                    return null;
                }
                return {
                    id:product._id,
                    name:product.name||product.title,
                    price:product.price,
                    description:product.description,
                    imageUrl:product.imageUrl,
                    categories:product.categories,
                    quantity:cartItem.quantity
                }
            });
            console.log('Products with quantity: ',productsWithQuantity);
            res.render('shop/cart',{
                title:'Cart',
                path:'/cart',
                productList:productsWithQuantity,
                isAuthenticated:req.session.isAuthenticated
            });
        }
        catch(error){
            console.error('Error in getCart controller: ',error);
            next(error);
        }
    }
    //---------------------------------------
    async postCart(req,res,next){
        try{
            const userId=req.session.user.id;
            const productId=req.body.productId;
            console.log('karta ürün ekleme Kullanıcı id: ',userId);
            console.log('eklenen ürün id: ',productId);
            // const product=await productService.getProductById(productId);
            await cartService.addProductToCart(userId,productId);
            res.redirect('/shop/index');
        }
        catch(error){
            // res.redirect('/error/error',{
            //     message:error.message
            // });
            console.error('Error in postCart controller: ',error);
            //next(error);
        }
    }
    //---------------------------------------
    async postCartItemDelete(req,res,next){
        const userId=req.session.user.id;
        const productId=req.body.productId;
        await cartService.removeProductFromCart(userId,productId);
        res.redirect('/shop/cart');
    }
    //---------------------------------------
    async postCartClear(req,res,next){
        const userId=req.session.user.id;
        // userId ile o kullanıcının kartını temizleme
        await cartService.emptyCart(userId);
        res.redirect('/shop/cart');
    }
    //---------------------------------------
    async getOrders(req,res,next){

        const userId=req.session.user.id;
        console.log("Kullanıcı ID'si: ",userId);
        const orders=await orderService.getUserOrders(userId);
        console.log('Kullanıcının siparişleri: ',orders);
        res.render('shop/orders',{
            orders:orders,
            path:'/orders'
        });
    }
    //---------------------------------------
    async postOrder(req,res,next){
        const userId=req.session.user.id;
        const createOrder=await orderService.CreateOrder(userId);
        res.redirect('/shop/cart');
    }
    //---------------------------------------
}
module.exports= new shopController();


//=======================================

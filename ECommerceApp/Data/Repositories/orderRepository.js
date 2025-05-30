

const mongoose=require('mongoose');
const Order = require('../../Models/Order');
const OrderModel=require('../Models/orderModel');
const UserModel=require('../Models/userModel');


const productRepository=require('../Repositories/productRepository');
const cartRepository=require('../Repositories/cartRepository');

class orderRepository{

    async createOrder(userId){
        // id göre kullanıcıyı bulma
        // kullanıcıyı sepetini bul
        //---------------------------------------------
        const user=await UserModel.findById(userId);
        if(!user){
            throw new Error('User not found');
        }
        //---------------------------------------------
        if(!user.cart || user.cart.items.length===0){
            throw new Error('Cart is Empty');
        }
        //---------------------------------------------
        // cart içindeki ürün id alma
        const productIds=user.cart.items.map(item=>item.productId);
        // Ürün bilgilerini veri tabından çekme
        const products=await productRepository.productsByIds(productIds);

        // ürün id'lerini ve bilgilerini eşleştir
        const productMap={};
        products.forEach(product=>{
            productMap[product._id.toString()]=product
        });
        //---------------------------------------------
        // Sipariş öğelerini oluştur
        const orderItems=[];
        let totalAmount=0;

        for(const cartItem of user.cart.items){
            //--------------------------------
            const productId=cartItem.productId.toString();
            const product=productMap[productId];
            //--------------------------------
            if(!product){
                console.warn(`Product with ID ${productId} not found`);
                continue; // ürün bulunamadıysa atla
            }
            //--------------------------------
            const orderItem={
                product:{
                    productId:product._id,
                    title:product.name,
                    price:product.price,
                    imageUrl:product.imageUrl
                },
                quantity:cartItem.quantity
            };
            //--------------------------------
            orderItems.push(orderItem);
            totalAmount += (product.price * cartItem.quantity);
            //--------------------------------
        }
        //---------------------------------------------
        if(orderItems.length===0){
            throw new Error('No valid products in cart');
        }
        //---------------------------------------------
        // yeni şisariş oluştur
        const order={
            user:{
                userId:userId,
                email:user.email,
                name:user.name,
            },
            items:orderItems, // burada oluşturduk
            totalAmount,      // burada oluşturduk
            // shippingAddress,  
            // paymentMethod
        };
        //---------------------------------------------
        // şiparişi kaydet(order create)
        await OrderModel.create(order);
        //---------------------------------------------
        // userId göre kullanıcının kartını temizleme
        await cartRepository.clearCart(userId);
        //---------------------------------------------

    }

    async ordersUserById(userId){
        const orders=await OrderModel.find({'user.userId':new mongoose.Types.ObjectId(userId)});
        if(!orders){
            throw new Error('Orders not found');
        }
        return orders.map(order=>new Order(
            order._id,
            order.user,
            order.items,
            order.totalAmount,
            order.status,
            order.paymentStatus,
            order.createdAt,
            order.shippingAddress || null,
            order.paymentMethod || null
        ));
    }
}


module.exports=new orderRepository();
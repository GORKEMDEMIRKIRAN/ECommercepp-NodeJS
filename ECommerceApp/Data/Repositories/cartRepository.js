


const mongoose=require('mongoose');

const UserModel=require('../Models/userModel');
const productRepository = require('./productRepository');

class cartRepository{
    
    //====================================================
    // get user cart
    async getCartByUserId(userId){
        try{
            const user=await UserModel.findById(userId)
                .exec();
            if(!user  || !user.cart || !user.cart.items || user.cart.items.length===0){
                return [];
            }
            // map cart items to include product details and quantity
            return user.cart.items.map(item=>{
                return{
                    productId:item.productId,
                    quantity:item.quantity
                };
            });
        }
        catch(error){
            console.error('Error in getcartbyuserId: ',error);
            throw error;
        }
    }
    //====================================================
    async addToCart(userId,productId){
        try{
            //--------------------------------
            // get user and product
            const user=await UserModel.findById(userId);
            console.log('use bilgisi :',user);
            const product=await productRepository.findProductById(productId);
            console.log('^bulunan ürün bilgisi: ',product);
            console.log('ürün eklenicek kullanıcı: ',user);
            console.log('kulanıcıya eklenicek ürün: ',product);
            //--------------------------------
            if(!user || !product){
                throw new Error('User or product not found');
            }
            //--------------------------------
            // Initialize cart if it doesn't exist
            if(!user.cart){
                user.cart={items:[]};
                console.log('Kullanıcı sepeti oluşturuldu');
            }
            // ürün sepette var mı kontrol et
            //const cartItems=user.cart?.items || [];
            const cartProductIndex=user.cart.items.findIndex(item=>
                item.productId && item.productId.toString() === productId.toString()
            );
            console.log('Ürün sepette var mı? Index: ',cartProductIndex);
            //--------------------------------
            let updateOperation;
            //--------------------------------
            if(cartProductIndex>=0){
                // ürün sepette varsa miktarını arttır
                updateOperation={
                    $inc:{[`cart.items.${cartProductIndex}.quantity`]:1}
                };
                console.log('Ürün miktarı arttırılacak');
            }
            else{
                // eğer eklenen ürün kartta hiç yoksa karta yeni ürünü ekleme
                updateOperation={
                    $push:{
                        'cart.items':{
                            productId:new mongoose.Types.ObjectId(productId),
                            quantity:1
                        }
                    }
                }
                console.log('Yeni ürün sepete eklenecek');
            }
            //--------------------------------
            // Doğrudan mongoDB update işlemi
            const result=await UserModel.updateOne(
                {_id:userId},
                updateOperation
            );
            console.log('Update sonucu: ',result);
            //--------------------------------
        }
        catch(error){
            console.error('Error in addToCart: ',error);
            console.log('');
            throw error;
        }
    }
    //====================================================
    async removeFromCart(userId,productId){
        try{
            //------------------------------------------
            const user=await UserModel.findById(userId);
            //------------------------------------------
            if(!user){
                throw new Error('User not found');
            }
            //------------------------------------------
            // // mongodb $pull operatörünü kullanarak ürünü sepetten çıkar
            const result=await UserModel.updateOne(
                {_id:userId},
                {
                    $pull:{
                        'cart.items':{
                            productId:new mongoose.Types.ObjectId(productId)
                        }
                    }
                }
            );
            console.log('Sepetten ürün silme sonucu: ',result);
            //------------------------------------------
        }
        catch(error){
            console.error('Error in removeFromCart: ',error);
            throw error;
        }
    }
    //====================================================
    async clearCart(userId){
        try{
            console.log('Sepet temizleme işlemi başlatıldı');
            console.log('Kullanici ID: ',userId);
            //------------------------------------
            const user = await UserModel.findById(userId);
            //------------------------------------
            if(!user){
                throw new Error('Cart not found');
            }
            //------------------------------------
            console.log('Mevcut sepet: ',user.cart);
            //------------------------------------
            // sepeti temizleme
            const updatedUser=await UserModel.findOneAndUpdate(
                {_id:userId},
                {$set:{'cart.items':[]}},
                {new:true} // güncellenmiş belgeyi döndür
            );
            console.log('Sepet temizlendi,güncellenmiş sepet:',updatedUser.cart);
            //------------------------------------
        }
        catch(error){
            console.error('Error in clearCart: ',error);
            throw error;
        }
    }
    //====================================================
}

module.exports=new cartRepository();
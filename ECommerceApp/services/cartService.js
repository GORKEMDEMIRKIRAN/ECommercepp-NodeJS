

const cartRepository=require('../Data/Repositories/cartRepository');

class cartService{
    //=====================================================
    async getUserCart(userId){
        try{
            return await cartRepository.getCartByUserId(userId);
        }
        catch(error){
            console.error('Error in getUserCart service: ',error);
            throw error;
        }
    }
    //=====================================================
    async addProductToCart(userId,productId){
        try{
            return await cartRepository.addToCart(userId,productId);
        }
        catch(error){
            console.error('Error in addProductToCart service: ',error);
            throw error;
        }
    }
    //=====================================================
    async removeProductFromCart(userId,productId){
        try{
            return await cartRepository.removeFromCart(userId,productId);
        }
        catch(error){
            console.error('Error in removeProductFromCart service: ',error);
            throw error;
        }
    }
    //=====================================================
    async emptyCart(userId){
        try{
            return await cartRepository.clearCart(userId);
        }
        catch(error){
            console.error('Error in emptyCart service: ',error);
            throw error;
        }
    }
    //=====================================================
}

module.exports=new cartService();
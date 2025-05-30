


const orderRepository=require('../Data/Repositories/orderRepository');


class orderService{

    async CreateOrder(userId){
        return await orderRepository.createOrder(userId);
    }
    async getUserOrders(userId){
        return await orderRepository.ordersUserById(userId);
    }
}


module.exports=new orderService();
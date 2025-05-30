


class Order{
    constructor(_id,user,items,totalAmount,status,paymentStatus,createdAt,shippingAddress=null,paymentMethod=null){
        this._id=_id;
        this.user=user||{};
        this.items=items||[];
        this.totalAmount=totalAmount;
        this.status=status;
        this.paymentStatus=paymentStatus;
        this.createdAt=createdAt;
        this.shippingAddress=shippingAddress;
        this.paymentMethod=paymentMethod;
        
    }
    toJSON(){
        return{
            id: this.id,
            user: this.user,
            items: this.items,
            totalAmount: this.totalAmount,
            status: this.status,
            paymentStatus: this.paymentStatus,
            createdAt: this.createdAt,
            shippingAddress: this.shippingAddress,
            paymentMethod: this.paymentMethod
        }
    }


}

module.exports=Order;
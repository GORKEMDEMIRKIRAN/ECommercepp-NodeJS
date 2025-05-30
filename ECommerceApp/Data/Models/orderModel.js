

const mongoose=require('mongoose');

const orderSchema=mongoose.Schema({
    user:{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        email:{
            type:String,
            required:true
        },
        name:String
    },
    items:[
        {
            product:{
                type:Object,
                productId:{
                    type:mongoose.Schema.TypesObjectId,
                    ref:'Product',
                    required:true
                },
                title:String,
                price:Number,
                imageUrl:String
            },
            quantity:{
                type:Number,
                required:true
            }
        }
    ],
    totalAmount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['Credit_card','paypal','bank_transfer','cash_on_delivery'],
        default:'Credit_card',
    },
    shippingAddress:{
        street:String,      //sokak
        city:String,        //il
        postalCode:String,  //posta kodu
        country:String,     //ilçe
        apartmentNo:Number, //apartman no
        apartment:Number,   //kat
        floor:Number,       // daire
    },
    paymentMethod:{
        type:String,
        enum:['Credit_card','paypal','bank_transfer','cash_on_delivery'],
    },
    paymentStatus:{
        type:String,
        enum:['pending','completed','failed','refunded'],
        default:'pending'
    },

},
{timestamps:true}// createdAt ve updatedAt alanlarını otomatik ekler

);

module.exports=mongoose.model('Order',orderSchema);
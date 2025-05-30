


const mongoose=require('mongoose');

const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price: {
        type:Number,
        required:true
    },
    description: String,
    imageUrl:String,
    userId:String,
    categories:Array,
    date:{
        type:Date,
        default:Date.now()
    }
});

module.exports=mongoose.model('Product',productSchema);
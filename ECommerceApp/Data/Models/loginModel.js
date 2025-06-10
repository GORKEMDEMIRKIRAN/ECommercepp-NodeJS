


const { default: mongoose } = require("mongoose")
const {isEmail,isStrongPassword}=require('validator');

const productSchema=mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required'],
        validate:[isEmail,'Invalid Email']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        validate:[isStrongPassword,'Invalid Password']
    },
});

module.exports=mongoose.model('login',productSchema);
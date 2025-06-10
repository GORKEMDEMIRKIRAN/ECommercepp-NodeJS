


const mongoose=require('mongoose');



const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        minlength:5  // minimum 5 karakter olmalı
    },
    brand:{
        type:String,
        required:[true,'Brand section ,s required'],
    },
    price: {
        type:Number,
        required:true,
        // Bunu kullanıcı ürün aktif ettiğinde fiyat zorunlu olmalı
        // ürün aktif olduğu durumda price alanı zorunlu olur.
        // ürün pasif olduğu durumda price alanı zorunlu olmaz.
        // required:function(){
        //     return this.isActive;
        // }
        // enum:['phone','computer']  // phone yada cmputer olmalı yoksa hata alır.
    },
    isActive:Boolean,
    tags:{
        type:Array,
        validate:{
            validator:function(value){
                return value && value.length>0;
            },
            message:'Ürün için en az bir etiket giriniz'
        }
    },
    description: String,
    imageUrl:String,
    userId:{
        type:String,
        required:[true,'UserId section is added']
    },
    categories:Array,
    date:{
        type:Date,
        default:Date.now()
    }
});

module.exports=mongoose.model('Product',productSchema);
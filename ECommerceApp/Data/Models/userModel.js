


const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true, // benzersiz
        required:true
    },
    password:{
        type:String,
        required:true
    },
    //=====================
    // EMAIL
    isEmailVerified:{
        type:Boolean,
        required:false // kullanıcı oluşunca false
    },
    emailVerificationToken:{
        type:String,
        default:null
    },
    emailVerificationExpires:{
        type:Date,
        default:null
    },
    //=====================
    // RESET PASSWORD
    passwordVerificationToken:{
        type:String,
        default:null
    },
    passwordVerificationExpires:{
        type:Date,
        default:null
    },
    //=====================
    // PHONE NUMBER
    phoneNumberVerificationToken:{
        type:String,
        default:null
    },
    phoneNumberVerificationExpires:{
        type:Date,
        default:null
    },
    //=====================
    role:{
        type:String,
        enum:['admin','customer','seller','lead_developer','developer'],
        default:'customer'
    },
    cart:{
        type:Object,
        items:[{
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }]
    },
    sex:{
        type:String,
        defaukt:'no', 
    },
    addresses:{
        type:Object,
        items:[{
            main:String,
            street:String,      //sokak
            city:String,        //il
            postalCode:String,  //posta kodu
            country:String,     //ilçe
            apartmentNo:Number, //apartman no
            apartment:Number,   //kat
            floor:Number,       // daire

        }]
    },
    // CARDS TO BANK
    cards: {
        items: [{
            cardNo: {
                type: String,   // kart numarası (String olarak)
                required: true
            },
            cardHolderName: {
                type: String,   // kart sahibinin adı
                required: true
            },
            expiryMonth: {
                type: Number,    // son kullanma ayı
                min: 1,
                max: 12,
                required: true
            },
            expiryYear: {
                type: Number,    // son kullanma yılı
                required: true
            },
            cvv: {
                type: String,    // güvenlik kodu (String olarak)
                required: true
            }
        }]
    },
    phoneNumber:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

module.exports=mongoose.model('User',userSchema);
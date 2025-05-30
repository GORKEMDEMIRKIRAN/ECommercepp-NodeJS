


const userService=require('../../services/userService');
const bcrypt=require('bcryptjs'); // For password hashing
const mongoose=require('mongoose');
//==========================================================================
async function passwordHash(value){
    return await bcrypt.hash(value,12);
}
//==========================================================================
async function seedUsers(){
    try{
        const count=await userService.getCountUsers();
        if(count===0){
            // password hashing
            const passwordHashed=await passwordHash('123456');
            // User List
            const userList=[
                {   
                    name:'gorkem',
                    email:'gorkem@example.com',
                    password: passwordHashed,
                    isEmailVerified:true,
                    emailVerificationToken:null,
                    emailVerificationExpires:null,
                    passwordVerificationToken:null,
                    passwordVerificationExpires:null,
                    phoneNumberVerificationToken:null,
                    phoneNumberVerificationExpires:null,
                    role:'admin',
                    cart:{items:[]},
                    sex:'no',
                    addresses:{items:[]},
                    cards:{items:[]},
                    phoneNumber:'no',
                },
                {   
                    name:'grkm',
                    email:'grkm@example.com',
                    password: passwordHashed,
                    isEmailVerified:true,
                    emailVerificationToken:null,
                    emailVerificationExpires:null,
                    passwordVerificationToken:null,
                    passwordVerificationExpires:null,
                    phoneNumberVerificationToken:null,
                    phoneNumberVerificationExpires:null,
                    role:'customer',
                    cart:{items:[]},
                    sex:'no',
                    addresses:{items:[]},
                    cards:{items:[]},
                    phoneNumber:'no',
                }
            ];
            
            await userService.getInsertManyUsers(userList);
            console.log('Kullanıcı tablosu boştu,kullanıcı eklendi');
        }else{
            console.log('Kullanıcı tablosunda zaten veri var,seed işlemi atlandı');
        }
    }catch(error){
        console.log('Hazır kullanıcı verisi eklenirken hata oluştu: ',error);
    }
}
//==========================================================================
module.exports={seedUsers};
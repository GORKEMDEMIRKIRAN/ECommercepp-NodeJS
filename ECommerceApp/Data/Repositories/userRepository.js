


const UserModel=require('../Models/userModel');
const User=require('../../Models/User');
const mongoose=require('mongoose');

class userRepository{
    //============================================
    async countUser(){
        return await UserModel.countDocuments({});
    }
    //============================================
    async insertManyUsers(users){
        const results= await UserModel.insertMany(users);
        return results;
    }
    //============================================
    async findAll(){
        const users=await UserModel.find({});
        return users.map(user=>new User(
            user._id,
            user.name,
            user.email,
            user.password,
            user.role
        ));
    }
    //============================================
    async UserByUserName(userName){
        const user=await UserModel.findOne({name:userName});
        if(!user){
            return null;
        }
        return new User(
            user.id,
            user.name,
            user.email,
            user.password,
            user.isEmailVerified,
            user.emailVerificationToken,
            user.emailVerificationExpires,
            user.passwordVerificationToken,
            user.passwordVerificationExpires,
            user.phoneNumberVerificationToken,
            user.phoneNumberVerificationExpires,
            user.role,
            user.cart,
            user.sex,
            user.addresses,
            user.cards,
            user.phoneNumber
        );
    }
    //============================================
    async UserByUserEmail(userEmail){
        const user=await UserModel.findOne({email:userEmail});
        if(!user){
            return null;
        }
        return new User(
            user._id, 
            user.name,
            user.email,
            user.password,
            user.isEmailVerified,
            user.emailVerificationToken,
            user.emailVerificationExpires,
            user.passwordVerificationToken,
            user.passwordVerificationExpires,
            user.phoneNumberVerificationToken,
            user.phoneNumberVerificationExpires,
            user.role,
            user.cart,
            user.sex,
            user.addresses,
            user.cards,
            user.phoneNumber
        );
    }
    //============================================
    async insertOneUser(user){
        const result=await UserModel.insertOne(user);
        return result;
    }
    //============================================
    async UserByUserId(userId){
        const user=await UserModel.findById(userId);
        if(!user){
            return null;
        }
        return new User(
            user._id,
            user.name,
            user.email,
            user.password,
            user.isEmailVerified,
            user.emailVerificationToken,
            user.emailVerificationExpires,
            user.passwordVerificationToken,
            user.passwordVerificationExpires,
            user.phoneNumberVerificationToken,
            user.phoneNumberVerificationExpires,
            user.role,
            user.cart,
            user.sex,
            user.addresses,
            user.cards,
            user.phoneNumber
        );
    }
    //============================================
    async AddUserAddress(userId,addressData){
        try {
            // Kullanıcının var olup olmadığını kontrol et
            const userExists = await this.UserByUserId(userId);
            if (!userExists) {
                throw new Error('User not found');
            }
            
            // Yeni adresi hazırla
            const newAddress = {
                main: addressData.main,
                street: addressData.street,
                city: addressData.city,
                postalCode: addressData.postalCode,
                country: addressData.country,
                apartmentNo: addressData.apartmentNo,
                apartment: addressData.apartment,
                floor: addressData.floor
            };
            

            // { new: true, upsert: true } seçenekleri ile güncellenmiş 
            // dokümanı döndürüyoruz ve gerekirse yeni alanlar oluşturuyoruz


            // $push operatörü ile addresses.items dizisine yeni adresi ekle
            await UserModel.findByIdAndUpdate(
                userId,
                { 
                    $push: { 'addresses.items': newAddress },
                    // Eğer addresses alanı yoksa, oluştur
                    $setOnInsert: { 'addresses': { items: [] } }
                },
                { 
                    //new: true, // Güncellenmiş dokümanı döndür
                    upsert: true // Eğer addresses alanı yoksa, oluştur
                }
            );
            
            // Güncellenmiş kullanıcı nesnesini döndür
            // return new User(
            //     updatedUser._id.toString(),
            //     updatedUser.name,
            //     updatedUser.email,
            //     updatedUser.password,
            //     updatedUser.role,
            //     updatedUser.cart,
            //     updatedUser.sex,
            //     updatedUser.addresses,
            //     updatedUser.cards,
            //     updatedUser.phoneNumber
            // );
        } catch (error) {
            console.error('Error in AddUserAddress', error);
            throw error; // Hatayı yukarı ilet
        }
    }
    //============================================
    async UpdateUserAddress(userId,addressData){
        try{
            const user=await this.UserByUserId(userId);
            if(!user){
                throw new Error('User not found');
            }
            let addresses=user.addresses.items;
            addresses.push({
                main: addressData.main,
                street: addressData.street,
                city: addressData.city,
                postalCode: addressData.postalCode,
                country: addressData.country,
                apartmentNo: addressData.apartmentNo,
                apartment: addressData.apartment,
                floor: addressData.floor
            });
            // $set operatörü ile güncelle
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { 'addresses.items': addresses } },
                { new: true } // Güncellenmiş dokümanı döndür
            );
        }
        catch(error){
            console.error('Error in AddUserAddress',error);
        }
    }
    //============================================

    // token işlemleri

    //============================================
    // doğrulama token ile kullanıcıyı bulma
    async UserByEmailVerificationToken(token){
        try{
            const user=await UserModel.findOne({emailVerificationToken:token});
            return user;
        }
        catch(error){
            console.log('UserByEmailVerificationToken hatasi: ',error);
        }
    }
    //============================================
    async UserByResetPasswordVerificationToken(token){
        try{
            const user=await UserModel.findOne({passwordVerificationToken:token});
            return user;
        }catch(error){
            console.log('UserByResetPasswordVerificationToken hatasi: ',error);
        }
    }
    //============================================
    async UpdateUser(userData) {
        const userId = userData.id;
        try {
            // Mongoose belgesini düz bir JavaScript nesnesine dönüştür
            const plainUserData = userData.toObject ? userData.toObject() : userData;
            
            // _id alanını kaldır çünkü MongoDB bunu güncelleyemez
            delete plainUserData.id;
            
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: plainUserData },
                { new: true }
            );
            return new User(
                user._id,
                user.name,
                user.email,
                user.password,
                user.isEmailVerified,
                user.emailVerificationToken,
                user.emailVerificationExpires,
                user.passwordVerificationToken,
                user.passwordVerificationExpires,
                user.phoneNumberVerificationToken,
                user.phoneNumberVerificationExpires,
                user.role,
                user.cart,
                user.sex,
                user.addresses,
                user.cards,
                user.phoneNumber
            );
        }
        catch(error) {
            console.log('UpdateUser hatası: ', error);
            throw error;
        }
    }
    //============================================
    async updateUserMailToken(userData){
        try{
            const result=await UserModel.findByIdAndUpdate(
                {_id:userData.id},
                {
                    $set:{
                        isEmailVerified:userData.isEmailVerified,
                        emailVerificationToken:userData.emailVerificationToken,
                        emailVerificationExpires:userData.emailVerificationExpires
                    }
                }
            );
            // console.log('Güncelleme sonucu: ',result);
            // const updatedUser=await UserModel.findById(userData._id);
            // return updatedUser;
        }
        catch(error){
            console.log('UpdateUser hatasi: ',error);
            throw error;
        }
    }
    //============================================
}

module.exports=new userRepository();
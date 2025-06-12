



const UserModel=require('../Models/userModel');
const User=require('../../Models/User');
const mongoose=require('mongoose');
const logger = require('../../config/logger');

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




    //============================================
    async findByUserName(userName){
        try{
            logger.debug('Finding user by username',{userName});
            const user=await UserModel.findOne({name:userName});
            if(!user){
                logger.debug('User not found by userName', { userName });
                return null;
            }
            logger.debug('User found by userName',{
                userId:user._id,
                userName:user.name
            });
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
        }catch(error){
            logger.logError(error,null,{
                action:'UserByUserName',
                userName:userName
            });
            throw error;
        }

    }
    //============================================
    async findByUserRole(role){
        try{
            logger.debug('Finding user by role',{role});
            const user=await UserModel.findOne({role:role});
            if(!user){
                logger.debug('User not found by role', { role });
                return null;
            }
            logger.debug('User found by userRole',{
                userId:user._id,
                userName:user.name
            });
            return user._id||user.id;
        }
        catch(error){
            logger.logError(error, null, {
                action: 'findByUserRole',
                role:role
            });
            throw error;
        }
    }
    //============================================
    async findByEmail(email) {
        try {
            logger.debug('Finding user by email', { email });
            const user = await UserModel.findOne({email});

            if (!user) {
                logger.debug('User not found by email', { email });
                return null;
            }
            
            logger.debug('User found by email', { 
                userId: user._id,
                email: user.email 
            });
            return user;

        } catch (error) {
            logger.logError(error, null, {
                action: 'findByEmail',
                email
            });
            throw error;
        }
    }
    //============================================
    async insertOneUser(userData){
        try{
            logger.debug('Inserting user',{userData});
            const result=await UserModel.insertOne(userData);
            if(!result){
                logger.debug('User not inserted',{userData});
                throw new Error('User not inserted');
            }
            logger.debug('User inserted',{result});
            return result;
        }
        catch(error){
            logger.logError(error,null,{
                action:'insertOneUser',
                user:userData
            });
            throw error;
        }
    }
    //============================================
    async findByEmailVerificationToken(token){
        try{
            logger.debug('Finding user by email verification token',{token});
            const user=await UserModel.findOne({emailVerificationToken:token});
            if(!user){
                logger.debug('User not found by email verification token',{token});
                return null;
            }
            logger.debug('User found by email verification token',{
                userId:user._id,
                email:user.email
            });
            return user;
        }
        catch(error){
            logger.logError(error,null,{
                action:'UserByEmailVerificationToken',
                token:token
            })
        }
    }
    //============================================
    async UpdateUser(userData) {
        try {
            logger.debug('UpdateUser repository updating user',{userData});
            const userId = userData.id;
            // Mongoose belgesini düz bir JavaScript nesnesine dönüştür
            const plainUserData = userData.toObject ? userData.toObject() : userData;
            logger.debug('UpdateUser plainUserData',{plainUserData});
            // _id alanını kaldır çünkü MongoDB bunu güncelleyemez
            delete plainUserData.id;
            logger.debug('plainUserData after deleting id',{plainUserData});
            // kullanıcıyı güncelle
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: plainUserData },
                { new: true }
            );
            logger.debug('UpdateUser user with $set',{user});
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
            logger.logError(error,null,{
                action:'UpdateUser',
                user:userData
            })
            throw error;
        }
    }
    //============================================
    async UserByVerificationToken(token){
        try{
            logger.debug('Finding user by token',{token});
            const user=await UserModel.findOne({token});
            
            if(!user){
                logger.debug('User not found by token',{token});
                return null;
            }
            logger.debug('User found by token',{
                userId:user._id,
                email:user.email
            })
            return user;
        }
        catch(error){
            logger.logError(error,null,{
                action:'finyByToken',
                token
            });
            throw error;
        }
    }
    //============================================

    async validatePassword(user, password) {
        try {
            logger.debug('Validating user password', { 
                userId: user._id,
                email: user.email 
            });
            
            const isValid = await user.comparePassword(password);
            
            if (!isValid) {
                logger.debug('Invalid password for user', { 
                    userId: user._id,
                    email: user.email 
                });
            }
            
            return isValid;
        } catch (error) {
            logger.logError(error, null, {
                action: 'validatePassword',
                userId: user._id,
                email: user.email
            });
            throw error;
        }
    }
}

module.exports=new userRepository();
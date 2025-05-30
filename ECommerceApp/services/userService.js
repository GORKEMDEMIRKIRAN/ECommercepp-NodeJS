


const userRepository=require('../Data/Repositories/userRepository');

class userService{
    //-------------------------------------------
    async getCountUsers(){
        return await userRepository.countUser();
    }
    //-------------------------------------------
    async getInsertManyUsers(users){
        return await userRepository.insertManyUsers(users);
    }
    //-------------------------------------------
    async getAllUsers(){
        return await userRepository.findAll();
    }
    //-------------------------------------------
    async getUserByUserName(userName){
        return await userRepository.UserByUserName(userName);
    }
    //-------------------------------------------
    async getUserByUserEmail(userEmail){
        return await userRepository.UserByUserEmail(userEmail);
    }
    //-------------------------------------------
    async getInsertOneUser(user){
        return await userRepository.insertOneUser(user);
    }
    //-------------------------------------------
    async getUserByUserId(userId){
        return await userRepository.UserByUserId(userId);
    }
    //-------------------------------------------
    async getAddUserAddress(userId,addressData){
        return await userRepository.AddUserAddress(userId,addressData);
    }
    //-------------------------------------------
    async getUpdateUserAddress(userId,addressData){
        return await userRepository.UpdateUserAddress(userId,addressData);
    }
    //-------------------------------------------


    // token işlemleri
    //-------------------------------------------
    async getUserByEmailVerificationToken(token){
        try{
            return await userRepository.UserByEmailVerificationToken(token);
        }catch(error){
            console.log('email verification service error: ',error);
        }
    }
    async getUserByResetPasswordVerificationToken(token){
        try{
            return await userRepository.UserByResetPasswordVerificationToken(token);
        }catch(error){
            console.log('email verification service error: ',error);
        }
    }
    //-------------------------------------------
    async getUpdateUser(user){
        return await userRepository.UpdateUser(user);
    }
    //-------------------------------------------
    async getUpdateUserMailToken(user){
        return await userRepository.updateUserMailToken(user);
    }
    //-------------------------------------------


}

module.exports=new userService();
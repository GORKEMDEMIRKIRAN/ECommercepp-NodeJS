



const logger = require('../config/logger');
const userRepository = require('../Data/Repositories/userRepository');
/*
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
*/
const bcryptjs=require('bcryptjs');
const {generateVerificationToken}=require('../Email/mailCreateToken');
const {VerificationSendEmail}=require('../Email/sendEmail');

const {ValidationError,
    AuthError,
    UserNotFoundError,
    EmailAlreadyVerifiedError,
    TokenNotFoundError,
    PasswordAlreadyVerifiedError
}=require('../Validation/validationClasses');


class AuthService {
    //======================================================
    // POST LOGIN SERVICE
    // Temel kimlik doğrulama
    async login(email, password) {
        try {
            //-------------------------------
            logger.info('authservice - Login attempt', { email });
            //-------------------------------
            if (!email || !password) {
                logger.warn('Login attempt with missing credentials', {
                    email: email ? 'provided' : 'missing',
                    password: password ? 'provided' : 'missing'
                });
                //throw new Error('Lütfen email ve şifre giriniz');
                throw new ValidationError('Lütfen email ve şifre gereklidir');
            }
            //-------------------------------
            const user = await userRepository.findByEmail(email);
            if (!user) {
                logger.warn('Login attempt with non-existent email', { email });
                //throw new Error('Böyle bir kullanıcı bulunamamıştır.');
                throw new AuthError('Böyle bir kullanıcı bulunamamıştır.');
            }
            //-------------------------------
            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                logger.warn('Login attempt with invalid password', { email });
                //throw new Error('Şifre hatalıdır.');
                throw new AuthError('Şifre hatalıdır.');
            }
            //-------------------------------
            if (!user.isEmailVerified) {
                logger.warn('Login attempt with unverified email', { email });
                //throw new Error('Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.');
                throw new AuthError('Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.');
            }
            //-------------------------------
            logger.info('User authenticated successfully', {
                userId: user._id,
                email: user.email,
                role: user.role
            });
            //-------------------------------
            return {
                id: user._id,
                email: user.email,
                role: user.role
            };
            //-------------------------------
        } catch (error) {
            logger.logError(error, null, { 
                action: 'login',
                 email 
            });
            throw error;
        }
    }
    //======================================================
    // POST REGISTER SERVICE
    async register(userData){
        try{
            //------------------------------------------------------
            if(!userData.name || !userData.email || !userData.password){
                logger.warn('Register attempt with missing credentials');
                throw new Error('Lütfen tüm alanları doldurunuz');
            }
            //------------------------------------------------------
            const userName=await userRepository.findByUserName(userData.name);
            const userEmail=await userRepository.findByEmail(userData.email);
            if(userName){
                logger.warn('Kullanıcı adı zaten kullanılıyor');
                throw new Error('Kullanıcı adı zaten kullanılıyor');
            }
            if(userEmail){
                logger.warn('Email zaten kullanılıyor');
                throw new Error('Email zaten kullanılıyor');
            }
            
            //------------------------------------------------------
            // password hash
            const hashedPassword=await bcryptjs.hash(userData.password,12);
            logger.info('Hashed password');
            // token oluşturma
            const verificationToken=generateVerificationToken();
            logger.info('Verification token');
            // yeni kullanıcı oluşturma
            const user={
                name:userData.name,
                email:userData.email,
                password:hashedPassword,
                role:'customer',
                cart:{
                    items:[]
                },
                sex:'no',
                addresses:{items:[]},
                cards:{items:[]},
                isEmailVerified:false, // e-posta doğrulama durumu
                emailVerificationToken:verificationToken,// token oluştur
                emailVerificationExpires: Date.now() + 24*60*60*1000,// 24 saat geçerli
                passwordVerificationToken:null,
                passwordVerificationExpires:null,
                phoneNumberVerificationToken:null,
                phoneNumberVerificationExpires:null,
                phoneNumber:null
            };
            logger.info('New user created');
            //------------------------------------------------------
            // doğrulama e-postası oluşturma
            const verificationUrl=`${process.env.SITE_URL}/auth/verify-email?token=${verificationToken}`;
            logger.info('verifcationUrl created');
            //------------------------------------------------------
            // kullanıcıyı kaydetme
            await userRepository.insertOneUser(user);
            logger.info('User added to database');
            //------------------------------------------------------
            // e-posta doğrulamasının gönderilmesi
            await VerificationSendEmail(user.email,verificationUrl,user.name);
            logger.info('verifcationUrl send');
            //------------------------------------------------------
        }
        catch(error){
            logger.logError(error,null,{
                action:'register',
                userData:userData
            });
            throw error;
        }
    }
    //======================================================
    async verifyEmail(token){
        try{
            logger.info('Verifying email',{token});
            if(!token){
                logger.warn('Invalid verification link');
                throw new Error('Geçersiz doğrulama bağlantısı');
            }
            // token ile kullanıcıyı bulma
            const user=await userRepository.findByEmailVerificationToken(token);
            if(!user){
                logger.warn('User not found by email verification token',{token});
                throw new Error('Geçersiz doğrulama bağlantısı');
            }
            // token süresi dolmuş mu kontrol et
            if(user.emailVerificationExpires<Date.now()){
                logger.warn('Verification link expired',{token});
                throw new Error('Doğrulama bağlantısının süresi dolmuş.');
            }
            // kullanıcıyı doğrulanmış olarak işaretle
            user.isEmailVerified=true;
            user.emailVerificationToken=null;
            user.emailVerificationExpires=null;
            logger.info('User verified',{userId:user._id});
            logger.info('Updating emailVerificationToken and emailVerificationExpires',{user});
            // kullanıcıyı güncelle
            await userRepository.UpdateUser(user);
            logger.info('Email verified successfully',{userId:user._id});
        }
        catch(error){
            logger.logError(error,null,{
                action:'verifyEmail',
                token:token
            });
            throw error;
        }

    }
    //======================================================
    async resetPasswordEmailSend(email){
        try{
            logger.info('resetPassword - Reset Password attempt',{email});
            //-------------------------------------
            const user=await userRepository.findByEmail(email);
            if(!user){
                logger.warn('resetPassword - User not found by email',{email});
                throw new UserNotFoundError('Kullanıcı bulunamadı');
            }
            //-------------------------------------
            const resetToken=generateVerificationToken();
            user.passwordVerificationToken=resetToken;
            user.passwordVerificationEcpires=Date.now()+24*60*60*1000;
            //-------------------------------------
            const updateUser=await userRepository.UpdateUser(user);
            logger.info('resetPassword - User updated',{updateUser});
            //-------------------------------------
            const resetUrl=`${process.env.SITE_URL}/auth/restart-password?token=${resetToken}`;
            logger.info('resetPassword - Reset URL created',{resetUrl});
            //-------------------------------------
            // e-posta sıfırlama linki gönder
            await ResetPasswordSendEmail(updateUser.email,resetUrl,updateUser.name);
            logger.info('resetPassword - Reset URL sent',{resetUrl});
        }
        catch(error){
            logger.logError(error,null,{
                action:'resetPassword',
                email:email
            });
            throw error;
        }
    }
    //======================================================
    async againVerifyEmail(email){
        try{
            logger.info('againVerifyEmail- again verify email attempt',{email});
            const user=await userRepository.findByEmail(email);
            if(!user){
                logger.warn('againVerifyEmail- user not found by email',{email});
                throw new UserNotFoundError('Kullanıcı bulunamadı');
            }
            if(user.isEmailVerified===true){
                logger.warn('againVerifyEmail- Email verified',{email});
                throw new EmailAlreadyVerifiedError('Mail zaten doğrulanmış');
            }
            if(user.emailVerificationToken !==null && user.emailVerificationExpires<Date.now()){
                logger.warn('againVerifyEmail - token var ve süresi hala geçerli',{email});
                const userToken=user.emailVerificationToken;
                const mailVerificationUrl=`${process.env.SITE_URL}/account/verify-email?token=${userToken}`;
                await VerificationSendEmail(user.email,mailVerificationUrl,user.name);
                logger.info('Mail gönderidi.');
                return {status:'TOKEN_VALID',message:'Doğrulama maili tekrar gönderildi'};
            }
            if(user.emailVerificationExpires>Date.now()){
                logger.warn('againVerifyEmail - token süresi bitmiş',{email});
                const createNewToken=generateVerificationToken();
                const createNewTokenDates=Date.now()+24*60*60*1000;
                user.isEmailVerified=false;
                user.emailVerificationToken=createNewToken;
                user.emailVerificationExpires=createNewTokenDates;
                // gerekli kullanıcı bilgilerini güncelleme
                await userRepository.UpdateUser(user);
                const newmailVerificationUrl=`${process.env.SITE_URL}/account/verify-email?token=${createNewToken}`;
                await VerificationSendEmail(user.email,newmailVerificationUrl,user.name);
                return {status:'NEW_TOKEN_SENT',message:'Yeni doğrulama maili gönderildi'};
            }
        }
        catch(error){
            logger.logError(error,null,{
                action:'againVerifyEmail',
                email:email
            });
            throw error;
        }
    }
    //======================================================
    async resetPasswordTokenPage(restartToken){
        try{
            // token geçerlilik kontrolü
            if(!restartToken){
                logger.warn('Geçersiz doğrulama bağlantısı');
                throw new TokenNotFoundError('Geçersiz doğrulama bağlantısı');
            }
            // kullanıcıyı bulme ve kontrolü
            const user=await userRepository.UserByVerificationToken(restartToken);
            if(!user){
                logger.warn('Böyle bir kullanıcı bulunamadı');
                throw new UserNotFoundError('Geçersiz Kullanıcı');
            }
            // Token süresi kontrolü
            if(user.passwordVerificationExpires<Date.now()){
                logger.warn('Doğrulama bağlantısının süresi dolmuş');
                throw new PasswordAlreadyVerifiedError('Doğrulama bağlantısının süresi dolmuş');
            }
            // Girilen şifreyi alma ve hasleme
            const newPassword=req.body.password;
            // şifreyi hashleme
            const hashedPassword=await bcryptjs.hash(newPassword,12);
            logger.info('user new password hashed');
            // User bilgilerini güncelleme
            user.password=hashedPassword;
            user.passwordVerificationToken=null;
            user.passwordVerificationExpires=null;
            // database güncelleme
            await userRepository.UpdateUser(user);
            logger.info('user database upgrated',{user});
        }
        catch(error){
            logger.logError(error,null,{
                action:'resetPasswordTokenPage',
                token:restartToken
            });
            throw error;
        }
    }
    //======================================================
    // getResetPasswordNewPasswordPage kısmında token aktarmak için iş mantığını yapacağız

    //======================================================
    async logout(userId) {
        try {
            logger.info('Logout attempt', { userId });
            // Token blacklist'e ekleme işlemi yapılabilir
            logger.info('User logged out successfully', { userId });
            return true;
        } catch (error) {
            logger.logError(error, null, { 
                action: 'logout', 
                userId 
            });
            throw error;
        }
    }
    //======================================================









    
    // Şifre işlemleri
    async forgotPassword(email) {
        try {
            logger.info('Password reset requested', { email });
            const user = await userRepository.findByEmail(email);
            if (!user) {
                logger.warn('Password reset attempt for non-existent email', { email });
                return; // Güvenlik için kullanıcı bulunamadı mesajı vermiyoruz
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = Date.now() + 3600000; // 1 saat

            await userRepository.updateResetToken(user._id, resetToken, resetExpires);
            // Email gönderme işlemi burada yapılır

            logger.info('Password reset token generated', { email });
        } catch (error) {
            logger.logError(error, null, { action: 'forgotPassword', email });
            throw error;
        }
    }
    // İki faktörlü doğrulama
    async enable2FA(userId) {
        try {
            logger.info('2FA enable attempt', { userId });
            const secret = speakeasy.generateSecret();
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);

            await userRepository.update2FASecret(userId, secret.base32);
            logger.info('2FA enabled successfully', { userId });

            return { secret: secret.base32, qrCode };
        } catch (error) {
            logger.logError(error, null, { action: 'enable2FA', userId });
            throw error;
        }
    }
    async verify2FA(userId, token) {
        try {
            logger.info('2FA verification attempt', { userId });
            const user = await userRepository.findById(userId);
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token
            });

            if (!isValid) {
                logger.warn('Invalid 2FA token', { userId });
                throw new Error('Invalid 2FA token');
            }

            logger.info('2FA verification successful', { userId });
            return true;
        } catch (error) {
            logger.logError(error, null, { action: 'verify2FA', userId });
            throw error;
        }
    }
    // Yardımcı metodlar
    generateToken(user) {
        // JWT token oluşturma işlemi
        return 'token';
    }
    generateTempToken(user) {
        // Geçici token oluşturma işlemi
        return 'temp-token';
    }
}

module.exports = new AuthService();

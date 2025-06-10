

const bcryptjs=require('bcryptjs');
const userService = require('../services/userService');
const User=require('../Models/User');

//sendemail fonksiyonu
const {ResetPasswordSendEmail,VerificationSendEmail}=require('../Email/sendEmail');
const {generateVerificationToken}=require('../Email/mailCreateToken');


// logger
const logger=require('../config/logger');


class accountController{
    constructor(userService){
        this.userService=userService;
    }
    //=====================================
    /*
    async getLogin(req,res,next){
        // session içinden aldığımız error mesajı sayfaya yansıtma
        // gelen session sayfaya yansıtma sonrası session içinden temizleme
        var errorMessage=req.session.errorMessage;
        var successMessage=req.session.successMessage;
        delete req.session.errorMessage;
        delete req.session.successMessage;
        res.render('account/login',{
            title:'Login',
            path:'/login',
            errorMessage:errorMessage,
            successMessage:successMessage
        });
    }
    //=====================================
    async postLogin(req, res, next) {
        try {
            const { email, password } = req.body;

            // Request log
            logger.logRequest(req, 'Login Request');
    
            // Email ve şifre kontrolü
            if (!email || !password) {
                logger.warn('Login Request: Email or password is missing',{
                    email:email ? 'provided' : 'missing',
                    password:password ? 'provided' : 'missing'
                });
                // return res.status(400).json({ error: 'Email and password are required' });
                req.session.errorMessage = 'Lütfen email ve şifre giriniz';
                return req.session.save(err => {
                    if (err) console.error('Session kaydetme hatası:', err);
                    return res.redirect('/account/login');
                });
            }
    
            // Email ile database kullanıcıyı bulma
            const user = await userService.getUserByUserEmail(email);
            
            // User null ise kullanıcı yok
            if (!user) {
                req.session.errorMessage = 'Böyle bir kullanıcı bulunamamıştır.';
                return req.session.save(err => {
                    if (err) console.error('Session kaydetme hatası:', err);
                    return res.redirect('/account/login');
                });
            }

            console.log('giriş işlemi sonucu user: ',user);
            // Girilen şifreyi hash ile karşılaştırma
            const isPasswordValid = await bcryptjs.compare(password, user.password);
            
            // Şifre hatalı ise mesaj yansıtma
            if (!isPasswordValid) {
                req.session.errorMessage = 'Şifre hatalıdır.';
                return req.session.save(err => {
                    if (err) console.error('Session kaydetme hatası:', err);
                    return res.redirect('/account/login');
                });
            }



            // e-posta doğrulaması kontrolü
            if(!user.isEmailVerified){
                req.session.errorMessage="Lütfen giriş yapamdan önce e-posta adresinizi doğrulayin.";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/login');
                });
            }
    
            // Session'a kullanıcı bilgilerini kaydet
            req.session.isAuthenticated = true;
            req.session.user = {
                id:user.id,
                email: user.email,
                role: user.role
            };
            console.log('Tüm session bilgileri: ',req.session);
            console.log('session içindeki user bilgileri: ',req.session.user);
            console.log();
    
            // Role göre ek bayraklar ekle
            if (user.role === "admin") {
                req.session.isAdmin = true;
                req.session.isCustomer = false;
                req.session.isSeller = false;
                req.session.isDeveloper = false;
            } else if (user.role === "customer") {
                req.session.isAdmin = false;
                req.session.isCustomer = true;
                req.session.isSeller = false;
                req.session.isDeveloper = false;
            } else if (user.role === "seller") {
                req.session.isAdmin = false;
                req.session.isCustomer = false;
                req.session.isSeller = true;
                req.session.isDeveloper = false;
            }
    
            // Session'ın kaydedilmesini bekle ve yönlendir
            return req.session.save(err => {
                if (err) {
                    console.error('Session kaydetme hatası:', err);
                }
                // Kullanıcının gitmek istediği sayfa için url yolu
                const url = req.session.redirectTo || '/';
                delete req.session.redirectTo;
                return res.redirect(url);
            });
        }
        catch (error) {
            console.error('Giriş hatası:', error);
            req.session.errorMessage = 'Bir hata oluştu, lütfen tekrar deneyin';
            return req.session.save(err => {
                if (err) console.error('Session kaydetme hatası:', err);
                return res.redirect('/account/login');
            });
        }
    }
    //=====================================
    async getRegister(req,res,next){
        var errorMessage=req.session.errorMessage;
        delete req.session.errorMessage;
        res.render('account/register',{
            title:'Register',
            path:'/register',
            errorMessage:errorMessage
        });
    }
    //=====================================
    async postRegister(req,res,next){
        try{
            //------------------------------------------------------
            const {name,email,password}=req.body;
            //------------------------------------------------------
            if(!name || !email || !password){
                req.session.errorMessage="Bütün alanları doldurunuz";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/register');
                });
            }
            //------------------------------------------------------
            const userName=await userService.getUserByUserName(name);
            const userEmail=await userService.getUserByUserEmail(email);
            if(userName){
                req.session.errorMessage="Kullnıcı mevcut";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/register');
                });
            }
            if(userEmail){
                req.session.errorMessage="Kullnıcı mevcut";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/register');
                });
            }
            //------------------------------------------------------
            // password hash
            const hashedpassword=await bcryptjs.hash(password,12);
            // token oluşturma
            const verificationToken=generateVerificationToken();
            // modeli oluşturma(yeni kullanıcı oluşturma)
            const user={
                name:name,
                email:email,
                password:hashedpassword,
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
            //------------------------------------------------------
            console.log("Kayıt sırasında oluşan token: ",verificationToken);
            // doğrulama e-postası gönderme
            const verificationUrl=`${process.env.SITE_URL}/account/verify-email?token=${verificationToken}`;
            //------------------------------------------------------
            // kullanıcıyı kaydetme
            await userService.getInsertOneUser(user);
            console.log('Added new user database');
            //------------------------------------------------------
            // Başarılı kayıt mesajını session'a ekle ve login sayfasına yönlendir.
            req.session.successMessage="Kayıt işlemi başarılı! Lütfen e-posta adresinizi doğrulayın.";
            return req.session.save(async(err)=>{
                if(err){
                    console.error('Session kaydetme hatasi: ',err);
                }
                //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                // E-posta doğrulama e-postası
                // 1- gönderilecek email, doprulama url,kullanıcı ismi verme
                await VerificationSendEmail(email,verificationUrl,name);
                //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                // kullanıcıt oluşturup login ekranına gönderme
                res.redirect('/account/login');

            })
            //------------------------------------------------------
        }
        catch(error){
            console.error('Kayıt hatasi: ', error);
            req.session.errorMessage='Kayıt sırasında bir hata oluştu, Lütfen tekrar deneyiniz.';
            return req.session.save(err=>{
                if(err){
                    console.error('kayıt sırasında oluşan hata: ',err); 
                }
                res.redirect('/account/register');
            })
        }
    }
    //===================================================================
    // E-posta doğrulama controller
    async getVerifyEmail(req,res,next){
        try{
            console.log('========================================');
            console.log('GET VERIFY EMAIL ISLEMI');
            // token mail url içeriğine gönderdik.
            // "token=" olarak gönderdiğimiz için "query" alıyoruz.
            //-------------------------------------------------------
            const {token}=req.query;
            if(!token){
                req.session.errorMessage="Geçersiz doğrulama bağlantısı";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/login');
                });
            }
            //-------------------------------------------------------
            // Token ile kullanıcıyı bulma
            const user=await userService.getUserByEmailVerificationToken(token);
            if (!user) {
                req.session.errorMessage = "Geçersiz veya süresi dolmuş doğrulama bağlantısı.";
                return req.session.save(err => {
                  if (err) console.error('Session kaydetme hatasi: ', err);
                  return res.redirect('/account/login');
                });
            }         
            //-------------------------------------------------------
            // Token süresi dolmuş mu kontrol et
            if (user.emailVerificationExpires < Date.now()) {
                req.session.errorMessage = "Doğrulama bağlantısının süresi dolmuş.";
                return req.session.save(err => {
                if (err) console.error('Session kaydetme hatasi: ', err);
                return res.redirect('/account/login');
                });
            }            
            //-------------------------------------------------------
            // Kullanıcıyı doğrulanmış olarak işaretle
            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            // Kullanıcıyı güncelle
            await userService.getUpdateUser(user);
            //-------------------------------------------------------
            console.log('========================================');
            // Başarı mesajı
            req.session.successMessage = "E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.";
            return req.session.save(err => {
                if (err) console.error('Session kaydetme hatasi: ', err);
                return res.redirect('/account/login');
            });
            //-------------------------------------------------------
        }
        catch(error){
            console.error('E-posta doğrulama hatası: ', error);
            req.session.errorMessage = 'Doğrulama sırasında bir hata oluştu.';
            return req.session.save(err => {
              if (err) console.error('Session kaydetme hatasi: ', err);
              return res.redirect('/account/login');
            });
        }
    }
       
    //=====================================
    async getReset(req,res,next){
        try {
            var errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
            
            res.render('account/reset', {
                title: 'Reset Password',
                path: '/reset-password',
                errorMessage: errorMessage
                // csrfToken res.locals'da olduğu için burada belirtmeye gerek yok
            });
        } catch (error) {
            res.render('error/error',{
                message:'hata oluştu',
                pageTitle:'Reset Page Not Found'
            });
            console.log(error);
        }
    } 
    */
    //=====================================
    /*
    async postReset(req,res,next){
        try{
            console.log('========================================');
            console.log('POST RESET ISLEMI');
            //---------------------------------------------------------
            const email=req.body.email;
            console.log('postReset = post edilen mail: ',email);
            //---------------------------------------------------------
            const user=await userService.getUserByUserEmail(email);
            if(!user){
                req.session.errorMessage="Kullanıcı bulunamadı";
                req.session.save(err=>{
                    if(err) console.error('Session katdetme hatasi: ',err);
                    return res.redirect('/account/login');
                })
            }
            //---------------------------------------------------------
            const resetToken=generateVerificationToken();
            console.log('Oluşturulan reset Token: ',resetToken);
            user.passwordVerificationToken=resetToken;
            user.passwordVerificationExpires=Date.now()+ 24*60*60*1000;
            //---------------------------------------------------------
            const updateUser=await userService.getUpdateUser(user);
            console.log("Kaydedilen user bilgileri: ",updateUser);
            //---------------------------------------------------------
            const resetUrl=`${process.env.SITE_URL}/account/restart-password?token=${resetToken}`;
            console.log('Reset url: ',resetUrl);
            //---------------------------------------------------------
            // e-posta sıfırlama linki gönderme
            await ResetPasswordSendEmail(updateUser.email,resetUrl,updateUser.name);
            //---------------------------------------------------------
            req.session.successMessage="Şifre sıfırlama linki e-postanıza gönderildi. Lütfen Sıfırlayın";
            req.session.save(async(err)=>{
                if(err){
                    console.error('Session kaydetme hatasi: ',err);
                }
                return res.redirect('/account/login');
            });
            //---------------------------------------------------------
            console.log('========================================');
        }
        catch(error){
            console.error('Parola sıfırlama hatasi: ',error);
            req.session.errorMessage="Parola sıfırlama sırasında bir hata oluştu";
            return req.session.save(err=>{
                if(err) console.error('Session kaydetme hatasi: ',err);
                return res.redirect('/account/login');
            });
        }
    }
    */
    //=====================================
    /*
    async getAgainVerifyEmail(req,res,next){
        // mail giriş ekranı
        // post işlemidne sonra session mesaj ekleme
        // bunun ile yönlendirilen sayfaya bu mesajlar aktarılır.
        try{
            var errorMessage=req.session.errorMessage;
            delete req.session.errorMessage;
    
            res.render('account/verify',{
                title:'Again verify email',
                path:'/again-verify-email',
                errorMessage:errorMessage
            });
        }catch(error){
            console.error('again verify page error: ',error);
        }

    }
    async postAgainVerifyEmail(req,res,next){
        try{
            // 1- Kullanıcı kontrolü
            // 2- Kullanıcı isVerifiend kontrolü
            // 3- Kullanıcı emailverificationToken ve süre kontrolü
                // kullanıcı token bulma
                // token kullanıcı mailine gönderme
            // 4- Kullanıcı emailVerificationEpires süre kontrolü
                // token ve süreyi "null" yapma
                // yeni token ve süre oluşturma
                // kullanıcı mail gönderme
            //---------------------------------------------------------
            const email=req.body.email;
            const user=await userService.getUserByUserEmail(email);
            console.log('Tekrar mail göndermek için girilen mail: ',email);
            console.log('bulunan kullanıcı ismi: ',user.name);
            console.log('bulunan kullanıcı isEmailVerified: ',user.isEmailVerified);
            console.log('bulunan kullanıcı emailVerificationToken: ',user.emailVerificationToken);
            console.log('bulunan kullanıcı emailVerificationExpires: ',user.emailVerificationExpires);

            if(!user){
                req.session.errorMessage="Böyle bir kullanici bulunamadı";
                req.session.save(err=>{
                    if(err){
                        console.error('session save error: ',err);
                    }
                    res.redirect('/account/register');
                });
            }
            console.log('kullanıcı var ');
            //---------------------------------------------------------
            if(user.isEmailVerified===true){
                req.session.errorMessage="Kullanıci maili zaten onaylanmış. Giriş Yapabilirsiniz";
                req.session.save(err=>{
                    if(err){
                        console.error('session save error: ',err);
                    }
                    res.redirect('/account/login');
                });
            }
            console.log('mail onaylı ');
            //---------------------------------------------------------
            // token varsa ve token süresi geçerli ise
            if(user.emailVerificationToken !== null && user.emailVerificationExpires < Date.now()){
                req.session.errorMessage="Mail doğrulama linki mail gönderildi! Mail onaylayabilirsiniz.";
                req.session.save(async(err)=>{
                    if(err){
                        console.error('session save error: ',err);
                    }
                    //*************************************
                    // Kullanıcıyı bulma ve token alma
                    const userToken=user.emailVerificationToken;
                    console.log('Hesapta bulunan token: ',userToken);
                    //*************************************
                    // token kullanıcı mail gönderme
                    // sıfırlama url'si
                    const mailVerificationUrl=`${process.env.SITE_URL}/account/verify-email?token=${userToken}`;
                    console.log('Hesapta bulunan token ile yeni url: ',mailVerificationUrl);
                    // mail gönderme
                    await VerificationSendEmail(user.email,mailVerificationUrl,user.name);
                    //*************************************
                    res.redirect('/account/login');
                    //*************************************
                });
            }
            console.log('token yok veya süresi bitmiş');
            //---------------------------------------------------------
            // token süresi bitiş ise
            if(user.emailVerificationExpires >= Date.now()){
                req.session.errorMessage="Mail doğrulama linki mail gönderildi! Mail onaylayabilirsiniz.";
                req.session.save(async(err)=>{
                    if(err){
                        console.error('session save error: ',err);
                    }
                    //*************************************
                    // token ve süre oluşturma ve güncelleme
                    const createNewToken= generateVerificationToken();
                    const createNewTokenDates=Date.now()+24*60*60*1000; // 24 hours
                    console.log('Token süresi bittiği için yeni token oluştu: ',createNewToken);
                    user.isEmailVerified=false;
                    user.emailVerificationToken=createNewToken;
                    user.emailVerificationExpires=createNewTokenDates;
                    await userService.getUpdateUserMailToken(user);
                    //*************************************
                    // kullanıcıya mail gönderme
                    // sıfırlama url'si
                    const newmailVerificationUrl=`${process.env.SITE_URL}/account/verify-email?token=${createNewToken}`;
                    console.log('Hesapta bulunan token ile yeni url: ',newmailVerificationUrl);
                    // mail gönderme
                    await VerificationSendEmail(user.email,newmailVerificationUrl,user.name);
                    //*************************************
                    res.redirect('/account/login');
                    //*************************************
                });
            }
            //---------------------------------------------------------
            //---------------------------------------------------------
        }
        catch(error){
            console.error('Again verify email error: ',error);
            req.session.errorMessage="Tekrar mail doğrulama kodu gönderiminde hata oluştu";
            return req.session.save(err=>{
                if(err) console.error('Session save error: ',err);
                return res.redirect('/account/login');
            })
        }

    }
  
    //=====================================

    async getResetPassword(req,res,next){
        // bu kısımda bu alana yapılan get isteginde parala değişecektir.
        var errorMessage=req.session.errorMessage;
        delete req.session.errorMessage;
        // link gelen token sayfada hidden böllümüne gödneriyoruz.
        const token=req.query.token;
        res.render('account/resetPassword',{
            title:'Mail Url Reset Password',
            path:'/Reset Password',
            errorMessage:errorMessage,
            token:token
        });
    }
    async postResetPassword(req,res,next){
        try{
            //----------------------------------------------------------
            const restartToken=req.body.token;
            console.log('Linkten gelen token bilgisi: ',restartToken);
            //----------------------------------------------------------
            if(!restartToken){
                req.session.errorMessage="Geçersiz doğrulama bağlantısı";
                return req.session.save(err=>{
                    if(err){
                        console.error('Session kaydetme hatasi: ',err);
                    }
                    return res.redirect('/account/login');
                });
            }
            //----------------------------------------------------------
            const user=await userService.getUserByResetPasswordVerificationToken(restartToken);
            console.log('token sonrası kullanıcı bilgisi: ',user);
            //----------------------------------------------------------
            if(!user){
                req.session.errorMessage = "Geçersiz veya süresi dolmuş doğrulama bağlantısı.";
                return req.session.save(err => {
                if (err) console.error('Session kaydetme hatasi: ', err);
                return res.redirect('/account/login');
                });
            }
            //----------------------------------------------------------
            //  Token süre kontrolü
            if(user.passwordVerificationExpires < Date.now()){
                req.session.errorMessage="Doğrulama bağlantısının süresi dolmuş";
                return req.session.save(err=>{
                    if(err) console.error('Session kayıt hatasi: ',err);
                    res.redirect('/account/login');
                });
            }
            //----------------------------------------------------------
            // Girilen şifreyi alma ve hashleme
            // Token ve süresini tanımsız hale getirme
            // Yine şifre değiştirince tekrar değerler alma
            const newPassword=req.body.password;
            const hashedPassword=await bcryptjs.hash(newPassword,12);
            console.log('Yeni girilen şifre bilgisi: ',newPassword);
            console.log('Yeni girilen şifre hashlenmesi: ',hashedPassword);
            user.password=hashedPassword;
            user.passwordVerificationToken=null;
            user.passwordVerificationExpires=null;
            //----------------------------------------------------------
            // kullanıcı bilgilerini güncelleme
            await userService.getUpdateUser(user);
            console.log('Yeni şifre sonucu güncellenen kullanıcı bilgileri: ',user);
            //----------------------------------------------------------
            req.session.successMessage = "Şifre yenileneme başarılı ! Giriş yapabilirsiniz.";
            return req.session.save(err => {
            if (err) console.error('Session kaydetme hatasi: ', err);
            return res.redirect('/account/login');
            });
            //----------------------------------------------------------
        }catch(error){
            console.error('Şifre değiştirme  hatası: ', error);
            req.session.errorMessage = 'Şifre değiştirme sırasında bir hata oluştu.';
            return req.session.save(err => {
              if (err) console.error('Session kaydetme hatasi: ', err);
              return res.redirect('/account/login');
            });
        }
    }
    //====================================================================

 
    async getLogout(req,res,next){
        try{
            // session tabanlı auth kullanılıyorsa
            if(req.session){
                req.session.destroy(err=>{
                    if(err){
                        throw new Error('Failed to logout');
                    }
                    // session cookie'sini temizle
                    res.clearCookie('connect.sid'); //express-session varsayılan cookie adı
                    res.redirect('/shop/index');
                })
            
            }
            // JWT tabanlı auth kullanıyorsanız
            else{
                // Client tarafında token'ı temizlemek gerekecek
                // Burada sadece başarılı yanıt dönüyoruz
                // res.status(200).json({
                //     success:true,
                //     message:'Logged out successfully'
                // });
                res.redirect('/account/login');
            }

        }catch(error){
            console.error('Error in postLogout controller: ',error);
            res.status(500).json({
                success:false,
                message:error.message || 'An error occurred while logging out'
            });
        }
    }
    */

    //=====================================
    async getProfile(req,res,next){
        try{
            const userId=req.session.user.id;
            const user=await userService.getUserByUserId(userId);
            if(!user){
                throw new Error('getProfile user not found');
            }
            res.render('account/profile',{
                user:user,
                path:'/profile'
            })
        }
        catch(error){
            console.error('Error in getProfile controller: ',error);
        }
    }
    //=====================================
    async updateProfile(req,res,next){
        
    }
    //=====================================
    async getAddress(req,res,next){
        try{
            res.render('account/address',{
                title:'Address',
                path:'/address'
            });
        }
        catch(error){
            console.error('Error in getAddress controller: ',error);
        }
    }
    //=====================================
    async postAddress(req,res,next){
        try{
            const userId=req.session.user.id;
            const addressData={
                main:req.body.main,
                country:req.body.country,
                city:req.body.city,
                street:req.body.street,
                apartment:parseInt(req.body.apartment)||0,
                floor:parseInt(req.body.floor)||0,
                apartmentNo:parseInt(req.body.apartmentNo)||0,
                postaCode:req.body.postaCode
            };
            await userService.getAddUserAddress(userId,addressData);

            res.redirect('/account/profile');
        }
        catch(error){
            console.error('Error in postAddress controller: ',error);
        }
    }
    //=====================================
    async getCards(req,res,next){
        res.render('account/cards',{
            title:'Cards',
            path:'/Cards'
        });
    }
    //=====================================
    async postCards(req,res,next){

    }
    //=====================================
    async getPhone(req,res,next){
        res.render('account/phone',{
            title:'PhoneNumber',
            path:'/PhoneNumber'
        });
    }
    //=====================================
    async postPhone(req,res,next){

    }
    //=====================================
}
module.exports=new accountController();
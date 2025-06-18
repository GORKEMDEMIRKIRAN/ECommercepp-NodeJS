


const logger = require('../config/logger');
const authService = require('../Services/authService');
const { ValidationError, 
    AuthError,
    UserNotFoundError,
    EmailAlreadyVerifiedError,
    TokenNotFoundError,
    PasswordAlreadyVerifiedError} = require('../Validation/validationClasses');
    



const authController = {
    //======================================================
    // View Render Methods (GET)
    getLoginPage: async(req, res) => {
        try {
            // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
            if (req.session.user) {
                return res.redirect('/');
            }
            logger.debug('Login page requested');
            // session içinden aldığımız error mesajı sayfaya yansıtma
            // gelen session sayfaya yansıtma sonrası session içinden temizleme
            var errorMessage=req.session.errorMessage;
            var successMessage=req.session.successMessage;
            delete req.session.errorMessage;
            delete req.session.successMessage;
            res.render('auth/login', {
                pageTitle: 'Login',
                path:'/login',
                errorMessage: errorMessage,
                successMessage: successMessage
            });
        } catch (error) {
            // 1.hatayı logla
            logger.logError(error, req,{
                action:'getLoginPage'
            });
            // 2. sessiona hata mesajı ekle
            req.session.errorMessage='getLoginPage Sayfa yüklenirken bir hata oluştu';
            // 3. session'ı kaydetmeyi dene
            return req.session.save(err=>{
                if(err){
                    logger.error('getLoginPage-Session kaydetme hatasi:',err);
                    return res.status(500).render('error/error', {
                        pageTitle: 'System Error',
                        message: 'An unexpected error occurred while loading the page'
                    });
                }
                logger.info('getLoginPage-session kaydedildi');
                //----------------
                // 4. sayfaya yönlendir
                //return res.redirect('/auth/login');
                //----------------
                // VEYA error sayfasına yönlendir
                return res.status(500).render('error/error', {
                    pageTitle: 'Error',
                    message: 'An error occurred while loading the page'
                });
                //----------------
            })
        }
    },
    //======================================================
    postLoginPage: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // HTTP isteği log
            logger.logRequest(req,'Login attempt');

            // Auth service'i çağır
            const user = await authService.login(email, password);

            // Session'a kullanıcı bilgilerini kaydet
            req.session.isAuthenticated = true;
            req.session.user = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            // Role göre ek bayraklar ekle
            if (user.role === "admin") {
                req.session.isLeadDeveloper = false;
                req.session.isAdmin = true;
                req.session.isCustomer = false;
                req.session.isSeller = false;
                req.session.isDeveloper = false;
            } else if (user.role === "customer") {
                req.session.isLeadDeveloper = false;
                req.session.isAdmin = false;
                req.session.isCustomer = true;
                req.session.isSeller = false;
                req.session.isDeveloper = false;
            } else if (user.role === "seller") {
                req.session.isLeadDeveloper = false;
                req.session.isAdmin = false;
                req.session.isCustomer = false;
                req.session.isSeller = true;
                req.session.isDeveloper = false;
            } else if (user.role === "lead_developer") {
                req.session.isLeadDeveloper = true;
                req.session.isAdmin = false;
                req.session.isCustomer = false;
                req.session.isSeller = false;
                req.session.isDeveloper = false;
            }

            // HTTP başarılı yanıt log
            logger.info('Login request successful', {
                userId: user.id,
                email: user.email,
                role: user.role
            });
            
            // Session'ın kaydedilmesini bekle ve yönlendir
            return req.session.save(err => {
                if (err) {
                    logger.error('postLoginPage - Session kaydetme hatası:', err);
                    req.session.errorMessage = 'Oturum kaydedilirken bir hata oluştu';
                    return res.redirect('/auth/login');
                }
                logger.info('postLoginPage-session kaydedildi');
                // Kullanıcının gitmek istediği sayfa için url yolu
                const url = req.session.redirectTo || '/';
                delete req.session.redirectTo;
                // Başarılı login sonrası yönlendirme
                return res.redirect(url);
            });

        } catch (error) {
            //----------------------------------
            // HTTP hata yanıtı log
            logger.logError(error, req,{
                action:'postLogin',
                token:req.body.email
            });
            // 2. hata +tipine göre işlem yap
            //----------------------------------
            if(error instanceof ValidationError){
                // for validation error
                req.session.errorMessage=error.message;
                return req.session.save(err=>{
                    if(err){
                        logger.error('postLoginPage-validationError-session save error: ',error);
                    }
                    return res.redirect('/auth/login');
                });
            }
            else if(error instanceof AuthError){
                // for authentication error
                req.session.errorMessage=error.message;
                return req.session.save(err=>{
                    if(err){
                        logger.error('postLoginPage-authError-session save error: ',error);
                    }
                    return res.redirect('/auth/login');
                });
            }
            else{
                // sistem hataları için
                logger.error('critical error in verify email: ',error); 
                return res.status(500).render('error/error',{
                    pageTitle:'System Error',
                    message:'An unexpected error occcured'
                })
            }
            //----------------------------------
        }
    },
    //======================================================
    getRegisterPage: async(req, res) => {
        try {
            // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
            if (req.session.user) {
                return res.redirect('/');
            }
            logger.debug('Register page requested');
            var errorMessage=req.session.errorMessage;
            delete req.session.errorMessage;
            res.render('auth/register', {
                pageTitle: 'Register',
                path:'/register',
                errorMessage: errorMessage
            });
        } catch (error) {
            logger.logError(error, req,{
                action:'getRegisterPage',
            });
            // session hata mesajı
            req.session.errorMessage='getRegisterPage sayfa yüklenirken hata oluştu';
            req.session.save(err=>{
                if(err){
                    logger.error('getRegisterPage-session kaydetme hatasi:',err);
                    return res.status(500).render('error/error', {
                        pageTitle: 'System Error',
                        message: 'An unexpected error occurred while loading the page',
                    });
                }
                // Session başarıyla kaydedildiyse login sayfasına yönlendir
                logger.info('getRegisterPage-session kaydedidi.');
                return res.redirect('/auth/register');
            });
        }
    },
    postRegisterPage: async(req,res)=>{
        try {
            //------------------------------------------------------
            const {name,email,password}=req.body;
            //------------------------------------------------------
            // HTTP isteği log
            logger.logRequest(req,'Register attempt');
            //------------------------------------------------------
            await authService.register({name,email,password});
            //------------------------------------------------------
            logger.info('Register request successful');
            //------------------------------------------------------
            logger.info('success','Registration successful. Please verify your email.');
            //------------------------------------------------------
            return res.redirect('/auth/login');
            //------------------------------------------------------
        } 
        catch (error) {
            // 1.http hata yanıtı log
            logger.logError(error,req,{
                action:'register',
                email:req.body.email
            });
            // 2.hata mesajını session kaydet
            req.session.errorMessage=error.message;
            // 3.session'ı kaydet ve yönlendir
            req.session.save(err=>{
                if(err){
                    logger.error('Session katdetme hatasi: ',err);
                }
                return res.redirect('/auth/register');
            })
        }
    },
    //======================================================
    getVerifyEmailPage: async(req, res) => {
        try {
            // token mail url içeriğine gönderdik.
            // "token=" olarak gönderdiğimiz için "query" alıyoruz.
            const { token } = req.query;
            logger.logRequest(req,'Email verification page requested');
            await authService.verifyEmail(token);
            logger.info('Email verified successfully',{token});
            //------------------------------------------------------
            logger.info('success','Email adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.');
            req.session.successMessage='Email adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.';
            return req.session.save(err=>{
                if(err){
                    logger.logError('getVerifyEmailPage-session kaydedilirken hata oluştu: ',err);
                    return res.status(500).render('error/error',{
                        pageTitle:'System Error',
                        message:'An unexpected error occurred'
                    });
                }
                logger.info('getVerifyEmailPage-session kaydedildi');
                return res.redirect('/auth/login');
            });
            //------------------------------------------------------
        }
        catch (error) {
            logger.logError(error, req,{
                action:'getVerifyEmailPage',
                token:req.query.token
            });
            return res.status(500).render('error/error',{
                pageTitle:'System Error',
                message:'An unexpected error occurred',
                pageMessage:'Verify Email process error',
            });
        
        }
    },
    //======================================================
    getAgainVerifyEmail:async(req,res)=>{
        // mail giriş ekranı
        try{
            if(req.session.user){
                return res.redirect('/');
            }
            logger.debug('Again verify email page requested');
            var errorMessage=req.session.errorMessage;
            delete req.session.errorMessage;
            res.render('auth/verify',{
                title:'Again verify email',
                path:'/again-verify-email',
                errorMessage:errorMessage
            });
        }catch(error){
            logger.logError(error,req,{
                action:'getAgainVerifyEmail'
            });
            req.session.errorMessage='getAgainVerifyEmail sayfa yüklenirken hata oluştu';
            req.session.save(err=>{
                if(err){
                    logger.error('getAgainVerifyEmail-session kaydetme hatasi:',err);
                    return res.status(500).render('error/error', {
                        pageTitle: 'System Error',
                        message: 'An unexpected error occurred while loading the page',
                    });
                }
                logger.info('getAgainVerifyEmail-session kaydedildi');
                return res.redirect('auth/login');
            }); 
        }
    },
    postAgainVerifyEmail:async(req,res)=>{
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
            /*
                Bu yapı sayesinde:
                    1-  Her hata durumu için özel bir hata sınıfı kullanıyoruz
                    2-  Controller'da hata tipine göre farklı sayfalara yönlendirme yapıyoruz
                    3-  Her durumda uygun hata/success mesajlarını session'a kaydediyoruz
                    4-  Session kaydetme hatalarını da yönetiyoruz
                    5-  Tüm işlemleri logluyoruz
                Kullanıcı deneyimi açısından: 
                    Kullanıcı bulunamazsa -> Kayıt sayfasına yönlendirilir
                    Email zaten doğrulanmışsa -> Login sayfasına yönlendirilir
                    Token geçerliyse -> Yeni mail gönderilir ve login sayfasına yönlendirilir
                    Token süresi bitmişse -> Yeni token oluşturulur, mail gönderilir ve login sayfasına yönlendirilir
                    Beklenmeyen hatalar için -> Tekrar doğrulama sayfasına yönlendirilir    
             */
            const email=req.body.email;
            logger.logRequest(req,'Again email verification page requested');
            const result=await authService.againVerifyEmail(email);
            //--------------------------------------------------------- 
            // Başarılı durumlar için
            if(result.status==='TOKEN_VALID'){
                req.session.successMessage=result.message;
                return req.session.save(err=>{
                    if(err){
                        logger.error('Session kaydetme hatasi: ',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'System Error',
                            message:'An unexpected error occurred'
                        });
                    }
                    return res.redirect('/auth/login');
                })
            }
            if(result.status==='NEW_TOKEN_SENT'){
                req.session.successMessage=result.message;
                return req.session.save(err=>{
                    if(err){
                        logger.error('Session kaydetme hatasi: ',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'System Error',
                            message:'An unexpected error occurred'                            
                        });
                    }
                    return res.redirect('/auth/login');
                })
            }
            //--------------------------------------------------------- 
        }
        catch(error){
            logger.logError(error,req,{
                action:'postAgainVerifyEmail',
                email:req.body.email
            });

            // HATA TIPINE GORE YONLENDIRME
            if(error instanceof UserNotFoundError){
                req.session.errorMessage=error.message;
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kaydetme hatasi: ',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'System Error',
                            message:'An unexpected error occured'
                        });
                    }
                    return res.redirect('/auth/register');// Kayıt sayfasına yönlendir
                });
            }
            if(error instanceof EmailAlreadyVerifiedError){
                req.session.errorMessage=error.message; // service tanımlı mesajı aktarma
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kaydetme hatasi:',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'System Error',
                            message:'An unexpected error occurred'
                        });
                    }
                    return res.redirect('/auth/login'); 
                });
            }
            // Diğer hatalar için
            req.session.errorMessage='Beklenmeyen bir hata oluştu';
            return req.session.save(err=>{
                if(err){
                    logger.error('Session kaydetme hatasi: ',err);
                    return res.status(500).render('error/error',{
                        pageTitle:'System Error',
                        message:'An unexpected error occurred'
                    });
                }
                return res.redirect('/auth/verify-email'); // tekrar doğrulama sayfasına yönlendir
            });
        }
    },
    //======================================================
    // parola sıfırlanacak mail sayfası
    getResetPasswordEmailPage: async(req, res) => {
        //-------------------------------------
        try {
            logger.debug('Reset password email get page requested');
            var errorMessage=req.session.errorMessage;
            delete req.session.errorMessage;
            res.render('auth/reset', {
                pageTitle: 'Reset',
                path:'/reset-password-mail',
                errorMessage: errorMessage
            });
        }
        //-------------------------------------
         catch (error) {
            logger.logError(error, req,{
                action:'getResetPasswordEmailPage'
            });
            req.session.errorMessage='getResetPasswordEmailPage sayfa yüklenirken hata oluştu';
            req.session.save(err=>{
                if(err){
                    logger.error('getResetPasswordEmailPage-session kaydetme hatasi: ',err);
                    return res.status(500).render('error/error', {
                        pageTitle: 'System Error',
                        message: 'An unexpected error occurred while loading the page',
                    });
                }
            });
            res.status(500).render('error/error', {
                pageTitle: 'Error',
                message: 'An error occurred while loading the reset password page'
            });
        }
        //-------------------------------------
    },
    //======================================================
    // email post etme sayfası
    // maile şifre sıfırlama bağlantısının gönderilmesi
    postResetPasswordEmailPage: async(req,res)=>{
        //-------------------------------------
        try {
            const {email}=req.body;
            // http isteği log
            logger.logRequest('Reset Password Email post Page required',{email});
            // bu service metodunda bütün işlemleri yapacağım.
            await authService.resetPasswordEmailSend(email);
            logger.info('Reset Password send successful');
            logger.info('Please new password your email');

            req.session.successMessage="Process successful";

            return req.session.save(err=>{
                if(err){
                    logger.error('postResetPasswordPage successfull session save error',err);
                }
                logger.info('postResetPasswordPage session save successful');
                return res.redirect('/auth/login');
            })
            //-------------------------------------
        }
        //-------------------------------------
        catch (error) {
            logger.logError(error,req,{
                action:'postResetPasswordEmailPage'
            });
            // hata tipine göre yönlendirme
            if(error instanceof UserNotFoundError){
                req.session.errorMessage=error.message;
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kaydetme hatasi: ',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'System Error',
                            message:'An unexpected error occured' 
                        });
                    }
                    return res.redirect('/auth/register');
                })
            }
            // diğer hatalar için
            req.session.errorMessage='Beklenmeyen bir hata oluştu';
            return req.session.save(err=>{
                if(err){
                    logger.error('postResetPasswordPage session save error: ',err);
                    return res.status(500).render('error/error',{
                        pageTitle:'System Error',
                        message:'An unexpected error occurred'
                    });
                }
                return res.redirect('/auth/reset-password');
            })
        }
        //-------------------------------------
    },
    //======================================================
    // Gönderilen şifre sıfırlama bağlantısı ile yeni şifre girilme sayfası
    getResetPasswordNewPasswordPage: async(req, res) => {
        try {
            const {token}=req.query; // url'den token al
            logger.debug('Forgot password page requested');
            res.render('auth/resetPassword', {
                pageTitle: 'Reset-New-Password',
                token:token, // url alınan token form içine gönderme
                errorMessage: req.flash('error'),
                successMessage: req.flash('success')
            });
        } catch (error) {
            logger.logError(error, req,{
                action:'getResetPasswordNewPasswordPage'
            });
            req.session.errorMessage='getResetPasswordNewPasswordPage sayfa yüklenirken hata oluştu';
            req.session.save(err=>{
                if(err){
                    logger.error('getResetPasswordNewPasswordPage-session kaydetme hatasi: ',err);
                    return res.status(500).render('error/error', {
                        pageTitle: 'System Error',
                        message: 'An unexpected error occurred while loading the page',
                    });
                }
            });
            res.status(500).render('error/error', {
                pageTitle: 'Error',
                message: 'An error occurred while loading the reset password page'
            });
        }
    },
    //======================================================
    // şifre sıfırlama post etme sayfası
    postResetPasswordNewPasswordPage: async(req,res)=>{
        try {
            logger.logRequest('New password send: ',{email});
            // get kısmında url token alıp form içine aktardık.
            const restartToken=req.body.token;
            logger.info('Form içinde gelen token bilgisi: ',restartToken);
            // servis katmanına gönderme
            await authService.resetPasswordTokenPage(token);
            logger.info('Reset password restart successful');
            logger.info('enter login successful');
            req.session.successMessage='Reset password successful';
            return req.session.save(err=>{
                if(err){
                    logger.error('postResetPasswordNewPasswordPage - successfull session save error',err);
                }
                logger.info('postResetPasswordNewPasswordPage session save successful');
                return res.redirect('/auth/login');
            });
        } 
        catch (error) {
            //------------------------------
            logger.logError(error,req,{
                action:'postResetPasswordNewPasswordPage'
            });
            //------------------------------
            if(error instanceof TokenNotFoundError){
                req.session.errorMessage=error.message;
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kayıt sırasında hata oluştu',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'Post Reset Password',
                            message:'Parola resetleme sırasında hata oluştu,Token bulunamadı'
                        });
                    }
                    return res.redirect('/auth/login');
                });
            }
            //------------------------------
            if(error instanceof UserNotFoundError){
                req.session.errorMessage=error.message;
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kayıt sırasında hata oluştu',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'Post Reset Password',
                            message:'Parola resetleme sırasında hata oluştu,Kullanıcı bulunamadı'
                        });
                    }
                    return res.redirect('/auth/login');
                });                
            }
            //------------------------------
            if(error instanceof PasswordAlreadyVerifiedError){
                req.session.errorMessage=error.message;
                req.session.save(err=>{
                    if(err){
                        logger.error('Session kayıt sırasında hata oluştu',err);
                        return res.status(500).render('error/error',{
                            pageTitle:'Post Reset Password',
                            message:'Parola resetleme sırasında hata oluştu,Doğrulama bağlantısı süresi dolmuş'
                        });
                    }
                    return res.redirect('/auth/login');
                });                
            }
            //------------------------------
            // diğer hatalar için
            req.session.errorMessage='Beklenmeyen bir hata oluştu';
            return req.session.save(err=>{
                if(err){
                    logger.error('postResetPasswordNewPasswordPage session save error: ',err);
                    return res.status(500).render('error/error',{
                        pageTitle:'System Error',
                        message:'An unexpected error occurred'
                    });
                }
                return res.redirect('/auth/login');
            })
            //------------------------------

        }
    },
    //======================================================
    getLogoutPage: async (req, res) => {
        try {
            const userId = req.session?.user?.id;
            // HTTP isteği log
            logger.logRequest(req, 'Logout attempt');
            // Auth service'i çağır
            await authService.logout(userId);

            // Session'ı temizle
            req.session.destroy((err) => {
                if (err) {
                    logger.logError(err, req, {
                        action: 'logout',
                        userId
                    });
                    return res.status(500).json({ error: 'Logout failed' });
                }
                // HTTP başarılı yanıt log
                logger.info('Logout request successful', { userId });
                res.redirect('/auth/login');
            });
        } catch (error) {
            // HTTP hata yanıtı log
            logger.logError(error, req, {
                action: 'logout',
                userId: req.session?.user?.id
            });
            res.status(500).json({ error: 'Logout failed' });
        }
    },
    //======================================================
};

module.exports = authController; 
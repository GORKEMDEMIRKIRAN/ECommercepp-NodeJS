


// AUTHENTICATION MIDDLEWARE

/**
 * Herhangi bir giriş yapmış kullanıcı için middleware
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Sonraki middleware'e geçiş fonksiyonu
 */

// Sadece adminler için
const isAdmin=(req,res,next)=>{
    // kullanıcı giriş yapmış mı kontrülü
    //--------------------------------------------------------------------
    if(!req.session.isAuthenticated){
        return res.status(401).render('error/error',{
            pageTitle:'Admin Authentication Required',
            path:'/error',
            statusCode:401,
            message:'Please log in to access this page'
        });
    }
    //--------------------------------------------------------------------
    // if(req.session.user && req.session.user.role==='admin'){
    //     return next();
    // }
    req.session.redirectTo=req.url;
    if(req.session.isAdmin){ 
        return next();
    }
    //--------------------------------------------------------------------
    // Admin değilse erişim reddedildi sayfasına yönlendir
    return res.status(403).render('error/error',{
        pageTitle:'Admin Access Denied',
        path:'/error',
        statusCode:403,
        message:'You do not have permission to access this page'
    });
    //--------------------------------------------------------------------
};

// Sadece normal kullanıcı veya adminler için
const isCustomer = (req, res, next) => {
    //--------------------------------------------------------------------
    // Kullanıcı giriş yapmış mı kontrolü
    if (!req.session.isAuthenticated) {
        return res.status(401).render('error/error', {
            pageTitle: 'User Authentication Required',
            path: '/error',
            statusCode: 401,
            message: 'Please log in to access this page'
        });
    }
    //--------------------------------------------------------------------
    // Kullanıcı rolü user veya admin mi kontrolü
    // Admin'lerin de user sayfalarına erişebilmesini sağlar
    // if (req.session.user && (req.session.user.role === 'user' || req.session.user.role === 'admin')) {
    //     return next();
    // }
    req.session.redirectTo=req.url;
    if(req.session.isCustomer){ 
        return next();
    }
    //--------------------------------------------------------------------
    // Yetkisiz kullanıcıları reddet
    return res.status(403).render('error/error', {
        pageTitle: 'User Access Denied',
        path: '/error',
        statusCode: 403,
        message: 'You do not have permission to access this page'
    });
    //--------------------------------------------------------------------
};

//  Her hangi bir giriş yapmış kullanıcı için
const isAuthenticated = (req, res, next) => {
    //--------------------------------------------------------------------
    req.session.redirectTo=req.originalUrl; 
    if (req.session.isAuthenticated) {
        // kullanıcının istek yaptığı url yolunu session ekledik.
        return next();
    }
    //--------------------------------------------------------------------
    return res.status(401).render('auth/login', {
        pageTitle: 'General Authentication Required',
        path: '/error',
        statusCode: 401,
        message: 'Please log in to access this page'
    });
    //--------------------------------------------------------------------
};






module.exports={isAdmin,isCustomer,isAuthenticated};

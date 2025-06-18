


const express=require('express');
const router=express.Router();
const adminController=require('../controllers/adminController');
const {isAdminOrLeadDeveloper,isLeadDeveloper,isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');


const logger=require('../config/logger')
const {productValidationRules,validate,validateProductCreationRate}=require('../middlewares/productValidationMiddleware');
const {logRateLimit}=require('../config/logRateLimit');
const {logSecurityCheck}=require('../config/logSecurityCheck');




// ADMIN PANEL ROUTES

// Request logging middleware
// HTTP isteklerini loglayan middleware fonksiyonu
// const logRequest = (req, res, next) => {
//     // 'info' seviyesinde log kaydı oluştur
//     logger.info('Admin product request', {
//         // HTTP metodu (GET, POST, PUT, DELETE, etc.)
//         method: req.method,
        
//         // İstek yapılan URL path'i
//         // Örnek: "/admin/add-product"
//         url: req.url,
        
//         // Session'dan kullanıcı ID'sini al
//         // Admin paneline erişen kullanıcının kimliği
//         userId: req.session.user.id,
        
//         // Kullanıcının tarayıcı/uygulama bilgisi
//         // Örnek: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
//         userAgent: req.get('User-Agent'),
        
//         // İsteği yapan kullanıcının IP adresi
//         // Güvenlik ve analiz için önemli
//         ip: req.ip
//     });
    
//     // Middleware chain'inde bir sonraki fonksiyona geç
//     // Bu çağrılmazsa istek askıda kalır
//     next();
// };

const logRequest=(req,res,next)=>{
    // Helper metod  kullanarak INFO seviyesinde log
    logger.logRequest(req,'Admin product request');
    next();
}



// PRODUCT
//=========================================
// router.get('/',adminController.getDashboard);
//=========================================
router.get('/products',csurf,
                        isAuthenticated,
                        isAdminOrLeadDeveloper,
                        adminController.getProducts);
//=========================================

router.get('/add-product',csurf,
                            isAuthenticated,
                            isAdminOrLeadDeveloper,
                            //logSecurityCheck,
                            logRequest,
                            adminController.getAddProduct);

router.post('/add-product',isAuthenticated,
                            isAdminOrLeadDeveloper,
                            //logSecurityCheck,
                            logRateLimit,
                            logRequest,
                            // validateProductCreationRate,
                            // productValidationRules(),
                            // validate,
                            adminController.postAddProduct);

//=========================================
router.get('/edit-product/:productId',csurf,
                            isAuthenticated,
                            isAdminOrLeadDeveloper,
                            logRequest,
                            adminController.getEditProduct);

router.post('/edit-product',isAuthenticated,
                            isAdminOrLeadDeveloper,
                            logRequest,
                            adminController.postEditProduct);

//=========================================
router.post('/delete-product',isAuthenticated,
                            isAdminOrLeadDeveloper,
                            logRequest,
                            adminController.postDeleteProduct);
//=========================================





// CATEGORY
//=========================================
router.get('/add-category',csurf,
                            isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.getAddCategory);

router.post('/add-category',isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.postAddCategory);

//=========================================
router.get('/edit-category/:categoryId',csurf,
                            isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.getEditCategory);


router.post('/edit-category',isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.postEditCategory);
// //=========================================


router.get('/category-list',csurf,
                            isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.getCategories);


//=========================================
 router.post('/delete-category',isAuthenticated,
                            isLeadDeveloper,
                            logRequest,
                            adminController.postDeleteCategory);
//=========================================


module.exports=router;
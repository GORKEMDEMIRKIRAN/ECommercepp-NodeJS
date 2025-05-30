

const express=require('express');
const router=express.Router();
const accountController=require('../controllers/accountController');
const adminController = require('../controllers/adminController');
const {isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');



// ACCOUNT PANEL ROUTES
//======================================================
router.get('/login',csurf,accountController.getLogin);
router.post('/login',accountController.postLogin);
//======================================================
router.get('/register',csurf,accountController.getRegister);
router.post('/register',accountController.postRegister);
//======================================================
// Bu kısımsa email bilgisi ile ön işlem yapma
router.get('/reset-password',csurf,accountController.getReset);
router.post('/reset-password',accountController.postReset);

// mail gönderilen url ile parola sıfırlama
router.get('/restart-password',csurf,accountController.getResetPassword);
router.post('/restart-password',accountController.postResetPassword);
//======================================================
router.get('/add-address',csurf,isAuthenticated,accountController.getAddress);
router.post('/add-address',isAuthenticated,accountController.postAddress);
//======================================================
router.get('/add-card',csurf,isAuthenticated,accountController.getCards);
router.post('/add-card',isAuthenticated,accountController.postCards);
//======================================================
router.get('/add-phone',csurf,isAuthenticated,accountController.getPhone);
router.post('/add-phone',isAuthenticated,accountController.postPhone);
//======================================================
router.get('/profile',csurf,isAuthenticated,accountController.getProfile);
router.post('/profile',isAuthenticated,accountController.updateProfile);
//======================================================
router.get('/logout',isAuthenticated,accountController.getLogout);
//======================================================
// mail doğrulama
router.get('/verify-email',csurf,accountController.getVerifyEmail);

// mail doğrulama düşmemesi durumunda tekrar mail gönderme
// Kullanıcı mail adresini girerek tekrar mail doğrulaması gödnericektir.
router.get('/again-verify-email',csurf,accountController.getAgainVerifyEmail);
router.post('/again-verify-email',accountController.postAgainVerifyEmail);
//======================================================
module.exports=router;
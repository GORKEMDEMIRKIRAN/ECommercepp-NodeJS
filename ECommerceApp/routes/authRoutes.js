



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { logSecurityCheck } = require('../config/logSecurityCheck');
const {isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');


// ACCOUNT PANEL ROUTES
//======================================================
router.get('/login', authController.getLoginPage);
router.post('/login', logSecurityCheck, authController.postLoginPage);
//======================================================
router.get('/register', authController.getRegisterPage);
router.post('/register', logSecurityCheck, authController.postRegisterPage);
//======================================================
// mail doğrulama
router.get('/verify-email', authController.getVerifyEmailPage);
//======================================================
// mail doğrulama düşmemesi durumunda tekrar mail gönderme
// Kullanıcı mail adresini girerek tekrar mail doğrulaması gödnericektir.
router.get('/again-verify-email',authController.getAgainVerifyEmail);
router.post('/again-verify-email',authController.postAgainVerifyEmail);
//======================================================
// Bu kısımsa email bilgisi ile ön işlem yapma
router.get('/reset-password',authController.getResetPasswordEmailPage);
router.post('/reset-password',authController.postResetPasswordEmailPage);
//======================================================
// mail gönderilen url ile parola sıfırlama
router.get('/restart-password',authController.getResetPasswordNewPasswordPage);
router.post('/restart-password',authController.postResetPasswordNewPasswordPage);
//======================================================
router.get('/logout',authController.getLogoutPage);
//======================================================


module.exports = router; 
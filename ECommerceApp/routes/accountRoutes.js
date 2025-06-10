

const express=require('express');
const router=express.Router();
const accountController=require('../controllers/accountController');
const {isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');



// ACCOUNT PANEL ROUTES
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

module.exports=router;



const express=require('express');
const router=express.Router();
const adminController=require('../controllers/adminController');
const {isAdmin,isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');
// ADMIN PANEL ROUTES


// PRODUCT
//=========================================
// router.get('/',adminController.getDashboard);
//=========================================
router.get('/products',csurf,isAuthenticated,isAdmin,adminController.getProducts);
//=========================================
router.get('/add-product',csurf,isAuthenticated,isAdmin,adminController.getAddProduct);
router.post('/add-product',isAuthenticated,isAdmin,adminController.postAddProduct);
//=========================================
router.get('/edit-product/:productId',csurf,isAuthenticated,isAdmin,adminController.getEditProduct);
router.post('/edit-product',isAuthenticated,isAdmin,adminController.postEditProduct);
//=========================================
router.post('/delete-product',isAuthenticated,isAdmin,adminController.postDeleteProduct);
//=========================================


// CATEGORY
//=========================================
router.get('/add-category',csurf,isAuthenticated,isAdmin,adminController.getAddCategory);
router.post('/add-category',isAuthenticated,isAdmin,adminController.postAddCategory);
//=========================================
router.get('/edit-category/:categoryId',csurf,isAuthenticated,isAdmin,adminController.getEditCategory);
router.post('/edit-category',isAuthenticated,isAdmin,adminController.postEditCategory);
// //=========================================
router.get('/category-list',csurf,isAuthenticated,isAdmin,adminController.getCategories);
//=========================================
 router.post('/delete-category',isAuthenticated,isAdmin,adminController.postDeleteCategory);
//=========================================


module.exports=router;
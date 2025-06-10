
const express = require('express');
const router = express.Router();
const shopController=require('../controllers/shopController');
const {isAuthenticated}=require('../middlewares/authMiddleware');
const {csurf}=require('../middlewares/csurf');

// SHOP PANEL ROUTES


// PRODUCTS
// Public route'lar - CSRF koruması yok
//===============================================
router.get('/index',shopController.getIndex);
router.get('/products',shopController.getProducts);
router.get('/details/:productId',shopController.getProduct);
router.get('/categories/:categoryId',shopController.getProductsByCategoryId);
//===============================================

// CARD
// Korumalı route'lar - CSRF koruması var
//===============================================
router.get('/cart',csurf,isAuthenticated,shopController.getCart);
router.post('/cart',csurf,isAuthenticated,shopController.postCart);
router.post('/cart-delete-product',csurf,isAuthenticated,shopController.postCartItemDelete);
router.post('/cart-clear',csurf,isAuthenticated,shopController.postCartClear);
//===============================================

// ORDERS
//===============================================
router.get('/orders',csurf,isAuthenticated,shopController.getOrders);
router.post('/create-order',csurf,isAuthenticated,shopController.postOrder);
//===============================================


module.exports = router;
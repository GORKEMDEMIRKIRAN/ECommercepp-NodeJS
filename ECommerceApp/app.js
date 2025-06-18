

// UYGULAMA BAŞLANGIÇ NOKTASI


//==============================================
// GENERAL PACKAGES
const express=require('express');
const path=require('path');
const cookieParser=require('cookie-parser');   // cookie process
//const logger=require('morgan');   // for logger
const errorHandler=require('./middlewares/errorMiddleware.js');  // Error middleware section
const bodyParser=require('body-parser');
// Debug middleware
const debugMiddleware = require('./middlewares/debugMiddleware.js');

//==============================================
// ROUTES
const accountRoutes=require('./routes/accountRoutes.js');
const adminRoutes=require('./routes/adminRoutes.js');
const shopRoutes=require('./routes/shopRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
//==============================================
// Express app
const app=express();

//==============================================
// Environment variables
const dotenv=require('dotenv');
dotenv.config();

//==============================================
// View Engine Setup
// pug setting
app.set('views', path.join(__dirname, 'views')); // __dirname mevcut dosyanın yolunu verir
app.set('view engine','pug');
//==============================================
// MIDDLEWARES
// app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false})); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
//==============================================

// Session kurulumu
const session=require('express-session');

const MongoDBStore=require('connect-mongodb-session')(session);
var SessionStore=new MongoDBStore({
  uri:process.env.MONGODB_URI,
  collection:'Sessions' // database oluşacak şema ismi
});


// Session kurulumu
app.use(session({
  secret:'your-secret-key', // session şifreleme anahtarı
  resave:false,
  saveUninitialized:false,
  cookie:{
    maxAge:3600000, // 1 saat(milisaniye cinsinden)
    secure: false,
    httpOnly: true
  },
  store:SessionStore,
}));


//==============================================

// CSRF koruması


// CSRF korumasını cookie'de saklamayacak şekilde ayarla
// CSRF koruması - cookie: false olarak ayarlayın
// Bu middleware'i sadece gerekli route'larda kullanacağız
// Örnek: app.use('/account', csrfProtection, accountRoutes);
/* 
const csrfProtection=csurf({
  cookie:false,
  sessionKey:'csrftoken'
});

// CSRF token'ı her istekte view'lara aktarma
app.use((req, res, next) => {
  // CSRF token'ı her zaman oluştur ama sadece gerekli route'larda kullan
  if (req.csrfToken) {
      res.locals.csrfToken = req.csrfToken();
  }
  next();
});
*/


// debug middleware csrf korumansından sonra ekleme
app.use(debugMiddleware);

// Önemli: csrf token'ı her istekte  view'lara aktarma
// Her istekte view'lara kullanıcı bilgilerini göster
app.use((req,res,next)=>{
  res.locals.isAuthenticated=req.session.isAuthenticated||false;
  res.locals.isLeadDeveloper=req.session.isLeadDeveloper||false;
  res.locals.isAdmin=req.session.isAdmin||false;
  res.locals.isCustomer=req.session.isCustomer||false;
  res.locals.isSeller=req.session.isSeller||false;
  res.locals.isDeveloper=req.session.isDeveloper||false;
  res.locals.user=req.session.user||null;
  next();
});


//==============================================
// http logs
const logger=require('./config/logger.js'); // logger config
app.use((req, res, next) =>{
  logger.logRequest(req, 'Incoming request');
  next();
});
//==============================================
// ROUTES
console.log('Routes yükleniyor....');
app.use('/account', accountRoutes);
app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);
console.log('Routes yüklendi.');
//==============================================
// Ana sayfa route'u
app.get('/', (req, res) => {
  res.redirect('/shop/index');
});
//==============================================
//Error handler - CSRF hatalarını özel olarak ele alın
/*
app.use((err, req, res, next) => {
   if (err.code === 'EBADCSRFTOKEN') {
       console.error('CSRF TOKEN HATASI VAR:', err);
       return res.status(403).redirect('/error/error', {
           pageTitle: 'CSRF Hatası',
           message: 'Form güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyin.'
       });
   }
   next(err);
});
*/
//==============================================
// Error handler
app.use(errorHandler);
//==============================================


module.exports=app;




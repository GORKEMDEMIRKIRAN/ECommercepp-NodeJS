


// ERROR MIDDLEWARE

// Hata yakalama middeware'i
const errorMiddlewares = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Hata sayfasını render et
    res.status(500).render('error', {
        pageTitle: 'Hata Oluştu',
        message: err.message || 'Beklenmeyen bir hata oluştu.'
    });
};

module.exports = errorMiddlewares;

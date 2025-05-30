


const csurf = (req, res, next) => {
    // Her istekte CSRF token'ı kontrol eder
    if (req.csrfToken) {
        // Eğer token varsa, res.locals'a ekler
        // Bu sayede view'larda csrfToken değişkeni kullanılabilir
        res.locals.csrfToken = req.csrfToken();
    }
    next();
};
module.exports={csurf};


/*
Akış şu şekilde çalışır:
    Kullanıcı bir sayfaya istek yaptığında:
        csurf.js middleware'i çalışır
        Eğer req.csrfToken varsa, yeni bir token oluşturulur
        Token res.locals.csrfToken'a atanır
        View'larda bu token kullanılabilir
    Form gönderildiğinde:
        Route'da csurf middleware'i varsa, token kontrol edilir
        Token geçerliyse işlem devam eder
        Token geçersizse hata fırlatılır
    Hata durumunda:
        app.js'deki error handler çalışır
        Kullanıcıya uygun hata mesajı gösterilir
 
 */
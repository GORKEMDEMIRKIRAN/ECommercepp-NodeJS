


// RATE LIMITING MIDDLEWARE


// Bu middleware, kullanıcıların API'ye çok sık istek göndermesini engeller
// Özellikle admin paneli gibi kritik alanlarda brute force saldırılarını önler

const logRateLimit = (req, res, next) => {
    // Kullanıcı ID'sini session'dan al
    const userId = req.session?.user?.id;
    
    // Şu anki zamanı al
    const now = Date.now();
    
    // Kullanıcının son istek zamanını al (yoksa 0)
    const userLastRequest = req.session.lastAdminRequest || 0;
    
    // Minimum istek aralığı (1 saniye)
    const minInterval = 8000;
    
    // Eğer son istekten bu yana geçen süre minimum aralıktan azsa
    if ((now - userLastRequest) < minInterval) {
        // WARNING seviyesinde log - çok sık istek
        logger.logWarning('Rate limit exceeded for admin user', req, {
            timeBetweenRequests: now - userLastRequest,
            minInterval: minInterval
        });
        
        // 429 Too Many Requests hatası döndür
        return res.status(429).json({
            error: 'Too many requests'
        });
    }
    
    // Son istek zamanını güncelle
    req.session.lastAdminRequest = now;
    
    // Bir sonraki middleware'e geç
    next();
};

module.exports = { logRateLimit };
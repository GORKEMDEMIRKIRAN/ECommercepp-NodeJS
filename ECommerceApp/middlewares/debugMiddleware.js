


// Debug middleware
const debugMiddleware = (req, res, next) => {
    if (req.method === 'POST') {
        console.log('===== DEBUG POST REQUEST =====');
        console.log('URL:', req.url);
        console.log('Body:', req.body);
        if (req.body) {
            console.log('CSRF Token in Request:', req.body._csrf||"no_csrf");
        }
        if (typeof req.csrfToken === 'function') {
            console.log('Expected CSRF Token:', req.csrfToken());
        }
        console.log('Cookies:', req.cookies);
        console.log('Session ID:', req.sessionID); // session id ulaşıyoruz.
        console.log('============================');
    }
    next();
};

module.exports = debugMiddleware;






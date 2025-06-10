// GUVENLIK MIDDLEWARE
const logger=require('./logger');

// SECURITY CHECK MIDDLEWARE
// Bu middleware, gelen isteklerin güvenlik kontrolünü yapar
// Şüpheli aktiviteleri tespit eder ve loglar

const logSecurityCheck = (req, res, next) => {
    // IP adresini al
    const ip = req.ip;
    
    // User-Agent bilgisini al
    const userAgent = req.get('user-agent');
    
    // Şüpheli IP kontrolü
    const suspiciousIPs = ['192.168.1.1', '10.0.0.1']; // Örnek IP'ler
    if (suspiciousIPs.includes(ip)) {
        logger.logSecurity('Suspicious IP detected', req);
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Şüpheli User-Agent kontrolü
    const suspiciousUserAgents = ['curl', 'wget', 'python-requests'];
    if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        logger.logSecurity('Suspicious User-Agent detected', req);
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // SQL Injection kontrolü
    const sqlInjectionPatterns = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION',
        '--', ';', '/*', '*/', 'xp_', 'sp_'
    ];
    
    const queryString = JSON.stringify(req.query);
    const bodyString = JSON.stringify(req.body);
    
    if (sqlInjectionPatterns.some(pattern => 
        queryString.toLowerCase().includes(pattern.toLowerCase()) ||
        bodyString.toLowerCase().includes(pattern.toLowerCase())
    )) {
        logger.logSecurity('Potential SQL Injection attempt detected', req);
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // XSS kontrolü
    const xssPatterns = [
        '<script>', 'javascript:', 'onerror=', 'onload=',
        'eval(', 'document.cookie', 'window.location'
    ];
    
    if (xssPatterns.some(pattern => 
        queryString.toLowerCase().includes(pattern.toLowerCase()) ||
        bodyString.toLowerCase().includes(pattern.toLowerCase())
    )) {
        logger.logSecurity('Potential XSS attempt detected', req);
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Tüm kontroller başarılı, bir sonraki middleware'e geç
    next();
};

module.exports = { logSecurityCheck };
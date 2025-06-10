


const winston = require('winston');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

/**
 *
    1-Logger Yapısı (config/logger.js):

        Farklı log seviyeleri: error, warn, info, http, debug
        Her seviye için farklı renkler
        Farklı log dosyaları:
                error.log: Sadece hatalar
                combined.log: Tüm loglar
                http.log: HTTP istekleri
         Her dosya için 5MB boyut limiti ve 5 dosya rotasyonu


    2-Rate Limiting (config/logRateLimit.js):
            Kullanıcıların çok sık istek göndermesini engeller
            Her istek arasında minimum 1 saniye bekleme süresi
            Limit aşımında 429 hatası ve log kaydı

    3-Security Check (config/logSecurityCheck.js):
            Şüpheli IP kontrolü
            Şüpheli User-Agent kontrolü
            SQL Injection kontrolü
            XSS saldırı kontrolü
            Her güvenlik ihlali için detaylı log
 */




//------------------------------------------------------
// logs klasörünü oluştur
const logsDir=path.join(__dirname,'..','logs');
if(!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir,{recursive:true});
}
//------------------------------------------------------
// Log seviyeleri ve renkleri
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
//------------------------------------------------------
// Log seviyesine göre renkler
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
//------------------------------------------------------
const logLevel = process.env.LOG_LEVEL || 'info';
// Winston'a renkleri ekle
winston.addColors(colors);
//------------------------------------------------------
const jsonFormat=winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({stack:true}),
    winston.format.json()
);
//------------------------------------------------------

// Log formatı

// Konsol için renkli ve okunabilir format (isteğe bağlı)
// Eğer konsolda da JSON istiyorsan, jsonFormat kullanabilirsin
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);
//------------------------------------------------------
// Transportlar (log çıktıları)
const transports = [
    // Konsol çıktısı
    new winston.transports.Console({
        format:jsonFormat,
        //level: logLevel,
    }),
    
    // Hata logları
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        forat: jsonFormat,
        //handleExceptions: true, // Hataları yakala  
    }),
    
    // Tüm loglar
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: jsonFormat,
    }),
    
    // HTTP istekleri için özel log
    new winston.transports.File({
        filename: path.join(logsDir, 'http.log'),
        level: 'http',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: jsonFormat
    }),
];
//------------------------------------------------------
// Logger oluştur
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    transports,
});

//------------------------------------------------------

// Request bilgilerini loglamak için yardımcı fonksiyon
logger.logRequest = (req, message = 'Request Log') => {
    logger.http(`${req.method} | ${req.url} | ${message}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.session?.user?.id,
    });
};
//------------------------------------------------------

logger.logError=(error,req=null,additionalInfo={})=>{
    const errorInfo={
        message:error.message,
        stack:error.stack,
        name:error.name,
        ...additionalInfo
    };
    if(req){
        errorInfo.request={
            method:req.method,
            url:req.url,
            userId:req.session?.user?.id,
            ip:req.ip
        };
    }
    logger.error('Error occurred', errorInfo);
};
//------------------------------------------------------
// Güvenlik uyarıları için yardımcı fonksiyon
logger.logSecurity = (message, req = null) => {
    const securityInfo = {
        message,
        timestamp: new Date().toISOString(),
    };
    if (req) {
        securityInfo.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userId: req.session?.user?.id,
        };
    }
    logger.warn('Security warning', securityInfo);
};

//------------------------------------------------------
// Güvenlik olaylarını loglama
logger.logSecurity = (event, details = {}) => {
    logger.warn({
        event: 'SECURITY',
        type: event,
        ...details,
        timestamp: new Date().toISOString()
    });
};

//------------------------------------------------------
// Performans metriklerini loglama
logger.logPerformance = (operation, duration, meta = {}) => {
    logger.info({
        event: 'PERFORMANCE',
        operation,
        duration,
        ...meta,
        timestamp: new Date().toISOString()
    });
};

//------------------------------------------------------
// İş mantığı olaylarını loglama
logger.logBusinessEvent = (event, details = {}) => {
    logger.info({
        event: 'BUSINESS',
        type: event,
        ...details,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;




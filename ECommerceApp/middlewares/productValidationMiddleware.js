


// Validation Middleware

const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

const productService=require('../services/productService')

const productValidationRules = () => {
    return [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Ürün adı gereklidir')
            .isLength({ min: 2, max: 100 })
            .withMessage('Ürün adı 2-100 karakter arasında olmalıdır')
            .custom(async (value) => {
                // Custom validation - ürün adı benzersizliği
                const productRepository = require('../../repositories/productRepository');
                const existingProduct = await productService.findByName(value);
                if (existingProduct) {
                    throw new Error('Bu ürün adı zaten kullanılıyor');
                }
                return true;
            }),

        body('price')
            .isFloat({ min: 0.01, max: 999999.99 })
            .withMessage('Fiyat 0.01 ile 999999.99 arasında olmalıdır')
            .toFloat(), // Sanitization

        body('brand')
            .trim()
            .notEmpty()
            .withMessage('Marka gereklidir')
            .isLength({ min: 2, max: 50 })
            .withMessage('Marka adı 2-50 karakter arasında olmalıdır'),

        body('description')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Açıklama 10-500 karakter arasında olmalıdır'),

        body('imageUrl'),
            // .optional()
            // .isURL()
            // .withMessage('Geçerli bir resim URL\'si giriniz'),

        body('categoryIds')
            .isArray({ min: 1 })
            .withMessage('En az bir kategori seçmelisiniz'),
            // .custom(async (categoryIds) => {
            //     // Custom validation - kategori varlığı kontrolü
            //     const categoryRepository = require('../../repositories/categoryRepository');
            //     for (const categoryId of categoryIds) {
            //         const exists = await categoryRepository.checkExists(categoryId);
            //         if (!exists) {
            //             throw new Error(`Geçersiz kategori ID: ${categoryId}`);
            //         }
            //     }
            //     return true;
            // }),

        // body('stock')
        //     .optional()
        //     .isInt({ min: 0, max: 10000 })
        //     .withMessage('Stok miktarı 0-10000 arasında olmalıdır')
        //     .toInt() // Sanitization
    ];
};

const validate = (req, res, next) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    logger.debug('Validation started', {
        requestId,
        url: req.url,
        method: req.method
    });

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        logger.warn('Validation failed', {
            requestId,
            errors: errorMessages,
            url: req.url
        });

        // API request ise JSON döndür
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Lütfen tüm alanları doğru şekilde doldurunuz',
                errors: errorMessages,
                requestId
            });
        }

        // Web form request ise render et
        return res.render('admin/add-product', {
            errorMessage: 'Lütfen tüm alanları doğru şekilde doldurunuz',
            errors: errors.array(),
            formData: req.body,
            requestId
        });
    }

    logger.debug('Validation passed', {
        requestId,
        validatedFields: Object.keys(req.body)
    });

    next();
};

// Rate limiting için validation
const validateProductCreationRate = (req, res, next) => {
    // Aynı kullanıcının çok sık ürün ekleme kontrolü
    const userId = req.user?.id;
    if (!userId) {
        return next();
    }

    // Redis veya memory cache ile rate limiting
    // Bu örnek basitleştirilmiş
    const userLastProductCreation = req.session.lastProductCreation;
    const now = Date.now();
    const minInterval = 30000; // 30 saniye

    if (userLastProductCreation && (now - userLastProductCreation) < minInterval) {
        logger.warn('Product creation rate limit exceeded', {
            userId,
            lastCreation: userLastProductCreation,
            currentTime: now
        });

        return res.status(429).json({
            success: false,
            error: 'Rate Limit Exceeded',
            message: 'Çok sık ürün eklemeye çalışıyorsunuz. Lütfen 30 saniye bekleyin.',
            retryAfter: Math.ceil((minInterval - (now - userLastProductCreation)) / 1000)
        });
    }

    req.session.lastProductCreation = now;
    next();
};

module.exports = {
    productValidationRules,
    validate,
    validateProductCreationRate
};
 
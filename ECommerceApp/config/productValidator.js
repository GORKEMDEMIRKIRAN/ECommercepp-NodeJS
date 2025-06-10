




/*
Express-Validator vs Joi Karşılaştırması

    Express-Validator Avantajları:
        Express.js ile native entegrasyon
        Middleware olarak route seviyesinde kullanım
        Sanitization (veri temizleme) özellikleri
        Request objesine direkt erişim
        Daha lightweight

    Joi Avantajları:
        Daha güçlü schema tanımlama
        Framework bağımsız (Express, Fastify, Koa ile kullanılabilir)
        Daha detaylı validation seçenekleri
        Nested object validation daha kolay
        TypeScript desteği daha iyi
*/

const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Ürün adı boş olamaz',
      'string.min': 'Ürün adı en az 2 karakter olmalı',
      'string.max': 'Ürün adı en fazla 100 karakter olmalı',
      'any.required': 'Ürün adı zorunludur'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Açıklama en fazla 500 karakter olmalı'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Fiyat pozitif bir sayı olmalı',
      'any.required': 'Fiyat zorunludur'
    }),
  
//   categoryId: Joi.number()
//     .integer()
//     .positive()
//     .required()
//     .messages({
//       'number.integer': 'Kategori ID geçerli bir sayı olmalı',
//       'any.required': 'Kategori ID zorunludur'
//     }),
  
//   stock: Joi.number()
//     .integer()
//     .min(0)
//     .required()
//     .messages({
//       'number.min': 'Stok miktarı negatif olamaz',
//       'any.required': 'Stok miktarı zorunludur'
//     })
});

const validateCreateProduct = (data) => {
  const { error, value } = createProductSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new ValidationError(errorMessages.join(', '));
  }
  
  return value;
};

module.exports = {
  validateCreateProduct
};

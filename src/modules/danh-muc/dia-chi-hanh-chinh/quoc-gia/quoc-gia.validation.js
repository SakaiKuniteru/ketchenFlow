const Joi = require('joi');

const createSchema = Joi.object({
    maQuocGia: Joi.string().trim().max(10).required().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.empty': 'Mã quốc gia không được để trống.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.',
        'any.required': 'Mã quốc gia là bắt buộc.'
    }),

    tenQuocGia: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên quốc gia phải là chuỗi.',
        'string.empty': 'Tên quốc gia không được để trống.',
        'string.max': 'Tên quốc gia không được vượt quá 255 ký tự.',
        'any.required': 'Tên quốc gia là bắt buộc.'
    }),

    tenTiengAnh: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Tên tiếng Anh phải là chuỗi.',
        'string.max': 'Tên tiếng Anh không được vượt quá 255 ký tự.'
    }),

    maDienThoai: Joi.string().trim().max(10).allow('', null).optional().messages({
        'string.base': 'Mã điện thoại phải là chuỗi.',
        'string.max': 'Mã điện thoại không được vượt quá 10 ký tự.'
    }),

    tenVietTat: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 50 ký tự.'
    }),

    maIso2: Joi.string().trim().max(2).allow('', null).optional().messages({
        'string.base': 'Mã ISO 2 phải là chuỗi.',
        'string.max': 'Mã ISO 2 không được vượt quá 2 ký tự.'
    }),

    maIso3: Joi.string().trim().max(3).allow('', null).optional().messages({
        'string.base': 'Mã ISO 3 phải là chuỗi.',
        'string.max': 'Mã ISO 3 không được vượt quá 3 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

/**
 * ==================================================
 * Schema cập nhật quốc gia
 * ==================================================
 */
const updateSchema = Joi.object({
    maQuocGia: Joi.string().trim().max(10).optional().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.empty': 'Mã quốc gia không được để trống.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.'
    }),

    tenQuocGia: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên quốc gia phải là chuỗi.',
        'string.empty': 'Tên quốc gia không được để trống.',
        'string.max': 'Tên quốc gia không được vượt quá 255 ký tự.'
    }),

    tenTiengAnh: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Tên tiếng Anh phải là chuỗi.',
        'string.max': 'Tên tiếng Anh không được vượt quá 255 ký tự.'
    }),

    maDienThoai: Joi.string().trim().max(10).allow('', null).optional().messages({
        'string.base': 'Mã điện thoại phải là chuỗi.',
        'string.max': 'Mã điện thoại không được vượt quá 10 ký tự.'
    }),

    tenVietTat: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 50 ký tự.'
    }),

    maIso2: Joi.string().trim().max(2).allow('', null).optional().messages({
        'string.base': 'Mã ISO 2 phải là chuỗi.',
        'string.max': 'Mã ISO 2 không được vượt quá 2 ký tự.'
    }),

    maIso3: Joi.string().trim().max(3).allow('', null).optional().messages({
        'string.base': 'Mã ISO 3 phải là chuỗi.',
        'string.max': 'Mã ISO 3 không được vượt quá 3 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .min(1)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

module.exports = {
    createSchema,
    updateSchema
};

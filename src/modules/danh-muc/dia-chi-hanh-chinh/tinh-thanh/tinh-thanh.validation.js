const Joi = require('joi');

const createSchema = Joi.object({
    maTinhThanh: Joi.string().trim().max(20).required().messages({
        'string.base': 'Mã Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Mã Tỉnh/Thành phố không được để trống.',
        'string.max': 'Mã Tỉnh/Thành phố không được vượt quá 20 ký tự.',
        'any.required': 'Mã Tỉnh/Thành phố là bắt buộc.'
    }),

    tenTinhThanh: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Tên Tỉnh/Thành phố không được để trống.',
        'string.max': 'Tên Tỉnh/Thành phố không được vượt quá 255 ký tự.',
        'any.required': 'Tên Tỉnh/Thành phố là bắt buộc.'
    }),

    tenVietTat: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 100 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID Quốc gia phải là số.',
        'number.integer': 'ID Quốc gia phải là số nguyên.',
        'number.positive': 'ID Quốc gia phải lớn hơn 0.'
    }),

    maQuocGia: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã Quốc gia phải là chuỗi.',
        'string.empty': 'Mã Quốc gia không được để trống.',
        'string.max': 'Mã Quốc gia không được vượt quá 50 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('quocGiaId', 'maQuocGia')
    .messages({
        'object.missing': 'Phải truyền quocGiaId hoặc maQuocGia.'
    });

const updateSchema = Joi.object({
    maTinhThanh: Joi.string().trim().max(20).optional().messages({
        'string.base': 'Mã Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Mã Tỉnh/Thành phố không được để trống.',
        'string.max': 'Mã Tỉnh/Thành phố không được vượt quá 20 ký tự.'
    }),

    tenTinhThanh: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Tên Tỉnh/Thành phố không được để trống.',
        'string.max': 'Tên Tỉnh/Thành phố không được vượt quá 255 ký tự.'
    }),

    tenVietTat: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 100 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID Quốc gia phải là số.',
        'number.integer': 'ID Quốc gia phải là số nguyên.',
        'number.positive': 'ID Quốc gia phải lớn hơn 0.'
    }),

    maQuocGia: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã Quốc gia phải là chuỗi.',
        'string.empty': 'Mã Quốc gia không được để trống.',
        'string.max': 'Mã Quốc gia không được vượt quá 50 ký tự.'
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

const Joi = require('joi');

const createSchema = Joi.object({
    maPhongBan: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã phòng ban phải là chuỗi.',
        'string.empty': 'Mã phòng ban không được để trống.',
        'string.max': 'Mã phòng ban không được vượt quá 50 ký tự.',
        'any.required': 'Mã phòng ban là bắt buộc.'
    }),

    tenPhongBan: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên phòng ban phải là chuỗi.',
        'string.empty': 'Tên phòng ban không được để trống.',
        'string.max': 'Tên phòng ban không được vượt quá 255 ký tự.',
        'any.required': 'Tên phòng ban là bắt buộc.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    coSoId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở phải là số nguyên.',
        'number.positive': 'ID cơ sở phải lớn hơn 0.'
    }),

    maCoSo: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('coSoId', 'maCoSo')
    .messages({
        'object.missing': 'Phải truyền coSoId hoặc maCoSo.'
    });

const updateSchema = Joi.object({
    maPhongBan: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã phòng ban phải là chuỗi.',
        'string.empty': 'Mã phòng ban không được để trống.',
        'string.max': 'Mã phòng ban không được vượt quá 50 ký tự.'
    }),

    tenPhongBan: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên phòng ban phải là chuỗi.',
        'string.empty': 'Tên phòng ban không được để trống.',
        'string.max': 'Tên phòng ban không được vượt quá 255 ký tự.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    coSoId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở phải là số nguyên.',
        'number.positive': 'ID cơ sở phải lớn hơn 0.'
    }),

    maCoSo: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
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

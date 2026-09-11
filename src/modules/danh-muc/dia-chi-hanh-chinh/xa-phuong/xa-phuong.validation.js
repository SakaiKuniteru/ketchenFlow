const Joi = require('joi');

const createSchema = Joi.object({
    maXaPhuong: Joi.string().trim().max(30).required().messages({
        'string.base': 'Mã Xã/Phường phải là chuỗi.',
        'string.empty': 'Mã Xã/Phường không được để trống.',
        'string.max': 'Mã Xã/Phường không được vượt quá 30 ký tự.',
        'any.required': 'Mã Xã/Phường là bắt buộc.'
    }),

    tenXaPhuong: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên Xã/Phường phải là chuỗi.',
        'string.empty': 'Tên Xã/Phường không được để trống.',
        'string.max': 'Tên Xã/Phường không được vượt quá 255 ký tự.',
        'any.required': 'Tên Xã/Phường là bắt buộc.'
    }),

    tenVietTat: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 100 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID Tỉnh/Thành phố phải là số.',
        'number.integer': 'ID Tỉnh/Thành phố phải là số nguyên.',
        'number.positive': 'ID Tỉnh/Thành phố phải lớn hơn 0.'
    }),

    maTinhThanh: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Mã Tỉnh/Thành phố không được để trống.',
        'string.max': 'Mã Tỉnh/Thành phố không được vượt quá 50 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('tinhThanhId', 'maTinhThanh')
    .messages({
        'object.missing': 'Phải truyền tinhThanhId hoặc maTinhThanh.'
    });

const updateSchema = Joi.object({
    maXaPhuong: Joi.string().trim().max(30).optional().messages({
        'string.base': 'Mã Xã/Phường phải là chuỗi.',
        'string.empty': 'Mã Xã/Phường không được để trống.',
        'string.max': 'Mã Xã/Phường không được vượt quá 30 ký tự.'
    }),

    tenXaPhuong: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên Xã/Phường phải là chuỗi.',
        'string.empty': 'Tên Xã/Phường không được để trống.',
        'string.max': 'Tên Xã/Phường không được vượt quá 255 ký tự.'
    }),

    tenVietTat: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Tên viết tắt phải là chuỗi.',
        'string.max': 'Tên viết tắt không được vượt quá 100 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID Tỉnh/Thành phố phải là số.',
        'number.integer': 'ID Tỉnh/Thành phố phải là số nguyên.',
        'number.positive': 'ID Tỉnh/Thành phố phải lớn hơn 0.'
    }),

    maTinhThanh: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã Tỉnh/Thành phố phải là chuỗi.',
        'string.empty': 'Mã Tỉnh/Thành phố không được để trống.',
        'string.max': 'Mã Tỉnh/Thành phố không được vượt quá 50 ký tự.'
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

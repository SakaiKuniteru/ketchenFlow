const Joi = require('joi');

const createSchema = Joi.object({
    maChucVu: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã chức vụ phải là chuỗi.',
        'string.empty': 'Mã chức vụ không được để trống.',
        'string.max': 'Mã chức vụ không được vượt quá 50 ký tự.',
        'any.required': 'Mã chức vụ là bắt buộc.'
    }),

    tenChucVu: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên chức vụ phải là chuỗi.',
        'string.empty': 'Tên chức vụ không được để trống.',
        'string.max': 'Tên chức vụ không được vượt quá 255 ký tự.',
        'any.required': 'Tên chức vụ là bắt buộc.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    maChucVu: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã chức vụ phải là chuỗi.',
        'string.empty': 'Mã chức vụ không được để trống.',
        'string.max': 'Mã chức vụ không được vượt quá 50 ký tự.'
    }),

    tenChucVu: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên chức vụ phải là chuỗi.',
        'string.empty': 'Tên chức vụ không được để trống.',
        'string.max': 'Tên chức vụ không được vượt quá 255 ký tự.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
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

const Joi = require('joi');

const createSchema = Joi.object({
    maDonViTinh: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã đơn vị tính phải là chuỗi.',
        'string.empty': 'Mã đơn vị tính không được để trống.',
        'string.max': 'Mã đơn vị tính không được vượt quá 50 ký tự.',
        'any.required': 'Mã đơn vị tính là bắt buộc.'
    }),

    tenDonViTinh: Joi.string().trim().max(100).required().messages({
        'string.base': 'Tên đơn vị tính phải là chuỗi.',
        'string.empty': 'Tên đơn vị tính không được để trống.',
        'string.max': 'Tên đơn vị tính không được vượt quá 100 ký tự.',
        'any.required': 'Tên đơn vị tính là bắt buộc.'
    }),

    kyHieu: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Ký hiệu phải là chuỗi.',
        'string.max': 'Ký hiệu không được vượt quá 20 ký tự.'
    }),

    loaiDonVi: Joi.number().integer().valid(10, 20, 30).required().messages({
        'number.base': 'Loại đơn vị phải là số.',
        'number.integer': 'Loại đơn vị phải là số nguyên.',
        'any.only': 'Loại đơn vị không hợp lệ.',
        'any.required': 'Loại đơn vị là bắt buộc.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    maDonViTinh: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã đơn vị tính phải là chuỗi.',
        'string.empty': 'Mã đơn vị tính không được để trống.',
        'string.max': 'Mã đơn vị tính không được vượt quá 50 ký tự.'
    }),

    tenDonViTinh: Joi.string().trim().max(100).optional().messages({
        'string.base': 'Tên đơn vị tính phải là chuỗi.',
        'string.empty': 'Tên đơn vị tính không được để trống.',
        'string.max': 'Tên đơn vị tính không được vượt quá 100 ký tự.'
    }),

    kyHieu: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Ký hiệu phải là chuỗi.',
        'string.max': 'Ký hiệu không được vượt quá 20 ký tự.'
    }),

    loaiDonVi: Joi.number().integer().valid(10, 20, 30).optional().messages({
        'number.base': 'Loại đơn vị phải là số.',
        'number.integer': 'Loại đơn vị phải là số nguyên.',
        'any.only': 'Loại đơn vị không hợp lệ.'
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

const Joi = require('joi');

const createSchema = Joi.object({
    maCaAn: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã ca ăn phải là chuỗi.',
        'string.empty': 'Mã ca ăn không được để trống.',
        'string.max': 'Mã ca ăn không được vượt quá 50 ký tự.',
        'any.required': 'Mã ca ăn là bắt buộc.'
    }),

    tenCaAn: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên ca ăn phải là chuỗi.',
        'string.empty': 'Tên ca ăn không được để trống.',
        'string.max': 'Tên ca ăn không được vượt quá 255 ký tự.',
        'any.required': 'Tên ca ăn là bắt buộc.'
    }),

    thoiGianBatDau: Joi.string()
        .trim()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Thời gian bắt đầu phải là chuỗi.',
            'string.empty': 'Thời gian bắt đầu không được để trống.',
            'string.pattern.base': 'Thời gian bắt đầu phải đúng định dạng HH:mm:ss.',
            'any.required': 'Thời gian bắt đầu là bắt buộc.'
        }),

    thoiGianKetThuc: Joi.string()
        .trim()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Thời gian kết thúc phải là chuỗi.',
            'string.empty': 'Thời gian kết thúc không được để trống.',
            'string.pattern.base': 'Thời gian kết thúc phải đúng định dạng HH:mm:ss.',
            'any.required': 'Thời gian kết thúc là bắt buộc.'
        }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    maCaAn: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã ca ăn phải là chuỗi.',
        'string.empty': 'Mã ca ăn không được để trống.',
        'string.max': 'Mã ca ăn không được vượt quá 50 ký tự.'
    }),

    tenCaAn: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên ca ăn phải là chuỗi.',
        'string.empty': 'Tên ca ăn không được để trống.',
        'string.max': 'Tên ca ăn không được vượt quá 255 ký tự.'
    }),

    thoiGianBatDau: Joi.string()
        .trim()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .optional()
        .messages({
            'string.base': 'Thời gian bắt đầu phải là chuỗi.',
            'string.empty': 'Thời gian bắt đầu không được để trống.',
            'string.pattern.base': 'Thời gian bắt đầu phải đúng định dạng HH:mm:ss.'
        }),

    thoiGianKetThuc: Joi.string()
        .trim()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .optional()
        .messages({
            'string.base': 'Thời gian kết thúc phải là chuỗi.',
            'string.empty': 'Thời gian kết thúc không được để trống.',
            'string.pattern.base': 'Thời gian kết thúc phải đúng định dạng HH:mm:ss.'
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

const Joi = require('joi');

const createSchema = Joi.object({
    maVoucher: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã voucher phải là chuỗi.',
        'string.empty': 'Mã voucher không được để trống.',
        'string.max': 'Mã voucher không được vượt quá 50 ký tự.',
        'any.required': 'Mã voucher là bắt buộc.'
    }),

    tenVoucher: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên voucher phải là chuỗi.',
        'string.empty': 'Tên voucher không được để trống.',
        'string.max': 'Tên voucher không được vượt quá 255 ký tự.',
        'any.required': 'Tên voucher là bắt buộc.'
    }),

    loaiMienGiam: Joi.number().integer().valid(10, 20).required().messages({
        'number.base': 'Loại miễn giảm phải là số.',
        'number.integer': 'Loại miễn giảm phải là số nguyên.',
        'any.only': 'Loại miễn giảm chỉ được là 10 hoặc 20.',
        'any.required': 'Loại miễn giảm là bắt buộc.'
    }),

    giaTri: Joi.number()
        .positive()
        .required()
        .when('loaiMienGiam', {
            is: 10,

            then: Joi.number().positive().max(100),

            otherwise: Joi.number().positive()
        })
        .messages({
            'number.base': 'Giá trị voucher phải là số.',

            'number.positive': 'Giá trị voucher phải lớn hơn 0.',

            'number.max': 'Giá trị phần trăm không được vượt quá 100.',

            'any.required': 'Giá trị voucher là bắt buộc.'
        }),

    soLuong: Joi.number().integer().min(0).required().messages({
        'number.base': 'Số lượng voucher phải là số.',
        'number.integer': 'Số lượng voucher phải là số nguyên.',
        'number.min': 'Số lượng voucher không được nhỏ hơn 0.',
        'any.required': 'Số lượng voucher là bắt buộc.'
    }),

    daSuDung: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Số lượng đã sử dụng phải là số.',
        'number.integer': 'Số lượng đã sử dụng phải là số nguyên.',
        'number.min': 'Số lượng đã sử dụng không được nhỏ hơn 0.'
    }),

    thoiGianBatDau: Joi.date().iso().allow(null).optional().messages({
        'date.base': 'Thời gian bắt đầu không hợp lệ.',
        'date.format': 'Thời gian bắt đầu phải đúng định dạng ISO.'
    }),

    thoiGianKetThuc: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .when('thoiGianBatDau', {
            is: Joi.date().required(),
            then: Joi.date().min(Joi.ref('thoiGianBatDau'))
        })
        .messages({
            'date.base': 'Thời gian kết thúc không hợp lệ.',
            'date.format': 'Thời gian kết thúc phải đúng định dạng ISO.',
            'date.min': 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.'
        }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    maVoucher: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã voucher phải là chuỗi.',
        'string.empty': 'Mã voucher không được để trống.',
        'string.max': 'Mã voucher không được vượt quá 50 ký tự.'
    }),

    tenVoucher: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên voucher phải là chuỗi.',
        'string.empty': 'Tên voucher không được để trống.',
        'string.max': 'Tên voucher không được vượt quá 255 ký tự.'
    }),

    loaiMienGiam: Joi.number().integer().valid(10, 20).optional().messages({
        'number.base': 'Loại miễn giảm phải là số.',
        'number.integer': 'Loại miễn giảm phải là số nguyên.',
        'any.only': 'Loại miễn giảm chỉ được là 10 hoặc 20.'
    }),

    giaTri: Joi.number()
        .positive()
        .required()
        .when('loaiMienGiam', {
            is: 10,

            then: Joi.number().positive().max(100),

            otherwise: Joi.number().positive()
        })
        .messages({
            'number.base': 'Giá trị voucher phải là số.',

            'number.positive': 'Giá trị voucher phải lớn hơn 0.',

            'number.max': 'Giá trị phần trăm không được vượt quá 100.',

            'any.required': 'Giá trị voucher là bắt buộc.'
        }),

    soLuong: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Số lượng voucher phải là số.',
        'number.integer': 'Số lượng voucher phải là số nguyên.',
        'number.min': 'Số lượng voucher không được nhỏ hơn 0.'
    }),

    daSuDung: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Số lượng đã sử dụng phải là số.',
        'number.integer': 'Số lượng đã sử dụng phải là số nguyên.',
        'number.min': 'Số lượng đã sử dụng không được nhỏ hơn 0.'
    }),

    thoiGianBatDau: Joi.date().iso().allow(null).optional().messages({
        'date.base': 'Thời gian bắt đầu không hợp lệ.',
        'date.format': 'Thời gian bắt đầu phải đúng định dạng ISO.'
    }),

    thoiGianKetThuc: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .when('thoiGianBatDau', {
            is: Joi.date().required(),
            then: Joi.date().min(Joi.ref('thoiGianBatDau'))
        })
        .messages({
            'date.base': 'Thời gian kết thúc không hợp lệ.',
            'date.format': 'Thời gian kết thúc phải đúng định dạng ISO.',
            'date.min': 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.'
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

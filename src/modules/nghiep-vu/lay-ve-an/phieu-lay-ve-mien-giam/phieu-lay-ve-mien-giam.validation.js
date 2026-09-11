const Joi = require('joi');

const { loaiMienGiam: dsLoaiMienGiam } = require('../../../../constants/enums');

const giaTriLoaiMienGiam = dsLoaiMienGiam.map((item) => Number(item.value));

const apDungSchema = Joi.object({
    phieuLayVeId: Joi.number().integer().positive().required().messages({
        'number.base': 'Phiếu lấy vé phải là số.',
        'number.integer': 'Phiếu lấy vé phải là số nguyên.',
        'number.positive': 'Phiếu lấy vé không hợp lệ.',
        'any.required': 'Phiếu lấy vé là bắt buộc.'
    }),

    chinhSachId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Chính sách phải là số.',
        'number.integer': 'Chính sách phải là số nguyên.',
        'number.positive': 'Chính sách không hợp lệ.'
    }),

    voucherId: Joi.number().integer().positive().required().messages({
        'number.base': 'Voucher phải là số.',
        'number.integer': 'Voucher phải là số nguyên.',
        'number.positive': 'Voucher không hợp lệ.',
        'any.required': 'Voucher là bắt buộc.'
    })
});

const createSchema = Joi.object({
    phieuLayVeId: Joi.number().integer().positive().required().messages({
        'number.base': 'Phiếu lấy vé phải là số.',
        'number.integer': 'Phiếu lấy vé phải là số nguyên.',
        'number.positive': 'Phiếu lấy vé không hợp lệ.',
        'any.required': 'Phiếu lấy vé là bắt buộc.'
    }),

    maMienGiam: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã miễn giảm phải là chuỗi.',
        'string.max': 'Mã miễn giảm không được vượt quá 50 ký tự.'
    }),

    tenMienGiam: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên miễn giảm phải là chuỗi.',
        'string.empty': 'Tên miễn giảm không được để trống.',
        'string.max': 'Tên miễn giảm không được vượt quá 255 ký tự.',
        'any.required': 'Tên miễn giảm là bắt buộc.'
    }),

    loaiMienGiam: Joi.number()
        .integer()
        .valid(...giaTriLoaiMienGiam)
        .required()
        .messages({
            'number.base': 'Loại miễn giảm phải là số.',
            'number.integer': 'Loại miễn giảm phải là số nguyên.',
            'any.only': 'Loại miễn giảm không hợp lệ.',
            'any.required': 'Loại miễn giảm là bắt buộc.'
        }),

    giaTri: Joi.number().positive().required().messages({
        'number.base': 'Giá trị miễn giảm phải là số.',
        'number.positive': 'Giá trị miễn giảm phải lớn hơn 0.',
        'any.required': 'Giá trị miễn giảm là bắt buộc.'
    }),

    lyDoMienGiam: Joi.string().trim().max(500).required().messages({
        'string.base': 'Lý do miễn giảm phải là chuỗi.',
        'string.empty': 'Lý do miễn giảm không được để trống.',
        'string.max': 'Lý do miễn giảm không được vượt quá 500 ký tự.',
        'any.required': 'Lý do miễn giảm là bắt buộc.'
    })
});

const updateSchema = Joi.object({
    maMienGiam: Joi.string().trim().max(50).allow('', null).optional(),

    tenMienGiam: Joi.string().trim().max(255).optional(),

    loaiMienGiam: Joi.number()
        .integer()
        .valid(...giaTriLoaiMienGiam)
        .optional()
        .messages({
            'any.only': 'Loại miễn giảm không hợp lệ.'
        }),

    giaTri: Joi.number().positive().optional(),

    lyDoMienGiam: Joi.string().trim().max(500).optional()
})
    .min(1)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

module.exports = {
    apDungSchema,
    createSchema,
    updateSchema
};

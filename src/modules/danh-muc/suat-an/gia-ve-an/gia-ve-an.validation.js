const Joi = require('joi');

const { doiTuongLayVe: dsDoiTuongLayVe } = require('../../../../constants/enums');

const giaTriDoiTuongLayVe = dsDoiTuongLayVe.map((item) => Number(item.value));

const createSchema = Joi.object({
    doiTuongLayVe: Joi.number()
        .integer()
        .valid(...giaTriDoiTuongLayVe)
        .required()
        .messages({
            'number.base': 'Đối tượng lấy vé phải là số.',
            'number.integer': 'Đối tượng lấy vé phải là số nguyên.',
            'any.only': 'Đối tượng lấy vé không hợp lệ.',
            'any.required': 'Đối tượng lấy vé là bắt buộc.'
        }),

    coSoId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Cơ sở phải là số.',
        'number.integer': 'Cơ sở phải là số nguyên.',
        'number.positive': 'Cơ sở không hợp lệ.'
    }),

    nhaAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Nhà ăn phải là số.',
        'number.integer': 'Nhà ăn phải là số nguyên.',
        'number.positive': 'Nhà ăn không hợp lệ.'
    }),

    caAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Ca ăn phải là số.',
        'number.integer': 'Ca ăn phải là số nguyên.',
        'number.positive': 'Ca ăn không hợp lệ.'
    }),

    donGia: Joi.number().min(0).required().messages({
        'number.base': 'Đơn giá phải là số.',
        'number.min': 'Đơn giá không được nhỏ hơn 0.',
        'any.required': 'Đơn giá là bắt buộc.'
    }),

    tuNgay: Joi.date().iso().required().messages({
        'date.base': 'Từ ngày không hợp lệ.',
        'date.format': 'Từ ngày phải đúng định dạng ngày.',
        'any.required': 'Từ ngày là bắt buộc.'
    }),

    denNgay: Joi.date().iso().min(Joi.ref('tuNgay')).allow(null).optional().messages({
        'date.base': 'Đến ngày không hợp lệ.',
        'date.format': 'Đến ngày phải đúng định dạng ngày.',
        'date.min': 'Đến ngày phải lớn hơn hoặc bằng từ ngày.'
    }),

    mucDoUuTien: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Mức độ ưu tiên phải là số.',
        'number.integer': 'Mức độ ưu tiên phải là số nguyên.',
        'number.min': 'Mức độ ưu tiên phải lớn hơn 0.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 500 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    doiTuongLayVe: Joi.number()
        .integer()
        .valid(...giaTriDoiTuongLayVe)
        .optional()
        .messages({
            'number.base': 'Đối tượng lấy vé phải là số.',
            'number.integer': 'Đối tượng lấy vé phải là số nguyên.',
            'any.only': 'Đối tượng lấy vé không hợp lệ.'
        }),

    coSoId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Cơ sở phải là số.',
        'number.integer': 'Cơ sở phải là số nguyên.',
        'number.positive': 'Cơ sở không hợp lệ.'
    }),

    nhaAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Nhà ăn phải là số.',
        'number.integer': 'Nhà ăn phải là số nguyên.',
        'number.positive': 'Nhà ăn không hợp lệ.'
    }),

    caAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Ca ăn phải là số.',
        'number.integer': 'Ca ăn phải là số nguyên.',
        'number.positive': 'Ca ăn không hợp lệ.'
    }),

    donGia: Joi.number().min(0).optional().messages({
        'number.base': 'Đơn giá phải là số.',
        'number.min': 'Đơn giá không được nhỏ hơn 0.'
    }),

    tuNgay: Joi.date().iso().optional().messages({
        'date.base': 'Từ ngày không hợp lệ.',
        'date.format': 'Từ ngày phải đúng định dạng ngày.'
    }),

    denNgay: Joi.date().iso().allow(null).optional().messages({
        'date.base': 'Đến ngày không hợp lệ.',
        'date.format': 'Đến ngày phải đúng định dạng ngày.'
    }),

    mucDoUuTien: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Mức độ ưu tiên phải là số.',
        'number.integer': 'Mức độ ưu tiên phải là số nguyên.',
        'number.min': 'Mức độ ưu tiên phải lớn hơn 0.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 500 ký tự.'
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

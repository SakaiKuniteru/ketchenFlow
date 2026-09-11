const Joi = require('joi');

const createSchema = Joi.object({
    maQuyen: Joi.string().trim().max(50).required().messages({
        'string.empty': 'Mã quyền không được để trống.',

        'string.max': 'Mã quyền không được vượt quá 50 ký tự.',

        'any.required': 'Mã quyền là bắt buộc.'
    }),

    tenQuyen: Joi.string().trim().max(255).required().messages({
        'string.empty': 'Tên quyền không được để trống.',

        'string.max': 'Tên quyền không được vượt quá 255 ký tự.',

        'any.required': 'Tên quyền là bắt buộc.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).messages({
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    dsNhomTinhNangId: Joi.array()
        .items(
            Joi.number().integer().positive().messages({
                'number.base': 'ID nhóm tính năng phải là số.',

                'number.integer': 'ID nhóm tính năng phải là số nguyên.',

                'number.positive': 'ID nhóm tính năng phải lớn hơn 0.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Nhóm tính năng phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một nhóm tính năng.',

            'array.unique': 'Danh sách nhóm tính năng không được trùng nhau.'
        }),

    dsMaNhomTinhNang: Joi.array()
        .items(
            Joi.string().trim().max(50).messages({
                'string.empty': 'Mã nhóm tính năng không được để trống.',

                'string.max': 'Mã nhóm tính năng không được vượt quá 50 ký tự.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Mã nhóm tính năng phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một mã nhóm tính năng.',

            'array.unique': 'Danh sách mã nhóm tính năng không được trùng nhau.'
        }),

    active: Joi.boolean().optional()
})

    .or('dsNhomTinhNangId', 'dsMaNhomTinhNang')
    .messages({
        'object.missing': 'Phải truyền dsNhomTinhNangId hoặc dsMaNhomTinhNang.'
    });

const updateSchema = Joi.object({
    maQuyen: Joi.string().trim().max(50).optional(),

    tenQuyen: Joi.string().trim().max(255).optional(),

    moTa: Joi.string().trim().max(500).allow('', null).optional(),

    dsNhomTinhNangId: Joi.array().items(Joi.number().integer().positive()).min(1).unique().optional().messages({
        'array.base': 'Nhóm tính năng phải là một danh sách.',

        'array.min': 'Phải chọn ít nhất một nhóm tính năng.',

        'array.unique': 'Danh sách nhóm tính năng không được trùng nhau.'
    }),

    dsMaNhomTinhNang: Joi.array()
        .items(
            Joi.string().trim().max(50).messages({
                'string.empty': 'Mã nhóm tính năng không được để trống.',

                'string.max': 'Mã nhóm tính năng không được vượt quá 50 ký tự.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Mã nhóm tính năng phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một mã nhóm tính năng.',

            'array.unique': 'Danh sách mã nhóm tính năng không được trùng nhau.'
        }),

    active: Joi.boolean().optional()
})
    .min(1)
    .or('dsNhomTinhNangId', 'dsMaNhomTinhNang')
    .messages({
        'object.min': 'Phải truyền ít nhất một trường để cập nhật.',

        'object.missing': 'Phải truyền dsNhomTinhNangId hoặc dsMaNhomTinhNang.'
    });

module.exports = {
    createSchema,

    updateSchema
};

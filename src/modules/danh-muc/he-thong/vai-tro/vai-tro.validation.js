const Joi = require('joi');

const createSchema = Joi.object({
    maVaiTro: Joi.string().trim().max(50).required().messages({
        'string.empty': 'Mã vai trò không được để trống.',

        'string.max': 'Mã vai trò không được vượt quá 50 ký tự.',

        'any.required': 'Mã vai trò là bắt buộc.'
    }),

    tenVaiTro: Joi.string().trim().max(255).required().messages({
        'string.empty': 'Tên vai trò không được để trống.',

        'string.max': 'Tên vai trò không được vượt quá 255 ký tự.',

        'any.required': 'Tên vai trò là bắt buộc.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).messages({
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    dsQuyenId: Joi.array()
        .items(
            Joi.number().integer().positive().messages({
                'number.base': 'ID quyền phải là số.',

                'number.integer': 'ID quyền phải là số nguyên.',

                'number.positive': 'ID quyền phải lớn hơn 0.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Quyền phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một quyền.',

            'array.unique': 'Danh sách quyền không được trùng nhau.'
        }),

    dsMaQuyen: Joi.array()
        .items(
            Joi.string().trim().max(50).messages({
                'string.empty': 'Mã quyền không được để trống.',

                'string.max': 'Mã quyền không được vượt quá 50 ký tự.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Mã quyền phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một mã quyền.',

            'array.unique': 'Danh sách mã quyền không được trùng nhau.'
        }),

    active: Joi.boolean().optional()
})

    .or('dsQuyenId', 'dsMaQuyen')
    .messages({
        'object.missing': 'Phải truyền dsQuyenId hoặc dsMaQuyen.'
    });

const updateSchema = Joi.object({
    maVaiTro: Joi.string().trim().max(50).optional(),

    tenVaiTro: Joi.string().trim().max(255).optional(),

    moTa: Joi.string().trim().max(500).allow('', null).optional(),

    dsQuyenId: Joi.array().items(Joi.number().integer().positive()).min(1).unique().optional().messages({
        'array.base': 'Quyền phải là một danh sách.',

        'array.min': 'Phải chọn ít nhất một quyền.',

        'array.unique': 'Danh sách quyền không được trùng nhau.'
    }),

    dsMaQuyen: Joi.array()
        .items(
            Joi.string().trim().max(50).messages({
                'string.empty': 'Mã quyền không được để trống.',

                'string.max': 'Mã quyền không được vượt quá 50 ký tự.'
            })
        )
        .min(1)
        .unique()
        .optional()
        .messages({
            'array.base': 'Mã quyền phải là một danh sách.',

            'array.min': 'Phải chọn ít nhất một mã quyền.',

            'array.unique': 'Danh sách mã quyền không được trùng nhau.'
        }),

    active: Joi.boolean().optional()
})
    .min(1)
    .or('dsQuyenId', 'dsMaQuyen')
    .messages({
        'object.min': 'Phải truyền ít nhất một trường để cập nhật.',

        'object.missing': 'Phải truyền dsQuyenId hoặc dsMaQuyen.'
    });

module.exports = {
    createSchema,

    updateSchema
};

const Joi = require('joi');

const createSchema = Joi.object({
    maThietLap: Joi.string().trim().max(100).required().messages({
        'string.base': 'Mã thiết lập phải là chuỗi.',

        'string.empty': 'Mã thiết lập không được để trống.',

        'string.max': 'Mã thiết lập không được vượt quá 100 ký tự.',

        'any.required': 'Mã thiết lập là bắt buộc.'
    }),

    tenThietLap: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên thiết lập phải là chuỗi.',

        'string.empty': 'Tên thiết lập không được để trống.',

        'string.max': 'Tên thiết lập không được vượt quá 255 ký tự.',

        'any.required': 'Tên thiết lập là bắt buộc.'
    }),

    giaTri: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.valid(null)).required().messages({
        'alternatives.types': 'Giá trị thiết lập phải là chuỗi, số, boolean hoặc null.',

        'alternatives.match': 'Giá trị thiết lập không hợp lệ.',

        'any.required': 'Giá trị thiết lập là bắt buộc.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',

        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    dsCoSoId: Joi.array().items(Joi.number().integer().positive()).min(1).unique().optional().messages({
        'array.base': 'Cơ sở phải là một danh sách.',

        'array.unique': 'Danh sách cơ sở không được trùng nhau.'
    }),

    dsMaCoSo: Joi.array().items(Joi.string().trim().max(50)).min(1).unique().optional().messages({
        'array.base': 'Mã cơ sở phải là một danh sách.',

        'array.unique': 'Danh sách mã cơ sở không được trùng nhau.'
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
                'string.base': 'Mã nhóm tính năng phải là chuỗi.',

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

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái hoạt động phải là true hoặc false.'
    })
});

const updateSchema = Joi.object({
    maThietLap: Joi.string().trim().max(100).optional().messages({
        'string.base': 'Mã thiết lập phải là chuỗi.',

        'string.empty': 'Mã thiết lập không được để trống.',

        'string.max': 'Mã thiết lập không được vượt quá 100 ký tự.'
    }),

    tenThietLap: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên thiết lập phải là chuỗi.',

        'string.empty': 'Tên thiết lập không được để trống.',

        'string.max': 'Tên thiết lập không được vượt quá 255 ký tự.'
    }),

    giaTri: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.valid(null)).optional().messages({
        'alternatives.types': 'Giá trị thiết lập phải là chuỗi, số, boolean hoặc null.',

        'alternatives.match': 'Giá trị thiết lập không hợp lệ.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',

        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    dsCoSoId: Joi.array().items(Joi.number().integer().positive()).min(1).unique().optional().messages({
        'array.base': 'Cơ sở phải là một danh sách.',

        'array.unique': 'Danh sách cơ sở không được trùng nhau.'
    }),

    dsMaCoSo: Joi.array().items(Joi.string().trim().max(50)).min(1).unique().optional().messages({
        'array.base': 'Mã cơ sở phải là một danh sách.',

        'array.unique': 'Danh sách mã cơ sở không được trùng nhau.'
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
                'string.base': 'Mã nhóm tính năng phải là chuỗi.',

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

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái hoạt động phải là true hoặc false.'
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

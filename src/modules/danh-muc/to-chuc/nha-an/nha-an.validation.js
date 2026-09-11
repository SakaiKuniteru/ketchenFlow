const Joi = require('joi');

const createSchema = Joi.object({
    maNhaAn: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã nhà ăn phải là chuỗi.',
        'string.empty': 'Mã nhà ăn không được để trống.',
        'string.max': 'Mã nhà ăn không được vượt quá 50 ký tự.',
        'any.required': 'Mã nhà ăn là bắt buộc.'
    }),

    tenNhaAn: Joi.string().trim().max(150).required().messages({
        'string.base': 'Tên nhà ăn phải là chuỗi.',
        'string.empty': 'Tên nhà ăn không được để trống.',
        'string.max': 'Tên nhà ăn không được vượt quá 150 ký tự.',
        'any.required': 'Tên nhà ăn là bắt buộc.'
    }),

    coSoId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở không hợp lệ.',
        'number.positive': 'ID cơ sở không hợp lệ.'
    }),

    maCoSo: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    dsNvQuanLyId: Joi.array()
        .items(
            Joi.number().integer().positive().messages({
                'number.base': 'ID nhân viên quản lý phải là số.',
                'number.integer': 'ID nhân viên quản lý không hợp lệ.',
                'number.positive': 'ID nhân viên quản lý không hợp lệ.'
            })
        )
        .unique()
        .optional()
        .messages({
            'array.base': 'Danh sách ID nhân viên quản lý phải là một mảng.',
            'array.unique': 'Danh sách ID nhân viên quản lý không được trùng lặp.'
        }),

    dsMaNvQuanLy: Joi.array()
        .items(
            Joi.string().trim().max(50).required().messages({
                'string.base': 'Mã nhân viên quản lý phải là chuỗi.',
                'string.empty': 'Mã nhân viên quản lý không được để trống.',
                'string.max': 'Mã nhân viên quản lý không được vượt quá 50 ký tự.',
                'any.required': 'Mã nhân viên quản lý không được để trống.'
            })
        )
        .unique((a, b) => a.trim().toUpperCase() === b.trim().toUpperCase())
        .optional()
        .messages({
            'array.base': 'Danh sách mã nhân viên quản lý phải là một mảng.',
            'array.unique': 'Danh sách mã nhân viên quản lý không được trùng lặp.'
        }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('coSoId', 'maCoSo')
    .messages({
        'object.missing': 'Phải truyền ID cơ sở hoặc mã cơ sở.'
    });

const updateSchema = Joi.object({
    maNhaAn: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã nhà ăn phải là chuỗi.',
        'string.empty': 'Mã nhà ăn không được để trống.',
        'string.max': 'Mã nhà ăn không được vượt quá 50 ký tự.'
    }),

    tenNhaAn: Joi.string().trim().max(150).optional().messages({
        'string.base': 'Tên nhà ăn phải là chuỗi.',
        'string.empty': 'Tên nhà ăn không được để trống.',
        'string.max': 'Tên nhà ăn không được vượt quá 150 ký tự.'
    }),

    coSoId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở không hợp lệ.',
        'number.positive': 'ID cơ sở không hợp lệ.'
    }),

    maCoSo: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    dsNvQuanLyId: Joi.array()
        .items(
            Joi.number().integer().positive().messages({
                'number.base': 'ID nhân viên quản lý phải là số.',
                'number.integer': 'ID nhân viên quản lý không hợp lệ.',
                'number.positive': 'ID nhân viên quản lý không hợp lệ.'
            })
        )
        .unique()
        .optional()
        .messages({
            'array.base': 'Danh sách ID nhân viên quản lý phải là một mảng.',
            'array.unique': 'Danh sách ID nhân viên quản lý không được trùng lặp.'
        }),

    dsMaNvQuanLy: Joi.array()
        .items(
            Joi.string().trim().max(50).required().messages({
                'string.base': 'Mã nhân viên quản lý phải là chuỗi.',
                'string.empty': 'Mã nhân viên quản lý không được để trống.',
                'string.max': 'Mã nhân viên quản lý không được vượt quá 50 ký tự.',
                'any.required': 'Mã nhân viên quản lý không được để trống.'
            })
        )
        .unique((a, b) => a.trim().toUpperCase() === b.trim().toUpperCase())
        .optional()
        .messages({
            'array.base': 'Danh sách mã nhân viên quản lý phải là một mảng.',
            'array.unique': 'Danh sách mã nhân viên quản lý không được trùng lặp.'
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

const Joi = require('joi');

const createSchema = Joi.object({
    maBaoCao: Joi.string().trim().max(100).required().messages({
        'string.base': 'Mã báo cáo phải là chuỗi.',

        'string.empty': 'Mã báo cáo không được để trống.',

        'string.max': 'Mã báo cáo không được vượt quá 100 ký tự.',

        'any.required': 'Mã báo cáo là bắt buộc.'
    }),

    tenBaoCao: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên báo cáo phải là chuỗi.',

        'string.empty': 'Tên báo cáo không được để trống.',

        'string.max': 'Tên báo cáo không được vượt quá 255 ký tự.',

        'any.required': 'Tên báo cáo là bắt buộc.'
    }),

    loaiXuatFile: Joi.number().integer().valid(10, 20, 30).allow(null).optional().messages({
        'number.base': 'Loại xuất file phải là số.',

        'number.integer': 'Loại xuất file phải là số nguyên.',

        'any.only': 'Loại xuất file không hợp lệ.'
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
    maBaoCao: Joi.string().trim().max(100).optional().messages({
        'string.base': 'Mã báo cáo phải là chuỗi.',

        'string.empty': 'Mã báo cáo không được để trống.',

        'string.max': 'Mã báo cáo không được vượt quá 100 ký tự.'
    }),

    tenBaoCao: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên báo cáo phải là chuỗi.',

        'string.empty': 'Tên báo cáo không được để trống.',

        'string.max': 'Tên báo cáo không được vượt quá 255 ký tự.'
    }),

    loaiXuatFile: Joi.number().integer().valid(10, 20, 30).allow(null).optional().messages({
        'number.base': 'Loại xuất file phải là số.',

        'number.integer': 'Loại xuất file phải là số nguyên.',

        'any.only': 'Loại xuất file không hợp lệ.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',

        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});

module.exports = {
    createSchema,

    updateSchema
};

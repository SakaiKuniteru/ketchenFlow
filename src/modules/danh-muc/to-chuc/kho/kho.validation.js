const Joi = require('joi');

const createSchema = Joi.object({
    maKho: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã kho phải là chuỗi.',
        'string.empty': 'Mã kho không được để trống.',
        'string.max': 'Mã kho không được vượt quá 50 ký tự.',
        'any.required': 'Mã kho là bắt buộc.'
    }),

    tenKho: Joi.string().trim().max(150).required().messages({
        'string.base': 'Tên kho phải là chuỗi.',
        'string.empty': 'Tên kho không được để trống.',
        'string.max': 'Tên kho không được vượt quá 150 ký tự.',
        'any.required': 'Tên kho là bắt buộc.'
    }),

    nhaAnId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID nhà ăn phải là số.',
        'number.integer': 'ID nhà ăn phải là số nguyên.',
        'number.positive': 'ID nhà ăn phải lớn hơn 0.'
    }),

    maNhaAn: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã nhà ăn phải là chuỗi.',
        'string.empty': 'Mã nhà ăn không được để trống.',
        'string.max': 'Mã nhà ăn không được vượt quá 50 ký tự.'
    }),

    loaiKho: Joi.number().integer().required().messages({
        'number.base': 'Loại kho phải là số.',
        'number.integer': 'Loại kho phải là số nguyên.',
        'any.required': 'Loại kho là bắt buộc.'
    }),

    diaDiem: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Địa điểm phải là chuỗi.',
        'string.max': 'Địa điểm không được vượt quá 255 ký tự.'
    }),

    dienTich: Joi.number().min(0).allow(null).optional().messages({
        'number.base': 'Diện tích phải là số.',
        'number.min': 'Diện tích không được nhỏ hơn 0.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 500 ký tự.'
    }),

    dsNvQuanLyId: Joi.array().items(Joi.number().integer().positive()).optional().messages({
        'array.base': 'Danh sách nhân viên quản lý phải là mảng.',
        'number.base': 'ID nhân viên quản lý phải là số.',
        'number.integer': 'ID nhân viên quản lý phải là số nguyên.',
        'number.positive': 'ID nhân viên quản lý phải lớn hơn 0.'
    }),

    dsNvQuanLyMa: Joi.array().items(Joi.string().trim().max(50)).optional().messages({
        'array.base': 'Danh sách mã nhân viên quản lý phải là mảng.',
        'string.base': 'Mã nhân viên quản lý phải là chuỗi.',
        'string.empty': 'Mã nhân viên quản lý không được để trống.',
        'string.max': 'Mã nhân viên quản lý không được vượt quá 50 ký tự.'
    }),

    nhietDoToiThieu: Joi.number().allow(null).optional().messages({
        'number.base': 'Nhiệt độ tối thiểu phải là số.'
    }),

    nhietDoToiDa: Joi.number().allow(null).optional().messages({
        'number.base': 'Nhiệt độ tối đa phải là số.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('nhaAnId', 'maNhaAn')
    .messages({
        'object.missing': 'Phải truyền nhaAnId hoặc maNhaAn.'
    });

const updateSchema = Joi.object({
    maKho: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã kho phải là chuỗi.',
        'string.empty': 'Mã kho không được để trống.',
        'string.max': 'Mã kho không được vượt quá 50 ký tự.'
    }),

    tenKho: Joi.string().trim().max(150).optional().messages({
        'string.base': 'Tên kho phải là chuỗi.',
        'string.empty': 'Tên kho không được để trống.',
        'string.max': 'Tên kho không được vượt quá 150 ký tự.'
    }),

    nhaAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID nhà ăn phải là số.',
        'number.integer': 'ID nhà ăn phải là số nguyên.',
        'number.positive': 'ID nhà ăn phải lớn hơn 0.'
    }),

    maNhaAn: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã nhà ăn phải là chuỗi.',
        'string.empty': 'Mã nhà ăn không được để trống.',
        'string.max': 'Mã nhà ăn không được vượt quá 50 ký tự.'
    }),

    loaiKho: Joi.number().integer().optional().messages({
        'number.base': 'Loại kho phải là số.',
        'number.integer': 'Loại kho phải là số nguyên.'
    }),

    diaDiem: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Địa điểm phải là chuỗi.',
        'string.max': 'Địa điểm không được vượt quá 255 ký tự.'
    }),

    dienTich: Joi.number().min(0).allow(null).optional().messages({
        'number.base': 'Diện tích phải là số.',
        'number.min': 'Diện tích không được nhỏ hơn 0.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 500 ký tự.'
    }),

    dsNvQuanLyId: Joi.array().items(Joi.number().integer().positive()).optional().messages({
        'array.base': 'Danh sách nhân viên quản lý phải là mảng.',
        'number.base': 'ID nhân viên quản lý phải là số.',
        'number.integer': 'ID nhân viên quản lý phải là số nguyên.',
        'number.positive': 'ID nhân viên quản lý phải lớn hơn 0.'
    }),

    dsNvQuanLyMa: Joi.array().items(Joi.string().trim().max(50)).optional().messages({
        'array.base': 'Danh sách mã nhân viên quản lý phải là mảng.',
        'string.base': 'Mã nhân viên quản lý phải là chuỗi.',
        'string.empty': 'Mã nhân viên quản lý không được để trống.',
        'string.max': 'Mã nhân viên quản lý không được vượt quá 50 ký tự.'
    }),

    nhietDoToiThieu: Joi.number().allow(null).optional().messages({
        'number.base': 'Nhiệt độ tối thiểu phải là số.'
    }),

    nhietDoToiDa: Joi.number().allow(null).optional().messages({
        'number.base': 'Nhiệt độ tối đa phải là số.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
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

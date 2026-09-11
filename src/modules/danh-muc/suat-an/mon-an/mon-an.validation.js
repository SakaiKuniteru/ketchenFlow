const Joi = require('joi');

const thucPhamCongThucSchema = Joi.object({
    thucPhamId: Joi.number().integer().positive().required().messages({
        'number.base': 'ID thực phẩm phải là số.',
        'number.integer': 'ID thực phẩm phải là số nguyên.',
        'number.positive': 'ID thực phẩm phải lớn hơn 0.',
        'any.required': 'ID thực phẩm là bắt buộc.'
    }),

    dinhLuong: Joi.number().positive().required().messages({
        'number.base': 'Định lượng thực phẩm phải là số.',
        'number.positive': 'Định lượng thực phẩm phải lớn hơn 0.',
        'any.required': 'Định lượng thực phẩm là bắt buộc.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú thực phẩm phải là chuỗi.',
        'string.max': 'Ghi chú thực phẩm không được vượt quá 500 ký tự.'
    })
});

const dsThucPhamSchema = Joi.array().items(thucPhamCongThucSchema).unique('thucPhamId').messages({
    'array.base': 'Danh sách thực phẩm phải là danh sách.',
    'array.unique': 'Một thực phẩm không được xuất hiện nhiều lần trong công thức.'
});

const createSchema = Joi.object({
    maMonAn: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã món ăn phải là chuỗi.',
        'string.empty': 'Mã món ăn không được để trống.',
        'string.max': 'Mã món ăn không được vượt quá 50 ký tự.',
        'any.required': 'Mã món ăn là bắt buộc.'
    }),

    tenMonAn: Joi.string().trim().max(150).required().messages({
        'string.base': 'Tên món ăn phải là chuỗi.',
        'string.empty': 'Tên món ăn không được để trống.',
        'string.max': 'Tên món ăn không được vượt quá 150 ký tự.',
        'any.required': 'Tên món ăn là bắt buộc.'
    }),

    nhomMonAnId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID nhóm món ăn phải là số.',
        'number.integer': 'ID nhóm món ăn phải là số nguyên.',
        'number.positive': 'ID nhóm món ăn phải lớn hơn 0.'
    }),

    maNhomMonAn: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã nhóm món ăn phải là chuỗi.',
        'string.empty': 'Mã nhóm món ăn không được để trống.',
        'string.max': 'Mã nhóm món ăn không được vượt quá 50 ký tự.'
    }),

    giaTien: Joi.number().precision(2).min(0).allow(null).optional().messages({
        'number.base': 'Giá tiền phải là số.',
        'number.min': 'Giá tiền không được nhỏ hơn 0.'
    }),

    calories: Joi.number().integer().min(0).allow(null).optional().messages({
        'number.base': 'Calories phải là số.',
        'number.integer': 'Calories phải là số nguyên.',
        'number.min': 'Calories không được nhỏ hơn 0.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    hinhAnh: Joi.string().trim().allow('', null).optional().messages({
        'string.base': 'Hình ảnh phải là chuỗi.'
    }),

    dsThucPham: dsThucPhamSchema.required().messages({
        'any.required': 'Danh sách thực phẩm là bắt buộc.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('nhomMonAnId', 'maNhomMonAn')
    .messages({
        'object.missing': 'Phải truyền nhomMonAnId hoặc maNhomMonAn.'
    });

const updateSchema = Joi.object({
    maMonAn: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã món ăn phải là chuỗi.',
        'string.empty': 'Mã món ăn không được để trống.',
        'string.max': 'Mã món ăn không được vượt quá 50 ký tự.'
    }),

    tenMonAn: Joi.string().trim().max(150).optional().messages({
        'string.base': 'Tên món ăn phải là chuỗi.',
        'string.empty': 'Tên món ăn không được để trống.',
        'string.max': 'Tên món ăn không được vượt quá 150 ký tự.'
    }),

    nhomMonAnId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID nhóm món ăn phải là số.',
        'number.integer': 'ID nhóm món ăn phải là số nguyên.',
        'number.positive': 'ID nhóm món ăn phải lớn hơn 0.'
    }),

    maNhomMonAn: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã nhóm món ăn phải là chuỗi.',
        'string.empty': 'Mã nhóm món ăn không được để trống.',
        'string.max': 'Mã nhóm món ăn không được vượt quá 50 ký tự.'
    }),

    giaTien: Joi.number().precision(2).min(0).allow(null).optional().messages({
        'number.base': 'Giá tiền phải là số.',
        'number.min': 'Giá tiền không được nhỏ hơn 0.'
    }),

    calories: Joi.number().integer().min(0).allow(null).optional().messages({
        'number.base': 'Calories phải là số.',
        'number.integer': 'Calories phải là số nguyên.',
        'number.min': 'Calories không được nhỏ hơn 0.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    hinhAnh: Joi.string().trim().allow('', null).optional().messages({
        'string.base': 'Hình ảnh phải là chuỗi.'
    }),

    dsThucPham: dsThucPhamSchema.optional(),

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

const Joi = require('joi');
const { normalizeGiaBan } = require('./san-pham-number');
const giaBanSchema = Joi.any()
    .custom((value, helpers) => {
        try {
            return normalizeGiaBan(value);
        } catch {
            return helpers.error('any.invalid');
        }
    })
    .messages({
        'any.invalid': 'Giá bán phải không âm, tối đa 12 số phần nguyên ' + 'và 5 số thập phân.'
    });
const createSchema = Joi.object({
    maSanPham: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã sản phẩm phải là chuỗi.',
        'string.empty': 'Mã sản phẩm không được để trống.',
        'string.max': 'Mã sản phẩm không được vượt quá 50 ký tự.',
        'any.required': 'Mã sản phẩm là bắt buộc.'
    }),
    tenSanPham: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên sản phẩm phải là chuỗi.',
        'string.empty': 'Tên sản phẩm không được để trống.',
        'string.max': 'Tên sản phẩm không được vượt quá 255 ký tự.',
        'any.required': 'Tên sản phẩm là bắt buộc.'
    }),
    nhomSanPhamId: Joi.number().integer().positive().required().messages({
        'number.base': 'Nhóm sản phẩm phải là số.',
        'number.integer': 'Nhóm sản phẩm phải là số nguyên.',
        'number.positive': 'Nhóm sản phẩm không hợp lệ.',
        'any.required': 'Nhóm sản phẩm là bắt buộc.'
    }),
    donViTinhId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Đơn vị tính phải là số.',
        'number.integer': 'Đơn vị tính phải là số nguyên.',
        'number.positive': 'Đơn vị tính không hợp lệ.'
    }),
    giaBan: giaBanSchema.required(),
    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),
    hinhAnh: Joi.string().trim().allow('', null).optional().messages({
        'string.base': 'Hình ảnh phải là chuỗi.'
    }),
    choPhepDat: Joi.boolean().optional().messages({
        'boolean.base': 'Cho phép đặt phải là true hoặc false.'
    }),
    laSanPhamMoi: Joi.boolean().optional().messages({
        'boolean.base': 'Sản phẩm mới phải là true hoặc false.'
    }),
    laSanPhamNoiBat: Joi.boolean().optional().messages({
        'boolean.base': 'Sản phẩm nổi bật phải là true hoặc false.'
    }),
    soLuongToiThieu: Joi.number().positive().optional().messages({
        'number.base': 'Số lượng tối thiểu phải là số.',
        'number.positive': 'Số lượng tối thiểu phải lớn hơn 0.'
    }),
    soLuongToiDa: Joi.number().positive().allow(null).optional().messages({
        'number.base': 'Số lượng tối đa phải là số.',
        'number.positive': 'Số lượng tối đa phải lớn hơn 0.'
    }),
    buocSoLuong: Joi.number().positive().optional().messages({
        'number.base': 'Bước số lượng phải là số.',
        'number.positive': 'Bước số lượng phải lớn hơn 0.'
    }),
    thoiGianChuanBiPhut: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Thời gian chuẩn bị phải là số.',
        'number.integer': 'Thời gian chuẩn bị phải là số nguyên.',
        'number.min': 'Thời gian chuẩn bị không được nhỏ hơn 0.'
    }),
    thuTuHienThi: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Thứ tự hiển thị phải là số.',
        'number.integer': 'Thứ tự hiển thị phải là số nguyên.',
        'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0.'
    }),
    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
});
const updateSchema = Joi.object({
    maSanPham: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã sản phẩm phải là chuỗi.',
        'string.empty': 'Mã sản phẩm không được để trống.',
        'string.max': 'Mã sản phẩm không được vượt quá 50 ký tự.'
    }),
    tenSanPham: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên sản phẩm phải là chuỗi.',
        'string.empty': 'Tên sản phẩm không được để trống.',
        'string.max': 'Tên sản phẩm không được vượt quá 255 ký tự.'
    }),
    nhomSanPhamId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Nhóm sản phẩm phải là số.',
        'number.integer': 'Nhóm sản phẩm phải là số nguyên.',
        'number.positive': 'Nhóm sản phẩm không hợp lệ.'
    }),
    donViTinhId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Đơn vị tính phải là số.',
        'number.integer': 'Đơn vị tính phải là số nguyên.',
        'number.positive': 'Đơn vị tính không hợp lệ.'
    }),
    giaBan: giaBanSchema.required(),
    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),
    hinhAnh: Joi.string().trim().allow('', null).optional().messages({
        'string.base': 'Hình ảnh phải là chuỗi.'
    }),
    choPhepDat: Joi.boolean().optional().messages({
        'boolean.base': 'Cho phép đặt phải là true hoặc false.'
    }),
    laSanPhamMoi: Joi.boolean().optional().messages({
        'boolean.base': 'Sản phẩm mới phải là true hoặc false.'
    }),
    laSanPhamNoiBat: Joi.boolean().optional().messages({
        'boolean.base': 'Sản phẩm nổi bật phải là true hoặc false.'
    }),
    soLuongToiThieu: Joi.number().positive().optional().messages({
        'number.base': 'Số lượng tối thiểu phải là số.',
        'number.positive': 'Số lượng tối thiểu phải lớn hơn 0.'
    }),
    soLuongToiDa: Joi.number().positive().allow(null).optional().messages({
        'number.base': 'Số lượng tối đa phải là số.',
        'number.positive': 'Số lượng tối đa phải lớn hơn 0.'
    }),
    buocSoLuong: Joi.number().positive().optional().messages({
        'number.base': 'Bước số lượng phải là số.',
        'number.positive': 'Bước số lượng phải lớn hơn 0.'
    }),
    thoiGianChuanBiPhut: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Thời gian chuẩn bị phải là số.',
        'number.integer': 'Thời gian chuẩn bị phải là số nguyên.',
        'number.min': 'Thời gian chuẩn bị không được nhỏ hơn 0.'
    }),
    thuTuHienThi: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Thứ tự hiển thị phải là số.',
        'number.integer': 'Thứ tự hiển thị phải là số nguyên.',
        'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0.'
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

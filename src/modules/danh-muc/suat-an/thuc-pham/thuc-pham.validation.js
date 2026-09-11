const Joi = require('joi');

const validateQuyDoi = (value, helpers) => {
    const { donViSoCapId, maDonViSoCap, donViSuDungId, maDonViSuDung, heSoQuyDoi } = value;

    const cungId =
        donViSoCapId !== undefined &&
        donViSoCapId !== null &&
        donViSuDungId !== undefined &&
        donViSuDungId !== null &&
        Number(donViSoCapId) === Number(donViSuDungId);

    const cungMa =
        maDonViSoCap && maDonViSuDung && maDonViSoCap.trim().toUpperCase() === maDonViSuDung.trim().toUpperCase();

    if ((cungId || cungMa) && heSoQuyDoi !== undefined && Number(heSoQuyDoi) !== 1) {
        return helpers.message({
            custom: 'Khi đơn vị sơ cấp và đơn vị sử dụng giống nhau, hệ số quy đổi phải bằng 1.'
        });
    }

    return value;
};

const createSchema = Joi.object({
    maThucPham: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã thực phẩm phải là chuỗi.',
        'string.empty': 'Mã thực phẩm không được để trống.',
        'string.max': 'Mã thực phẩm không được vượt quá 50 ký tự.',
        'any.required': 'Mã thực phẩm là bắt buộc.'
    }),

    tenThucPham: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên thực phẩm phải là chuỗi.',
        'string.empty': 'Tên thực phẩm không được để trống.',
        'string.max': 'Tên thực phẩm không được vượt quá 255 ký tự.',
        'any.required': 'Tên thực phẩm là bắt buộc.'
    }),

    donViSoCapId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID đơn vị sơ cấp phải là số.',
        'number.integer': 'ID đơn vị sơ cấp phải là số nguyên.',
        'number.positive': 'ID đơn vị sơ cấp phải lớn hơn 0.'
    }),

    maDonViSoCap: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã đơn vị sơ cấp phải là chuỗi.',
        'string.empty': 'Mã đơn vị sơ cấp không được để trống.',
        'string.max': 'Mã đơn vị sơ cấp không được vượt quá 50 ký tự.'
    }),

    donViSuDungId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID đơn vị sử dụng phải là số.',
        'number.integer': 'ID đơn vị sử dụng phải là số nguyên.',
        'number.positive': 'ID đơn vị sử dụng phải lớn hơn 0.'
    }),

    maDonViSuDung: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã đơn vị sử dụng phải là chuỗi.',
        'string.empty': 'Mã đơn vị sử dụng không được để trống.',
        'string.max': 'Mã đơn vị sử dụng không được vượt quá 50 ký tự.'
    }),

    heSoQuyDoi: Joi.number().positive().default(1).messages({
        'number.base': 'Hệ số quy đổi phải là số.',
        'number.positive': 'Hệ số quy đổi phải lớn hơn 0.'
    }),

    quyCach: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Quy cách phải là chuỗi.',
        'string.max': 'Quy cách không được vượt quá 255 ký tự.'
    }),

    giaNhap: Joi.number().min(0).allow(null).optional().messages({
        'number.base': 'Giá nhập phải là số.',
        'number.min': 'Giá nhập phải lớn hơn hoặc bằng 0.'
    }),

    tyLeHaoHutDuKien: Joi.number().min(0).max(100).default(0).messages({
        'number.base': 'Tỷ lệ hao hụt dự kiến phải là số.',
        'number.min': 'Tỷ lệ hao hụt dự kiến phải lớn hơn hoặc bằng 0.',
        'number.max': 'Tỷ lệ hao hụt dự kiến không được vượt quá 100.'
    }),

    xuatXuId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID quốc gia xuất xứ phải là số.',
        'number.integer': 'ID quốc gia xuất xứ phải là số nguyên.',
        'number.positive': 'ID quốc gia xuất xứ phải lớn hơn 0.'
    }),

    maXuatXu: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã quốc gia xuất xứ phải là chuỗi.',
        'string.max': 'Mã quốc gia xuất xứ không được vượt quá 50 ký tự.'
    }),

    dieuKienBaoQuan: Joi.number().integer().valid(10, 20, 30, 40).allow(null).optional().messages({
        'number.base': 'Điều kiện bảo quản phải là số.',
        'number.integer': 'Điều kiện bảo quản phải là số nguyên.',
        'any.only': 'Điều kiện bảo quản không hợp lệ.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    ghiChu: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 500 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('donViSoCapId', 'maDonViSoCap')
    .or('donViSuDungId', 'maDonViSuDung')
    .custom(validateQuyDoi)
    .messages({
        'object.missing': 'Phải truyền đầy đủ đơn vị sơ cấp và đơn vị sử dụng.'
    });

const updateSchema = Joi.object({
    maThucPham: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã thực phẩm phải là chuỗi.',
        'string.empty': 'Mã thực phẩm không được để trống.',
        'string.max': 'Mã thực phẩm không được vượt quá 50 ký tự.'
    }),

    tenThucPham: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên thực phẩm phải là chuỗi.',
        'string.empty': 'Tên thực phẩm không được để trống.',
        'string.max': 'Tên thực phẩm không được vượt quá 255 ký tự.'
    }),

    donViSoCapId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID đơn vị sơ cấp phải là số.',
        'number.integer': 'ID đơn vị sơ cấp phải là số nguyên.',
        'number.positive': 'ID đơn vị sơ cấp phải lớn hơn 0.'
    }),

    maDonViSoCap: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã đơn vị sơ cấp phải là chuỗi.',
        'string.empty': 'Mã đơn vị sơ cấp không được để trống.',
        'string.max': 'Mã đơn vị sơ cấp không được vượt quá 50 ký tự.'
    }),

    donViSuDungId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID đơn vị sử dụng phải là số.',
        'number.integer': 'ID đơn vị sử dụng phải là số nguyên.',
        'number.positive': 'ID đơn vị sử dụng phải lớn hơn 0.'
    }),

    maDonViSuDung: Joi.string().trim().max(50).allow(null).optional().messages({
        'string.base': 'Mã đơn vị sử dụng phải là chuỗi.',
        'string.empty': 'Mã đơn vị sử dụng không được để trống.',
        'string.max': 'Mã đơn vị sử dụng không được vượt quá 50 ký tự.'
    }),

    heSoQuyDoi: Joi.number().positive().optional().messages({
        'number.base': 'Hệ số quy đổi phải là số.',
        'number.positive': 'Hệ số quy đổi phải lớn hơn 0.'
    }),

    quyCach: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Quy cách phải là chuỗi.',
        'string.max': 'Quy cách không được vượt quá 255 ký tự.'
    }),

    giaNhap: Joi.number().min(0).allow(null).optional().messages({
        'number.base': 'Giá nhập phải là số.',
        'number.min': 'Giá nhập phải lớn hơn hoặc bằng 0.'
    }),

    tyLeHaoHutDuKien: Joi.number().min(0).max(100).allow(null).optional().messages({
        'number.base': 'Tỷ lệ hao hụt dự kiến phải là số.',
        'number.min': 'Tỷ lệ hao hụt dự kiến phải lớn hơn hoặc bằng 0.',
        'number.max': 'Tỷ lệ hao hụt dự kiến không được vượt quá 100.'
    }),

    xuatXuId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID quốc gia xuất xứ phải là số.',
        'number.integer': 'ID quốc gia xuất xứ phải là số nguyên.',
        'number.positive': 'ID quốc gia xuất xứ phải lớn hơn 0.'
    }),

    maXuatXu: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã quốc gia xuất xứ phải là chuỗi.',
        'string.max': 'Mã quốc gia xuất xứ không được vượt quá 50 ký tự.'
    }),

    dieuKienBaoQuan: Joi.number().integer().valid(10, 20, 30, 40).allow(null).optional().messages({
        'number.base': 'Điều kiện bảo quản phải là số.',
        'number.integer': 'Điều kiện bảo quản phải là số nguyên.',
        'any.only': 'Điều kiện bảo quản không hợp lệ.'
    }),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',
        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
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
    .custom(validateQuyDoi)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

module.exports = {
    createSchema,
    updateSchema
};

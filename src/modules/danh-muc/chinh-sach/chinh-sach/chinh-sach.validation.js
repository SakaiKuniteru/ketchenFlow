const Joi = require('joi');

const { loaiDoiTuong: danhSachLoaiDoiTuong } = require('../../../../constants/enums');

const danhSachGiaTriLoaiDoiTuong = danhSachLoaiDoiTuong.map((item) => Number(item.value));

const LOAI_DOI_TUONG = {
    VAI_TRO: 10,
    CHUC_VU: 20,
    TAI_KHOAN: 30
};

function schemaDanhSachId(label) {
    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .messages({
                    'number.base': `ID ${label} phải là số.`,

                    'number.integer': `ID ${label} phải là số nguyên.`,

                    'number.positive': `ID ${label} phải lớn hơn 0.`
                })
        )
        .unique()
        .messages({
            'array.base': `Danh sách ${label} phải là một mảng.`,

            'array.unique': `Danh sách ${label} không được chứa ID trùng nhau.`
        });
}

function validatePhamVi(value, helpers) {
    const loai = Number(value.loaiChinhSach);

    if (!Number.isInteger(loai)) {
        return value;
    }

    const dsVaiTroId = Array.isArray(value.dsVaiTroId) ? value.dsVaiTroId : [];

    const dsChucVuId = Array.isArray(value.dsChucVuId) ? value.dsChucVuId : [];

    const dsTaiKhoanId = Array.isArray(value.dsTaiKhoanId) ? value.dsTaiKhoanId : [];

    switch (loai) {
        case LOAI_DOI_TUONG.VAI_TRO:
            if (dsVaiTroId.length === 0) {
                return helpers.message({
                    custom: 'Vui lòng chọn ít nhất một vai trò áp dụng.'
                });
            }

            if (dsChucVuId.length > 0 || dsTaiKhoanId.length > 0) {
                return helpers.message({
                    custom: 'Chính sách loại Vai trò chỉ được phép chọn danh sách vai trò.'
                });
            }

            break;

        case LOAI_DOI_TUONG.CHUC_VU:
            if (dsChucVuId.length === 0) {
                return helpers.message({
                    custom: 'Vui lòng chọn ít nhất một chức vụ áp dụng.'
                });
            }

            if (dsVaiTroId.length > 0 || dsTaiKhoanId.length > 0) {
                return helpers.message({
                    custom: 'Chính sách loại Chức vụ chỉ được phép chọn danh sách chức vụ.'
                });
            }

            break;

        case LOAI_DOI_TUONG.TAI_KHOAN:
            if (dsTaiKhoanId.length === 0) {
                return helpers.message({
                    custom: 'Vui lòng chọn ít nhất một tài khoản áp dụng.'
                });
            }

            if (dsVaiTroId.length > 0 || dsChucVuId.length > 0) {
                return helpers.message({
                    custom: 'Chính sách loại Tài khoản chỉ được phép chọn danh sách tài khoản.'
                });
            }

            break;
    }

    return value;
}

const createSchema = Joi.object({
    maChinhSach: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã chính sách phải là chuỗi.',

        'string.empty': 'Mã chính sách không được để trống.',

        'string.max': 'Mã chính sách không được vượt quá 50 ký tự.',

        'any.required': 'Mã chính sách là bắt buộc.'
    }),

    tenChinhSach: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên chính sách phải là chuỗi.',

        'string.empty': 'Tên chính sách không được để trống.',

        'string.max': 'Tên chính sách không được vượt quá 255 ký tự.',

        'any.required': 'Tên chính sách là bắt buộc.'
    }),

    loaiChinhSach: Joi.number()
        .integer()
        .valid(...danhSachGiaTriLoaiDoiTuong)
        .required()
        .messages({
            'number.base': 'Loại chính sách phải là số.',

            'number.integer': 'Loại chính sách phải là số nguyên.',

            'any.only': `Loại chính sách chỉ được là ${danhSachGiaTriLoaiDoiTuong.join(', ')}.`,

            'any.required': 'Loại chính sách là bắt buộc.'
        }),

    dsVoucherId: schemaDanhSachId('voucher').min(1).required().messages({
        'array.min': 'Vui lòng chọn ít nhất một voucher.',

        'any.required': 'Danh sách voucher là bắt buộc.'
    }),

    dsVaiTroId: schemaDanhSachId('vai trò').default([]),

    dsChucVuId: schemaDanhSachId('chức vụ').default([]),

    dsTaiKhoanId: schemaDanhSachId('tài khoản').default([]),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',

        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    mucDoUuTien: Joi.number().integer().positive().required().messages({
        'number.base': 'Mức độ ưu tiên phải là số.',

        'number.integer': 'Mức độ ưu tiên phải là số nguyên.',

        'number.positive': 'Mức độ ưu tiên phải lớn hơn 0.',

        'any.required': 'Mức độ ưu tiên là bắt buộc.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
}).custom(validatePhamVi);

const updateSchema = Joi.object({
    maChinhSach: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã chính sách phải là chuỗi.',

        'string.empty': 'Mã chính sách không được để trống.',

        'string.max': 'Mã chính sách không được vượt quá 50 ký tự.'
    }),

    tenChinhSach: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên chính sách phải là chuỗi.',

        'string.empty': 'Tên chính sách không được để trống.',

        'string.max': 'Tên chính sách không được vượt quá 255 ký tự.'
    }),

    loaiChinhSach: Joi.number()
        .integer()
        .valid(...danhSachGiaTriLoaiDoiTuong)
        .optional()
        .messages({
            'number.base': 'Loại chính sách phải là số.',

            'number.integer': 'Loại chính sách phải là số nguyên.',

            'any.only': `Loại chính sách chỉ được là ${danhSachGiaTriLoaiDoiTuong.join(', ')}.`
        }),

    dsVoucherId: schemaDanhSachId('voucher').min(1).optional().messages({
        'array.min': 'Vui lòng chọn ít nhất một voucher.'
    }),

    dsVaiTroId: schemaDanhSachId('vai trò').optional(),

    dsChucVuId: schemaDanhSachId('chức vụ').optional(),

    dsTaiKhoanId: schemaDanhSachId('tài khoản').optional(),

    moTa: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Mô tả phải là chuỗi.',

        'string.max': 'Mô tả không được vượt quá 500 ký tự.'
    }),

    mucDoUuTien: Joi.number().integer().positive().optional().messages({
        'number.base': 'Mức độ ưu tiên phải là số.',

        'number.integer': 'Mức độ ưu tiên phải là số nguyên.',

        'number.positive': 'Mức độ ưu tiên phải lớn hơn 0.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .min(1)
    .custom(validatePhamVi)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

module.exports = {
    createSchema,
    updateSchema
};

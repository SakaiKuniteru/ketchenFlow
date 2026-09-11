const Joi = require('joi');

const { loaiDoiTuong: danhSachLoaiDoiTuong } = require('../../../constants/enums');

const danhSachGiaTriLoaiDoiTuong = danhSachLoaiDoiTuong.map((item) => Number(item.value));

const doiTuongSchema = Joi.object({
    loaiDoiTuong: Joi.number()
        .integer()
        .valid(...danhSachGiaTriLoaiDoiTuong)
        .required()
        .messages({
            'number.base': 'Loại đối tượng phải là số.',

            'number.integer': 'Loại đối tượng phải là số nguyên.',

            'any.only': `Loại đối tượng chỉ được là ${danhSachGiaTriLoaiDoiTuong.join(', ')}.`,

            'any.required': 'Loại đối tượng là bắt buộc.'
        }),

    doiTuongId: Joi.number().integer().positive().required().messages({
        'number.base': 'ID đối tượng phải là số.',

        'number.integer': 'ID đối tượng phải là số nguyên.',

        'number.positive': 'ID đối tượng phải lớn hơn 0.',

        'any.required': 'ID đối tượng là bắt buộc.'
    })
});

function validatePhamVi(value, helpers) {
    const guiTatCa = value.guiTatCa === true;

    const doiTuong = Array.isArray(value.doiTuong) ? value.doiTuong : [];

    if (guiTatCa && doiTuong.length > 0) {
        return helpers.message({
            custom: 'Thông báo gửi tất cả không được chọn thêm đối tượng nhận.'
        });
    }

    if (value.guiTatCa === false && doiTuong.length === 0) {
        return helpers.message({
            custom: 'Vui lòng chọn ít nhất một đối tượng nhận thông báo.'
        });
    }

    if (value.thamChieuId && !value.loaiThamChieu) {
        return helpers.message({
            custom: 'Loại tham chiếu không được để trống khi có ID tham chiếu.'
        });
    }

    return value;
}

const createSchema = Joi.object({
    tieuDe: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tiêu đề phải là chuỗi.',

        'string.empty': 'Tiêu đề không được để trống.',

        'string.max': 'Tiêu đề không được vượt quá 255 ký tự.',

        'any.required': 'Tiêu đề là bắt buộc.'
    }),

    noiDung: Joi.string().trim().required().messages({
        'string.base': 'Nội dung phải là chuỗi.',

        'string.empty': 'Nội dung không được để trống.',

        'any.required': 'Nội dung là bắt buộc.'
    }),

    guiTatCa: Joi.boolean().required().messages({
        'boolean.base': 'Gửi tất cả phải là true hoặc false.',

        'any.required': 'Phạm vi gửi là bắt buộc.'
    }),

    loaiThamChieu: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Loại tham chiếu phải là chuỗi.',

        'string.max': 'Loại tham chiếu không được vượt quá 100 ký tự.'
    }),

    thamChieuId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID tham chiếu phải là số.',

        'number.integer': 'ID tham chiếu phải là số nguyên.',

        'number.positive': 'ID tham chiếu phải lớn hơn 0.'
    }),

    duongDan: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Đường dẫn phải là chuỗi.',

        'string.max': 'Đường dẫn không được vượt quá 500 ký tự.'
    }),

    doiTuong: Joi.array()
        .items(doiTuongSchema)
        .unique(
            (a, b) => Number(a.loaiDoiTuong) === Number(b.loaiDoiTuong) && Number(a.doiTuongId) === Number(b.doiTuongId)
        )
        .default([])
        .messages({
            'array.base': 'Danh sách đối tượng phải là một mảng.',

            'array.unique': 'Danh sách đối tượng không được chứa đối tượng trùng nhau.'
        })
}).custom(validatePhamVi);

const updateSchema = Joi.object({
    tieuDe: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tiêu đề phải là chuỗi.',

        'string.empty': 'Tiêu đề không được để trống.',

        'string.max': 'Tiêu đề không được vượt quá 255 ký tự.'
    }),

    noiDung: Joi.string().trim().optional(),

    guiTatCa: Joi.boolean().optional(),

    loaiThamChieu: Joi.string().trim().max(100).allow('', null).optional(),

    thamChieuId: Joi.number().integer().positive().allow(null).optional(),

    duongDan: Joi.string().trim().max(500).allow('', null).optional(),

    doiTuong: Joi.array()
        .items(doiTuongSchema)
        .unique(
            (a, b) => Number(a.loaiDoiTuong) === Number(b.loaiDoiTuong) && Number(a.doiTuongId) === Number(b.doiTuongId)
        )
        .optional()
})
    .min(1)
    .custom(validatePhamViUpdate)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

function validatePhamViUpdate(value, helpers) {
    const doiTuong = Array.isArray(value.doiTuong) ? value.doiTuong : null;

    if (value.guiTatCa === true && doiTuong && doiTuong.length > 0) {
        return helpers.message({
            custom: 'Thông báo gửi tất cả không được chọn thêm đối tượng nhận.'
        });
    }

    if (value.guiTatCa === false && doiTuong && doiTuong.length === 0) {
        return helpers.message({
            custom: 'Vui lòng chọn ít nhất một đối tượng nhận thông báo.'
        });
    }

    if (
        value.thamChieuId !== undefined &&
        value.thamChieuId !== null &&
        (value.loaiThamChieu === null || value.loaiThamChieu === '')
    ) {
        return helpers.message({
            custom: 'Loại tham chiếu không được để trống khi có ID tham chiếu.'
        });
    }

    return value;
}

module.exports = {
    createSchema,
    updateSchema
};

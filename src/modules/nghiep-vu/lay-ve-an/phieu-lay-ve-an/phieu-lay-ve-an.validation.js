const Joi = require('joi');

const {
    gioiTinh: dsGioiTinh,
    doiTuongLayVe: dsDoiTuongLayVe,
    phuongThucThanhToan: dsPhuongThucThanhToan
} = require('../../../../constants/enums');

const giaTriGioiTinh = dsGioiTinh.map((item) => Number(item.value));

const giaTriDoiTuongLayVe = dsDoiTuongLayVe.map((item) => Number(item.value));

const giaTriPhuongThucThanhToan = dsPhuongThucThanhToan.map((item) => Number(item.value));

const createSchema = Joi.object({
    thucDonNgayId: Joi.number().integer().positive().required().messages({
        'number.base': 'Thực đơn ngày phải là số.',
        'number.integer': 'Thực đơn ngày phải là số nguyên.',
        'number.positive': 'Thực đơn ngày không hợp lệ.',
        'any.required': 'Thực đơn ngày là bắt buộc.'
    }),

    doiTuongLayVe: Joi.number()
        .integer()
        .valid(...giaTriDoiTuongLayVe)
        .required()
        .messages({
            'number.base': 'Đối tượng lấy vé phải là số.',
            'number.integer': 'Đối tượng lấy vé phải là số nguyên.',
            'any.only': 'Đối tượng lấy vé không hợp lệ.',
            'any.required': 'Đối tượng lấy vé là bắt buộc.'
        }),

    nhanVienId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'Nhân viên phải là số.',
        'number.integer': 'Nhân viên phải là số nguyên.',
        'number.positive': 'Nhân viên không hợp lệ.'
    }),

    hoTenNguoiLayVe: Joi.string().trim().max(150).allow('', null).optional().messages({
        'string.base': 'Họ tên người lấy vé phải là chuỗi.',
        'string.max': 'Họ tên người lấy vé không được vượt quá 150 ký tự.'
    }),

    ngaySinhNguoiLayVe: Joi.date().iso().allow(null).optional().messages({
        'date.base': 'Ngày sinh người lấy vé không hợp lệ.',
        'date.format': 'Ngày sinh người lấy vé không đúng định dạng.'
    }),

    gioiTinhNguoiLayVe: Joi.number()
        .integer()
        .valid(...giaTriGioiTinh)
        .allow(null)
        .optional()
        .messages({
            'number.base': 'Giới tính phải là số.',
            'number.integer': 'Giới tính phải là số nguyên.',
            'any.only': 'Giới tính không hợp lệ.'
        }),

    soDienThoaiNguoiLayVe: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Số điện thoại phải là chuỗi.',
        'string.max': 'Số điện thoại không được vượt quá 20 ký tự.'
    }),

    diaChiNguoiLayVe: Joi.string().trim().allow('', null).optional().messages({
        'string.base': 'Địa chỉ phải là chuỗi.'
    }),

    donViNguoiLayVe: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Đơn vị phải là chuỗi.',
        'string.max': 'Đơn vị không được vượt quá 255 ký tự.'
    }),

    khachLauDai: Joi.boolean().optional().messages({
        'boolean.base': 'Khách lâu dài phải là true hoặc false.'
    }),

    soLuong: Joi.number().integer().min(1).required().messages({
        'number.base': 'Số lượng vé phải là số.',
        'number.integer': 'Số lượng vé phải là số nguyên.',
        'number.min': 'Số lượng vé phải lớn hơn 0.',
        'any.required': 'Số lượng vé là bắt buộc.'
    }),

    ghiChu: Joi.string().trim().max(1000).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 1000 ký tự.'
    }),

    phuongThucThanhToan: Joi.number()
        .integer()
        .valid(...giaTriPhuongThucThanhToan)
        .allow(null)
        .optional()
        .messages({
            'number.base': 'Phương thức thanh toán phải là số.',
            'number.integer': 'Phương thức thanh toán phải là số nguyên.',
            'any.only': 'Phương thức thanh toán không hợp lệ.'
        })
});

const updateSchema = Joi.object({
    thucDonNgayId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Thực đơn ngày phải là số.',
        'number.integer': 'Thực đơn ngày phải là số nguyên.',
        'number.positive': 'Thực đơn ngày không hợp lệ.'
    }),

    doiTuongLayVe: Joi.number()
        .integer()
        .valid(...giaTriDoiTuongLayVe)
        .optional()
        .messages({
            'number.base': 'Đối tượng lấy vé phải là số.',
            'number.integer': 'Đối tượng lấy vé phải là số nguyên.',
            'any.only': 'Đối tượng lấy vé không hợp lệ.'
        }),

    nhanVienId: Joi.number().integer().positive().allow(null).optional(),

    hoTenNguoiLayVe: Joi.string().trim().max(150).allow('', null).optional(),

    ngaySinhNguoiLayVe: Joi.date().iso().allow(null).optional(),

    gioiTinhNguoiLayVe: Joi.number()
        .integer()
        .valid(...giaTriGioiTinh)
        .allow(null)
        .optional(),

    soDienThoaiNguoiLayVe: Joi.string().trim().max(20).allow('', null).optional(),

    diaChiNguoiLayVe: Joi.string().trim().allow('', null).optional(),

    donViNguoiLayVe: Joi.string().trim().max(255).allow('', null).optional(),

    khachLauDai: Joi.boolean().optional(),

    soLuong: Joi.number().integer().min(1).optional(),

    ghiChu: Joi.string().trim().max(1000).allow('', null).optional(),

    phuongThucThanhToan: Joi.number()
        .integer()
        .valid(...giaTriPhuongThucThanhToan)
        .allow(null)
        .optional()
})
    .min(1)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

const huySchema = Joi.object({
    lyDoHuy: Joi.string().trim().max(500).required().messages({
        'string.base': 'Lý do hủy phải là chuỗi.',
        'string.empty': 'Lý do hủy không được để trống.',
        'string.max': 'Lý do hủy không được vượt quá 500 ký tự.',
        'any.required': 'Lý do hủy là bắt buộc.'
    })
});

module.exports = {
    createSchema,
    updateSchema,
    huySchema
};

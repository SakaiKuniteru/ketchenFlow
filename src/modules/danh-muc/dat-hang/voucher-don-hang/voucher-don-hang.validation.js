"use strict";

const Joi = require("joi");

const {
    loaiGiamVoucherDonHang,
    phamViApDungVoucherDonHang
} = require("../../../../constants/enums");

const layDanhSachGiaTri = danhSach =>
    danhSach.map(item => Number(item.value));

const danhSachIdSchema = Joi.array()
    .items(
        Joi.number()
            .integer()
            .positive()
    )
    .unique();

const fields = {
    maVoucher: Joi.string()
        .trim()
        .max(50),

    tenVoucher: Joi.string()
        .trim()
        .max(255),

    moTa: Joi.string()
        .trim()
        .max(1000)
        .allow("", null),

    loaiGiam: Joi.number()
        .integer()
        .valid(
            ...layDanhSachGiaTri(
                loaiGiamVoucherDonHang
            )
        ),

    giaTri: Joi.number()
        .positive(),

    giamToiDa: Joi.number()
        .min(0)
        .allow(null),

    giaTriDonHangToiThieu: Joi.number()
        .min(0),

    soLuongPhatHanh: Joi.number()
        .integer()
        .positive()
        .allow(null),

    soLuotMoiNhanVien: Joi.number()
        .integer()
        .positive()
        .allow(null),

    phamViApDung: Joi.number()
        .integer()
        .valid(
            ...layDanhSachGiaTri(
                phamViApDungVoucherDonHang
            )
        ),

    choPhepDungChung: Joi.boolean(),

    tuDongApDung: Joi.boolean(),

    thoiGianBatDau: Joi.date()
        .iso(),

    thoiGianKetThuc: Joi.date()
        .iso(),

    active: Joi.boolean(),

    nhomSanPhamIds: danhSachIdSchema,

    sanPhamIds: danhSachIdSchema,

    coSoIds: danhSachIdSchema,

    phongBanIds: danhSachIdSchema,

    chucVuIds: danhSachIdSchema,

    nhanVienIds: danhSachIdSchema
};

const createSchema = Joi.object({
    maVoucher: fields.maVoucher
        .required(),

    tenVoucher: fields.tenVoucher
        .required(),

    moTa: fields.moTa
        .optional(),

    loaiGiam: fields.loaiGiam
        .required(),

    giaTri: fields.giaTri
        .required(),

    giamToiDa: fields.giamToiDa
        .optional(),

    giaTriDonHangToiThieu:
        fields.giaTriDonHangToiThieu
            .optional(),

    soLuongPhatHanh:
        fields.soLuongPhatHanh
            .optional(),

    soLuotMoiNhanVien:
        fields.soLuotMoiNhanVien
            .optional(),

    phamViApDung: fields.phamViApDung
        .required(),

    choPhepDungChung:
        fields.choPhepDungChung
            .optional(),

    tuDongApDung:
        fields.tuDongApDung
            .optional(),

    thoiGianBatDau:
        fields.thoiGianBatDau
            .required(),

    thoiGianKetThuc:
        fields.thoiGianKetThuc
            .greater(
                Joi.ref("thoiGianBatDau")
            )
            .required(),

    active: fields.active
        .optional(),

    nhomSanPhamIds:
        fields.nhomSanPhamIds
            .optional(),

    sanPhamIds:
        fields.sanPhamIds
            .optional(),

    coSoIds:
        fields.coSoIds
            .optional(),

    phongBanIds:
        fields.phongBanIds
            .optional(),

    chucVuIds:
        fields.chucVuIds
            .optional(),

    nhanVienIds:
        fields.nhanVienIds
            .optional()
});

const updateSchema = Joi.object(
    Object.fromEntries(
        Object.entries(fields).map(
            ([key, schema]) => [
                key,
                schema.optional()
            ]
        )
    )
)
    .min(1)
    .messages({
        "object.min":
            "Phải truyền ít nhất một trường cần cập nhật."
    });

module.exports = {
    createSchema,
    updateSchema
};
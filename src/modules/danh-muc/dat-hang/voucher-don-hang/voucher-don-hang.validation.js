"use strict";

const Joi = require("joi");

const ids = Joi.array()
    .items(
        Joi.number()
            .integer()
            .positive()
    )
    .unique();

const f = {
    maVoucher: Joi.string().trim().max(50),
    tenVoucher: Joi.string().trim().max(255),
    moTa: Joi.string().trim().max(1000).allow("", null),
    loaiGiam: Joi.number().integer().valid(10, 20, 30),
    giaTri: Joi.number().positive(),
    giamToiDa: Joi.number().min(0).allow(null),
    giaTriDonHangToiThieu: Joi.number().min(0),
    soLuongPhatHanh: Joi.number().integer().positive().allow(null),
    soLuotMoiNhanVien: Joi.number().integer().positive().allow(null),
    phamViApDung: Joi.number().integer().valid(10, 20, 30),
    choPhepDungChung: Joi.boolean(),
    tuDongApDung: Joi.boolean(),
    thoiGianBatDau: Joi.date().iso(),
    thoiGianKetThuc: Joi.date().iso(),
    active: Joi.boolean(),
    nhomSanPhamIds: ids,
    sanPhamIds: ids,
    coSoIds: ids,
    phongBanIds: ids,
    chucVuIds: ids,
    nhanVienIds: ids
};

const createSchema = Joi.object({
    maVoucher: f.maVoucher.required(),
    tenVoucher: f.tenVoucher.required(),
    moTa: f.moTa.optional(),
    loaiGiam: f.loaiGiam.required(),
    giaTri: f.giaTri.required(),
    giamToiDa: f.giamToiDa.optional(),
    giaTriDonHangToiThieu: f.giaTriDonHangToiThieu.optional(),
    soLuongPhatHanh: f.soLuongPhatHanh.optional(),
    soLuotMoiNhanVien: f.soLuotMoiNhanVien.optional(),
    phamViApDung: f.phamViApDung.required(),
    choPhepDungChung: f.choPhepDungChung.optional(),
    tuDongApDung: f.tuDongApDung.optional(),
    thoiGianBatDau: f.thoiGianBatDau.required(),
    thoiGianKetThuc: f.thoiGianKetThuc
        .greater(
            Joi.ref("thoiGianBatDau")
        )
        .required(),
    active: f.active.optional(),
    nhomSanPhamIds: f.nhomSanPhamIds.optional(),
    sanPhamIds: f.sanPhamIds.optional(),
    coSoIds: f.coSoIds.optional(),
    phongBanIds: f.phongBanIds.optional(),
    chucVuIds: f.chucVuIds.optional(),
    nhanVienIds: f.nhanVienIds.optional()
});

const updateSchema = Joi.object(
    Object.fromEntries(
        Object.entries(f).map(
            ([k, v]) => [k, v.optional()]
        )
    )
).min(1);

module.exports = {
    createSchema,
    updateSchema
};
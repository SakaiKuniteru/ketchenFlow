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

function normalizeVoucherDecimal(value) {
    if (
        typeof value !== "string" &&
        typeof value !== "number"
    ) {
        throw new Error("Giá trị phải là số hoặc chuỗi số chuẩn.");
    }

    const text = String(value).trim();

    if (!/^\d+(?:\.\d+)?$/.test(text)) {
        throw new Error(
            "Dùng dấu chấm thập phân, không có dấu phân nhóm."
        );
    }

    let [whole, fraction = ""] = text.split(".");

    whole = whole.replace(/^0+(?=\d)/, "");
    fraction = fraction.replace(/0+$/, "");

    if (whole.length > 12 || fraction.length > 5) {
        throw new Error(
            "Tối đa 12 chữ số nguyên và 5 chữ số thập phân."
        );
    }

    return whole + (fraction ? "." + fraction : "");
}

function decimalField(label, positive = false) {
    return Joi.any()
        .custom((value, helpers) => {
            try {
                const decimal = normalizeVoucherDecimal(value);

                if (positive && decimal === "0") {
                    return helpers.error("any.invalid");
                }

                // Giữ chuỗi chuẩn, không ép sang Number.
                return decimal;
            } catch {
                return helpers.error("any.invalid");
            }
        })
        .label(label)
        .messages({
            "any.invalid":
                label + " phải " +
                (positive ? "lớn hơn 0" : "lớn hơn hoặc bằng 0") +
                ", tối đa 12 chữ số nguyên và 5 chữ số thập phân."
        });
}

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

    giaTri:
        decimalField("Giá trị", true),

    giamToiDa:
        decimalField("Giảm tối đa")
            .allow(null),

    giaTriDonHangToiThieu:
        decimalField("Đơn hàng tối thiểu"),

    soLuongPhatHanh:
        Joi.number()
            .integer()
            .positive()
            .max(2147483647)
            .allow(null),

    soLuotMoiNhanVien:
        Joi.number()
            .integer()
            .positive()
            .max(2147483647)
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

    nhaAnIds: danhSachIdSchema,

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

    nhaAnIds:
        fields.nhaAnIds
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
    updateSchema,
    normalizeVoucherDecimal
};
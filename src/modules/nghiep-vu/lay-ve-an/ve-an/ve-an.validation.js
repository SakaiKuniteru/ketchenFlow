const Joi = require("joi");

const kiemTraSchema = Joi.object({
    qrToken: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
            "string.base": "QR token phải là chuỗi.",
            "string.empty": "QR token không được để trống.",
            "string.max": "QR token không được vượt quá 255 ký tự.",
            "any.required": "QR token là bắt buộc."
        })
});

const xacNhanSuDungSchema = Joi.object({
    qrToken: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
            "string.base": "QR token phải là chuỗi.",
            "string.empty": "QR token không được để trống.",
            "string.max": "QR token không được vượt quá 255 ký tự.",
            "any.required": "QR token là bắt buộc."
        })
});

const huySchema = Joi.object({
    lyDoHuy: Joi.string()
        .trim()
        .max(500)
        .required()
        .messages({
            "string.base": "Lý do hủy phải là chuỗi.",
            "string.empty": "Lý do hủy không được để trống.",
            "string.max": "Lý do hủy không được vượt quá 500 ký tự.",
            "any.required": "Lý do hủy là bắt buộc."
        })
});

const danhSachVeIdsSchema =
    Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .required()
        )
        .min(1)
        .max(200)
        .unique()
        .required()
        .messages({

            "array.base":
                "Danh sách vé phải là mảng.",

            "array.min":
                "Phải chọn ít nhất một vé.",

            "array.max":
                "Mỗi lần chỉ được xử lý tối đa 200 vé.",

            "array.unique":
                "Danh sách vé không được trùng lặp.",

            "any.required":
                "Danh sách vé là bắt buộc."

        });


const xacNhanSuDungHangLoatSchema =
    Joi.object({

        ids:
            danhSachVeIdsSchema

    });


const huyHangLoatSchema =
    Joi.object({

        ids:
            danhSachVeIdsSchema,

        lyDoHuy:
            Joi.string()
                .trim()
                .max(500)
                .required()
                .messages({

                    "string.base":
                        "Lý do hủy phải là chuỗi.",

                    "string.empty":
                        "Lý do hủy không được để trống.",

                    "string.max":
                        "Lý do hủy không được vượt quá 500 ký tự.",

                    "any.required":
                        "Lý do hủy là bắt buộc."

                })

    });

const huyXacNhanHangLoatSchema =
    Joi.object({

        ids:
            danhSachVeIdsSchema

    });


const huyHuyHangLoatSchema =
    Joi.object({

        ids:
            danhSachVeIdsSchema

    });

module.exports = {

    kiemTraSchema,

    xacNhanSuDungSchema,

    huySchema,

    xacNhanSuDungHangLoatSchema,

    huyHangLoatSchema,
    huyXacNhanHangLoatSchema,
    huyHuyHangLoatSchema

};
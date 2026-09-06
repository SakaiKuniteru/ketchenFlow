const Joi = require("joi");

const {
    phuongThucThanhToan:
        dsPhuongThucThanhToan,

    loaiGiaoDich:
        dsLoaiGiaoDich

} = require(
    "../../../../constants/enums"
);


const giaTriPhuongThucThanhToan =
    dsPhuongThucThanhToan.map(
        item =>
            Number(
                item.value
            )
    );


const giaTriLoaiGiaoDich =
    dsLoaiGiaoDich.map(
        item =>
            Number(
                item.value
            )
    );


const createSchema =
    Joi.object({

        phieuLayVeId:
            Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    "number.base":
                        "Phiếu lấy vé phải là số.",
                    "number.integer":
                        "Phiếu lấy vé phải là số nguyên.",
                    "number.positive":
                        "Phiếu lấy vé không hợp lệ.",
                    "any.required":
                        "Phiếu lấy vé là bắt buộc."
                }),

        phuongThuc:
            Joi.number()
                .integer()
                .valid(
                    ...giaTriPhuongThucThanhToan
                )
                .required()
                .messages({
                    "number.base":
                        "Phương thức thanh toán phải là số.",
                    "number.integer":
                        "Phương thức thanh toán phải là số nguyên.",
                    "any.only":
                        "Phương thức thanh toán không hợp lệ.",
                    "any.required":
                        "Phương thức thanh toán là bắt buộc."
                }),

        maThamChieu:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional(),

        maChuanChi:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional()

    });


const taoQrSchema =
    Joi.object({

        phieuLayVeId:
            Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    "number.base":
                        "Phiếu lấy vé phải là số.",
                    "number.integer":
                        "Phiếu lấy vé phải là số nguyên.",
                    "number.positive":
                        "Phiếu lấy vé không hợp lệ.",
                    "any.required":
                        "Phiếu lấy vé là bắt buộc."
                })

    });


const huyQrSchema =
    Joi.object({

        noiDung:
            Joi.string()
                .trim()
                .max(
                    500
                )
                .allow(
                    "",
                    null
                )
                .optional()

    });


const xacNhanSchema =
    Joi.object({

        maThamChieu:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional(),

        maChuanChi:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional()

    });


const hoanTienSchema =
    Joi.object({

        phieuLayVeId:
            Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    "number.base":
                        "Phiếu lấy vé phải là số.",
                    "number.integer":
                        "Phiếu lấy vé phải là số nguyên.",
                    "number.positive":
                        "Phiếu lấy vé không hợp lệ.",
                    "any.required":
                        "Phiếu lấy vé là bắt buộc."
                }),

        phuongThuc:
            Joi.number()
                .integer()
                .valid(
                    ...giaTriPhuongThucThanhToan
                )
                .required()
                .messages({
                    "number.base":
                        "Phương thức hoàn tiền phải là số.",
                    "number.integer":
                        "Phương thức hoàn tiền phải là số nguyên.",
                    "any.only":
                        "Phương thức hoàn tiền không hợp lệ.",
                    "any.required":
                        "Phương thức hoàn tiền là bắt buộc."
                }),

        soLuongHoan:
            Joi.number()
                .integer()
                .min(1)
                .required()
                .messages({
                    "number.base": "Số lượng hoàn phải là số.",
                    "number.integer": "Số lượng hoàn phải là số nguyên.",
                    "number.min": "Số lượng hoàn phải lớn hơn 0.",
                    "any.required": "Số lượng hoàn là bắt buộc."
                }),

        lyDoHoan:
            Joi.string()
                .trim()
                .max(500)
                .required()
                .messages({
                    "string.base": "Lý do hoàn phải là chuỗi.",
                    "string.empty": "Lý do hoàn không được để trống.",
                    "string.max": "Lý do hoàn không được vượt quá 500 ký tự.",
                    "any.required": "Lý do hoàn là bắt buộc."
                }),


        soTien:
            Joi.number()
                .positive()
                .optional()
                .messages({
                    "number.base":
                        "Số tiền hoàn phải là số.",
                    "number.positive":
                        "Số tiền hoàn phải lớn hơn 0."
                }),

        maThamChieu:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional(),

        maChuanChi:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional()

    });


const callbackSchema =
    Joi.object({

        maGiaoDich:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .required(),

        trangThai:
            Joi.number()
                .integer()
                .required(),

        maThamChieu:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional(),

        maChuanChi:
            Joi.string()
                .trim()
                .max(
                    100
                )
                .allow(
                    "",
                    null
                )
                .optional(),

        noiDungLoi:
            Joi.string()
                .trim()
                .max(
                    1000
                )
                .allow(
                    "",
                    null
                )
                .optional()

    })
        .unknown(
            true
        );


module.exports = {
    createSchema,
    taoQrSchema,
    huyQrSchema,
    xacNhanSchema,
    hoanTienSchema,
    callbackSchema
};
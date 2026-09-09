const Joi = require("joi");

const {
    loaiDiaDiemNhanHang:
        dsLoaiDiaDiemNhanHang
} = require("../../../../constants/enums");


const dsGiaTriLoaiDiaDiem =
    dsLoaiDiaDiemNhanHang.map(
        item => Number(item.value)
    );


const maDiaDiemSchema =
    Joi.string()
        .trim()
        .max(50)
        .messages({
            "string.base":
                "Mã địa điểm phải là chuỗi.",
            "string.empty":
                "Mã địa điểm không được để trống.",
            "string.max":
                "Mã địa điểm không được vượt quá 50 ký tự."
        });


const tenDiaDiemSchema =
    Joi.string()
        .trim()
        .max(255)
        .messages({
            "string.base":
                "Tên địa điểm phải là chuỗi.",
            "string.empty":
                "Tên địa điểm không được để trống.",
            "string.max":
                "Tên địa điểm không được vượt quá 255 ký tự."
        });


const diaChiChiTietSchema =
    Joi.string()
        .trim()
        .max(500)
        .messages({
            "string.base":
                "Địa chỉ chi tiết phải là chuỗi.",
            "string.empty":
                "Địa chỉ chi tiết không được để trống.",
            "string.max":
                "Địa chỉ chi tiết không được vượt quá 500 ký tự."
        });


const loaiDiaDiemSchema =
    Joi.number()
        .integer()
        .valid(
            ...dsGiaTriLoaiDiaDiem
        )
        .messages({
            "number.base":
                "Loại địa điểm phải là số.",
            "number.integer":
                "Loại địa điểm phải là số nguyên.",
            "any.only":
                "Loại địa điểm không hợp lệ."
        });


const laMacDinhSchema =
    Joi.boolean()
        .messages({
            "boolean.base":
                "Trạng thái mặc định phải là true hoặc false."
        });


const ghiChuSchema =
    Joi.string()
        .trim()
        .max(500)
        .allow(
            "",
            null
        )
        .messages({
            "string.base":
                "Ghi chú phải là chuỗi.",
            "string.max":
                "Ghi chú không được vượt quá 500 ký tự."
        });


const thuTuHienThiSchema =
    Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base":
                "Thứ tự hiển thị phải là số.",
            "number.integer":
                "Thứ tự hiển thị phải là số nguyên.",
            "number.min":
                "Thứ tự hiển thị không được nhỏ hơn 0."
        });


const activeSchema =
    Joi.boolean()
        .messages({
            "boolean.base":
                "Trạng thái phải là true hoặc false."
        });


const createSchema =
    Joi.object({

        maDiaDiem:
            maDiaDiemSchema
                .required()
                .messages({
                    "any.required":
                        "Mã địa điểm là bắt buộc."
                }),

        tenDiaDiem:
            tenDiaDiemSchema
                .required()
                .messages({
                    "any.required":
                        "Tên địa điểm là bắt buộc."
                }),

        diaChiChiTiet:
            diaChiChiTietSchema
                .required()
                .messages({
                    "any.required":
                        "Địa chỉ chi tiết là bắt buộc."
                }),

        loaiDiaDiem:
            loaiDiaDiemSchema
                .optional(),

        laMacDinh:
            laMacDinhSchema
                .optional(),

        ghiChu:
            ghiChuSchema
                .optional(),

        thuTuHienThi:
            thuTuHienThiSchema
                .optional(),

        active:
            activeSchema
                .optional()

    });


const updateSchema =
    Joi.object({

        maDiaDiem:
            maDiaDiemSchema
                .optional(),

        tenDiaDiem:
            tenDiaDiemSchema
                .optional(),

        diaChiChiTiet:
            diaChiChiTietSchema
                .optional(),

        loaiDiaDiem:
            loaiDiaDiemSchema
                .optional(),

        laMacDinh:
            laMacDinhSchema
                .optional(),

        ghiChu:
            ghiChuSchema
                .optional(),

        thuTuHienThi:
            thuTuHienThiSchema
                .optional(),

        active:
            activeSchema
                .optional()

    })
        .min(1)
        .messages({
            "object.min":
                "Phải truyền ít nhất một trường cần cập nhật."
        });


module.exports = {
    createSchema,
    updateSchema
};

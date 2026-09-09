const Joi =
    require("joi");


const createSchema =
    Joi.object({

        maNhomSanPham:
            Joi.string()
                .trim()
                .max(50)
                .required()
                .messages({
                    "string.base":
                        "Mã nhóm sản phẩm phải là chuỗi.",

                    "string.empty":
                        "Mã nhóm sản phẩm không được để trống.",

                    "string.max":
                        "Mã nhóm sản phẩm không được vượt quá 50 ký tự.",

                    "any.required":
                        "Mã nhóm sản phẩm là bắt buộc."
                }),

        tenNhomSanPham:
            Joi.string()
                .trim()
                .max(150)
                .required()
                .messages({
                    "string.base":
                        "Tên nhóm sản phẩm phải là chuỗi.",

                    "string.empty":
                        "Tên nhóm sản phẩm không được để trống.",

                    "string.max":
                        "Tên nhóm sản phẩm không được vượt quá 150 ký tự.",

                    "any.required":
                        "Tên nhóm sản phẩm là bắt buộc."
                }),

        loaiSanPham:
            Joi.number()
                .integer()
                .valid(
                    10,
                    20,
                    30,
                    40
                )
                .required()
                .messages({
                    "number.base":
                        "Loại sản phẩm phải là số.",

                    "number.integer":
                        "Loại sản phẩm phải là số nguyên.",

                    "any.only":
                        "Loại sản phẩm không hợp lệ.",

                    "any.required":
                        "Loại sản phẩm là bắt buộc."
                }),

        moTa:
            Joi.string()
                .trim()
                .max(500)
                .allow(
                    "",
                    null
                )
                .optional()
                .messages({
                    "string.base":
                        "Mô tả phải là chuỗi.",

                    "string.max":
                        "Mô tả không được vượt quá 500 ký tự."
                }),

        thuTuHienThi:
            Joi.number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    "number.base":
                        "Thứ tự hiển thị phải là số.",

                    "number.integer":
                        "Thứ tự hiển thị phải là số nguyên.",

                    "number.min":
                        "Thứ tự hiển thị không được nhỏ hơn 0."
                }),

        active:
            Joi.boolean()
                .optional()
                .messages({
                    "boolean.base":
                        "Trạng thái phải là true hoặc false."
                })

    });


const updateSchema =
    Joi.object({

        maNhomSanPham:
            Joi.string()
                .trim()
                .max(50)
                .optional()
                .messages({
                    "string.base":
                        "Mã nhóm sản phẩm phải là chuỗi.",

                    "string.empty":
                        "Mã nhóm sản phẩm không được để trống.",

                    "string.max":
                        "Mã nhóm sản phẩm không được vượt quá 50 ký tự."
                }),

        tenNhomSanPham:
            Joi.string()
                .trim()
                .max(150)
                .optional()
                .messages({
                    "string.base":
                        "Tên nhóm sản phẩm phải là chuỗi.",

                    "string.empty":
                        "Tên nhóm sản phẩm không được để trống.",

                    "string.max":
                        "Tên nhóm sản phẩm không được vượt quá 150 ký tự."
                }),

        loaiSanPham:
            Joi.number()
                .integer()
                .valid(
                    10,
                    20,
                    30,
                    40
                )
                .optional()
                .messages({
                    "number.base":
                        "Loại sản phẩm phải là số.",

                    "number.integer":
                        "Loại sản phẩm phải là số nguyên.",

                    "any.only":
                        "Loại sản phẩm không hợp lệ."
                }),

        moTa:
            Joi.string()
                .trim()
                .max(500)
                .allow(
                    "",
                    null
                )
                .optional()
                .messages({
                    "string.base":
                        "Mô tả phải là chuỗi.",

                    "string.max":
                        "Mô tả không được vượt quá 500 ký tự."
                }),

        thuTuHienThi:
            Joi.number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    "number.base":
                        "Thứ tự hiển thị phải là số.",

                    "number.integer":
                        "Thứ tự hiển thị phải là số nguyên.",

                    "number.min":
                        "Thứ tự hiển thị không được nhỏ hơn 0."
                }),

        active:
            Joi.boolean()
                .optional()
                .messages({
                    "boolean.base":
                        "Trạng thái phải là true hoặc false."
                })

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
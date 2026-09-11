const Joi =
    require("joi");


const soDonToiDaSchema = Joi.string()
    .trim()
    .pattern(
        /^(?:0|[1-9]\d{0,11})(?:\.\d{1,5})?$/
    )
    .custom((value, helpers) => {
        if (!/[1-9]/.test(value)) {
            return helpers.error("any.invalid");
        }

        return value;
    })
    .allow(null)
    .optional()
    .messages({
        "string.base":
            "Số đơn tối đa phải được gửi dưới dạng chuỗi số chuẩn.",

        "string.empty":
            "Nếu không giới hạn, gửi số đơn tối đa là null.",

        "string.pattern.base":
            "Số đơn tối đa chỉ được có tối đa 12 số phần nguyên " +
            "và 5 số phần thập phân, dùng dấu chấm thập phân.",

        "any.invalid":
            "Số đơn tối đa phải lớn hơn 0."
    });

const timeSchema =
    Joi.string()
        .trim()
        .pattern(
            /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
        )
        .messages({
            "string.base":
                "Thời gian phải là chuỗi.",

            "string.empty":
                "Thời gian không được để trống.",

            "string.pattern.base":
                "Thời gian phải có định dạng HH:mm hoặc HH:mm:ss."
        });


const createSchema =
    Joi.object({

        maKhungGio:
            Joi.string()
                .trim()
                .max(50)
                .required()
                .messages({
                    "string.base":
                        "Mã khung giờ phải là chuỗi.",

                    "string.empty":
                        "Mã khung giờ không được để trống.",

                    "string.max":
                        "Mã khung giờ không được vượt quá 50 ký tự.",

                    "any.required":
                        "Mã khung giờ là bắt buộc."
                }),

        tenKhungGio:
            Joi.string()
                .trim()
                .max(150)
                .required()
                .messages({
                    "string.base":
                        "Tên khung giờ phải là chuỗi.",

                    "string.empty":
                        "Tên khung giờ không được để trống.",

                    "string.max":
                        "Tên khung giờ không được vượt quá 150 ký tự.",

                    "any.required":
                        "Tên khung giờ là bắt buộc."
                }),

        coSoId:
            Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    "number.base":
                        "Cơ sở phải là số.",

                    "number.integer":
                        "Cơ sở phải là số nguyên.",

                    "number.positive":
                        "Cơ sở không hợp lệ.",

                    "any.required":
                        "Cơ sở là bắt buộc."
                }),

        gioBatDau:
            timeSchema
                .required()
                .messages({
                    "any.required":
                        "Giờ bắt đầu là bắt buộc."
                }),

        gioKetThuc:
            timeSchema
                .required()
                .messages({
                    "any.required":
                        "Giờ kết thúc là bắt buộc."
                }),

        soDonToiDa: soDonToiDaSchema,

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

        maKhungGio:
            Joi.string()
                .trim()
                .max(50)
                .optional()
                .messages({
                    "string.base":
                        "Mã khung giờ phải là chuỗi.",

                    "string.empty":
                        "Mã khung giờ không được để trống.",

                    "string.max":
                        "Mã khung giờ không được vượt quá 50 ký tự."
                }),

        tenKhungGio:
            Joi.string()
                .trim()
                .max(150)
                .optional()
                .messages({
                    "string.base":
                        "Tên khung giờ phải là chuỗi.",

                    "string.empty":
                        "Tên khung giờ không được để trống.",

                    "string.max":
                        "Tên khung giờ không được vượt quá 150 ký tự."
                }),

        coSoId:
            Joi.number()
                .integer()
                .positive()
                .optional()
                .messages({
                    "number.base":
                        "Cơ sở phải là số.",

                    "number.integer":
                        "Cơ sở phải là số nguyên.",

                    "number.positive":
                        "Cơ sở không hợp lệ."
                }),

        gioBatDau:
            timeSchema
                .optional(),

        gioKetThuc:
            timeSchema
                .optional(),

        soDonToiDa: soDonToiDaSchema,

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
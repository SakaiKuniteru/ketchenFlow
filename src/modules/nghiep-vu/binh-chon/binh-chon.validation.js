const Joi = require('joi');

const createSchema = Joi.object({
    thucDonNgayId: Joi.number().integer().positive().required().messages({
        'number.base': 'ID ngày thực đơn phải là số.',

        'number.integer': 'ID ngày thực đơn phải là số nguyên.',

        'number.positive': 'ID ngày thực đơn phải lớn hơn 0.',

        'any.required': 'Ngày thực đơn là bắt buộc.'
    }),

    batDauBinhChon: Joi.date().iso().required().messages({
        'date.base': 'Thời gian bắt đầu bình chọn không hợp lệ.',

        'date.format': 'Thời gian bắt đầu bình chọn phải đúng định dạng ISO.',

        'any.required': 'Thời gian bắt đầu bình chọn là bắt buộc.'
    }),

    hanBinhChon: Joi.date().iso().greater(Joi.ref('batDauBinhChon')).required().messages({
        'date.base': 'Hạn bình chọn không hợp lệ.',

        'date.format': 'Hạn bình chọn phải đúng định dạng ISO.',

        'date.greater': 'Hạn bình chọn phải lớn hơn thời gian bắt đầu bình chọn.',

        'any.required': 'Hạn bình chọn là bắt buộc.'
    }),

    choPhepThayDoi: Joi.boolean().optional().messages({
        'boolean.base': 'Cho phép thay đổi phải là true hoặc false.'
    })
})
    .required()
    .messages({
        'any.required': 'Dữ liệu đợt bình chọn là bắt buộc.',

        'object.base': 'Dữ liệu đợt bình chọn không hợp lệ.'
    });

const updateSchema = Joi.object({
    thucDonNgayId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID ngày thực đơn phải là số.',

        'number.integer': 'ID ngày thực đơn phải là số nguyên.',

        'number.positive': 'ID ngày thực đơn phải lớn hơn 0.'
    }),

    batDauBinhChon: Joi.date().iso().optional().messages({
        'date.base': 'Thời gian bắt đầu bình chọn không hợp lệ.',

        'date.format': 'Thời gian bắt đầu bình chọn phải đúng định dạng ISO.'
    }),

    hanBinhChon: Joi.date().iso().optional().messages({
        'date.base': 'Hạn bình chọn không hợp lệ.',

        'date.format': 'Hạn bình chọn phải đúng định dạng ISO.'
    }),

    choPhepThayDoi: Joi.boolean().optional().messages({
        'boolean.base': 'Cho phép thay đổi phải là true hoặc false.'
    })
})
    .required()
    .min(1)
    .custom((value, helpers) => {
        if (value.batDauBinhChon !== undefined && value.hanBinhChon !== undefined) {
            const batDau = new Date(value.batDauBinhChon);

            const han = new Date(value.hanBinhChon);

            if (batDau >= han) {
                return helpers.message('Hạn bình chọn phải lớn hơn thời gian bắt đầu bình chọn.');
            }
        }

        return value;
    })
    .messages({
        'any.required': 'Dữ liệu cập nhật đợt bình chọn là bắt buộc.',

        'object.base': 'Dữ liệu cập nhật đợt bình chọn không hợp lệ.',

        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

const voteSchema = Joi.object({
    luaChon: Joi.boolean().required().messages({
        'boolean.base': 'Lựa chọn bình chọn phải là true hoặc false.',

        'any.required': 'Lựa chọn bình chọn là bắt buộc.'
    })
})
    .required()
    .messages({
        'any.required': 'Dữ liệu bình chọn là bắt buộc.',

        'object.base': 'Dữ liệu bình chọn không hợp lệ.'
    });

const cancelSchema = Joi.object({
    lyDoHuy: Joi.string().trim().max(500).required().messages({
        'string.base': 'Lý do hủy phải là chuỗi.',

        'string.empty': 'Lý do hủy không được để trống.',

        'string.max': 'Lý do hủy không được vượt quá 500 ký tự.',

        'any.required': 'Lý do hủy là bắt buộc.'
    })
})
    .required()
    .messages({
        'any.required': 'Dữ liệu hủy đợt bình chọn là bắt buộc.',

        'object.base': 'Dữ liệu hủy đợt bình chọn không hợp lệ.'
    });

const reopenSchema = Joi.object({
    hanBinhChon: Joi.date().iso().required().messages({
        'date.base': 'Hạn bình chọn không hợp lệ.',

        'date.format': 'Hạn bình chọn phải đúng định dạng ISO.',

        'any.required': 'Hạn bình chọn mới là bắt buộc.'
    })
})
    .required()
    .messages({
        'any.required': 'Dữ liệu mở lại bình chọn là bắt buộc.',

        'object.base': 'Dữ liệu mở lại bình chọn không hợp lệ.'
    });

module.exports = {
    createSchema,
    updateSchema,
    voteSchema,
    cancelSchema,
    reopenSchema
};

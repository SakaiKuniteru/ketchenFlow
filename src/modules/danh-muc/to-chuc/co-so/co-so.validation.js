const Joi = require('joi');

const createSchema = Joi.object({
    maCoSo: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.',
        'any.required': 'Mã cơ sở là bắt buộc.'
    }),

    tenCoSo: Joi.string().trim().max(255).required().messages({
        'string.base': 'Tên cơ sở phải là chuỗi.',
        'string.empty': 'Tên cơ sở không được để trống.',
        'string.max': 'Tên cơ sở không được vượt quá 255 ký tự.',
        'any.required': 'Tên cơ sở là bắt buộc.'
    }),

    diaChi: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Địa chỉ phải là chuỗi.',
        'string.max': 'Địa chỉ không được vượt quá 500 ký tự.'
    }),

    logo: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Logo phải là chuỗi.',
        'string.max': 'Logo không được vượt quá 500 ký tự.'
    }),

    favicon: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Favicon phải là chuỗi.',
        'string.max': 'Favicon không được vượt quá 500 ký tự.'
    }),

    logoDoiTac: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Logo đối tác phải là chuỗi.',
        'string.max': 'Logo đối tác không được vượt quá 500 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID quốc gia phải là số.',
        'number.integer': 'ID quốc gia không hợp lệ.',
        'number.positive': 'ID quốc gia không hợp lệ.'
    }),

    maQuocGia: Joi.string().trim().max(10).optional().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.empty': 'Mã quốc gia không được để trống.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID tỉnh/thành phải là số.',
        'number.integer': 'ID tỉnh/thành không hợp lệ.',
        'number.positive': 'ID tỉnh/thành không hợp lệ.'
    }),

    maTinhThanh: Joi.string().trim().max(20).optional().messages({
        'string.base': 'Mã tỉnh/thành phải là chuỗi.',
        'string.empty': 'Mã tỉnh/thành không được để trống.',
        'string.max': 'Mã tỉnh/thành không được vượt quá 20 ký tự.'
    }),

    xaPhuongId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID xã/phường phải là số.',
        'number.integer': 'ID xã/phường không hợp lệ.',
        'number.positive': 'ID xã/phường không hợp lệ.'
    }),

    maXaPhuong: Joi.string().trim().max(20).optional().messages({
        'string.base': 'Mã xã/phường phải là chuỗi.',
        'string.empty': 'Mã xã/phường không được để trống.',
        'string.max': 'Mã xã/phường không được vượt quá 20 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('quocGiaId', 'maQuocGia')
    .or('tinhThanhId', 'maTinhThanh')
    .or('xaPhuongId', 'maXaPhuong')
    .messages({
        'object.missing': 'Mỗi cấp địa chỉ phải có ID hoặc mã tương ứng.'
    });

const updateSchema = Joi.object({
    maCoSo: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.empty': 'Mã cơ sở không được để trống.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    tenCoSo: Joi.string().trim().max(255).optional().messages({
        'string.base': 'Tên cơ sở phải là chuỗi.',
        'string.empty': 'Tên cơ sở không được để trống.',
        'string.max': 'Tên cơ sở không được vượt quá 255 ký tự.'
    }),

    diaChi: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Địa chỉ phải là chuỗi.',
        'string.max': 'Địa chỉ không được vượt quá 500 ký tự.'
    }),

    logo: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Logo phải là chuỗi.',
        'string.max': 'Logo không được vượt quá 500 ký tự.'
    }),

    favicon: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Favicon phải là chuỗi.',
        'string.max': 'Favicon không được vượt quá 500 ký tự.'
    }),

    logoDoiTac: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Logo đối tác phải là chuỗi.',
        'string.max': 'Logo đối tác không được vượt quá 500 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID quốc gia phải là số.',
        'number.integer': 'ID quốc gia không hợp lệ.',
        'number.positive': 'ID quốc gia không hợp lệ.'
    }),

    maQuocGia: Joi.string().trim().max(10).optional().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.empty': 'Mã quốc gia không được để trống.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID tỉnh/thành phải là số.',
        'number.integer': 'ID tỉnh/thành không hợp lệ.',
        'number.positive': 'ID tỉnh/thành không hợp lệ.'
    }),

    maTinhThanh: Joi.string().trim().max(20).optional().messages({
        'string.base': 'Mã tỉnh/thành phải là chuỗi.',
        'string.empty': 'Mã tỉnh/thành không được để trống.',
        'string.max': 'Mã tỉnh/thành không được vượt quá 20 ký tự.'
    }),

    xaPhuongId: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID xã/phường phải là số.',
        'number.integer': 'ID xã/phường không hợp lệ.',
        'number.positive': 'ID xã/phường không hợp lệ.'
    }),

    maXaPhuong: Joi.string().trim().max(20).optional().messages({
        'string.base': 'Mã xã/phường phải là chuỗi.',
        'string.empty': 'Mã xã/phường không được để trống.',
        'string.max': 'Mã xã/phường không được vượt quá 20 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .min(1)
    .messages({
        'object.min': 'Phải truyền ít nhất một trường cần cập nhật.'
    });

module.exports = {
    createSchema,
    updateSchema
};

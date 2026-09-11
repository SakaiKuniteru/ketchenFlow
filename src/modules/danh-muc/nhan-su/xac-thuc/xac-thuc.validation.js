const Joi = require('joi');

const loginSchema = Joi.object({
    taiKhoan: Joi.string().trim().allow(''),

    matKhau: Joi.string().allow('')
}).custom((value, helpers) => {
    if (!value.taiKhoan && !value.matKhau) {
        return helpers.message('Tên đăng nhập và mật khẩu không được để trống.');
    }

    if (!value.taiKhoan) {
        return helpers.message('Tên đăng nhập không được để trống.');
    }

    if (!value.matKhau) {
        return helpers.message('Mật khẩu không được để trống.');
    }

    return value;
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh Token không được để trống.',

        'any.required': 'Refresh Token là bắt buộc.'
    })
});

const changeMatKhauSchema = Joi.object({
    matKhauCu: Joi.string().required().messages({
        'string.empty': 'Mật khẩu cũ không được để trống.',

        'any.required': 'Mật khẩu cũ là bắt buộc.'
    }),

    matKhauMoi: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).+$/)
        .required()
        .messages({
            'string.empty': 'Mật khẩu mới không được để trống.',

            'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự.',

            'string.pattern.base': 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.',

            'any.required': 'Mật khẩu mới là bắt buộc.'
        })
});

module.exports = {
    loginSchema,

    refreshTokenSchema,

    changeMatKhauSchema
};

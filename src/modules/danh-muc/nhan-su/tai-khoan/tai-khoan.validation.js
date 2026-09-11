const Joi = require('joi');

const messages = {
    'any.required': '{{#label}} là trường bắt buộc.',

    'any.only': '{{#label}} không hợp lệ.',

    'any.custom': '{{#message}}',

    'string.base': '{{#label}} phải là chuỗi.',

    'string.empty': '{{#label}} không được để trống.',

    'string.min': '{{#label}} phải có ít nhất {{#limit}} ký tự.',

    'string.max': '{{#label}} không được vượt quá {{#limit}} ký tự.',

    'string.pattern.base': '{{#label}} không đúng định dạng.',

    'number.base': '{{#label}} phải là số.',

    'number.integer': '{{#label}} phải là số nguyên.',

    'number.positive': '{{#label}} phải lớn hơn 0.',

    'boolean.base': '{{#label}} phải là true hoặc false.',

    'array.base': '{{#label}} phải là một danh sách.',

    'array.min': '{{#label}} phải có ít nhất {{#limit}} phần tử.',

    'array.unique': '{{#label}} không được chứa phần tử trùng lặp.',

    'object.unknown': 'Trường {{#label}} không được phép gửi lên.'
};

const idSchema = Joi.number().integer().positive().messages({
    'number.base': 'ID phải là số.',

    'number.integer': 'ID phải là số nguyên.',

    'number.positive': 'ID phải lớn hơn 0.'
});

const maNhanVienSchema = Joi.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(/^[A-Za-z0-9_.-]+$/)
    .messages({
        'string.base': 'Mã nhân viên phải là chuỗi.',

        'string.empty': 'Mã nhân viên không được để trống.',

        'string.min': 'Mã nhân viên không được để trống.',

        'string.max': 'Mã nhân viên không được vượt quá 50 ký tự.',

        'string.pattern.base': 'Mã nhân viên chỉ được chứa chữ cái, chữ số, dấu gạch dưới, dấu chấm và dấu gạch ngang.'
    });

const tenDangNhapSchema = Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-z0-9_.-]+$/)
    .messages({
        'string.base': 'Tên đăng nhập phải là chuỗi.',

        'string.empty': 'Tên đăng nhập không được để trống.',

        'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự.',

        'string.max': 'Tên đăng nhập không được vượt quá 100 ký tự.',

        'string.pattern.base': 'Tên đăng nhập chỉ được chứa chữ cái, chữ số, dấu gạch dưới, dấu chấm và dấu gạch ngang.'
    });

const dsVaiTroIdSchema = Joi.array()
    .items(
        Joi.number().integer().positive().messages({
            'number.base': 'ID vai trò phải là số.',

            'number.integer': 'ID vai trò phải là số nguyên.',

            'number.positive': 'ID vai trò phải lớn hơn 0.',

            'any.required': 'ID vai trò không được để trống.'
        })
    )
    .unique()
    .messages({
        'array.base': 'Danh sách ID vai trò phải là một mảng.',

        'array.unique': 'Danh sách ID vai trò không được trùng lặp.',

        'array.includes': 'Danh sách ID vai trò có phần tử không hợp lệ.'
    });

const dsMaVaiTroSchema = Joi.array()
    .items(
        Joi.string()
            .trim()
            .min(1)
            .max(50)
            .pattern(/^[A-Za-z0-9_.-]+$/)
            .messages({
                'string.base': 'Mã vai trò phải là chuỗi.',

                'string.empty': 'Mã vai trò không được để trống.',

                'string.min': 'Mã vai trò không được để trống.',

                'string.max': 'Mã vai trò không được vượt quá 50 ký tự.',

                'string.pattern.base':
                    'Mã vai trò chỉ được chứa chữ cái, chữ số, dấu gạch dưới, dấu chấm và dấu gạch ngang.'
            })
    )
    .unique((a, b) => String(a).trim().toUpperCase() === String(b).trim().toUpperCase())
    .messages({
        'array.base': 'Danh sách mã vai trò phải là một mảng.',

        'array.unique': 'Danh sách mã vai trò không được trùng lặp.',

        'array.includes': 'Danh sách mã vai trò có phần tử không hợp lệ.'
    });

const matKhauSchema = Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/)
    .messages({
        'string.base': 'Mật khẩu phải là chuỗi.',

        'string.empty': 'Mật khẩu không được để trống.',

        'string.min': 'Mật khẩu phải có ít nhất 8 ký tự.',

        'string.max': 'Mật khẩu không được vượt quá 100 ký tự.',

        'string.pattern.base': 'Mật khẩu phải có ít nhất một chữ thường, một chữ hoa, một chữ số và một ký tự đặc biệt.'
    });

const createSchema = Joi.object({
    nhanVienId: idSchema.optional(),

    maNhanVien: maNhanVienSchema.optional(),

    tenDangNhap: tenDangNhapSchema.required(),

    biKhoa: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái khóa phải là true hoặc false.'
    }),

    khoaVinhVien: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái khóa vĩnh viễn phải là true hoặc false.'
    }),

    anhDaiDien: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ảnh đại diện không hợp lệ.',

        'string.max': 'Đường dẫn ảnh đại diện không được vượt quá 500 ký tự.'
    }),

    dsVaiTroId: dsVaiTroIdSchema.optional(),

    dsMaVaiTro: dsMaVaiTroSchema.optional(),

    active: Joi.boolean().default(true).messages({
        'boolean.base': 'Trạng thái hoạt động phải là true hoặc false.'
    })
})
    .custom((value, helpers) => {
        const coNhanVienId = value.nhanVienId !== undefined && value.nhanVienId !== null;

        const coMaNhanVien =
            value.maNhanVien !== undefined && value.maNhanVien !== null && String(value.maNhanVien).trim() !== '';

        if (!coNhanVienId && !coMaNhanVien) {
            return helpers.message({
                custom: 'Phải cung cấp nhanVienId hoặc maNhanVien.'
            });
        }

        if (coNhanVienId && coMaNhanVien) {
            return helpers.message({
                custom: 'Chỉ được cung cấp một trong hai trường nhanVienId hoặc maNhanVien.'
            });
        }

        const coDsVaiTroId = Array.isArray(value.dsVaiTroId);

        const coDsMaVaiTro = Array.isArray(value.dsMaVaiTro);

        if (!coDsVaiTroId && !coDsMaVaiTro) {
            return helpers.message({
                custom: 'Phải cung cấp dsVaiTroId hoặc dsMaVaiTro.'
            });
        }

        return value;
    }, 'Kiểm tra dữ liệu tạo tài khoản')
    .unknown(false)
    .messages(messages);

const updateSchema = Joi.object({
    nhanVienId: idSchema.optional(),

    maNhanVien: maNhanVienSchema.optional(),

    tenDangNhap: tenDangNhapSchema.optional(),

    biKhoa: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái khóa phải là true hoặc false.'
    }),

    khoaVinhVien: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái khóa vĩnh viễn phải là true hoặc false.'
    }),

    anhDaiDien: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ảnh đại diện không hợp lệ.',

        'string.max': 'Đường dẫn ảnh đại diện không được vượt quá 500 ký tự.'
    }),

    dsVaiTroId: dsVaiTroIdSchema.optional(),

    dsMaVaiTro: dsMaVaiTroSchema.optional(),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái hoạt động phải là true hoặc false.'
    })
})
    .min(1)
    .custom((value, helpers) => {
        const coNhanVienId = value.nhanVienId !== undefined && value.nhanVienId !== null;

        const coMaNhanVien =
            value.maNhanVien !== undefined && value.maNhanVien !== null && String(value.maNhanVien).trim() !== '';

        if (coNhanVienId && coMaNhanVien) {
            return helpers.message({
                custom: 'Chỉ được cung cấp một trong hai trường nhanVienId hoặc maNhanVien.'
            });
        }

        return value;
    }, 'Kiểm tra dữ liệu cập nhật tài khoản')
    .unknown(false)
    .messages({
        ...messages,

        'object.min': 'Phải cung cấp ít nhất một trường cần cập nhật.'
    });

const doiMatKhauSchema = Joi.object({
    matKhauCu: Joi.string().required().messages({
        'any.required': 'Mật khẩu cũ không được để trống.',

        'string.base': 'Mật khẩu cũ phải là chuỗi.',

        'string.empty': 'Mật khẩu cũ không được để trống.'
    }),

    matKhauMoi: matKhauSchema.required().messages({
        'any.required': 'Mật khẩu mới không được để trống.',

        'string.empty': 'Mật khẩu mới không được để trống.'
    }),

    xacNhanMatKhau: Joi.string().required().valid(Joi.ref('matKhauMoi')).messages({
        'any.required': 'Xác nhận mật khẩu không được để trống.',

        'string.base': 'Xác nhận mật khẩu phải là chuỗi.',

        'string.empty': 'Xác nhận mật khẩu không được để trống.',

        'any.only': 'Xác nhận mật khẩu không khớp với mật khẩu mới'
    })
})
    .custom((value, helpers) => {
        if (value.matKhauCu === value.matKhauMoi) {
            return helpers.message({
                custom: 'Mật khẩu mới không được trùng với mật khẩu cũ.'
            });
        }

        return value;
    }, 'Kiểm tra mật khẩu mới')
    .unknown(false)
    .messages(messages);

const idParamSchema = Joi.object({
    id: idSchema.required().messages({
        'any.required': 'ID tài khoản không được để trống.',

        'number.base': 'ID tài khoản phải là số.',

        'number.integer': 'ID tài khoản phải là số nguyên.',

        'number.positive': 'ID tài khoản phải lớn hơn 0.'
    })
})
    .unknown(false)
    .messages(messages);

const getTongHopSchema = Joi.object({
    tuKhoa: Joi.string().trim().max(255).allow('').optional().messages({
        'string.base': 'Từ khóa tìm kiếm phải là chuỗi.',

        'string.max': 'Từ khóa tìm kiếm không được vượt quá 255 ký tự.'
    }),

    active: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').optional().messages({
        'boolean.base': 'Trạng thái hoạt động phải là true hoặc false.'
    }),

    nhanVienId: idSchema.optional(),

    vaiTroId: idSchema.optional(),

    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Trang phải là số.',

        'number.integer': 'Trang phải là số nguyên.',

        'number.min': 'Trang phải lớn hơn hoặc bằng 1.'
    }),

    limit: Joi.number().integer().min(1).max(100).default(20).messages({
        'number.base': 'Số bản ghi mỗi trang phải là số.',

        'number.integer': 'Số bản ghi mỗi trang phải là số nguyên.',

        'number.min': 'Số bản ghi mỗi trang phải lớn hơn hoặc bằng 1.',

        'number.max': 'Số bản ghi mỗi trang không được vượt quá 100.'
    }),

    sortBy: Joi.string()
        .valid('id', 'tenDangNhap', 'maNhanVien', 'hoTen', 'lanDangNhapCuoi', 'createdAt', 'updatedAt')
        .default('tenDangNhap')
        .messages({
            'string.base': 'Trường sắp xếp phải là chuỗi.',

            'any.only': 'Trường sắp xếp không hợp lệ.'
        }),

    sortOrder: Joi.string().lowercase().valid('asc', 'desc').default('asc').messages({
        'string.base': 'Chiều sắp xếp phải là chuỗi.',

        'any.only': 'Chiều sắp xếp chỉ nhận asc hoặc desc.'
    })
})
    .unknown(false)
    .messages(messages);

const datLaiMatKhauSchema = Joi.object({}).unknown(false).messages({
    'object.unknown': 'Đặt lại mật khẩu không cần truyền dữ liệu trong body.'
});

module.exports = {
    getTongHopSchema,

    idParamSchema,

    createSchema,

    updateSchema,

    doiMatKhauSchema,

    datLaiMatKhauSchema
};

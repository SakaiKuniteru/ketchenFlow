const Joi = require('joi');

const createSchema = Joi.object({
    maNhanVien: Joi.string().trim().max(50).required().messages({
        'string.base': 'Mã nhân viên phải là chuỗi.',
        'string.empty': 'Mã nhân viên không được để trống.',
        'string.max': 'Mã nhân viên không được vượt quá 50 ký tự.',
        'any.required': 'Mã nhân viên là bắt buộc.'
    }),

    hoTen: Joi.string().trim().max(100).required().messages({
        'string.base': 'Họ tên phải là chuỗi.',
        'string.empty': 'Họ tên không được để trống.',
        'string.max': 'Họ tên không được vượt quá 100 ký tự.',
        'any.required': 'Họ tên là bắt buộc.'
    }),

    ngaySinh: Joi.date().allow(null).optional().messages({
        'date.base': 'Ngày sinh không hợp lệ.'
    }),

    gioiTinh: Joi.number().integer().valid(0, 1, 2).required().messages({
        'number.base': 'Giới tính phải là số.',
        'number.integer': 'Giới tính phải là số nguyên.'
    }),

    soDienThoai: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Số điện thoại phải là chuỗi.',
        'string.max': 'Số điện thoại không được vượt quá 20 ký tự.'
    }),

    email: Joi.string().trim().email().max(255).allow('', null).optional().messages({
        'string.base': 'Email phải là chuỗi.',
        'string.email': 'Email không đúng định dạng.',
        'string.max': 'Email không được vượt quá 255 ký tự.'
    }),

    anhDaiDien: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ảnh đại diện phải là chuỗi.',
        'string.max': 'Ảnh đại diện không được vượt quá 500 ký tự.'
    }),

    diaChi: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Địa chỉ phải là chuỗi.',
        'string.max': 'Địa chỉ không được vượt quá 500 ký tự.'
    }),

    ghiChu: Joi.string().trim().max(1000).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 1000 ký tự.'
    }),

    maThe: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Mã thẻ phải là chuỗi.',
        'string.max': 'Mã thẻ không được vượt quá 100 ký tự.'
    }),

    maQr: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Mã QR phải là chuỗi.',
        'string.max': 'Mã QR không được vượt quá 255 ký tự.'
    }),

    maBarcode: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Mã Barcode phải là chuỗi.',
        'string.max': 'Mã Barcode không được vượt quá 255 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID quốc gia phải là số.',
        'number.integer': 'ID quốc gia phải là số nguyên.',
        'number.positive': 'ID quốc gia phải lớn hơn 0.'
    }),

    maQuocGia: Joi.string().trim().max(10).allow('', null).optional().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID tỉnh/thành phố phải là số.',
        'number.integer': 'ID tỉnh/thành phố phải là số nguyên.',
        'number.positive': 'ID tỉnh/thành phố phải lớn hơn 0.'
    }),

    maTinhThanh: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Mã tỉnh/thành phố phải là chuỗi.',
        'string.max': 'Mã tỉnh/thành phố không được vượt quá 20 ký tự.'
    }),

    xaPhuongId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID xã/phường phải là số.',
        'number.integer': 'ID xã/phường phải là số nguyên.',
        'number.positive': 'ID xã/phường phải lớn hơn 0.'
    }),

    maXaPhuong: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Mã xã/phường phải là chuỗi.',
        'string.max': 'Mã xã/phường không được vượt quá 20 ký tự.'
    }),

    coSoId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở phải là số nguyên.',
        'number.positive': 'ID cơ sở phải lớn hơn 0.'
    }),

    maCoSo: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    phongBanId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID phòng ban phải là số.',
        'number.integer': 'ID phòng ban phải là số nguyên.',
        'number.positive': 'ID phòng ban phải lớn hơn 0.'
    }),

    maPhongBan: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã phòng ban phải là chuỗi.',
        'string.max': 'Mã phòng ban không được vượt quá 50 ký tự.'
    }),

    chucVuId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID chức vụ phải là số.',
        'number.integer': 'ID chức vụ phải là số nguyên.',
        'number.positive': 'ID chức vụ phải lớn hơn 0.'
    }),

    maChucVu: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã chức vụ phải là chuỗi.',
        'string.max': 'Mã chức vụ không được vượt quá 50 ký tự.'
    }),

    active: Joi.boolean().optional().messages({
        'boolean.base': 'Trạng thái phải là true hoặc false.'
    })
})
    .or('quocGiaId', 'maQuocGia')
    .or('tinhThanhId', 'maTinhThanh')
    .or('xaPhuongId', 'maXaPhuong')
    .or('coSoId', 'maCoSo')
    .or('phongBanId', 'maPhongBan')
    .or('chucVuId', 'maChucVu')
    .messages({
        'object.missing':
            'Phải có ID hoặc mã tương ứng cho quốc gia, tỉnh/thành phố, xã/phường, cơ sở, phòng ban và chức vụ.'
    });

const updateSchema = Joi.object({
    maNhanVien: Joi.string().trim().max(50).optional().messages({
        'string.base': 'Mã nhân viên phải là chuỗi.',
        'string.empty': 'Mã nhân viên không được để trống.',
        'string.max': 'Mã nhân viên không được vượt quá 50 ký tự.'
    }),

    hoTen: Joi.string().trim().max(100).optional().messages({
        'string.base': 'Họ tên phải là chuỗi.',
        'string.empty': 'Họ tên không được để trống.',
        'string.max': 'Họ tên không được vượt quá 100 ký tự.'
    }),

    ngaySinh: Joi.date().allow(null).optional().messages({
        'date.base': 'Ngày sinh không hợp lệ.'
    }),

    gioiTinh: Joi.number().integer().valid(0, 1, 2).optional().messages({
        'number.base': 'Giới tính phải là số.',
        'number.integer': 'Giới tính phải là số nguyên.'
    }),

    soDienThoai: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Số điện thoại phải là chuỗi.',
        'string.max': 'Số điện thoại không được vượt quá 20 ký tự.'
    }),

    email: Joi.string().trim().email().max(255).allow('', null).optional().messages({
        'string.base': 'Email phải là chuỗi.',
        'string.email': 'Email không đúng định dạng.',
        'string.max': 'Email không được vượt quá 255 ký tự.'
    }),

    anhDaiDien: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Ảnh đại diện phải là chuỗi.',
        'string.max': 'Ảnh đại diện không được vượt quá 500 ký tự.'
    }),

    diaChi: Joi.string().trim().max(500).allow('', null).optional().messages({
        'string.base': 'Địa chỉ phải là chuỗi.',
        'string.max': 'Địa chỉ không được vượt quá 500 ký tự.'
    }),

    ghiChu: Joi.string().trim().max(1000).allow('', null).optional().messages({
        'string.base': 'Ghi chú phải là chuỗi.',
        'string.max': 'Ghi chú không được vượt quá 1000 ký tự.'
    }),

    maThe: Joi.string().trim().max(100).allow('', null).optional().messages({
        'string.base': 'Mã thẻ phải là chuỗi.',
        'string.max': 'Mã thẻ không được vượt quá 100 ký tự.'
    }),

    maQr: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Mã QR phải là chuỗi.',
        'string.max': 'Mã QR không được vượt quá 255 ký tự.'
    }),

    maBarcode: Joi.string().trim().max(255).allow('', null).optional().messages({
        'string.base': 'Mã Barcode phải là chuỗi.',
        'string.max': 'Mã Barcode không được vượt quá 255 ký tự.'
    }),

    quocGiaId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID quốc gia phải là số.',
        'number.integer': 'ID quốc gia phải là số nguyên.',
        'number.positive': 'ID quốc gia phải lớn hơn 0.'
    }),

    maQuocGia: Joi.string().trim().max(10).allow('', null).optional().messages({
        'string.base': 'Mã quốc gia phải là chuỗi.',
        'string.max': 'Mã quốc gia không được vượt quá 10 ký tự.'
    }),

    tinhThanhId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID tỉnh/thành phố phải là số.',
        'number.integer': 'ID tỉnh/thành phố phải là số nguyên.',
        'number.positive': 'ID tỉnh/thành phố phải lớn hơn 0.'
    }),

    maTinhThanh: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Mã tỉnh/thành phố phải là chuỗi.',
        'string.max': 'Mã tỉnh/thành phố không được vượt quá 20 ký tự.'
    }),

    xaPhuongId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID xã/phường phải là số.',
        'number.integer': 'ID xã/phường phải là số nguyên.',
        'number.positive': 'ID xã/phường phải lớn hơn 0.'
    }),

    maXaPhuong: Joi.string().trim().max(20).allow('', null).optional().messages({
        'string.base': 'Mã xã/phường phải là chuỗi.',
        'string.max': 'Mã xã/phường không được vượt quá 20 ký tự.'
    }),

    coSoId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID cơ sở phải là số.',
        'number.integer': 'ID cơ sở phải là số nguyên.',
        'number.positive': 'ID cơ sở phải lớn hơn 0.'
    }),

    maCoSo: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã cơ sở phải là chuỗi.',
        'string.max': 'Mã cơ sở không được vượt quá 50 ký tự.'
    }),

    phongBanId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID phòng ban phải là số.',
        'number.integer': 'ID phòng ban phải là số nguyên.',
        'number.positive': 'ID phòng ban phải lớn hơn 0.'
    }),

    maPhongBan: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã phòng ban phải là chuỗi.',
        'string.max': 'Mã phòng ban không được vượt quá 50 ký tự.'
    }),

    chucVuId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'ID chức vụ phải là số.',
        'number.integer': 'ID chức vụ phải là số nguyên.',
        'number.positive': 'ID chức vụ phải lớn hơn 0.'
    }),

    maChucVu: Joi.string().trim().max(50).allow('', null).optional().messages({
        'string.base': 'Mã chức vụ phải là chuỗi.',
        'string.max': 'Mã chức vụ không được vượt quá 50 ký tự.'
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

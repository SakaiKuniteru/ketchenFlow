'use strict';

const Joi = require('joi');
const enums = require('../../../../constants/enums');
const { itemSchema } = require('../gio-hang/gio-hang.validation');

const createSchema = Joi.object({
    clientRequestId: Joi.string().guid({ version: 'uuidv4' }).optional(),
    coSoId: Joi.number().integer().positive().required(),
    datHo: Joi.boolean().default(false),
    nguoiNhanId: Joi.number().integer().positive().allow(null).optional(),
    tenNguoiNhan: Joi.string().trim().max(150).required(),
    soDienThoaiNguoiNhan: Joi.string()
        .trim()
        .pattern(/^[+\d][\d\s().-]{7,19}$/)
        .required(),
    diaDiemNhanId: Joi.number().integer().positive().allow(null).optional(),
    diaChiNhan: Joi.string().trim().max(500).required(),
    khungGioNhanId: Joi.number().integer().positive().required(),
    thoiGianNhanTu: Joi.date().iso().required(),
    thoiGianNhanDen: Joi.date().iso().greater(Joi.ref('thoiGianNhanTu')).required(),
    ghiChu: Joi.string().trim().max(1000).allow('', null).optional(),
    maVoucher: Joi.string().trim().max(50).allow('', null).optional(),
    phiDichVu: Joi.number().min(0).default(0),
    phuongThucThanhToan: Joi.number()
        .valid(...enums.phuongThucThanhToanDonHang.map((item) => item.value))
        .required(),
    items: Joi.array().items(itemSchema).min(1).unique('sanPhamId').required()
});

const listSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    coSoId: Joi.number().integer().positive().optional(),
    trangThai: Joi.number()
        .valid(...enums.trangThaiDonHang.map((item) => item.value))
        .optional(),
    trangThaiThanhToan: Joi.number()
        .valid(...enums.trangThaiThanhToanDonHang.map((item) => item.value))
        .optional(),
    keyword: Joi.string().trim().max(255).allow('').optional(),
    tuNgay: Joi.date().iso().optional(),
    denNgay: Joi.date()
        .iso()
        .when('tuNgay', { is: Joi.exist(), then: Joi.date().min(Joi.ref('tuNgay')) })
        .optional()
});

const actionSchema = Joi.object({
    lyDo: Joi.string().trim().max(500).allow('', null).optional(),
    version: Joi.number().integer().positive().required()
});

module.exports = { createSchema, listSchema, actionSchema };

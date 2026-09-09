"use strict";

const Joi = require("joi");

const itemSchema = Joi.object({
    sanPhamId: Joi.number().integer().positive().required(),
    soLuong: Joi.number().positive().required(),
    ghiChu: Joi.string().trim().max(500).allow("", null).optional()
});

const tinhGioHangSchema = Joi.object({
    coSoId: Joi.number().integer().positive().required(),
    maVoucher: Joi.string().trim().max(50).allow("", null).optional(),
    phiDichVu: Joi.number().min(0).default(0),
    items: Joi.array().items(itemSchema).min(1).unique("sanPhamId").required()
});

module.exports = {
    itemSchema,
    tinhGioHangSchema
};

"use strict";

const Joi = require("joi");
const { tinhGioHangSchema } = require("../gio-hang/gio-hang.validation");

const listQuerySchema = Joi.object({
    coSoId: Joi.number().integer().positive().required(),
    nhomSanPhamId: Joi.number().integer().positive().optional(),
    loaiSanPham: Joi.number().integer().valid(10, 20, 30, 40).optional(),
    keyword: Joi.string().trim().max(255).allow("").optional(),
    laSanPhamMoi: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
    listQuerySchema,
    tinhGioHangSchema
};

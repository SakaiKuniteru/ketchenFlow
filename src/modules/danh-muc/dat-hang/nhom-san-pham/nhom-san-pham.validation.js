"use strict";

const Joi = require("joi");

const fields = {
    maNhomSanPham: Joi.string().trim().max(50),
    tenNhomSanPham: Joi.string().trim().max(150),
    loaiSanPham: Joi.number().integer().valid(10, 20, 30, 40),
    moTa: Joi.string().trim().max(500).allow("", null),
    thuTuHienThi: Joi.number().integer().min(0),
    active: Joi.boolean()
};

const createSchema = Joi.object({
    maNhomSanPham: fields.maNhomSanPham.required(),
    tenNhomSanPham: fields.tenNhomSanPham.required(),
    loaiSanPham: fields.loaiSanPham.required(),
    moTa: fields.moTa.optional(),
    thuTuHienThi: fields.thuTuHienThi.optional(),
    active: fields.active.optional()
});

const updateSchema = Joi.object({
    maNhomSanPham: fields.maNhomSanPham.optional(),
    tenNhomSanPham: fields.tenNhomSanPham.optional(),
    loaiSanPham: fields.loaiSanPham.optional(),
    moTa: fields.moTa.optional(),
    thuTuHienThi: fields.thuTuHienThi.optional(),
    active: fields.active.optional()
}).min(1);

module.exports = {
    createSchema,
    updateSchema
};

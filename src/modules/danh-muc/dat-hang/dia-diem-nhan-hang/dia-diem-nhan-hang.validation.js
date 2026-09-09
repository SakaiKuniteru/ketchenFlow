"use strict";

const Joi = require("joi");

const fields = {
    maDiaDiem: Joi.string().trim().max(50),
    tenDiaDiem: Joi.string().trim().max(255),
    coSoId: Joi.number().integer().positive(),
    moTaDiaChi: Joi.string().trim().max(500).allow("", null),
    thuTuHienThi: Joi.number().integer().min(0),
    active: Joi.boolean()
};

const createSchema = Joi.object({
    maDiaDiem: fields.maDiaDiem.required(),
    tenDiaDiem: fields.tenDiaDiem.required(),
    coSoId: fields.coSoId.required(),
    moTaDiaChi: fields.moTaDiaChi.optional(),
    thuTuHienThi: fields.thuTuHienThi.optional(),
    active: fields.active.optional()
});

const updateSchema = Joi.object({
    maDiaDiem: fields.maDiaDiem.optional(),
    tenDiaDiem: fields.tenDiaDiem.optional(),
    coSoId: fields.coSoId.optional(),
    moTaDiaChi: fields.moTaDiaChi.optional(),
    thuTuHienThi: fields.thuTuHienThi.optional(),
    active: fields.active.optional()
}).min(1);

module.exports = {
    createSchema,
    updateSchema
};
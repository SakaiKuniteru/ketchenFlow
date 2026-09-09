"use strict";

const Joi = require("joi");

const time = Joi.string().pattern(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
);

const f = {
    maKhungGio: Joi.string().trim().max(50),
    tenKhungGio: Joi.string().trim().max(150),
    coSoId: Joi.number().integer().positive(),
    gioBatDau: time,
    gioKetThuc: time,
    hanDatTruocPhut: Joi.number().integer().min(0),
    soDonToiDa: Joi.number().integer().positive().allow(null),
    active: Joi.boolean()
};

const createSchema = Joi.object({
    maKhungGio: f.maKhungGio.required(),
    tenKhungGio: f.tenKhungGio.required(),
    coSoId: f.coSoId.required(),
    gioBatDau: f.gioBatDau.required(),
    gioKetThuc: f.gioKetThuc.required(),
    hanDatTruocPhut: f.hanDatTruocPhut.optional(),
    soDonToiDa: f.soDonToiDa.optional(),
    active: f.active.optional()
});

const updateSchema = Joi.object({
    maKhungGio: f.maKhungGio.optional(),
    tenKhungGio: f.tenKhungGio.optional(),
    coSoId: f.coSoId.optional(),
    gioBatDau: f.gioBatDau.optional(),
    gioKetThuc: f.gioKetThuc.optional(),
    hanDatTruocPhut: f.hanDatTruocPhut.optional(),
    soDonToiDa: f.soDonToiDa.optional(),
    active: f.active.optional()
}).min(1);

module.exports = {
    createSchema,
    updateSchema
};
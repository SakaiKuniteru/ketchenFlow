'use strict';

const Joi = require('joi');

const applySchema = Joi.object({
    maVoucher: Joi.string().trim().max(50).required(),
    coSoId: Joi.number().integer().positive().required(),
    items: Joi.array()
        .items(
            Joi.object({
                sanPhamId: Joi.number().integer().positive().required(),
                soLuong: Joi.number().positive().required()
            })
        )
        .min(1)
        .required()
});

module.exports = { applySchema };

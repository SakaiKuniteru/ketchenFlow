'use strict';

const Joi = require('joi');

const confirmSchema = Joi.object({
    maGiaoDich: Joi.string().trim().max(100).required(),
    maThamChieu: Joi.string().trim().max(100).allow('', null).optional(),
    maChuanChi: Joi.string().trim().max(100).allow('', null).optional()
});

module.exports = { confirmSchema };

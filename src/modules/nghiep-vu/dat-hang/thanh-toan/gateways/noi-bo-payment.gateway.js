"use strict";
const crypto = require("crypto");
module.exports = { create: async () => ({ maGiaoDich: `NB-${crypto.randomUUID()}`, choXuLy: true }) };

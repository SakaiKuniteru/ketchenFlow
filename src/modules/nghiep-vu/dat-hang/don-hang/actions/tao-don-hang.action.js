"use strict";

const service = require("../don-hang.service");

async function taoDonHang(data, user) {
    return service.create(data, user);
}

module.exports = taoDonHang;

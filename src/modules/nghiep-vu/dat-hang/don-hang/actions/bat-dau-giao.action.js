"use strict";

const { TRANG_THAI_DON_HANG } = require("../don-hang.constants");
const service = require("../don-hang.service");

async function batDauGiao(id, data, user) {
    return service.changeStatus(id, TRANG_THAI_DON_HANG.DANG_GIAO, "BAT_DAU_GIAO", data, user);
}

module.exports = batDauGiao;

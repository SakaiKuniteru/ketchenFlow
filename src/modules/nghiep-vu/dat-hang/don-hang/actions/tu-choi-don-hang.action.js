"use strict";

const { TRANG_THAI_DON_HANG } = require("../don-hang.constants");
const service = require("../don-hang.service");

async function tuChoiDonHang(id, data, user) {
    return service.changeStatus(id, TRANG_THAI_DON_HANG.TU_CHOI, "TU_CHOI_DON_HANG", data, user);
}

module.exports = tuChoiDonHang;

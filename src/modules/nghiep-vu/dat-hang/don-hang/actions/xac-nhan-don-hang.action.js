"use strict";

const { TRANG_THAI_DON_HANG } = require("../don-hang.constants");
const service = require("../don-hang.service");

async function xacNhanDonHang(id, data, user) {
    return service.changeStatus(
        id,
        TRANG_THAI_DON_HANG.DANG_CHUAN_BI,
        "XAC_NHAN_DON_HANG",
        data,
        user
    );
}

module.exports = xacNhanDonHang;

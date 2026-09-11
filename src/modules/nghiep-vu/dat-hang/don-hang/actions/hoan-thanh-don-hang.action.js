'use strict';

const { TRANG_THAI_DON_HANG } = require('../don-hang.constants');
const service = require('../don-hang.service');

async function hoanThanhDonHang(id, data, user) {
    return service.changeStatus(id, TRANG_THAI_DON_HANG.HOAN_THANH, 'HOAN_THANH_DON_HANG', data, user);
}

module.exports = hoanThanhDonHang;

'use strict';

const { TRANG_THAI_DON_HANG } = require('../don-hang.constants');
const service = require('../don-hang.service');

async function huyDonHang(id, data, user) {
    return service.changeStatus(id, TRANG_THAI_DON_HANG.DA_HUY, 'HUY_DON_HANG', data, user);
}

module.exports = huyDonHang;

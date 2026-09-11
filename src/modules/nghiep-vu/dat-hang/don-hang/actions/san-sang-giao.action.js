'use strict';

const { TRANG_THAI_DON_HANG } = require('../don-hang.constants');
const service = require('../don-hang.service');

async function sanSangGiao(id, data, user) {
    return service.changeStatus(id, TRANG_THAI_DON_HANG.SAN_SANG_GIAO, 'SAN_SANG_GIAO', data, user);
}

module.exports = sanSangGiao;

'use strict';

const express = require('express');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const controller = require('./catalog.controller');

const router = express.Router();

router.use(authenticate);
router.get('/san-pham', controller.getDanhSach);
router.get('/thong-tin-checkout', controller.getThongTinCheckout);
router.post('/tinh-gio-hang', controller.tinhGioHang);

module.exports = router;

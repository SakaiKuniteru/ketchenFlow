const express = require('express');
const router = express.Router();
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./dia-chi.controller');
const chucVuExcel = require('./dia-chi.excel');

router.get('/tong-hop', authenticate, authorize('Q000005'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.get('/:id', authenticate, authorize('Q000510'), controller.getChiTiet);

module.exports = router;

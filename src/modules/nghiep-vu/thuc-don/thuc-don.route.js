const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./thuc-don.validation');
const validate = require('../../../middlewares/validate.middleware');
const authenticate = require('../../../middlewares/authenticate.middleware');
const authorize = require('../../../middlewares/authorize.middleware');
const uploadImportExcel = require('../../../middlewares/upload-import-excel.middleware');
const controller = require('./thuc-don.controller');
const thucDonExcel = require('./thuc-don.excel');

router.get('/tong-hop', authenticate, authorize('Q000025'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), thucDonExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    thucDonExcel.importData
);

router.get('/:id', authenticate, authorize('Q001001', 'Q001002', 'Q001003', 'Q001004'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q001002', 'Q001003', 'Q001004'),
    validate(createSchema),
    controller.create
);

router.patch('/cap-nhat/:id', authenticate, authorize('Q001003', 'Q001004'), validate(updateSchema), controller.update);

router.delete('/xoa/:id', authorize('Q001005'), authenticate, controller.xoa);

router.patch('/duyet/:id', authenticate, authorize('Q001006'), controller.duyet);

router.patch('/huy-duyet/:id', authenticate, authorize('Q001007'), controller.huyDuyet);

router.patch('/huy/:id', authenticate, authorize('Q001008'), controller.huy);

router.patch('/hoan-huy/:id', authenticate, authorize('Q001009'), controller.hoanHuy);

module.exports = router;

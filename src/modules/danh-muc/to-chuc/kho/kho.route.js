const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./kho.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./kho.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const khoExcel = require('./kho.excel');

router.get('/tong-hop', authenticate, authorize('Q000022'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), khoExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    khoExcel.importData
);

router.get('/:id', authenticate, authorize('Q000559', 'Q000560', 'Q000561'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000560', 'Q000561'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000561'), validate(updateSchema), controller.update);

module.exports = router;

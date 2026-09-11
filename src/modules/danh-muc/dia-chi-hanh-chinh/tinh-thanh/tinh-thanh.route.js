const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./tinh-thanh.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./tinh-thanh.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./tinh-thanh.excel');

router.get('/tong-hop', authenticate, authorize('Q000007'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000514', 'Q000515', 'Q000516'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000515', 'Q000516'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000516'), validate(updateSchema), controller.update);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./quoc-gia.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./quoc-gia.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./quoc-gia.excel');

router.get('/tong-hop', authenticate, authorize('Q000006'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000511', 'Q000512', 'Q000513'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000512', 'Q000513'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000513'), validate(updateSchema), controller.update);

module.exports = router;

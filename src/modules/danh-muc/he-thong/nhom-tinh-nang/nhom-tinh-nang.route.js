const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./nhom-tinh-nang.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./nhom-tinh-nang.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./nhom-tinh-nang.excel');

router.get('/tong-hop', authenticate, authorize('Q000009'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000520', 'Q000521', 'Q000522'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000521', 'Q000522'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000522'), validate(updateSchema), controller.update);

module.exports = router;

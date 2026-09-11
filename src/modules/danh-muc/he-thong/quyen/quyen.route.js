const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./quyen.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./quyen.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./quyen.excel');

router.get('/tong-hop', authenticate, authorize('Q000010'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000523', 'Q000524', 'Q000525'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000524', 'Q000525'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000525'), validate(updateSchema), controller.update);

module.exports = router;

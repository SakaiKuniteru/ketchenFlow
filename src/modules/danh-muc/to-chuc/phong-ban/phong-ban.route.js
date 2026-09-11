const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./phong-ban.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./phong-ban.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const phongBanExcel = require('./phong-ban.excel');

router.get('/tong-hop', authenticate, authorize('Q000003'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), phongBanExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    phongBanExcel.importData
);

router.get('/:id', authenticate, authorize('Q000504', 'Q000505', 'Q000506'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000505', 'Q000506'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000506'), validate(updateSchema), controller.update);

module.exports = router;

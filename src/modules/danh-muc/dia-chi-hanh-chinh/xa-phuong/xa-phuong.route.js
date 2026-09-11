const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./xa-phuong.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./xa-phuong.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./xa-phuong.excel');

router.get('/tong-hop', authenticate, authorize('Q000008'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000517', 'Q000518', 'Q000519'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000518', 'Q000519'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000519'), validate(updateSchema), controller.update);

module.exports = router;

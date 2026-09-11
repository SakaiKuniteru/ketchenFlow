const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./nha-an.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./nha-an.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const nhaAnExcel = require('./nha-an.excel');

router.get('/tong-hop', authenticate, authorize('Q000017'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), nhaAnExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    nhaAnExcel.importData
);

router.get('/:id', authenticate, authorize('Q000544', 'Q000545', 'Q000546'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000545', 'Q000546'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000546'), validate(updateSchema), controller.update);

module.exports = router;

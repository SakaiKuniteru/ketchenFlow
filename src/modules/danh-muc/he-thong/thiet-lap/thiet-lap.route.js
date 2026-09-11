const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./thiet-lap.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./thiet-lap.controller');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const thietLapExcel = require('./thiet-lap.excel');

router.get('/tong-hop', authenticate, authorize('Q000013'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), thietLapExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    thietLapExcel.importData
);

router.get('/:id', authenticate, authorize('Q000532', 'Q000533', 'Q000534'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000533', 'Q000534'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000534'), validate(updateSchema), controller.update);

module.exports = router;

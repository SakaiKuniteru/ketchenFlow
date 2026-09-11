const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./thuc-pham.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./thuc-pham.controller');
const multer = require('multer');
const excelController = require('./thuc-pham.excel');

const uploadExcel = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const uploadThucPham = require('./upload-thuc-pham.middleware');

router.get('/tong-hop', authenticate, authorize('Q000021'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), excelController.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadExcel.single('file'),
    excelController.importData
);

router.get('/:id', authenticate, authorize('Q000556', 'Q000557', 'Q000558'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000557', 'Q000558'),
    uploadThucPham.single('hinhAnh'),
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000558'),
    uploadThucPham.single('hinhAnh'),
    validate(updateSchema),
    controller.update
);

module.exports = router;

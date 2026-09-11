const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./mon-an.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./mon-an.controller');
const uploadMonAn = require('./upload-mon-an.middleware');
const validateUpdateMonAn = validate(updateSchema);
const multer = require('multer');
const excelController = require('./mon-an.excel');

function parseDsThucPham(req, res, next) {
    try {
        if (typeof req.body?.dsThucPham === 'string') {
            req.body.dsThucPham = JSON.parse(req.body.dsThucPham);
        }

        return next();
    } catch (error) {
        return next(new Error('Danh sách thực phẩm không hợp lệ.'));
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

function validateMonAnUpdate(req, res, next) {
    const hasBody = Object.keys(req.body || {}).length > 0;

    const hasFile = Boolean(req.file);

    if (!hasBody && hasFile) {
        return next();
    }

    return validateUpdateMonAn(req, res, next);
}

router.get('/tong-hop', authenticate, authorize('Q000020'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), excelController.exportData);

router.post('/import-du-lieu', authenticate, authorize('Q100002'), upload.single('file'), excelController.importData);

router.get('/xuat-cong-thuc', authenticate, authorize('Q100001'), excelController.exportCongThuc);

router.post(
    '/import-cong-thuc',
    authenticate,
    authorize('Q100002'),
    upload.single('file'),
    excelController.importCongThuc
);

router.post('/cap-nhat-gia', authenticate, authorize('Q000554', 'Q000555'), controller.capNhatGia);

router.get('/:id', authenticate, authorize('Q000553', 'Q000554', 'Q000555'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000554', 'Q000555'),
    uploadMonAn.single('hinhAnh'),
    parseDsThucPham,
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000555'),
    uploadMonAn.single('hinhAnh'),
    parseDsThucPham,
    validateMonAnUpdate,
    controller.update
);

module.exports = router;

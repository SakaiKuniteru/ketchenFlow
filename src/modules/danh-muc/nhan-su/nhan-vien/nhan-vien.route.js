const express = require('express');
const router = express.Router();
const controller = require('./nhan-vien.controller');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const validate = require('../../../../middlewares/validate.middleware');
const uploadNhanVien = require('./upload-nhan-vien.middleware');
const { createSchema, updateSchema } = require('./nhan-vien.validation');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const chucVuExcel = require('./nhan-vien.excel');
const validateUpdateNhanVien = validate(updateSchema);

function validateNhanVienUpdate(req, res, next) {
    const hasBody = Object.keys(req.body || {}).length > 0;

    const hasFile = Boolean(req.file);

    if (!hasBody && hasFile) {
        return next();
    }

    return validateUpdateNhanVien(req, res, next);
}

router.get('/tong-hop', authenticate, authorize('Q000023'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), chucVuExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    chucVuExcel.importData
);

router.get('/:id', authenticate, authorize('Q000562', 'Q000563', 'Q000564'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000563', 'Q000564'),
    uploadNhanVien.single('anhDaiDien'),
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000564'),
    uploadNhanVien.single('anhDaiDien'),
    validateNhanVienUpdate,
    controller.update
);

module.exports = router;

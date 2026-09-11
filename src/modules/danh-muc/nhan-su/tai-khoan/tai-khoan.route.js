const express = require('express');
const router = express.Router();
const { createSchema, updateSchema, doiMatKhauSchema, datLaiMatKhauSchema } = require('./tai-khoan.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./tai-khoan.controller');
const uploadNhanVien = require('../nhan-vien/upload-nhan-vien.middleware');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const taiKhoanExcel = require('./tai-khoan.excel');
const validateUpdateTaiKhoan = validate(updateSchema);

function validateTaiKhoanUpdate(req, res, next) {
    const hasBody = Object.keys(req.body || {}).length > 0;

    const hasFile = Boolean(req.file);

    if (!hasBody && hasFile) {
        return next();
    }
    return validateUpdateTaiKhoan(req, res, next);
}

router.get('/tong-hop', authenticate, authorize('Q000012'), controller.getTongHop);

router.get('/nhan-vien-kha-dung', authenticate, authorize('Q000530', 'Q000531'), controller.getNhanVienKhaDung);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), taiKhoanExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    taiKhoanExcel.importData
);

router.get('/:id', authenticate, authorize('Q000529', 'Q000530', 'Q000531'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000530', 'Q000531'),
    uploadNhanVien.single('anhDaiDien'),
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000531'),
    uploadNhanVien.single('anhDaiDien'),
    validateTaiKhoanUpdate,
    controller.update
);

router.patch('/doi-mat-khau', authenticate, authorize('Q000531'), validate(doiMatKhauSchema), controller.doiMatKhau);

router.patch(
    '/dat-lai-mat-khau/:id',
    authenticate,
    authorize('Q000531'),
    validate(datLaiMatKhauSchema),
    controller.datLaiMatKhau
);

module.exports = router;

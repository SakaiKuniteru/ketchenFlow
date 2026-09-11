const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./co-so.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const uploadCoSo = require('./upload-co-so.middleware');
const mapCoSoUpload = require('./map-co-so-upload.middleware');
const controller = require('./co-so.controller');
const validateUpdateCoSo = validate(updateSchema);
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const coSoExcel = require('./co-so.excel');

function validateCoSoUpdate(req, res, next) {
    const hasBody = Object.keys(req.body || {}).length > 0;

    const hasFile = Object.values(req.files || {}).some((files) => Array.isArray(files) && files.length > 0);

    if (!hasBody && hasFile) {
        return next();
    }

    return validateUpdateCoSo(req, res, next);
}

router.get('/tong-hop', authenticate, authorize('Q000002'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), coSoExcel.exportData);

router.post(
    '/import-du-lieu',
    authenticate,
    authorize('Q100002'),
    uploadImportExcel.single('file'),
    coSoExcel.importData
);

router.get('/:id', authenticate, authorize('Q000501', 'Q000502', 'Q000503'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000502', 'Q000503'),
    uploadCoSo.fields([
        {
            name: 'logo',
            maxCount: 1
        },
        {
            name: 'favicon',
            maxCount: 1
        },
        {
            name: 'logoDoiTac',
            maxCount: 1
        }
    ]),
    mapCoSoUpload,
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000503'),
    uploadCoSo.fields([
        {
            name: 'logo',
            maxCount: 1
        },
        {
            name: 'favicon',
            maxCount: 1
        },
        {
            name: 'logoDoiTac',
            maxCount: 1
        }
    ]),
    mapCoSoUpload,
    validateCoSoUpdate,
    controller.update
);

module.exports = router;

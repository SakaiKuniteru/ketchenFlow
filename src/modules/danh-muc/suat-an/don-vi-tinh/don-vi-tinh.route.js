const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./don-vi-tinh.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const uploadImportExcel = require('../../../../middlewares/upload-import-excel.middleware');
const controller = require('./don-vi-tinh.controller');
const multer = require('multer');
const excelController = require('./don-vi-tinh.excel');

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.get('/tong-hop', authenticate, authorize('Q000016'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), excelController.exportData);

router.post('/import-du-lieu', authenticate, authorize('Q100002'), upload.single('file'), excelController.importData);

router.get('/:id', authenticate, authorize('Q000541', 'Q000542', 'Q000543'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000542', 'Q000543'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000543'), validate(updateSchema), controller.update);

module.exports = router;

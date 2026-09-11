const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./ca-an.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./ca-an.controller');
const multer = require('multer');
const excelController = require('./ca-an.excel');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.get('/tong-hop', authenticate, authorize('Q000018'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), excelController.exportData);

router.post('/import-du-lieu', authenticate, authorize('Q100002'), upload.single('file'), excelController.importData);

router.get('/:id', authenticate, authorize('Q000547', 'Q000548', 'Q000549'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000548', 'Q000549'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000549'), validate(updateSchema), controller.update);

module.exports = router;

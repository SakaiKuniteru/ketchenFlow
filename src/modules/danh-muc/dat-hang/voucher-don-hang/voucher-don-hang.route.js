'use strict';

const express = require('express');
const multer = require('multer');

const authenticate = require('../../../../middlewares/authenticate.middleware');

const authorize = require('../../../../middlewares/authorize.middleware');

const validate = require('../../../../middlewares/validate.middleware');

const controller = require('./voucher-don-hang.controller');

const excelController = require('./voucher-don-hang.excel');

const { createSchema, updateSchema } = require('./voucher-don-hang.validation');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.get('/tong-hop', authenticate, authorize('Q000034', 'Q002031'), controller.getTongHop);

router.get('/xuat-du-lieu', authenticate, authorize('Q100001'), excelController.exportData);

router.post('/import-du-lieu', authenticate, authorize('Q100002'), upload.single('file'), excelController.importData);

router.get('/:id', authenticate, authorize('Q000034', 'Q002031', 'Q002032', 'Q002033'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q002032', 'Q002033'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q002033'), validate(updateSchema), controller.update);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./gia-ve-an.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./gia-ve-an.controller');

router.get('/tong-hop', authenticate, authorize('Q000029'), controller.getTongHop);

router.get('/tim-gia', authenticate, authorize('Q000568', 'Q000569', 'Q000570'), controller.getTimGia);

router.get('/:id', authenticate, authorize('Q000568', 'Q000569', 'Q000570'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000569', 'Q000570'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000570'), validate(updateSchema), controller.update);

module.exports = router;

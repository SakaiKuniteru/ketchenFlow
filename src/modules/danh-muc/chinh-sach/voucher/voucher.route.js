const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./voucher.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./voucher.controller');

router.get('/tong-hop', authenticate, authorize('Q000014'), controller.getTongHop);

router.get('/:id', authenticate, authorize('Q000535', 'Q000536', 'Q000537'), controller.getChiTiet);

router.post('/them-moi', authenticate, authorize('Q000536', 'Q000537'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000537'), validate(updateSchema), controller.update);

module.exports = router;

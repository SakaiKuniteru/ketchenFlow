'use strict';

const express = require('express');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const validate = require('../../../../middlewares/validate.middleware');
const controller = require('./thanh-toan-don-hang.controller');
const { confirmSchema } = require('./thanh-toan-don-hang.validation');

const router = express.Router();
router.use(authenticate);
router.post('/:donHangId/khoi-tao', controller.create);
router.get('/:donHangId/lich-su', controller.list);
router.patch('/giao-dich/:id/xac-nhan', authorize('Q002033'), validate(confirmSchema), controller.confirm);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate.middleware');
const controller = require('./cau-hinh.controller');

router.get('/gia-tri-public', controller.getGiaTriPublic);

router.get('/gia-tri', authenticate, controller.getGiaTri);

module.exports = router;

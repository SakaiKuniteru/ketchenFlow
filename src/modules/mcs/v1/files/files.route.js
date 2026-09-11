'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../../../middlewares/authenticate.middleware');
const controller = require('./files.controller');

router.get(/^\/(.+)$/, authenticate, controller.getFile);

module.exports = router;

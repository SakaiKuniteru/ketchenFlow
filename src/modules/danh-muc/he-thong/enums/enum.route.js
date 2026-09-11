const express = require('express');

const router = express.Router();

const enumController = require('./enum.controller');

const authenticate = require('../../../../middlewares/authenticate.middleware');

router.get('/', enumController.get);

module.exports = router;

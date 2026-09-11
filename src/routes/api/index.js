const express = require('express');

const routes = require('./config');

const router = express.Router();

routes.forEach(([path, route]) => {
    router.use(path, route);
});

module.exports = router;

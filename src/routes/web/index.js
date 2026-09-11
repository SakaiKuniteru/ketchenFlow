'use strict';

const express = require('express');
const router = express.Router();
const webRoutes = require('./config');
const { renderPage } = require('../../utils/render-page.util');
router.get('/assets/js/pages/dat-hang/templates.js', require('./order-templates'));

router.use((req, res, next) => {
    res.locals.formOptions = {
        gioiTinh: [
            {
                value: '0',
                label: 'Nữ'
            },
            {
                value: '1',
                label: 'Nam'
            },
            {
                value: '2',
                label: 'Khác'
            }
        ]
    };

    next();
});

router.get('/', (req, res, next) => {
    try {
        return renderPage(req, res, 'pages/home/index', {
            title: 'Trang chủ',
            breadcrumbs: []
        });
    } catch (error) {
        next(error);
    }
});

router.get('/auth/login', (req, res, next) => {
    try {
        return renderPage(req, res, 'pages/auth/login', {
            layout: 'auth',
            title: 'Đăng nhập',
            breadcrumbs: []
        });
    } catch (error) {
        next(error);
    }
});

webRoutes.forEach((route) => {
    const method = String(route.method || 'get').toLowerCase();

    if (typeof router[method] !== 'function') {
        throw new Error(`HTTP method không hợp lệ: ${method}`);
    }

    router[method](route.path, route.handler);
});

module.exports = router;

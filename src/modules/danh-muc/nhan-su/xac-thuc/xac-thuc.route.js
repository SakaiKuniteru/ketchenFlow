const express = require('express');

const router = express.Router();

const controller = require('./xac-thuc.controller');

const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const validate = require('../../../../middlewares/validate.middleware');

const {
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
    profileSchema,
    changeMatKhauSchema
} = require('./xac-thuc.validation');

router.post('/login', validate(loginSchema), controller.login);

router.get('/nhan-vien-hien-tai', authenticate, controller.getNhanVienHienTai);

router.get('/nhan-vien/:id', authenticate, controller.getThongTinNhanVien);

router.post('/lam-moi-token', validate(refreshTokenSchema), controller.refreshToken);

router.post('/logout', controller.logout);

router.patch('/doi-mat-khau', authenticate, validate(changeMatKhauSchema), controller.changeMatKhau);

module.exports = router;

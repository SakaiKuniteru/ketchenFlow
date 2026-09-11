const express = require('express');
const router = express.Router();

const {
    createSchema,
    taoQrSchema,
    huyQrSchema,
    huyThanhToanSchema,
    xacNhanSchema,
    hoanTienSchema,
    callbackSchema
} = require('./thanh-toan-ve-an.validation');

const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./thanh-toan-ve-an.controller');

router.get('/tong-hop', authenticate, authorize('Q001041'), controller.getTongHop);

router.post('/them-moi', authenticate, authorize('Q001042'), validate(createSchema), controller.create);

router.post('/tao-qr', authenticate, authorize('Q001043'), validate(taoQrSchema), controller.taoQr);

router.get('/qr/:id', authenticate, authorize('Q001056', 'Q001043', 'Q001044', 'Q001045'), controller.getQr);

router.patch('/huy-qr/:id', authenticate, authorize('Q001044'), validate(huyQrSchema), controller.huyQr);

router.patch('/xac-nhan/:id', authenticate, authorize('Q001045'), validate(xacNhanSchema), controller.xacNhan);

router.post('/hoan-tien', authenticate, authorize('Q001046'), validate(hoanTienSchema), controller.hoanTien);

router.patch(
    '/huy-thanh-toan/:id',
    authenticate,
    authorize('Q001046'),
    validate(huyThanhToanSchema),
    controller.huyThanhToan
);

router.post('/callback', validate(callbackSchema), controller.callback);

router.get('/danh-sach-phieu/:phieuLayVeId', authenticate, authorize('Q001058'), controller.getDanhSachPhieu);

router.get('/in-phieu-hoan/:id', authenticate, authorize('Q001059'), controller.inPhieuHoan);

router.get('/:id', authenticate, authorize('Q001060'), controller.getChiTiet);

module.exports = router;

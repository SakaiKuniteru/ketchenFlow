const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./chinh-sach.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./chinh-sach.controller');

router.get('/tong-hop', authenticate, authorize('Q000015'), controller.getTongHop);

router.get(
    '/tong-hop/doi-tuong',
    authenticate,
    authorize('Q000015'),
    authorize('Q000538', 'Q000539', 'Q000540'),
    controller.getTongHopDoiTuong
);

router.get(
    '/tong-hop/voucher',
    authenticate,
    authorize('Q000015'),
    authorize('Q000538', 'Q000539', 'Q000540'),
    controller.getTongHopVoucher
);

router.get(
    '/tong-hop/loai-chinh-sach',
    authenticate,
    authorize('Q000015'),
    authorize('Q000538', 'Q000539', 'Q000540'),
    controller.getLoaiChinhSach
);

router.get('/:id', authenticate, authorize('Q000538', 'Q000539', 'Q000540'), controller.getChiTiet);

router.get(
    '/:id/doi-tuong',
    authenticate,
    authorize('Q000015'),
    authorize('Q000538', 'Q000539', 'Q000540'),
    controller.getDoiTuongTheoChinhSach
);

router.post('/them-moi', authenticate, authorize('Q000539', 'Q000540'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q000540'), validate(updateSchema), controller.update);

module.exports = router;

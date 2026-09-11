const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./bao-cao.validation');
const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const uploadBaoCao = require('./upload-bao-cao.middleware');
const controller = require('./bao-cao.controller');

router.get('/tong-hop', authenticate, authorize('Q000024'), controller.getTongHop);

router.get('/thong-tin-xuat/:idHoacMa', authenticate, authorize('Q100001'), controller.getThongTinXuatBaoCao);

router.get('/xuat/:idHoacMa', authenticate, authorize('Q100001'), controller.xuatBaoCao);

router.get('/:id', authenticate, authorize('Q000565', 'Q000566', 'Q000567'), controller.getChiTiet);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q000566', 'Q000567'),
    uploadBaoCao.single('fileMau'),
    validate(createSchema),
    controller.create
);

router.patch(
    '/cap-nhat/:id',
    authenticate,
    authorize('Q000567'),
    uploadBaoCao.single('fileMau'),
    validate(updateSchema),
    controller.update
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createSchema, updateSchema } = require('./thong-bao.validation');
const validate = require('../../../middlewares/validate.middleware');
const authenticate = require('../../../middlewares/authenticate.middleware');
const authorize = require('../../../middlewares/authorize.middleware');
const controller = require('./thong-bao.controller');

router.get('/tong-hop', authenticate, authorize('Q000026'), controller.getTongHop);

router.get(
    '/tong-hop/doi-tuong',
    authenticate,
    authorize('Q000026'),
    authorize('Q001010', 'Q001011', 'Q001012', 'Q001013'),
    controller.getTongHopDoiTuong
);

router.get('/cua-toi', authenticate, authorize('Q001016'), controller.getCuaToi);

router.get('/cua-toi/so-chua-doc', authenticate, authorize('Q001016'), controller.getSoChuaDoc);

router.patch('/cua-toi/da-doc-tat-ca', authenticate, authorize('Q001017'), controller.danhDauTatCaDaDoc);

router.patch('/cua-toi/:id/da-doc', authenticate, authorize('Q001016'), controller.danhDauDaDoc);

router.post(
    '/them-moi',
    authenticate,
    authorize('Q001011', 'Q001012', 'Q001013'),
    validate(createSchema),
    controller.create
);

router.patch('/cap-nhat/:id', authenticate, authorize('Q001012', 'Q001013'), validate(updateSchema), controller.update);

router.patch('/gui/:id', authenticate, authorize('Q001014'), controller.gui);

router.patch('/huy-gui/:id', authenticate, authorize('Q001015'), controller.huyGui);

router.get('/:id', authenticate, authorize('Q001010', 'Q001011', 'Q001012', 'Q001013'), controller.getChiTiet);

module.exports = router;

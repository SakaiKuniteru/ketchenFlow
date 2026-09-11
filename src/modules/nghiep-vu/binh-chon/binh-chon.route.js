const express = require('express');
const router = express.Router();
const { createSchema, updateSchema, voteSchema, cancelSchema, reopenSchema } = require('./binh-chon.validation');
const validate = require('../../../middlewares/validate.middleware');
const authenticate = require('../../../middlewares/authenticate.middleware');
const authorize = require('../../../middlewares/authorize.middleware');
const controller = require('./binh-chon.controller');

router.get('/tong-hop', authenticate, authorize('Q000027'), controller.getTongHop);

router.get(
    '/thuc-don-ngay-hop-le',
    authenticate,
    authorize('Q001019', 'Q001020'),
    controller.getDanhSachThucDonNgayHopLe
);

router.get('/cua-toi/hien-tai', authenticate, authorize('Q001023', 'Q001025'), controller.getHienTaiCuaToi);

router.get('/cua-toi/sap-toi', authenticate, authorize('Q001024'), controller.getSapToiCuaToi);

router.get('/lich-su', authenticate, authorize('Q001026'), controller.getLichSuTong);

router.get('/cua-toi/lich-su', authenticate, authorize('Q001027', 'Q001026'), controller.getLichSuCuaToi);

router.get(
    '/cua-toi/:id',
    authenticate,
    authorize('Q001023', 'Q001024', 'Q001025', 'Q001026', 'Q001027'),
    controller.getChiTietCuaToi
);

router.post('/them-moi', authenticate, authorize('Q001019'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q001020'), validate(updateSchema), controller.update);

router.patch('/gui/:id', authenticate, authorize('Q001021'), controller.gui);

router.patch('/mo-lai/:id', authenticate, authorize('Q001031'), validate(reopenSchema), controller.moLai);

router.patch('/huy/:id', authenticate, authorize('Q001022'), validate(cancelSchema), controller.huy);

router.put('/cua-toi/:id/binh-chon', authenticate, authorize('Q001025'), validate(voteSchema), controller.binhChon);

router.get('/:id/thong-ke', authenticate, authorize('Q001028'), controller.getThongKe);

router.get('/:id/nguoi-binh-chon', authenticate, authorize('Q001029', 'Q001028'), controller.getNguoiBinhChon);

router.get('/:id', authenticate, authorize('Q001018', 'Q001019', 'Q001020'), controller.getChiTiet);

router.delete('/xoa/:id', authenticate, authorize('Q001030'), controller.remove);

module.exports = router;

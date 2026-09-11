const express = require('express');
const router = express.Router();

const { apDungSchema, createSchema, updateSchema } = require('./phieu-lay-ve-mien-giam.validation');

const validate = require('../../../../middlewares/validate.middleware');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const controller = require('./phieu-lay-ve-mien-giam.controller');

router.get('/tong-hop', authenticate, authorize('Q001037'), controller.getTongHop);

router.get('/kha-dung', authenticate, authorize('Q001053'), controller.getKhaDung);

router.post('/ap-dung', authenticate, authorize('Q001054'), validate(apDungSchema), controller.apDung);

router.post('/them-moi', authenticate, authorize('Q001038', 'Q001039'), validate(createSchema), controller.create);

router.patch('/cap-nhat/:id', authenticate, authorize('Q001039'), validate(updateSchema), controller.update);

router.delete('/xoa/:id', authenticate, authorize('Q001040'), controller.delete);

router.get('/:id', authenticate, authorize('Q001055', 'Q001038', 'Q001039'), controller.getChiTiet);

module.exports = router;

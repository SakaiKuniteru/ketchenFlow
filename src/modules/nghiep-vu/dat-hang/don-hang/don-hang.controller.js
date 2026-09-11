'use strict';

const service = require('./don-hang.service');
const { successResponse } = require('../../../../utils/response.util');
const { TRANG_THAI_DON_HANG } = require('./don-hang.constants');

class DonHangController {
    async create(req, res, next) {
        try {
            const data = await service.create(req.body, req.user);
            return successResponse(res, 'Đặt hàng thành công.', data, 201);
        } catch (error) {
            return next(error);
        }
    }

    async listMine(req, res, next) {
        try {
            const data = await service.listMine(req.query, req.user);
            return successResponse(res, 'Lấy danh sách đơn hàng thành công.', data);
        } catch (error) {
            return next(error);
        }
    }

    async listManagement(req, res, next) {
        try {
            const data = await service.listManagement(req.query, req.user);
            return successResponse(res, 'Lấy danh sách nhận đơn thành công.', data);
        } catch (error) {
            return next(error);
        }
    }

    async detail(req, res, next) {
        try {
            const data = await service.getDetail(req.params.id, req.user);
            return successResponse(res, 'Lấy chi tiết đơn hàng thành công.', data);
        } catch (error) {
            return next(error);
        }
    }

    async managementDetail(req, res, next) {
        try {
            const data = await service.getManagementDetail(req.params.id, req.user);
            return successResponse(res, 'Lấy chi tiết nhận đơn thành công.', data);
        } catch (error) {
            return next(error);
        }
    }

    action(target, name) {
        return async (req, res, next) => {
            try {
                const data = await service.changeStatus(req.params.id, target, name, req.body, req.user);
                return successResponse(res, 'Xử lý đơn hàng thành công.', data);
            } catch (error) {
                return next(error);
            }
        };
    }
}

const controller = new DonHangController();
controller.xacNhan = controller.action(TRANG_THAI_DON_HANG.DANG_CHUAN_BI, 'XAC_NHAN_DON_HANG');
controller.tuChoi = controller.action(TRANG_THAI_DON_HANG.TU_CHOI, 'TU_CHOI_DON_HANG');
controller.huy = controller.action(TRANG_THAI_DON_HANG.DA_HUY, 'HUY_DON_HANG');
controller.huyNhaAn = controller.action(TRANG_THAI_DON_HANG.DA_HUY, 'NHA_AN_HUY_DON_HANG');
controller.sanSangGiao = controller.action(TRANG_THAI_DON_HANG.SAN_SANG_GIAO, 'SAN_SANG_GIAO');
controller.batDauGiao = controller.action(TRANG_THAI_DON_HANG.DANG_GIAO, 'BAT_DAU_GIAO');
controller.hoanThanh = controller.action(TRANG_THAI_DON_HANG.HOAN_THANH, 'HOAN_THANH_DON_HANG');

module.exports = controller;

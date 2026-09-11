'use strict';

const service = require('./catalog.service');
const { successResponse } = require('../../../../utils/response.util');

class CatalogController {
    async getDanhSach(req, res, next) {
        try {
            return successResponse(
                res,
                'Lấy danh sách đặt hàng thành công.',
                await service.getDanhSach(req.query, req.user)
            );
        } catch (error) {
            return next(error);
        }
    }

    async getThongTinCheckout(req, res, next) {
        try {
            return successResponse(
                res,
                'Lấy thông tin nhận hàng thành công.',
                await service.getThongTinCheckout(req.query, req.user)
            );
        } catch (error) {
            return next(error);
        }
    }

    async tinhGioHang(req, res, next) {
        try {
            return successResponse(res, 'Tính giỏ hàng thành công.', await service.tinhGioHang(req.body, req.user));
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new CatalogController();

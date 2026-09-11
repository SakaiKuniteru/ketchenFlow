const khungGioNhanHangService = require('./khung-gio-nhan-hang.service');

const { successResponse } = require('../../../../utils/response.util');

class KhungGioNhanHangController {
    async getTongHop(req, res, next) {
        try {
            const data = await khungGioNhanHangService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách khung giờ nhận hàng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getKhungGioKhaDung(req, res, next) {
        try {
            const data = await khungGioNhanHangService.getKhungGioKhaDung(req.query);

            return successResponse(res, 'Lấy danh sách khung giờ có thể nhận hàng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await khungGioNhanHangService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết khung giờ nhận hàng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await khungGioNhanHangService.create(req.body);

            return successResponse(res, 'Thêm khung giờ nhận hàng thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await khungGioNhanHangService.update(id, req.body);

            return successResponse(res, 'Cập nhật khung giờ nhận hàng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new KhungGioNhanHangController();

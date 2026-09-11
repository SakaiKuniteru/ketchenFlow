const donViTinhService = require('./don-vi-tinh.service');

const { successResponse } = require('../../../../utils/response.util');

class DonViTinhController {
    async getTongHop(req, res, next) {
        try {
            const data = await donViTinhService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách đơn vị tính thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await donViTinhService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết đơn vị tính thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await donViTinhService.create(req.body);

            return successResponse(res, 'Thêm đơn vị tính thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await donViTinhService.update(id, req.body);

            return successResponse(res, 'Cập nhật đơn vị tính thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DonViTinhController();

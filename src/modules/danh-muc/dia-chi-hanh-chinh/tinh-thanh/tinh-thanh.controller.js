const tinhThanhService = require('./tinh-thanh.service');

const { successResponse } = require('../../../../utils/response.util');

class TinhThanhController {
    async getTongHop(req, res, next) {
        try {
            const data = await tinhThanhService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách tỉnh thành thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await tinhThanhService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết tỉnh thành thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await tinhThanhService.create(req.body);

            return successResponse(res, 'Thêm tỉnh thành thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await tinhThanhService.update(id, req.body);

            return successResponse(res, 'Cập nhật tỉnh thành thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TinhThanhController();

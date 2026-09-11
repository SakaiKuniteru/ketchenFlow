const nhaAnService = require('./nha-an.service');

const { successResponse } = require('../../../../utils/response.util');

class NhaAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await nhaAnService.getTongHop();

            return successResponse(res, 'Lấy danh sách nhà ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhaAnService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết nhà ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await nhaAnService.create(req.body);

            return successResponse(res, 'Thêm mới nhà ăn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = await nhaAnService.update(req.params.id, req.body);

            return successResponse(res, 'Cập nhật nhà ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NhaAnController();

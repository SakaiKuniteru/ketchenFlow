const quyenService = require('./quyen.service');

const { successResponse } = require('../../../../utils/response.util');

class QuyenController {
    async getTongHop(req, res, next) {
        try {
            const data = await quyenService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách quyền thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await quyenService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết quyền thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await quyenService.create(req.body);

            return successResponse(res, 'Thêm quyền thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await quyenService.update(id, req.body);

            return successResponse(res, 'Cập nhật quyền thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new QuyenController();

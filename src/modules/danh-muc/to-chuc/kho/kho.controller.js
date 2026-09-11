const khoService = require('./kho.service');
const { successResponse } = require('../../../../utils/response.util');

class KhoController {
    async getTongHop(req, res, next) {
        try {
            const data = await khoService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách kho thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await khoService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết kho thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await khoService.create(req.body);

            return successResponse(res, 'Thêm kho thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await khoService.update(id, req.body);

            return successResponse(res, 'Cập nhật kho thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new KhoController();

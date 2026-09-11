const caAnService = require('./ca-an.service');
const { successResponse } = require('../../../../utils/response.util');

class CaAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await caAnService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách ca ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await caAnService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết ca ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await caAnService.create(req.body);

            return successResponse(res, 'Thêm ca ăn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await caAnService.update(id, req.body);

            return successResponse(res, 'Cập nhật ca ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CaAnController();

const quocGiaService = require('./quoc-gia.service');

const { successResponse } = require('../../../../utils/response.util');

class QuocGiaController {
    async getTongHop(req, res, next) {
        try {
            const data = await quocGiaService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách quốc gia thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await quocGiaService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết quốc gia thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await quocGiaService.create(req.body);

            return successResponse(res, 'Thêm quốc gia thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await quocGiaService.update(id, req.body);

            return successResponse(res, 'Cập nhật quốc gia thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new QuocGiaController();

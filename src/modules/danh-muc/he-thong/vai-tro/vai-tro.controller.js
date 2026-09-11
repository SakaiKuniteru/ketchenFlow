const vaiTroService = require('./vai-tro.service');

const { successResponse } = require('../../../../utils/response.util');

class VaiTroController {
    async getTongHop(req, res, next) {
        try {
            const data = await vaiTroService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách vai trò thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await vaiTroService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết vai trò thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await vaiTroService.create(req.body);

            return successResponse(res, 'Thêm vai trò thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await vaiTroService.update(id, req.body);

            return successResponse(res, 'Cập nhật vai trò thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VaiTroController();

const coSoService = require('./co-so.service');
const { successResponse } = require('../../../../utils/response.util');

class CoSoController {
    async getTongHop(req, res, next) {
        try {
            const data = await coSoService.getTongHop();

            return successResponse(res, 'Lấy danh sách cơ sở thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;
            const data = await coSoService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết cơ sở thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await coSoService.create(req.body, req.files);

            return successResponse(res, 'Thêm mới cơ sở thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = await coSoService.update(req.params.id, req.body, req.files);

            return successResponse(res, 'Cập nhật cơ sở thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CoSoController();

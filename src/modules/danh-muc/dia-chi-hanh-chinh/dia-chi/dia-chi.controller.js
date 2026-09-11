const diaChiService = require('./dia-chi.service');

const { successResponse } = require('../../../../utils/response.util');

class DiaChiController {
    async getTongHop(req, res, next) {
        try {
            const data = await diaChiService.getTongHop();

            return successResponse(res, 'Lấy danh sách địa chỉ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await diaChiService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết địa chỉ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DiaChiController();

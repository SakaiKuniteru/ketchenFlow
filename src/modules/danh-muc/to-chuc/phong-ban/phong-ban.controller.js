const phongBanService = require('./phong-ban.service');
const { successResponse } = require('../../../../utils/response.util');

class PhongBanController {
    async getTongHop(req, res, next) {
        try {
            const data = await phongBanService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách phòng ban thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await phongBanService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết phòng ban thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await phongBanService.create(req.body);

            return successResponse(res, 'Thêm phòng ban thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await phongBanService.update(id, req.body);

            return successResponse(res, 'Cập nhật phòng ban thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PhongBanController();

const chucVuService = require('./chuc-vu.service');

const { successResponse } = require('../../../../utils/response.util');

class ChucVuController {
    async getTongHop(req, res, next) {
        try {
            const data = await chucVuService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách chức vụ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await chucVuService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết chức vụ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await chucVuService.create(req.body);

            return successResponse(res, 'Thêm chức vụ thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await chucVuService.update(id, req.body);

            return successResponse(res, 'Cập nhật chức vụ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChucVuController();

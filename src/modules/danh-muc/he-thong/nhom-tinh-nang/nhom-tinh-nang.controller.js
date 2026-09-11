const nhomTinhNangService = require('./nhom-tinh-nang.service');

const { successResponse } = require('../../../../utils/response.util');

class NhomTinhNangController {
    async getTongHop(req, res, next) {
        try {
            const data = await nhomTinhNangService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách nhóm tính năng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomTinhNangService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết nhóm tính năng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await nhomTinhNangService.create(req.body);

            return successResponse(res, 'Thêm nhóm tính năng thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomTinhNangService.update(id, req.body);

            return successResponse(res, 'Cập nhật nhóm tính năng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NhomTinhNangController();

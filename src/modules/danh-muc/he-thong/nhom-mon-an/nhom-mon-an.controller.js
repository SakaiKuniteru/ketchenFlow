const nhomMonAnService = require('./nhom-mon-an.service');

const { successResponse } = require('../../../../utils/response.util');

class NhomMonAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await nhomMonAnService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách nhóm món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomMonAnService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết nhóm món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await nhomMonAnService.create(req.body);

            return successResponse(res, 'Thêm nhóm món ăn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomMonAnService.update(id, req.body);

            return successResponse(res, 'Cập nhật nhóm món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NhomMonAnController();

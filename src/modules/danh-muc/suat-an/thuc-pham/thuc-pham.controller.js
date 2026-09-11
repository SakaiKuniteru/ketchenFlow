const thucPhamService = require('./thuc-pham.service');
const { successResponse } = require('../../../../utils/response.util');

class ThucPhamController {
    async getTongHop(req, res, next) {
        try {
            const data = await thucPhamService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách thực phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucPhamService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết thực phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await thucPhamService.create(req.body, req.file);

            return successResponse(res, 'Thêm thực phẩm thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucPhamService.update(id, req.body, req.file);

            return successResponse(res, 'Cập nhật thực phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThucPhamController();

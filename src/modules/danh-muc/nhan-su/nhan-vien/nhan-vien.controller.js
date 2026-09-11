const nhanVienService = require('./nhan-vien.service');

const { successResponse } = require('../../../../utils/response.util');

class NhanVienController {
    async getTongHop(req, res, next) {
        try {
            const data = await nhanVienService.getTongHop();

            return successResponse(res, 'Lấy danh mục nhân viên thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const data = await nhanVienService.getChiTiet(req.params.id);

            return successResponse(res, 'Lấy chi tiết nhân viên thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const result = await nhanVienService.create(req.body, req.file);

            return successResponse(res, 'Thêm nhân viên thành công.', result, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const result = await nhanVienService.update(req.params.id, req.body, req.file);

            return successResponse(res, 'Cập nhật nhân viên thành công.', result, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NhanVienController();

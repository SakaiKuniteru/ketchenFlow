const nhomSanPhamService = require('./nhom-san-pham.service');

const { successResponse } = require('../../../../utils/response.util');

class NhomSanPhamController {
    async getTongHop(req, res, next) {
        try {
            const data = await nhomSanPhamService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách nhóm sản phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomSanPhamService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết nhóm sản phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await nhomSanPhamService.create(req.body);

            return successResponse(res, 'Thêm nhóm sản phẩm thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await nhomSanPhamService.update(id, req.body);

            return successResponse(res, 'Cập nhật nhóm sản phẩm thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NhomSanPhamController();

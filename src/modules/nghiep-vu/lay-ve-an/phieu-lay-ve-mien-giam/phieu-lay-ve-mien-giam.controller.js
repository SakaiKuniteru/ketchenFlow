const service = require('./phieu-lay-ve-mien-giam.service');

const { successResponse } = require('../../../../utils/response.util');

class PhieuLayVeMienGiamController {
    async getTongHop(req, res, next) {
        try {
            const data = await service.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách miễn giảm của phiếu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getKhaDung(req, res, next) {
        try {
            const data = await service.getKhaDung(req.query);

            return successResponse(res, 'Lấy danh sách miễn giảm khả dụng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await service.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết miễn giảm của phiếu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async apDung(req, res, next) {
        try {
            const data = await service.apDung(req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Áp dụng miễn giảm thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await service.create(req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Thêm miễn giảm cho phiếu thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await service.update(id, req.body);

            return successResponse(res, 'Cập nhật miễn giảm của phiếu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const data = await service.delete(id);

            return successResponse(res, 'Xóa miễn giảm của phiếu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PhieuLayVeMienGiamController();

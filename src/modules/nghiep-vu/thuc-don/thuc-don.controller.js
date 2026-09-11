const thucDonService = require('./thuc-don.service');

const { successResponse } = require('../../../utils/response.util');

class ThucDonController {
    async getTongHop(req, res, next) {
        try {
            const data = await thucDonService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await thucDonService.create(req.body);

            return successResponse(res, 'Thêm thực đơn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.update(id, req.body);

            return successResponse(res, 'Cập nhật thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async xoa(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.xoa(id);

            return successResponse(res, 'Xóa thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async duyet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.duyet(id);

            return successResponse(res, 'Duyệt thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async huyDuyet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.huyDuyet(id);

            return successResponse(res, 'Hủy duyệt thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async huy(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.huy(id);

            return successResponse(res, 'Hủy thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async hoanHuy(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thucDonService.hoanHuy(id);

            return successResponse(res, 'Hoàn hủy thực đơn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThucDonController();

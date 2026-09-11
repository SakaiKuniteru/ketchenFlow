const thongBaoService = require('./thong-bao.service');
const { successResponse } = require('../../../utils/response.util');

class ThongBaoController {
    async getTongHop(req, res, next) {
        try {
            const data = await thongBaoService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getTongHopDoiTuong(req, res, next) {
        try {
            const data = await thongBaoService.getTongHopDoiTuong(req.query);

            return successResponse(res, 'Lấy danh sách đối tượng nhận thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getCuaToi(req, res, next) {
        try {
            const data = await thongBaoService.getCuaToi(req.user.taiKhoanId, req.query);

            return successResponse(res, 'Lấy danh sách thông báo của tôi thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getSoChuaDoc(req, res, next) {
        try {
            const data = await thongBaoService.getSoChuaDoc(req.user.taiKhoanId);

            return successResponse(res, 'Lấy số lượng thông báo chưa đọc thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async danhDauTatCaDaDoc(req, res, next) {
        try {
            const data = await thongBaoService.danhDauTatCaDaDoc(req.user.taiKhoanId);

            return successResponse(res, 'Đánh dấu tất cả thông báo là đã đọc thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async danhDauDaDoc(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thongBaoService.danhDauDaDoc(id, req.user.taiKhoanId);

            return successResponse(res, 'Đánh dấu thông báo là đã đọc thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await thongBaoService.create(req.body, req.user.taiKhoanId);

            return successResponse(res, 'Thêm thông báo thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thongBaoService.update(id, req.body, req.authorizationPermissions);

            return successResponse(res, 'Cập nhật thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async gui(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thongBaoService.gui(id);

            return successResponse(res, 'Gửi thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async huyGui(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thongBaoService.huyGui(id);

            return successResponse(res, 'Hủy gửi thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thongBaoService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết thông báo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThongBaoController();

const binhChonService = require('./binh-chon.service');

const { successResponse } = require('../../../utils/response.util');

class BinhChonSuatAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await binhChonService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getDanhSachThucDonNgayHopLe(req, res, next) {
        try {
            const data = await binhChonService.getDanhSachThucDonNgayHopLe(req.query);

            return successResponse(res, 'Lấy danh sách ngày thực đơn hợp lệ thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const data = await binhChonService.getChiTiet(req.params.id);

            return successResponse(res, 'Lấy chi tiết đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await binhChonService.create(req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Thêm đợt bình chọn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = await binhChonService.update(req.params.id, req.body);

            return successResponse(res, 'Cập nhật đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async gui(req, res, next) {
        try {
            const data = await binhChonService.gui(req.params.id, req.user?.taiKhoanId);

            return successResponse(res, 'Gửi đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async moLai(req, res, next) {
        try {
            const data = await binhChonService.moLai(req.params.id, req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Mở lại đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async huy(req, res, next) {
        try {
            const data = await binhChonService.huy(req.params.id, req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Hủy đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getHienTaiCuaToi(req, res, next) {
        try {
            const data = await binhChonService.getHienTaiCuaToi(req.user?.taiKhoanId);

            return successResponse(res, 'Lấy đợt bình chọn hiện tại thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getSapToiCuaToi(req, res, next) {
        try {
            const data = await binhChonService.getSapToiCuaToi(req.user?.taiKhoanId);

            return successResponse(res, 'Lấy danh sách bình chọn sắp tới thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async binhChon(req, res, next) {
        try {
            const data = await binhChonService.binhChon(req.params.id, req.body, req.user?.taiKhoanId);

            return successResponse(res, 'Bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getLichSuTong(req, res, next) {
        try {
            const data = await binhChonService.getLichSuTong(req.query);

            return successResponse(res, 'Lấy lịch sử bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getLichSuCuaToi(req, res, next) {
        try {
            const data = await binhChonService.getLichSuCuaToi(req.user?.taiKhoanId, req.query);

            return successResponse(res, 'Lấy lịch sử bình chọn của bạn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTietCuaToi(req, res, next) {
        try {
            const data = await binhChonService.getChiTietCuaToi(req.params.id, req.user?.taiKhoanId);

            return successResponse(res, 'Lấy chi tiết đợt bình chọn của bạn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getThongKe(req, res, next) {
        try {
            const data = await binhChonService.getThongKe(req.params.id);

            return successResponse(res, 'Lấy thống kê bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getNguoiBinhChon(req, res, next) {
        try {
            const data = await binhChonService.getNguoiBinhChon(req.params.id, req.query);

            return successResponse(res, 'Lấy danh sách người bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const data = await binhChonService.remove(req.params.id);

            return successResponse(res, 'Xóa đợt bình chọn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BinhChonSuatAnController();

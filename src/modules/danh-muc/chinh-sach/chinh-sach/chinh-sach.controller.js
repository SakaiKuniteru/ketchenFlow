const chinhSachService = require('./chinh-sach.service');

const { successResponse } = require('../../../../utils/response.util');

class ChinhSachController {
    async getTongHop(req, res, next) {
        try {
            const data = await chinhSachService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách chính sách thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getTongHopDoiTuong(req, res, next) {
        try {
            const data = await chinhSachService.getTongHopDoiTuong(req.query);

            return successResponse(res, 'Lấy danh sách đối tượng áp dụng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getTongHopVoucher(req, res, next) {
        try {
            const data = await chinhSachService.getTongHopVoucher(req.query);

            return successResponse(res, 'Lấy danh sách voucher thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getLoaiChinhSach(req, res, next) {
        try {
            const data = chinhSachService.getLoaiChinhSach();

            return successResponse(res, 'Lấy danh sách loại chính sách thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await chinhSachService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết chính sách thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getDoiTuongTheoChinhSach(req, res, next) {
        try {
            const { id } = req.params;

            const data = await chinhSachService.getDoiTuongTheoChinhSach(id, req.query);

            return successResponse(res, 'Lấy danh sách đối tượng áp dụng của chính sách thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await chinhSachService.create(req.body);

            return successResponse(res, 'Thêm chính sách thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await chinhSachService.update(id, req.body);

            return successResponse(res, 'Cập nhật chính sách thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChinhSachController();

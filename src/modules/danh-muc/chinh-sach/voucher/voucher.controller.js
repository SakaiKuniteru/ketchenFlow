const voucherService = require('./voucher.service');

const { successResponse } = require('../../../../utils/response.util');

class VoucherController {
    async getTongHop(req, res, next) {
        try {
            const data = await voucherService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách voucher thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await voucherService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết voucher thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await voucherService.create(req.body);

            return successResponse(res, 'Thêm voucher thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await voucherService.update(id, req.body);

            return successResponse(res, 'Cập nhật voucher thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VoucherController();

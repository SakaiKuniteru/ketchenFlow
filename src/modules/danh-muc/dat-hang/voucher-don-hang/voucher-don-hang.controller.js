"use strict";

const voucherDonHangService =
    require("./voucher-don-hang.service");

const {
    successResponse
} = require("../../../../utils/response.util");

class VoucherDonHangController {

    async getTongHop(
        req,
        res,
        next
    ) {
        try {
            const data =
                await voucherDonHangService
                    .getTongHop(req.query);

            return successResponse(
                res,
                "Lấy danh sách voucher đơn hàng thành công.",
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(
        req,
        res,
        next
    ) {
        try {
            const data =
                await voucherDonHangService
                    .getChiTiet(
                        req.params.id
                    );

            return successResponse(
                res,
                "Lấy chi tiết voucher đơn hàng thành công.",
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async create(
        req,
        res,
        next
    ) {
        try {
            const data =
                await voucherDonHangService
                    .create(
                        req.body,
                        req.user
                    );

            return successResponse(
                res,
                "Thêm voucher đơn hàng thành công.",
                data,
                201
            );
        } catch (error) {
            next(error);
        }
    }

    async update(
        req,
        res,
        next
    ) {
        try {
            const data =
                await voucherDonHangService
                    .update(
                        req.params.id,
                        req.body
                    );

            return successResponse(
                res,
                "Cập nhật voucher đơn hàng thành công.",
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports =
    new VoucherDonHangController();
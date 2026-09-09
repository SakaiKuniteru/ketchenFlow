"use strict";

const service = require("./dia-diem-nhan-hang.service");

const {
    successResponse
} = require("../../../../utils/response.util");

class DiaDiemNhanHangController {
    async getTongHop(
        req,
        res,
        next
    ) {
        try {
            return successResponse(
                res,
                "Lấy danh sách địa điểm nhận hàng thành công.",
                await service.getTongHop(req.query)
            );
        } catch (e) {
            return next(e);
        }
    }

    async getChiTiet(
        req,
        res,
        next
    ) {
        try {
            return successResponse(
                res,
                "Lấy chi tiết địa điểm nhận hàng thành công.",
                await service.getChiTiet(req.params.id)
            );
        } catch (e) {
            return next(e);
        }
    }

    async create(
        req,
        res,
        next
    ) {
        try {
            return successResponse(
                res,
                "Thêm địa điểm nhận hàng thành công.",
                await service.create(req.body),
                201
            );
        } catch (e) {
            return next(e);
        }
    }

    async update(
        req,
        res,
        next
    ) {
        try {
            return successResponse(
                res,
                "Cập nhật địa điểm nhận hàng thành công.",
                await service.update(req.params.id, req.body)
            );
        } catch (e) {
            return next(e);
        }
    }
}

module.exports = new DiaDiemNhanHangController();
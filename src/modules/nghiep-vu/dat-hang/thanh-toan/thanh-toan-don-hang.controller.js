"use strict";

const service = require("./thanh-toan-don-hang.service");
const { successResponse } = require("../../../../utils/response.util");

class ThanhToanController {
    async create(req, res, next) {
        try {
            const data = await service.create(req.params.donHangId, req.user);
            return successResponse(res, "Khởi tạo thanh toán thành công.", data, 201);
        } catch (error) {
            return next(error);
        }
    }

    async list(req, res, next) {
        try {
            const data = await service.list(req.params.donHangId, req.user);
            return successResponse(res, "Lấy lịch sử thanh toán thành công.", data);
        } catch (error) {
            return next(error);
        }
    }

    async confirm(req, res, next) {
        try {
            const data = await service.confirm(req.params.id, req.body, req.user);
            return successResponse(res, "Xác nhận thanh toán thành công.", data);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new ThanhToanController();

"use strict";

const service = require("./khung-gio-nhan-hang.service");

const {
    successResponse
} = require("../../../../utils/response.util");

class Controller {
    async getTongHop(
        q,
        s,
        n
    ) {
        try {
            return successResponse(
                s,
                "Lấy danh sách khung giờ nhận hàng thành công.",
                await service.getTongHop(q.query)
            );
        } catch (e) {
            return n(e);
        }
    }

    async getChiTiet(
        q,
        s,
        n
    ) {
        try {
            return successResponse(
                s,
                "Lấy chi tiết khung giờ nhận hàng thành công.",
                await service.getChiTiet(q.params.id)
            );
        } catch (e) {
            return n(e);
        }
    }

    async create(
        q,
        s,
        n
    ) {
        try {
            return successResponse(
                s,
                "Thêm khung giờ nhận hàng thành công.",
                await service.create(q.body),
                201
            );
        } catch (e) {
            return n(e);
        }
    }

    async update(
        q,
        s,
        n
    ) {
        try {
            return successResponse(
                s,
                "Cập nhật khung giờ nhận hàng thành công.",
                await service.update(q.params.id, q.body)
            );
        } catch (e) {
            return n(e);
        }
    }
}

module.exports = new Controller();
"use strict";

const service = require("./nhom-san-pham.service");
const { successResponse } = require("../../../../utils/response.util");

class NhomSanPhamController {
    async getTongHop(req, res, next) {
        try { return successResponse(res, "Lấy danh sách nhóm sản phẩm thành công.", await service.getTongHop(req.query)); }
        catch (error) { return next(error); }
    }
    async getChiTiet(req, res, next) {
        try { return successResponse(res, "Lấy chi tiết nhóm sản phẩm thành công.", await service.getChiTiet(req.params.id)); }
        catch (error) { return next(error); }
    }
    async create(req, res, next) {
        try { return successResponse(res, "Thêm nhóm sản phẩm thành công.", await service.create(req.body), 201); }
        catch (error) { return next(error); }
    }
    async update(req, res, next) {
        try { return successResponse(res, "Cập nhật nhóm sản phẩm thành công.", await service.update(req.params.id, req.body)); }
        catch (error) { return next(error); }
    }
}

module.exports = new NhomSanPhamController();

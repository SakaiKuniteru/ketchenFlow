const sanPhamService = require("./san-pham.service");
const {
    successResponse
} = require("../../../../utils/response.util");

class SanPhamController {
    async getTongHop(req, res, next) {
        try {
            const data = await sanPhamService.getTongHop(req.query);
            return successResponse(res, "Lấy danh sách sản phẩm thành công.", data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const data = await sanPhamService.getChiTiet(id);
            return successResponse(res, "Lấy chi tiết sản phẩm thành công.", data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await sanPhamService.create(req.body, req.file);
            return successResponse(res, "Thêm sản phẩm thành công.", data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const data = await sanPhamService.update(id, req.body, req.file);
            return successResponse(res, "Cập nhật sản phẩm thành công.", data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SanPhamController();

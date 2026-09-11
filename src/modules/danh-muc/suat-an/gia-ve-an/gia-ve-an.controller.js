const giaVeAnService = require('./gia-ve-an.service');
const { successResponse } = require('../../../../utils/response.util');

class GiaVeAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await giaVeAnService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách giá vé ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getTimGia(req, res, next) {
        try {
            const data = await giaVeAnService.getTimGia(req.query);

            return successResponse(res, 'Lấy giá vé ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await giaVeAnService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết giá vé ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await giaVeAnService.create(req.body);

            return successResponse(res, 'Thêm giá vé ăn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await giaVeAnService.update(id, req.body);

            return successResponse(res, 'Cập nhật giá vé ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GiaVeAnController();

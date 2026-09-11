const monAnService = require('./mon-an.service');

const { successResponse } = require('../../../../utils/response.util');

class MonAnController {
    async getTongHop(req, res, next) {
        try {
            const data = await monAnService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await monAnService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await monAnService.create(req.body, req.file);

            return successResponse(res, 'Thêm món ăn thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            console.log('CONTENT-TYPE:', req.headers['content-type']);

            console.log('BODY:', req.body);

            console.log('FILE:', req.file);

            const data = await monAnService.update(id, req.body || {}, req.file || null);

            return successResponse(res, 'Cập nhật món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async capNhatGia(req, res, next) {
        try {
            const data = await monAnService.capNhatGia(req.body);

            return successResponse(res, 'Cập nhật giá món ăn thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MonAnController();

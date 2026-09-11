const xaPhuongService = require('./xa-phuong.service');

const { successResponse } = require('../../../../utils/response.util');

class XaPhuongController {
    async getTongHop(req, res, next) {
        try {
            const data = await xaPhuongService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách Xã/Phường thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await xaPhuongService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết Xã/Phường thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await xaPhuongService.create(req.body);

            return successResponse(res, 'Thêm Xã/Phường thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await xaPhuongService.update(id, req.body);

            return successResponse(res, 'Cập nhật Xã/Phường thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new XaPhuongController();

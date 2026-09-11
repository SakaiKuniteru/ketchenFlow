'use strict';

const cauHinhService = require('./cau-hinh.service');
const { successResponse } = require('../../utils/response.util');

class CauHinhController {
    async getGiaTriPublic(req, res, next) {
        try {
            const { ma } = req.query;

            const data = await cauHinhService.getGiaTriPublic(ma);

            return successResponse(res, 'Lấy giá trị thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getGiaTri(req, res, next) {
        try {
            const { ma } = req.query;

            const data = await cauHinhService.getGiaTri(ma);

            return successResponse(res, 'Lấy giá trị thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CauHinhController();

const thietLapService = require('./thiet-lap.service');

const { successResponse } = require('../../../../utils/response.util');

class ThietLapController {
    async getTongHop(req, res, next) {
        try {
            const data = await thietLapService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thietLapService.getChiTiet(id);

            return successResponse(res, 'Lấy chi tiết thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getCauHinhTheoMa(req, res, next) {
        try {
            const data =
                thietLapService
                    .getCauHinhTheoMa(
                        req.params.maThietLap
                    );

            return successResponse(
                res,
                'Lấy cấu hình thiết lập thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async getGiaTriTheoMa(req, res, next) {
        try {
            const { maThietLap } = req.params;

            const data = await thietLapService.getGiaTriTheoMa(maThietLap);

            return successResponse(res, 'Lấy giá trị thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getGiaTriTheoId(req, res, next) {
        try {
            const { maThietLap } = req.params;

            const data = await thietLapService.getGiaTriTheoId(maThietLap);

            return successResponse(res, 'Lấy thiết lập theo mã thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getByGroup(req, res, next) {
        try {
            const { nhom } = req.params;

            const data = await thietLapService.getByGroup(nhom);

            return successResponse(res, 'Lấy danh sách thiết lập theo nhóm tính năng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await thietLapService.create(req.body);

            return successResponse(res, 'Thêm thiết lập thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const data = await thietLapService.update(id, req.body);

            return successResponse(res, 'Cập nhật thiết lập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async dongBo(req, res, next) {
        try {
            const data =
                await thietLapService
                    .dongBo(
                        req.params.id
                    );

            return successResponse(
                res,
                'Cập nhật thiết lập thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async dongBoTatCa(
        req,
        res,
        next
    ) {
        try {

            const data =
                await thietLapService
                    .dongBoTatCa();


            return successResponse(
                res,
                'Cập nhật toàn bộ thiết lập thành công.',
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }
}

module.exports = new ThietLapController();

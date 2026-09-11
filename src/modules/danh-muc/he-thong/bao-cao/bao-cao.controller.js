const baoCaoService = require('./bao-cao.service');

const { successResponse } = require('../../../../utils/response.util');

class BaoCaoController {
    async getTongHop(req, res, next) {
        try {
            const data = await baoCaoService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách báo cáo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const data = await baoCaoService.getChiTiet(req.params.id);

            return successResponse(res, 'Lấy chi tiết báo cáo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await baoCaoService.create(req.body, req.file);

            return successResponse(res, 'Thêm báo cáo thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = await baoCaoService.update(req.params.id, req.body, req.file);

            return successResponse(res, 'Cập nhật báo cáo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getThongTinXuatBaoCao(req, res, next) {
        try {
            const data = await baoCaoService.getThongTinXuatBaoCao(req.params.idHoacMa);

            return successResponse(res, 'Lấy thông tin xuất báo cáo thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async xuatBaoCao(req, res, next) {
        try {
            const data = await baoCaoService.xuatBaoCao(req.params.idHoacMa, req.query.loaiXuatFile);

            return res.download(data.duongDanFile, data.tenFile);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BaoCaoController();

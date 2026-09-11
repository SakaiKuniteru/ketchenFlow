const taiKhoanService = require('./tai-khoan.service');
const { successResponse } = require('../../../../utils/response.util');

class TaiKhoanController {
    async getTongHop(req, res, next) {
        try {
            const data = await taiKhoanService.getTongHop(req.query);

            return successResponse(res, 'Lấy danh sách tài khoản thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getNhanVienKhaDung(req, res, next) {
        try {
            const data = await taiKhoanService.getNhanVienKhaDung(req.query?.taiKhoanId);

            return successResponse(res, 'Lấy danh sách nhân viên khả dụng thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getChiTiet(req, res, next) {
        try {
            const data = await taiKhoanService.getChiTiet(req.params.id);

            return successResponse(res, 'Lấy chi tiết tài khoản thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = await taiKhoanService.create(req.body, req.file);

            return successResponse(res, 'Tạo tài khoản thành công.', data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = await taiKhoanService.update(req.params.id, req.body, req.file);

            return successResponse(res, 'Cập nhật tài khoản thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async doiMatKhau(req, res, next) {
        try {
            console.log(req.user);

            const taiKhoanId = req.user?.taiKhoanId || req.user?.id;

            const data = await taiKhoanService.doiMatKhau(taiKhoanId, req.body);

            return successResponse(res, 'Đổi mật khẩu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async datLaiMatKhau(req, res, next) {
        try {
            const data = await taiKhoanService.datLaiMatKhau(req.params.id);

            return successResponse(res, 'Đặt lại mật khẩu thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaiKhoanController();

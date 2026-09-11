const ApiError = require('../../../../utils/api-error');

const xacThucService = require('./xac-thuc.service');

const { successResponse } = require('../../../../utils/response.util');

class XacThucController {
    async login(req, res, next) {
        try {
            const {
                taiKhoan,

                matKhau
            } = req.body;

            if (!taiKhoan || !matKhau) {
                throw new ApiError(400, 'Tên đăng nhập và mật khẩu không được để trống.');
            }

            const result = await xacThucService.login(taiKhoan, matKhau);

            return res.status(200).json({
                success: true,

                message: 'Đăng nhập thành công.',

                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getThongTinNhanVien(req, res, next) {
        try {
            const data = await xacThucService.getThongTinNhanVien(req.params.id);

            return successResponse(res, 'Lấy thông tin nhân viên thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async getNhanVienHienTai(req, res, next) {
        try {
            const data = await xacThucService.getThongTinNhanVien(req.user.nhanVienId);

            return successResponse(res, 'Lấy thông tin nhân viên đang đăng nhập thành công.', data, 200);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            const result = await xacThucService.refreshToken(refreshToken);

            return res.status(200).json({
                success: true,

                message: 'Làm mới Access Token thành công.',

                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;

            await xacThucService.logout(refreshToken);

            res.json({
                success: true,

                message: 'Đăng xuất thành công.'
            });
        } catch (error) {
            next(error);
        }
    }

    async changeMatKhau(req, res, next) {
        try {
            const {
                matKhauCu,

                matKhauMoi
            } = req.body;

            await xacThucService.changeMatKhau(
                req.user.taiKhoanId,

                matKhauCu,

                matKhauMoi
            );

            res.json({
                success: true,

                message: 'Đổi mật khẩu thành công.'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new XacThucController();

const crypto = require('crypto');
const md5 = require('../../../../utils/md5');
const jwt = require('../../../../utils/jwt');
const ApiError = require('../../../../utils/api-error');
const authRepository = require('./xac-thuc.repository');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');

class XacThucService {
    layDanhSachMaQuyen(account) {
        if (!Array.isArray(account?.dsQuyen)) {
            return [];
        }

        return [
            ...new Set(
                account.dsQuyen
                    .map((quyen) =>
                        String(quyen?.maQuyen || '')
                            .trim()
                            .toUpperCase()
                    )
                    .filter(Boolean)
            )
        ];
    }
    tinhThoiGianMoKhoa(batDau, { soLuong, donVi }) {
        const ketQua = new Date(batDau);

        switch (donVi) {
            case 'phut':
                ketQua.setMinutes(ketQua.getMinutes() + soLuong);
                break;

            case 'gio':
                ketQua.setHours(ketQua.getHours() + soLuong);
                break;

            case 'ngay':
                ketQua.setDate(ketQua.getDate() + soLuong);
                break;

            case 'thang':
                ketQua.setMonth(ketQua.getMonth() + soLuong);
                break;

            case 'nam':
                ketQua.setFullYear(ketQua.getFullYear() + soLuong);
                break;

            default:
                return null;
        }

        return ketQua;
    }

    taoThongBaoKhoa({ soLuong, donVi }) {
        const label = {
            phut: 'phút',
            gio: 'giờ',
            ngay: 'ngày',
            thang: 'tháng',
            nam: 'năm'
        };

        return `Tài khoản đã bị khóa trong ${soLuong} ${label[donVi]}.`;
    }

    async login(taiKhoan, matKhau) {
        const account = await authRepository.findByTaiKhoan(taiKhoan);

        if (!account) {
            throw new ApiError(401, 'Sai tài khoản hoặc mật khẩu.');
        }

        if (!account.active) {
            throw new ApiError(403, 'Tài khoản đã bị khóa.');
        }

        if (account.biKhoa) {
            if (!account.khoaDen) {
                throw new ApiError(423, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
            }

            const khoaDen = new Date(account.khoaDen);

            const hienTai = new Date();

            if (khoaDen > hienTai) {
                throw new ApiError(423, 'Tài khoản đang bị khóa tạm thời.');
            }

            await authRepository.unlockAccount(account.id);

            account.biKhoa = false;
            account.khoaDen = null;
            account.soLanDangNhapSai = 0;
        }

        const isCorrectMatKhau = md5.compare(matKhau, account.matKhauHash);

        if (!isCorrectMatKhau) {
            const failedLoginCount = await authRepository.increaseFailedLogin(account.id);

            const maxFailedLogin = await cauHinhService.getSoLanDangNhapSaiToiDa();

            if (maxFailedLogin === null) {
                throw new ApiError(401, 'Sai tài khoản hoặc mật khẩu.');
            }

            if (failedLoginCount < maxFailedLogin) {
                throw new ApiError(401, 'Sai tài khoản hoặc mật khẩu.');
            }

            const thoiGianKhoa = await cauHinhService.getThoiGianKhoaTaiKhoan();

            if (!thoiGianKhoa) {
                await authRepository.lockAccount(account.id, null);

                throw new ApiError(423, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
            }

            const khoaDen = this.tinhThoiGianMoKhoa(new Date(), thoiGianKhoa);

            await authRepository.lockAccount(account.id, khoaDen);

            throw new ApiError(423, this.taoThongBaoKhoa(thoiGianKhoa));
        }

        await authRepository.resetFailedLogin(account.id);

        await authRepository.updateLastLogin(account.id);

        const permissions = this.layDanhSachMaQuyen(account);

        const payload = {
            taiKhoanId: account.id,
            nhanVienId: account.nhanVienId,
            taiKhoan: account.taiKhoan,
            roles: account.roles,
            dsVaiTroId: account.dsVaiTroId,
            dsQuyenId: account.dsQuyenId,
            permissions
        };

        const accessTokenMinutes = await cauHinhService.getSoPhutAccessToken();

        const refreshTokenMinutes = await cauHinhService.getSoPhutRefreshToken();

        const accessToken = jwt.generateAccessToken(
            {
                ...payload,

                tokenId: crypto.randomUUID()
            },
            accessTokenMinutes
        );

        const refreshToken = jwt.generateRefreshToken(
            {
                ...payload,

                tokenId: crypto.randomUUID()
            },
            refreshTokenMinutes
        );

        const refreshExpiresAt = new Date();

        refreshExpiresAt.setMinutes(refreshExpiresAt.getMinutes() + refreshTokenMinutes);

        await authRepository.saveRefreshToken(account.id, refreshToken, refreshExpiresAt);

        return {
            accessToken,
            refreshToken,
            id: account.id,
            nhanVienId: account.nhanVienId,
            maNhanVien: account.maNhanVien,
            hoTen: account.hoTen,
            taiKhoan: account.taiKhoan,
            firstLogin: account.doiMatKhauLanDau,
            email: account.email,
            soDienThoai: account.soDienThoai,
            anhDaiDien: account.anhDaiDien,
            ngaySinh: account.ngaySinh,
            gioiTinh: account.gioiTinh,
            diaChi: account.diaChi,
            ghiChu: account.ghiChu,
            maThe: account.maThe,
            maQr: account.maQr,
            maBarcode: account.maBarcode,
            quocGiaId: account.quocGiaId,
            tinhThanhId: account.tinhThanhId,
            xaPhuongId: account.xaPhuongId,
            roles: account.roles,
            dsVaiTroId: account.dsVaiTroId,
            dsVaiTro: account.dsVaiTro,
            coSoId: account.coSoId,
            coSo: account.coSo,
            phongBanId: account.phongBanId,
            phongBan: account.phongBan,
            chucVuId: account.chucVuId,
            chucVu: account.chucVu,
            dsQuyenId: account.dsQuyenId,
            dsQuyen: account.dsQuyen,
            permissions,
            active: account.active,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        };
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new ApiError(401, 'Refresh Token không hợp lệ.');
        }

        let payload;

        try {
            payload = jwt.verifyRefreshToken(refreshToken);
        } catch {
            throw new ApiError(401, 'Refresh Token đã hết hạn.');
        }

        const tokenInDb = await authRepository.findRefreshToken(refreshToken);

        if (!tokenInDb) {
            throw new ApiError(401, 'Refresh Token không tồn tại.');
        }

        if (tokenInDb.revoked) {
            throw new ApiError(401, 'Refresh Token đã bị thu hồi.');
        }

        if (new Date(tokenInDb.expires_at) < new Date()) {
            throw new ApiError(401, 'Refresh Token đã hết hạn.');
        }

        const account = await authRepository.findById(tokenInDb.tai_khoan_id);

        if (!account) {
            throw new ApiError(401, 'Tài khoản không tồn tại.');
        }

        const permissions = this.layDanhSachMaQuyen(account);

        const newPayload = {
            taiKhoanId: account.id,
            nhanVienId: account.nhanVienId,
            taiKhoan: account.taiKhoan,
            roles: account.roles,
            dsVaiTroId: account.dsVaiTroId,
            dsQuyenId: account.dsQuyenId,
            permissions
        };

        const accessTokenMinutes = await cauHinhService.getSoPhutAccessToken();

        const refreshTokenMinutes = await cauHinhService.getSoPhutRefreshToken();

        const newAccessToken = jwt.generateAccessToken(
            {
                ...newPayload,

                tokenId: crypto.randomUUID()
            },
            accessTokenMinutes
        );

        const newRefreshToken = jwt.generateRefreshToken(
            {
                ...newPayload,

                tokenId: crypto.randomUUID()
            },
            refreshTokenMinutes
        );

        const expiresAt = new Date();

        expiresAt.setMinutes(expiresAt.getMinutes() + refreshTokenMinutes);

        await authRepository.saveRefreshToken(account.id, newRefreshToken, expiresAt);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken) {
        if (!refreshToken) {
            throw new ApiError(400, 'Refresh Token không được để trống.');
        }

        const tokenInDb = await authRepository.findRefreshToken(refreshToken);

        /*
         * Logout idempotent.
         */
        if (!tokenInDb) {
            return;
        }

        /*
         * Manual logout hoặc timeout:
         * thu hồi TOÀN BỘ Refresh Token
         * còn sống của phiên tài khoản.
         */
        await authRepository.revokeAllRefreshToken(tokenInDb.tai_khoan_id);

        return;
    }

    async changeMatKhau(taiKhoanId, matKhauCu, matKhauMoi) {
        const account = await authRepository.findById(taiKhoanId);

        if (!account) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        const matKhau = await authRepository.getMatKhauHash(taiKhoanId);

        const isCorrect = md5.compare(matKhauCu, matKhau.mat_khau_hash);

        if (!isCorrect) {
            throw new ApiError(400, 'Mật khẩu cũ không đúng.');
        }

        if (matKhauCu === matKhauMoi) {
            throw new ApiError(400, 'Mật khẩu mới phải khác mật khẩu cũ.');
        }

        const matKhauHash = md5.hash(matKhauMoi);

        await authRepository.changeMatKhau(taiKhoanId, matKhauHash);

        await authRepository.revokeAllRefreshToken(taiKhoanId);

        return;
    }

    async getThongTinNhanVien(id) {
        const nhanVienId = Number(id);

        if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
            throw new ApiError(400, 'ID nhân viên không hợp lệ.');
        }

        const nhanVien = await authRepository.getThongTinNhanVien(nhanVienId);

        if (!nhanVien) {
            throw new ApiError(404, 'Nhân viên không tồn tại.');
        }

        return nhanVien;
    }
}

module.exports = new XacThucService();

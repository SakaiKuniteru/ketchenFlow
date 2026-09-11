const crypto = require('crypto');
const ApiError = require('../../../../utils/api-error');
const taiKhoanRepository = require('./tai-khoan.repository');
const thietLapRepository = require('../../he-thong/thiet-lap/thiet-lap.repository');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');
const nhanVienFileService = require('../nhan-vien/nhan-vien-file.service');

class TaiKhoanService {
    parseId(id) {
        const taiKhoanId = Number(id);

        if (!Number.isInteger(taiKhoanId) || taiKhoanId <= 0) {
            throw new ApiError(400, 'ID tài khoản không hợp lệ.');
        }

        return taiKhoanId;
    }

    hashMatKhau(matKhau) {
        if (typeof matKhau !== 'string' || matKhau.length === 0) {
            throw new ApiError(400, 'Mật khẩu không hợp lệ.');
        }

        return crypto.createHash('md5').update(matKhau, 'utf8').digest('hex');
    }

    compareMatKhau(matKhau, matKhauHash) {
        if (typeof matKhau !== 'string' || typeof matKhauHash !== 'string') {
            return false;
        }

        const hashNhapVao = this.hashMatKhau(matKhau);

        if (hashNhapVao.length !== matKhauHash.length) {
            return false;
        }

        return crypto.timingSafeEqual(Buffer.from(hashNhapVao, 'utf8'), Buffer.from(matKhauHash, 'utf8'));
    }

    tinhThoiGianKhoa(hienTai, thoiGianKhoa) {
        const ngay = new Date(hienTai);

        const { soLuong, donVi } = thoiGianKhoa;

        switch (donVi) {
            case 'phut':
                ngay.setMinutes(ngay.getMinutes() + soLuong);
                break;

            case 'gio':
                ngay.setHours(ngay.getHours() + soLuong);
                break;

            case 'ngay':
                ngay.setDate(ngay.getDate() + soLuong);
                break;

            case 'thang':
                ngay.setMonth(ngay.getMonth() + soLuong);
                break;

            case 'nam':
                ngay.setFullYear(ngay.getFullYear() + soLuong);
                break;

            default:
                return null;
        }

        return ngay;
    }

    async chuanHoaTrangThaiKhoa(data, taiKhoanHienTai = null) {
        const duLieu = {
            ...data
        };

        if (data.biKhoa === undefined) {
            if (taiKhoanHienTai) {
                duLieu.biKhoa = taiKhoanHienTai.biKhoa;
                duLieu.khoaDen = taiKhoanHienTai.khoaDen;
            }

            return duLieu;
        }

        if (data.biKhoa === false) {
            duLieu.biKhoa = false;
            duLieu.khoaDen = null;
            duLieu.resetSoLanDangNhapSai = true;

            return duLieu;
        }

        duLieu.biKhoa = true;

        if (data.khoaVinhVien === true) {
            duLieu.khoaDen = null;

            return duLieu;
        }

        const thoiGianKhoa = await cauHinhService.getThoiGianKhoaTaiKhoan();

        if (!thoiGianKhoa) {
            duLieu.khoaDen = null;

            return duLieu;
        }

        duLieu.khoaDen = this.tinhThoiGianKhoa(new Date(), thoiGianKhoa);

        return duLieu;
    }

    async getMatKhauMacDinh() {
        const matKhauMacDinh = await thietLapRepository.getGiaTriTheoMa('MAT_KHAU_MAC_DINH');

        if (matKhauMacDinh === null || matKhauMacDinh === undefined || String(matKhauMacDinh).length === 0) {
            throw new ApiError(500, 'Chưa thiết lập mật khẩu mặc định của hệ thống.');
        }

        return String(matKhauMacDinh);
    }

    async getTongHop(query) {
        return await taiKhoanRepository.getTongHop(query);
    }

    async getNhanVienKhaDung(taiKhoanId = null) {
        let idTaiKhoan = null;

        if (taiKhoanId !== undefined && taiKhoanId !== null && String(taiKhoanId).trim() !== '') {
            idTaiKhoan = this.parseId(taiKhoanId);
        }

        return await taiKhoanRepository.getNhanVienKhaDung(idTaiKhoan);
    }

    async getChiTiet(id) {
        const taiKhoanId = this.parseId(id);

        const taiKhoan = await taiKhoanRepository.getChiTiet(taiKhoanId);

        if (!taiKhoan) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        return taiKhoan;
    }

    async chuanHoaNhanVien(data, taiKhoanHienTai = null) {
        const duLieu = {
            ...data
        };

        if (duLieu.maNhanVien !== undefined) {
            const maNhanVien = String(duLieu.maNhanVien).trim().toUpperCase();

            if (!maNhanVien) {
                throw new ApiError(400, 'Mã nhân viên không được để trống.');
            }

            const nhanVien = await taiKhoanRepository.findNhanVienByMa(maNhanVien);

            if (
                duLieu.hoTen !== undefined &&
                duLieu.hoTen.trim().toLowerCase() !== nhanVien.hoTen.trim().toLowerCase()
            ) {
                throw new ApiError(400, 'Mã nhân viên và họ tên không khớp.');
            }

            if (
                duLieu.maCoSo !== undefined &&
                duLieu.maCoSo.trim().toUpperCase() !== nhanVien.coSo.maCoSo.toUpperCase()
            ) {
                throw new ApiError(400, 'Mã cơ sở không khớp với nhân viên.');
            }

            if (
                duLieu.maPhongBan !== undefined &&
                duLieu.maPhongBan.trim().toUpperCase() !== nhanVien.phongBan.maPhongBan.toUpperCase()
            ) {
                throw new ApiError(400, 'Mã phòng ban không khớp với nhân viên.');
            }

            if (
                duLieu.maChucVu !== undefined &&
                duLieu.maChucVu.trim().toUpperCase() !== nhanVien.chucVu.maChucVu.toUpperCase()
            ) {
                throw new ApiError(400, 'Mã chức vụ không khớp với nhân viên.');
            }

            if (!nhanVien) {
                throw new ApiError(400, `Nhân viên có mã "${maNhanVien}" không tồn tại.`);
            }

            if (!nhanVien.active) {
                throw new ApiError(400, `Nhân viên "${nhanVien.hoTen}" đã bị khóa.`);
            }

            duLieu.nhanVienId = Number(nhanVien.id);
            duLieu.maNhanVien = nhanVien.maNhanVien;
        } else if ((duLieu.nhanVienId === undefined || duLieu.nhanVienId === null) && taiKhoanHienTai) {
            duLieu.nhanVienId = Number(taiKhoanHienTai.nhanVienId);
        }

        return duLieu;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (Array.isArray(duLieu.dsMaVaiTro)) {
            const danhSachMa = [
                ...new Set(duLieu.dsMaVaiTro.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))
            ];

            const danhSachVaiTro = await taiKhoanRepository.getDsVaiTroByMas(danhSachMa);

            if (danhSachVaiTro.length !== danhSachMa.length) {
                const maTimThay = danhSachVaiTro.map((item) => item.maVaiTro.toUpperCase());

                const maKhongTonTai = danhSachMa.filter((ma) => !maTimThay.includes(ma));

                throw new ApiError(400, `Mã vai trò không tồn tại: ${maKhongTonTai.join(', ')}.`);
            }

            const vaiTroBiKhoa = danhSachVaiTro.find((item) => !item.active);

            if (vaiTroBiKhoa) {
                throw new ApiError(400, `Vai trò "${vaiTroBiKhoa.tenVaiTro}" đã bị khóa.`);
            }

            const idsTheoMa = danhSachMa.map((ma) => {
                const vaiTro = danhSachVaiTro.find((item) => item.maVaiTro.toUpperCase() === ma);

                return Number(vaiTro.id);
            });

            if (Array.isArray(duLieu.dsVaiTroId)) {
                const idsDaTruyen = [...new Set(duLieu.dsVaiTroId.map((id) => Number(id)))];

                const idsTheoMaSapXep = [...idsTheoMa].sort((a, b) => a - b);

                const idsDaTruyenSapXep = [...idsDaTruyen].sort((a, b) => a - b);

                if (JSON.stringify(idsTheoMaSapXep) !== JSON.stringify(idsDaTruyenSapXep)) {
                    throw new ApiError(400, 'Danh sách ID và mã vai trò không khớp.');
                }
            }

            duLieu.dsVaiTroId = idsTheoMa;
        } else if (Array.isArray(duLieu.dsVaiTroId)) {
            duLieu.dsVaiTroId = [...new Set(duLieu.dsVaiTroId.map((id) => Number(id)))];
        }

        delete duLieu.dsMaVaiTro;

        return duLieu;
    }

    async validateLienKet(data) {
        if (data.dsVaiTroId === undefined) {
            return;
        }

        if (!Array.isArray(data.dsVaiTroId)) {
            throw new ApiError(400, 'Danh sách vai trò không hợp lệ.');
        }

        if (data.dsVaiTroId.length === 0) {
            data.dsVaiTroId = [];
            return;
        }

        const danhSachId = [...new Set(data.dsVaiTroId.map((id) => Number(id)))];

        const idKhongHopLe = danhSachId.some((id) => !Number.isInteger(id) || id <= 0);

        if (idKhongHopLe) {
            throw new ApiError(400, 'Danh sách vai trò không hợp lệ.');
        }

        const danhSachVaiTro = await taiKhoanRepository.getDsVaiTroByIds(danhSachId);

        if (danhSachVaiTro.length !== danhSachId.length) {
            throw new ApiError(400, 'Có vai trò không tồn tại.');
        }

        const vaiTroBiKhoa = danhSachVaiTro.find((item) => !item.active);

        if (vaiTroBiKhoa) {
            throw new ApiError(400, `Vai trò "${vaiTroBiKhoa.tenVaiTro}" đã bị khóa.`);
        }

        data.dsVaiTroId = danhSachId;
    }

    async validateNhanVien(nhanVienId, excludeId = null) {
        const id = Number(nhanVienId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, 'Nhân viên không hợp lệ.');
        }

        const daCoTaiKhoan = await taiKhoanRepository.existsNhanVien(id, excludeId);

        if (daCoTaiKhoan) {
            throw new ApiError(409, 'Nhân viên đã được tạo tài khoản.');
        }
    }

    async validateTenDangNhap(tenDangNhap, excludeId = null) {
        const trungTenDangNhap = await taiKhoanRepository.existsTenDangNhap(tenDangNhap, excludeId);

        if (trungTenDangNhap) {
            throw new ApiError(409, 'Tên đăng nhập đã tồn tại.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        await this.validateNhanVien(data.nhanVienId, excludeId);

        await this.validateTenDangNhap(data.tenDangNhap, excludeId);
    }

    async create(data, file = null) {
        let duLieu = await this.chuanHoaNhanVien(data);

        duLieu = await this.chuanHoaLienKet(duLieu);
        duLieu = await this.chuanHoaTrangThaiKhoa(duLieu);

        if (!duLieu.nhanVienId) {
            throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
        }

        await this.validateLienKet(duLieu);

        const tenDangNhap = String(duLieu.tenDangNhap).trim();

        if (!tenDangNhap) {
            throw new ApiError(400, 'Tên đăng nhập không được để trống.');
        }

        const duLieuTao = {
            nhanVienId: duLieu.nhanVienId,
            tenDangNhap,
            dsVaiTroId: duLieu.dsVaiTroId,
            biKhoa: duLieu.biKhoa === true,
            khoaDen: duLieu.khoaDen || null,
            active: duLieu.active !== undefined ? duLieu.active : true
        };

        await this.validateTrungDuLieu(duLieuTao);

        const matKhauMacDinh = await this.getMatKhauMacDinh();

        duLieuTao.matKhauHash = this.hashMatKhau(matKhauMacDinh);

        let fileMoi = null;

        try {
            if (file) {
                const nhanVien = await taiKhoanRepository.getNhanVienById(duLieuTao.nhanVienId);

                if (!nhanVien) {
                    throw new ApiError(400, 'Nhân viên không tồn tại.');
                }

                fileMoi = await nhanVienFileService.saveFile(nhanVien.maNhanVien, nhanVien.hoTen, file);
            }

            const ketQua = await taiKhoanRepository.create(duLieuTao);

            if (!ketQua) {
                throw new ApiError(500, 'Không thể tạo tài khoản.');
            }

            if (fileMoi) {
                await taiKhoanRepository.updateAnhDaiDien(duLieuTao.nhanVienId, fileMoi.relativePath);

                const nhanVien = await taiKhoanRepository.getNhanVienById(duLieuTao.nhanVienId);

                await nhanVienFileService.cleanupOldFiles(nhanVien.maNhanVien, 3);
            }

            return await taiKhoanRepository.getChiTiet(ketQua.id);
        } catch (error) {
            if (fileMoi) {
                try {
                    await nhanVienFileService.deletePhysicalFile(fileMoi.fullPath);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh tài khoản mới:', deleteError);
                }
            } else {
                try {
                    await nhanVienFileService.deleteTempFile(file);
                } catch (deleteTempError) {
                    console.error('Không thể xóa file temp tài khoản:', deleteTempError);
                }
            }

            throw error;
        }
    }

    async update(id, data, file = null) {
        const taiKhoanId = this.parseId(id);

        const taiKhoan = await taiKhoanRepository.getChiTiet(taiKhoanId);

        if (!taiKhoan) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        let duLieuCapNhat = {
            maNhanVien: data.maNhanVien !== undefined ? data.maNhanVien : undefined,

            nhanVienId: data.nhanVienId !== undefined ? Number(data.nhanVienId) : taiKhoan.nhanVienId,

            tenDangNhap: data.tenDangNhap !== undefined ? String(data.tenDangNhap).trim() : taiKhoan.tenDangNhap,

            biKhoa: data.biKhoa !== undefined ? data.biKhoa : undefined,

            khoaVinhVien: data.khoaVinhVien !== undefined ? data.khoaVinhVien : undefined,

            dsVaiTroId:
                data.dsVaiTroId !== undefined
                    ? data.dsVaiTroId
                    : data.dsMaVaiTro !== undefined
                      ? undefined
                      : taiKhoan.dsVaiTroId,

            dsMaVaiTro: data.dsMaVaiTro !== undefined ? data.dsMaVaiTro : undefined,

            active: data.active !== undefined ? data.active : taiKhoan.active
        };

        duLieuCapNhat = await this.chuanHoaNhanVien(duLieuCapNhat, taiKhoan);

        duLieuCapNhat = await this.chuanHoaLienKet(duLieuCapNhat);

        duLieuCapNhat = await this.chuanHoaTrangThaiKhoa(duLieuCapNhat, taiKhoan);

        if (!duLieuCapNhat.tenDangNhap) {
            throw new ApiError(400, 'Tên đăng nhập không được để trống.');
        }

        await this.validateLienKet(duLieuCapNhat);

        await this.validateTrungDuLieu(duLieuCapNhat, taiKhoanId);

        let fileMoi = null;

        try {
            const nhanVien = await taiKhoanRepository.getNhanVienById(duLieuCapNhat.nhanVienId);

            if (!nhanVien) {
                throw new ApiError(400, 'Nhân viên không tồn tại.');
            }

            if (file) {
                fileMoi = await nhanVienFileService.saveFile(nhanVien.maNhanVien, nhanVien.hoTen, file);
            }

            const ketQua = await taiKhoanRepository.update(taiKhoanId, duLieuCapNhat);

            if (!ketQua) {
                throw new ApiError(404, 'Tài khoản không tồn tại.');
            }

            if (fileMoi) {
                await taiKhoanRepository.updateAnhDaiDien(duLieuCapNhat.nhanVienId, fileMoi.relativePath);

                await nhanVienFileService.cleanupOldFiles(nhanVien.maNhanVien, 3);
            }

            return await taiKhoanRepository.getChiTiet(taiKhoanId);
        } catch (error) {
            if (fileMoi) {
                try {
                    await nhanVienFileService.deletePhysicalFile(fileMoi.fullPath);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh tài khoản mới:', deleteError);
                }
            } else {
                try {
                    await nhanVienFileService.deleteTempFile(file);
                } catch (deleteTempError) {
                    console.error('Không thể xóa file temp tài khoản:', deleteTempError);
                }
            }

            throw error;
        }
    }

    async doiMatKhau(id, data) {
        const taiKhoanId = this.parseId(id);

        const taiKhoan = await taiKhoanRepository.getThongTinMatKhau(taiKhoanId);

        if (!taiKhoan) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        if (!taiKhoan.active) {
            throw new ApiError(403, 'Tài khoản đã bị khóa.');
        }

        const matKhauCu = String(data.matKhauCu || '');

        const matKhauMoi = String(data.matKhauMoi || '');

        const xacNhanMatKhau = String(data.xacNhanMatKhau || '');

        if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
            throw new ApiError(400, 'Mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu không được để trống.');
        }

        const dungMatKhauCu = this.compareMatKhau(matKhauCu, taiKhoan.matKhauHash);

        if (!dungMatKhauCu) {
            throw new ApiError(400, 'Mật khẩu cũ không chính xác.');
        }

        if (matKhauMoi !== xacNhanMatKhau) {
            throw new ApiError(400, 'Xác nhận mật khẩu không khớp.');
        }

        if (matKhauMoi === matKhauCu) {
            throw new ApiError(400, 'Mật khẩu mới không được trùng với mật khẩu cũ.');
        }

        const matKhauHashMoi = this.hashMatKhau(matKhauMoi);

        const ketQua = await taiKhoanRepository.doiMatKhau(taiKhoanId, matKhauHashMoi);

        if (!ketQua) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        return ketQua;
    }

    async datLaiMatKhau(id) {
        const taiKhoanId = this.parseId(id);

        const taiKhoan = await taiKhoanRepository.getChiTiet(taiKhoanId);

        if (!taiKhoan) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        const matKhauMacDinh = await this.getMatKhauMacDinh();

        const matKhauHash = this.hashMatKhau(matKhauMacDinh);

        const ketQua = await taiKhoanRepository.datLaiMatKhau(taiKhoanId, matKhauHash);

        if (!ketQua) {
            throw new ApiError(404, 'Tài khoản không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new TaiKhoanService();

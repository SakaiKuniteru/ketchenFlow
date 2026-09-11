const {
    gioiTinh: dsGioiTinh,
    doiTuongLayVe: dsDoiTuongLayVe,
    phuongThucThanhToan: dsPhuongThucThanhToan,
    trangThaiPhieuThu: dsTrangThaiPhieuThu
} = require('../../../../constants/enums');

const cauHinhService = require('../../../cau-hinh/cau-hinh.service');
const ApiError = require('../../../../utils/api-error');
const phieuLayVeAnRepository = require('./phieu-lay-ve-an.repository');
const inBaoCaoService = require('../../../../services/in-bao-cao/in-bao-cao.service');

class PhieuLayVeAnService {
    parseId(id) {
        const phieuLayVeAnId = Number(id);

        if (!Number.isInteger(phieuLayVeAnId) || phieuLayVeAnId <= 0) {
            throw new ApiError(400, 'ID phiếu lấy vé ăn không hợp lệ.');
        }

        return phieuLayVeAnId;
    }

    parseNguoiDungId(id) {
        const taiKhoanId = Number(id);

        if (!Number.isInteger(taiKhoanId) || taiKhoanId <= 0) {
            throw new ApiError(401, 'Không xác định được tài khoản thực hiện.');
        }

        return taiKhoanId;
    }

    validateEnum(danhSach, value, message) {
        const hopLe = danhSach.some((item) => Number(item.value) === Number(value));

        if (!hopLe) {
            throw new ApiError(400, message);
        }
    }

    validateDoiTuongLayVe(value) {
        this.validateEnum(dsDoiTuongLayVe, value, 'Đối tượng lấy vé không hợp lệ.');
    }

    validateGioiTinh(value) {
        if (value === undefined || value === null || value === '') {
            return;
        }

        this.validateEnum(dsGioiTinh, value, 'Giới tính không hợp lệ.');
    }

    validatePhuongThucThanhToan(value) {
        if (value === undefined || value === null || value === '') {
            return;
        }

        this.validateEnum(dsPhuongThucThanhToan, value, 'Phương thức thanh toán không hợp lệ.');
    }

    validateTrangThai(value) {
        this.validateEnum(dsTrangThaiPhieuThu, value, 'Trạng thái phiếu không hợp lệ.');
    }

    async getTongHop(query) {
        return await phieuLayVeAnRepository.getTongHop(query);
    }

    async getThucDonNgayHopLe() {
        return await phieuLayVeAnRepository.getThucDonNgayHopLe();
    }

    async getGiaVePreview(query = {}) {
        const thucDonNgayId = Number(query.thucDonNgayId);

        if (!Number.isInteger(thucDonNgayId) || thucDonNgayId <= 0) {
            throw new ApiError(400, 'Thực đơn ngày không hợp lệ.');
        }

        if (query.doiTuongLayVe === undefined || query.doiTuongLayVe === null || query.doiTuongLayVe === '') {
            throw new ApiError(400, 'Đối tượng lấy vé là bắt buộc.');
        }

        const doiTuongLayVe = Number(query.doiTuongLayVe);

        this.validateDoiTuongLayVe(doiTuongLayVe);

        await this.validateThucDonNgay(thucDonNgayId);

        const donGia = await this.getDonGia(thucDonNgayId, doiTuongLayVe);

        return {
            thucDonNgayId,
            doiTuongLayVe,
            donGia
        };
    }

    async getChiTiet(id) {
        const phieuLayVeAnId = this.parseId(id);

        const phieu = await phieuLayVeAnRepository.getChiTiet(phieuLayVeAnId);

        if (!phieu) {
            throw new ApiError(404, 'Phiếu lấy vé ăn không tồn tại.');
        }

        return phieu;
    }

    async validateThucDonNgay(id) {
        const thucDonNgay = await phieuLayVeAnRepository.getThucDonNgayById(id);

        if (!thucDonNgay) {
            throw new ApiError(404, 'Thực đơn ngày không tồn tại.');
        }

        if (!thucDonNgay.active || !thucDonNgay.thuc_don_active) {
            throw new ApiError(400, 'Thực đơn ngày không còn hoạt động.');
        }

        if (Number(thucDonNgay.trang_thai) !== 30) {
            throw new ApiError(400, 'Thực đơn chưa ở trạng thái đang áp dụng.');
        }

        return thucDonNgay;
    }

    async validateNguoiLayVe(data) {
        const doiTuong = Number(data.doiTuongLayVe);

        if (doiTuong === 10) {
            if (!data.nhanVienId) {
                throw new ApiError(400, 'Nhân viên là bắt buộc.');
            }

            const nhanVien = await phieuLayVeAnRepository.getNhanVienById(data.nhanVienId);

            if (!nhanVien) {
                throw new ApiError(404, 'Nhân viên không tồn tại.');
            }

            if (!nhanVien.active) {
                throw new ApiError(400, 'Nhân viên không còn hoạt động.');
            }

            return {
                nhanVienId: Number(nhanVien.id),
                hoTenNguoiLayVe: null,
                ngaySinhNguoiLayVe: null,
                gioiTinhNguoiLayVe: null,
                soDienThoaiNguoiLayVe: null,
                diaChiNguoiLayVe: null,
                donViNguoiLayVe: null,
                khachLauDai: false
            };
        }

        if (!data.hoTenNguoiLayVe || !data.hoTenNguoiLayVe.trim()) {
            throw new ApiError(400, 'Họ tên người lấy vé là bắt buộc.');
        }

        return {
            nhanVienId: null,
            hoTenNguoiLayVe: data.hoTenNguoiLayVe.trim(),
            ngaySinhNguoiLayVe: data.ngaySinhNguoiLayVe || null,
            gioiTinhNguoiLayVe:
                data.gioiTinhNguoiLayVe !== undefined && data.gioiTinhNguoiLayVe !== null
                    ? Number(data.gioiTinhNguoiLayVe)
                    : null,
            soDienThoaiNguoiLayVe: data.soDienThoaiNguoiLayVe?.trim() || null,
            diaChiNguoiLayVe: data.diaChiNguoiLayVe?.trim() || null,
            donViNguoiLayVe: data.donViNguoiLayVe?.trim() || null,
            khachLauDai: data.khachLauDai !== undefined ? data.khachLauDai : false
        };
    }

    async getDonGia(thucDonNgayId, doiTuongLayVe) {
        const giaVe = await phieuLayVeAnRepository.getGiaVe(thucDonNgayId, doiTuongLayVe);

        if (!giaVe) {
            throw new ApiError(404, 'Không tìm thấy giá vé ăn phù hợp.');
        }

        return Number(giaVe.don_gia);
    }

    taoNguCanhSinhMaVeAn(cauHinh, date = new Date()) {
        const yyyy = String(date.getFullYear());

        const yy = yyyy.slice(-2);

        const mm = String(date.getMonth() + 1).padStart(2, '0');

        const dd = String(date.getDate()).padStart(2, '0');

        let prefix = cauHinh.tienTo;

        if (cauHinh.coYY) {
            prefix += yy;
        }

        if (cauHinh.coMM) {
            prefix += mm;
        }

        if (cauHinh.coDD) {
            prefix += dd;
        }

        return {
            prefix,
            doRongDaySo: cauHinh.doRongDaySo,
            khoa: [cauHinh.dinhDang, prefix].join(':')
        };
    }

    async taoSoPhieuMoi(db) {
        const quyTacSinhMaVeAn = await cauHinhService.getQuyTacSinhMaVeAn();

        const nguCanhSinhMaVeAn = this.taoNguCanhSinhMaVeAn(quyTacSinhMaVeAn);

        return await phieuLayVeAnRepository.taoSoPhieuTheoQuyTac(nguCanhSinhMaVeAn, db);
    }

    async create(data, nguoiTaoId) {
        const taiKhoanId = this.parseNguoiDungId(nguoiTaoId);

        this.validateDoiTuongLayVe(data.doiTuongLayVe);

        this.validateGioiTinh(data.gioiTinhNguoiLayVe);

        this.validatePhuongThucThanhToan(data.phuongThucThanhToan);

        await this.validateThucDonNgay(Number(data.thucDonNgayId));

        const nguoiLayVe = await this.validateNguoiLayVe(data);

        const donGia = await this.getDonGia(Number(data.thucDonNgayId), Number(data.doiTuongLayVe));

        const soLuong = Number(data.soLuong);

        const tienGoc = donGia * soLuong;

        const quyTacSinhMaVeAn = await cauHinhService.getQuyTacSinhMaVeAn();

        const nguCanhSinhMaVeAn = this.taoNguCanhSinhMaVeAn(quyTacSinhMaVeAn);

        const duLieuTao = {
            thucDonNgayId: Number(data.thucDonNgayId),
            doiTuongLayVe: Number(data.doiTuongLayVe),
            ...nguoiLayVe,
            soLuong,
            donGia,
            tienGoc,
            tongMienGiam: 0,
            thanhTien: tienGoc,
            ghiChu: data.ghiChu?.trim() || null,
            phuongThucThanhToan:
                data.phuongThucThanhToan !== undefined && data.phuongThucThanhToan !== null
                    ? Number(data.phuongThucThanhToan)
                    : null,
            trangThai: 0,
            nguoiTaoId: taiKhoanId
        };

        this.validateTrangThai(duLieuTao.trangThai);

        return await phieuLayVeAnRepository.create(duLieuTao, nguCanhSinhMaVeAn);
    }

    async update(id, data) {
        const phieuLayVeAnId = this.parseId(id);

        const phieu = await this.getChiTiet(phieuLayVeAnId);

        const trangThai = Number(phieu.trangThai);

        if (trangThai === 50) {
            throw new ApiError(400, 'Phiếu đã hủy không được phép cập nhật.');
        }

        const khoaThongTinTinhTien = [-10, 10, 30, 40, 60].includes(trangThai);

        if (khoaThongTinTinhTien) {
            data = {
                ...data,
                thucDonNgayId: phieu.thucDonNgayId,
                doiTuongLayVe: phieu.doiTuongLayVe,
                soLuong: phieu.soLuong,
                phuongThucThanhToan: phieu.phuongThucThanhToan
            };
        }

        const duLieuTam = {
            thucDonNgayId: data.thucDonNgayId !== undefined ? Number(data.thucDonNgayId) : Number(phieu.thucDonNgayId),

            doiTuongLayVe: data.doiTuongLayVe !== undefined ? Number(data.doiTuongLayVe) : Number(phieu.doiTuongLayVe),

            nhanVienId: data.nhanVienId !== undefined ? data.nhanVienId : phieu.nhanVienId,

            hoTenNguoiLayVe: data.hoTenNguoiLayVe !== undefined ? data.hoTenNguoiLayVe : phieu.hoTenNguoiLayVe,

            ngaySinhNguoiLayVe:
                data.ngaySinhNguoiLayVe !== undefined ? data.ngaySinhNguoiLayVe : phieu.ngaySinhNguoiLayVe,

            gioiTinhNguoiLayVe:
                data.gioiTinhNguoiLayVe !== undefined ? data.gioiTinhNguoiLayVe : phieu.gioiTinhNguoiLayVe,

            soDienThoaiNguoiLayVe:
                data.soDienThoaiNguoiLayVe !== undefined ? data.soDienThoaiNguoiLayVe : phieu.soDienThoaiNguoiLayVe,

            diaChiNguoiLayVe: data.diaChiNguoiLayVe !== undefined ? data.diaChiNguoiLayVe : phieu.diaChiNguoiLayVe,

            donViNguoiLayVe: data.donViNguoiLayVe !== undefined ? data.donViNguoiLayVe : phieu.donViNguoiLayVe,

            khachLauDai: data.khachLauDai !== undefined ? data.khachLauDai : phieu.khachLauDai
        };

        this.validateDoiTuongLayVe(duLieuTam.doiTuongLayVe);

        this.validateGioiTinh(duLieuTam.gioiTinhNguoiLayVe);

        await this.validateThucDonNgay(duLieuTam.thucDonNgayId);

        const nguoiLayVe = await this.validateNguoiLayVe(duLieuTam);

        const donGia = await this.getDonGia(duLieuTam.thucDonNgayId, duLieuTam.doiTuongLayVe);

        const soLuong = data.soLuong !== undefined ? Number(data.soLuong) : Number(phieu.soLuong);

        const tienGoc = donGia * soLuong;

        const tongMienGiam = Number(phieu.tongMienGiam);

        const thanhTien = Math.max(tienGoc - tongMienGiam, 0);

        const phuongThucThanhToan =
            data.phuongThucThanhToan !== undefined ? data.phuongThucThanhToan : phieu.phuongThucThanhToan;

        this.validatePhuongThucThanhToan(phuongThucThanhToan);

        const duLieuCapNhat = {
            thucDonNgayId: duLieuTam.thucDonNgayId,
            doiTuongLayVe: duLieuTam.doiTuongLayVe,
            ...nguoiLayVe,
            soLuong,
            donGia,
            tienGoc,
            tongMienGiam,
            thanhTien,

            ghiChu:
                data.ghiChu !== undefined ? (data.ghiChu === null ? null : data.ghiChu.trim() || null) : phieu.ghiChu,

            phuongThucThanhToan: phuongThucThanhToan !== null ? Number(phuongThucThanhToan) : null
        };

        const ketQua = await phieuLayVeAnRepository.update(phieuLayVeAnId, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Phiếu lấy vé ăn không tồn tại.');
        }

        return ketQua;
    }

    async huy(id, data, nguoiHuyId) {
        const phieuLayVeAnId = this.parseId(id);

        const taiKhoanId = this.parseNguoiDungId(nguoiHuyId);

        const phieu = await this.getChiTiet(phieuLayVeAnId);

        if (Number(phieu.trangThai) === 50) {
            throw new ApiError(400, 'Phiếu đã được hủy trước đó.');
        }

        if (Number(phieu.trangThai) === 60) {
            throw new ApiError(400, 'Phiếu đã hoàn tiền không thể hủy.');
        }

        const ketQua = await phieuLayVeAnRepository.huy(phieuLayVeAnId, taiKhoanId, data.lyDoHuy.trim());

        if (!ketQua) {
            throw new ApiError(404, 'Phiếu lấy vé ăn không tồn tại.');
        }

        return ketQua;
    }

    async getDuLieuInVe(id, nguoiInId) {
        const taiKhoanInId = this.parseNguoiDungId(nguoiInId);

        const phieuLayVeAnId = this.parseId(id);

        const phieu = await phieuLayVeAnRepository.getDuLieuInVe(phieuLayVeAnId);

        if (!phieu) {
            throw new ApiError(404, 'Phiếu lấy vé ăn không tồn tại.');
        }

        if (![40, 60].includes(Number(phieu.trangThai))) {
            throw new ApiError(400, 'Phiếu chưa thanh toán nên chưa thể in vé.');
        }

        const data = inBaoCaoService.normalizeReportData({
            ...phieu,

            ngay: inBaoCaoService.normalizeDate(phieu.ngay),

            ngaySinhNguoiLayVe: phieu.ngaySinhNguoiLayVe
                ? inBaoCaoService.normalizeDate(phieu.ngaySinhNguoiLayVe)
                : null,

            thoiGianBatDau: inBaoCaoService.normalizeTime(phieu.thoiGianBatDau),

            thoiGianKetThuc: inBaoCaoService.normalizeTime(phieu.thoiGianKetThuc),

            thoiGianThanhToan: inBaoCaoService.normalizeDateTime(phieu.thoiGianThanhToan),

            thoiGianHuy: phieu.thoiGianHuy ? inBaoCaoService.normalizeDateTime(phieu.thoiGianHuy) : null,

            createdAt: inBaoCaoService.normalizeDateTime(phieu.createdAt),

            updatedAt: inBaoCaoService.normalizeDateTime(phieu.updatedAt),

            donGia: phieu.donGia,
            tienGoc: phieu.tienGoc,
            tongMienGiam: phieu.tongMienGiam,
            thanhTien: phieu.thanhTien,

            doiTuongLayVe: phieu.doiTuongLayVe,
            phuongThucThanhToan: phieu.phuongThucThanhToan,
            trangThai: phieu.trangThai,

            nguoiLayVe: phieu.tenNhanVien || phieu.hoTenNguoiLayVe || ''
        });

        return await inBaoCaoService.taoBaoCao({
            maBaoCao: 've_an',
            id: phieu.id,
            soPhieu: phieu.soPhieu,
            data,
            nguoiInId: taiKhoanInId
        });
    }
}

module.exports = new PhieuLayVeAnService();

const { loaiMienGiam: danhSachLoaiMienGiam } = require('../../../../constants/enums');

const ApiError = require('../../../../utils/api-error');
const voucherRepository = require('./voucher.repository');

class VoucherService {
    async getTongHop(query) {
        return await voucherRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const voucher = await voucherRepository.getChiTiet(id);

        if (!voucher) {
            throw new ApiError(404, 'Voucher không tồn tại.');
        }

        return voucher;
    }

    validateLoaiMienGiam(giaTriLoaiMienGiam) {
        const giaTriSo = Number(giaTriLoaiMienGiam);

        const hopLe = danhSachLoaiMienGiam.some((item) => Number(item.value) === giaTriSo);

        if (!hopLe) {
            throw new ApiError(400, 'Loại miễn giảm không hợp lệ.');
        }
    }

    validateGiaTriMienGiam(loaiMienGiam, giaTri) {
        const loaiMienGiamSo = Number(loaiMienGiam);

        const giaTriSo = Number(giaTri);

        if (Number.isNaN(giaTriSo) || giaTriSo <= 0) {
            throw new ApiError(400, 'Giá trị miễn giảm phải lớn hơn 0.');
        }

        if (loaiMienGiamSo === 10 && giaTriSo > 100) {
            throw new ApiError(400, 'Giá trị miễn giảm theo phần trăm không được vượt quá 100.');
        }
    }

    validateSoLuong(soLuong, daSuDung) {
        const soLuongSo = Number(soLuong);

        const daSuDungSo = Number(daSuDung);

        if (!Number.isInteger(soLuongSo) || soLuongSo < 0) {
            throw new ApiError(400, 'Số lượng voucher phải là số nguyên lớn hơn hoặc bằng 0.');
        }

        if (!Number.isInteger(daSuDungSo) || daSuDungSo < 0) {
            throw new ApiError(400, 'Số lượng voucher đã sử dụng phải là số nguyên lớn hơn hoặc bằng 0.');
        }

        if (daSuDungSo > soLuongSo) {
            throw new ApiError(400, 'Số lượng voucher đã sử dụng không được lớn hơn tổng số lượng.');
        }
    }

    validateThoiGian(thoiGianBatDau, thoiGianKetThuc) {
        if (!thoiGianBatDau || !thoiGianKetThuc) {
            return;
        }

        const batDau = new Date(thoiGianBatDau);

        const ketThuc = new Date(thoiGianKetThuc);

        if (Number.isNaN(batDau.getTime()) || Number.isNaN(ketThuc.getTime())) {
            throw new ApiError(400, 'Thời gian áp dụng voucher không hợp lệ.');
        }

        if (ketThuc <= batDau) {
            throw new ApiError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        if (data.maVoucher !== undefined) {
            const trungMa = await voucherRepository.existsMaVoucher(data.maVoucher, excludeId);

            if (trungMa) {
                throw new ApiError(409, 'Mã voucher đã tồn tại.');
            }
        }

        if (data.tenVoucher !== undefined) {
            const trungTen = await voucherRepository.existsTenVoucher(data.tenVoucher, excludeId);

            if (trungTen) {
                throw new ApiError(409, 'Tên voucher đã tồn tại.');
            }
        }
    }

    async suDungVoucher(id, client) {
        const ketQua = await voucherRepository.suDungVoucher(id, client);

        if (!ketQua) {
            throw new ApiError(400, 'Voucher không tồn tại, đã bị khóa hoặc đã hết lượt sử dụng.');
        }

        return ketQua;
    }

    async hoanVoucher(id, client) {
        const ketQua = await voucherRepository.hoanVoucher(id, client);

        if (!ketQua) {
            throw new ApiError(400, 'Voucher không tồn tại hoặc số lượng đã sử dụng bằng 0.');
        }

        return ketQua;
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        this.validateLoaiMienGiam(duLieu.loaiMienGiam);

        this.validateGiaTriMienGiam(duLieu.loaiMienGiam, duLieu.giaTri);

        this.validateSoLuong(duLieu.soLuong, duLieu.daSuDung);

        this.validateThoiGian(duLieu.thoiGianBatDau, duLieu.thoiGianKetThuc);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maVoucher: duLieu.maVoucher.trim(),

            tenVoucher: duLieu.tenVoucher.trim(),

            loaiMienGiam: duLieu.loaiMienGiam,

            giaTri: Number(duLieu.giaTri),

            soLuong: Number(duLieu.soLuong),

            daSuDung: 0,

            thoiGianBatDau: duLieu.thoiGianBatDau ?? null,

            thoiGianKetThuc: duLieu.thoiGianKetThuc ?? null,

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await voucherRepository.create(duLieuTao);
    }

    async update(id, data) {
        const voucher = await voucherRepository.getChiTiet(id);

        if (!voucher) {
            throw new ApiError(404, 'Voucher không tồn tại.');
        }

        const duLieuCapNhat = {
            maVoucher: data.maVoucher !== undefined ? data.maVoucher.trim() : voucher.maVoucher,

            tenVoucher: data.tenVoucher !== undefined ? data.tenVoucher.trim() : voucher.tenVoucher,

            loaiMienGiam: data.loaiMienGiam !== undefined ? data.loaiMienGiam : voucher.loaiMienGiam,

            giaTri: data.giaTri !== undefined ? Number(data.giaTri) : Number(voucher.giaTri),

            soLuong: data.soLuong !== undefined ? Number(data.soLuong) : voucher.soLuong,

            daSuDung: voucher.daSuDung,

            thoiGianBatDau: data.thoiGianBatDau !== undefined ? data.thoiGianBatDau : voucher.thoiGianBatDau,

            thoiGianKetThuc: data.thoiGianKetThuc !== undefined ? data.thoiGianKetThuc : voucher.thoiGianKetThuc,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : voucher.moTa,

            active: data.active !== undefined ? data.active : voucher.active
        };

        this.validateLoaiMienGiam(duLieuCapNhat.loaiMienGiam);

        this.validateGiaTriMienGiam(duLieuCapNhat.loaiMienGiam, duLieuCapNhat.giaTri);

        this.validateSoLuong(duLieuCapNhat.soLuong, duLieuCapNhat.daSuDung);

        this.validateThoiGian(duLieuCapNhat.thoiGianBatDau, duLieuCapNhat.thoiGianKetThuc);

        await this.validateTrungDuLieu(duLieuCapNhat, id);

        const ketQua = await voucherRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Voucher không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new VoucherService();

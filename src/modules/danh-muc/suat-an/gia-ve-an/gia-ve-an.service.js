const { doiTuongLayVe: dsDoiTuongLayVe } = require('../../../../constants/enums');

const ApiError = require('../../../../utils/api-error');
const giaVeAnRepository = require('./gia-ve-an.repository');

class GiaVeAnService {
    parseId(id) {
        const giaVeAnId = Number(id);

        if (!Number.isInteger(giaVeAnId) || giaVeAnId <= 0) {
            throw new ApiError(400, 'ID giá vé ăn không hợp lệ.');
        }

        return giaVeAnId;
    }

    parseNullableId(value, tenTruong) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const id = Number(value);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, `${tenTruong} không hợp lệ.`);
        }

        return id;
    }

    async getTongHop(query) {
        return await giaVeAnRepository.getTongHop(query);
    }

    async getTimGia(query) {
        const thucDonNgayId = Number(query.thucDonNgayId);

        if (!Number.isInteger(thucDonNgayId) || thucDonNgayId <= 0) {
            throw new ApiError(400, 'Thực đơn ngày không hợp lệ.');
        }

        if (query.doiTuongLayVe === undefined || query.doiTuongLayVe === null || query.doiTuongLayVe === '') {
            throw new ApiError(400, 'Đối tượng lấy vé là bắt buộc.');
        }

        const doiTuongLayVe = Number(query.doiTuongLayVe);

        this.validateDoiTuongLayVe(doiTuongLayVe);

        const giaVeAn = await giaVeAnRepository.getTimGia(thucDonNgayId, doiTuongLayVe);

        if (!giaVeAn) {
            throw new ApiError(404, 'Không tìm thấy giá vé ăn phù hợp.');
        }

        return giaVeAn;
    }

    async getChiTiet(id) {
        const giaVeAnId = this.parseId(id);

        const giaVeAn = await giaVeAnRepository.getChiTiet(giaVeAnId);

        if (!giaVeAn) {
            throw new ApiError(404, 'Giá vé ăn không tồn tại.');
        }

        return giaVeAn;
    }

    validateDoiTuongLayVe(doiTuongLayVe) {
        const hopLe = dsDoiTuongLayVe.some((item) => Number(item.value) === Number(doiTuongLayVe));

        if (!hopLe) {
            throw new ApiError(400, 'Đối tượng lấy vé không hợp lệ.');
        }
    }

    validateThoiGian(tuNgay, denNgay) {
        if (!denNgay) {
            return;
        }

        const batDau = new Date(`${tuNgay}T00:00:00`);
        const ketThuc = new Date(`${denNgay}T00:00:00`);

        if (Number.isNaN(batDau.getTime()) || Number.isNaN(ketThuc.getTime())) {
            throw new ApiError(400, 'Thời gian áp dụng không hợp lệ.');
        }

        if (batDau > ketThuc) {
            throw new ApiError(400, 'Đến ngày phải lớn hơn hoặc bằng từ ngày.');
        }
    }

    async validateDanhMuc(data) {
        if (data.coSoId) {
            const tonTai = await giaVeAnRepository.existsCoSo(data.coSoId);

            if (!tonTai) {
                throw new ApiError(404, 'Cơ sở không tồn tại.');
            }
        }

        if (data.nhaAnId) {
            const nhaAn = await giaVeAnRepository.getNhaAnById(data.nhaAnId);

            if (!nhaAn) {
                throw new ApiError(404, 'Nhà ăn không tồn tại.');
            }

            if (data.coSoId && Number(nhaAn.co_so_id) !== Number(data.coSoId)) {
                throw new ApiError(400, 'Nhà ăn không thuộc cơ sở đã chọn.');
            }
        }

        if (data.caAnId) {
            const tonTai = await giaVeAnRepository.existsCaAn(data.caAnId);

            if (!tonTai) {
                throw new ApiError(404, 'Ca ăn không tồn tại.');
            }
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungCauHinh = await giaVeAnRepository.existsCauHinhTrung(data, excludeId);

        if (trungCauHinh) {
            throw new ApiError(409, 'Đã tồn tại cấu hình giá vé ăn trùng phạm vi và thời gian áp dụng.');
        }
    }

    chuanHoaNgay(value) {
        if (!value) {
            return null;
        }

        if (typeof value === 'string') {
            return value.slice(0, 10);
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date.toISOString().slice(0, 10);
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        this.validateDoiTuongLayVe(duLieu.doiTuongLayVe);

        const duLieuTao = {
            doiTuongLayVe: Number(duLieu.doiTuongLayVe),

            coSoId: this.parseNullableId(duLieu.coSoId, 'Cơ sở'),

            nhaAnId: this.parseNullableId(duLieu.nhaAnId, 'Nhà ăn'),

            caAnId: this.parseNullableId(duLieu.caAnId, 'Ca ăn'),

            donGia: Number(duLieu.donGia),

            tuNgay: this.chuanHoaNgay(duLieu.tuNgay),

            denNgay: this.chuanHoaNgay(duLieu.denNgay),

            mucDoUuTien: duLieu.mucDoUuTien !== undefined ? Number(duLieu.mucDoUuTien) : 1,

            ghiChu: duLieu.ghiChu?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        this.validateThoiGian(duLieuTao.tuNgay, duLieuTao.denNgay);

        await this.validateDanhMuc(duLieuTao);

        await this.validateTrungDuLieu(duLieuTao);

        return await giaVeAnRepository.create(duLieuTao);
    }

    async update(id, data) {
        const giaVeAnId = this.parseId(id);

        const giaVeAn = await giaVeAnRepository.getChiTiet(giaVeAnId);

        if (!giaVeAn) {
            throw new ApiError(404, 'Giá vé ăn không tồn tại.');
        }

        const duLieuCapNhat = {
            doiTuongLayVe:
                data.doiTuongLayVe !== undefined ? Number(data.doiTuongLayVe) : Number(giaVeAn.doiTuongLayVe),

            coSoId: data.coSoId !== undefined ? this.parseNullableId(data.coSoId, 'Cơ sở') : giaVeAn.coSoId,

            nhaAnId: data.nhaAnId !== undefined ? this.parseNullableId(data.nhaAnId, 'Nhà ăn') : giaVeAn.nhaAnId,

            caAnId: data.caAnId !== undefined ? this.parseNullableId(data.caAnId, 'Ca ăn') : giaVeAn.caAnId,

            donGia: data.donGia !== undefined ? Number(data.donGia) : Number(giaVeAn.donGia),

            tuNgay: data.tuNgay !== undefined ? this.chuanHoaNgay(data.tuNgay) : this.chuanHoaNgay(giaVeAn.tuNgay),

            denNgay: data.denNgay !== undefined ? this.chuanHoaNgay(data.denNgay) : this.chuanHoaNgay(giaVeAn.denNgay),

            mucDoUuTien: data.mucDoUuTien !== undefined ? Number(data.mucDoUuTien) : Number(giaVeAn.mucDoUuTien),

            ghiChu:
                data.ghiChu !== undefined ? (data.ghiChu === null ? null : data.ghiChu.trim() || null) : giaVeAn.ghiChu,

            active: data.active !== undefined ? data.active : giaVeAn.active
        };

        this.validateDoiTuongLayVe(duLieuCapNhat.doiTuongLayVe);

        this.validateThoiGian(duLieuCapNhat.tuNgay, duLieuCapNhat.denNgay);

        await this.validateDanhMuc(duLieuCapNhat);

        await this.validateTrungDuLieu(duLieuCapNhat, giaVeAnId);

        const ketQua = await giaVeAnRepository.update(giaVeAnId, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Giá vé ăn không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new GiaVeAnService();

const { active } = require('../../../../constants/enums');
const ApiError = require('../../../../utils/api-error');

const chucVuRepository = require('./chuc-vu.repository');

class ChucVuService {
    async getTongHop(query) {
        return await chucVuRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const chucVu = await chucVuRepository.getChiTiet(id);

        if (!chucVu) {
            throw new ApiError(404, 'Chức vụ không tồn tại.');
        }

        return chucVu;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await chucVuRepository.existsMaChucVu(data.maChucVu, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã chức vụ đã tồn tại.');
        }

        const trungTen = await chucVuRepository.existsTenChucVu(data.tenChucVu, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên chức vụ đã tồn tại trong cơ sở này.');
        }
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maChucVu: duLieu.maChucVu.trim(),

            tenChucVu: duLieu.tenChucVu.trim(),

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await chucVuRepository.create(duLieuTao);
    }

    async update(id, data) {
        const chucVu = await chucVuRepository.getChiTiet(id);

        if (!chucVu) {
            throw new ApiError(404, 'Chức vụ không tồn tại.');
        }

        const duLieuCapNhat = {
            maChucVu: data.maChucVu !== undefined ? data.maChucVu.trim() : chucVu.maChucVu,

            tenChucVu: data.tenChucVu !== undefined ? data.tenChucVu.trim() : chucVu.tenChucVu,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : chucVu.moTa,

            active: data.active !== undefined ? data.active : chucVu.active
        };

        await this.validateTrungDuLieu(duLieuCapNhat, id);

        const ketQua = await chucVuRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Chức vụ không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new ChucVuService();

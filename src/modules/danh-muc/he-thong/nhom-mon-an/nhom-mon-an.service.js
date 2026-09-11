const { active } = require('../../../../constants/enums');
const ApiError = require('../../../../utils/api-error');

const nhomMonAnRepository = require('./nhom-mon-an.repository');

class NhomMonAnService {
    async getTongHop(query) {
        return await nhomMonAnRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const nhomMonAn = await nhomMonAnRepository.getChiTiet(id);

        if (!nhomMonAn) {
            throw new ApiError(404, 'Nhóm món ăn không tồn tại.');
        }

        return nhomMonAn;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await nhomMonAnRepository.existsMaNhomMonAn(data.maNhomMonAn, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã nhóm món ăn đã tồn tại.');
        }

        const trungTen = await nhomMonAnRepository.existsTenNhomMonAn(data.tenNhomMonAn, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên nhóm món ăn đã tồn tại trong cơ sở này.');
        }
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maNhomMonAn: duLieu.maNhomMonAn.trim(),

            tenNhomMonAn: duLieu.tenNhomMonAn.trim(),

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await nhomMonAnRepository.create(duLieuTao);
    }

    async update(id, data) {
        const nhomMonAn = await nhomMonAnRepository.getChiTiet(id);

        if (!nhomMonAn) {
            throw new ApiError(404, 'Nhóm món ăn không tồn tại.');
        }

        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu, id);

        const duLieuCapNhat = {
            maNhomMonAn: data.maNhomMonAn !== undefined ? data.maNhomMonAn.trim() : nhomMonAn.maNhomMonAn,

            tenNhomMonAn: data.tenNhomMonAn !== undefined ? data.tenNhomMonAn.trim() : nhomMonAn.tenNhomMonAn,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : nhomMonAn.moTa,

            active: data.active !== undefined ? data.active : nhomMonAn.active
        };

        const ketQua = await nhomMonAnRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Nhóm món ăn không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new NhomMonAnService();

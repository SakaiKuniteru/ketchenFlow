const { active } = require('../../../../constants/enums');
const ApiError = require('../../../../utils/api-error');

const nhomTinhNangRepository = require('./nhom-tinh-nang.repository');

class NhomTinhNangService {
    async getTongHop(query) {
        return await nhomTinhNangRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const nhomTinhNang = await nhomTinhNangRepository.getChiTiet(id);

        if (!nhomTinhNang) {
            throw new ApiError(404, 'Nhóm tính năng không tồn tại.');
        }

        return nhomTinhNang;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await nhomTinhNangRepository.existsMaNhomTinhNang(data.maNhomTinhNang, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã nhóm tính năng đã tồn tại.');
        }

        const trungTen = await nhomTinhNangRepository.existsTenNhomTinhNang(data.tenNhomTinhNang, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên nhóm tính năng đã tồn tại trong cơ sở này.');
        }
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maNhomTinhNang: duLieu.maNhomTinhNang.trim(),

            tenNhomTinhNang: duLieu.tenNhomTinhNang.trim(),

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await nhomTinhNangRepository.create(duLieuTao);
    }

    async update(id, data) {
        const nhomTinhNang = await nhomTinhNangRepository.getChiTiet(id);

        if (!nhomTinhNang) {
            throw new ApiError(404, 'Nhóm tính năng không tồn tại.');
        }

        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu, id);

        const duLieuCapNhat = {
            maNhomTinhNang:
                data.maNhomTinhNang !== undefined ? data.maNhomTinhNang.trim() : nhomTinhNang.maNhomTinhNang,

            tenNhomTinhNang:
                data.tenNhomTinhNang !== undefined ? data.tenNhomTinhNang.trim() : nhomTinhNang.tenNhomTinhNang,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : nhomTinhNang.moTa,

            active: data.active !== undefined ? data.active : nhomTinhNang.active
        };

        const ketQua = await nhomTinhNangRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Nhóm tính năng không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new NhomTinhNangService();

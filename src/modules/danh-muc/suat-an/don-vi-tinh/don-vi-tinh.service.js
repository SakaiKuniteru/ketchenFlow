const { loaiDonVi: dsLoaiDonVi } = require('../../../../constants/enums');

const ApiError = require('../../../../utils/api-error');

const donViTinhRepository = require('./don-vi-tinh.repository');

class DonViTinhService {
    parseId(id) {
        const donViTinhId = Number(id);

        if (!Number.isInteger(donViTinhId) || donViTinhId <= 0) {
            throw new ApiError(400, 'ID đơn vị tính không hợp lệ.');
        }

        return donViTinhId;
    }

    async getTongHop(query) {
        return await donViTinhRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const donViTinhId = this.parseId(id);

        const donViTinh = await donViTinhRepository.getChiTiet(donViTinhId);

        if (!donViTinh) {
            throw new ApiError(404, 'Đơn vị tính không tồn tại.');
        }

        return donViTinh;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await donViTinhRepository.existsMaDonViTinh(data.maDonViTinh, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã đơn vị tính đã tồn tại.');
        }

        const trungTen = await donViTinhRepository.existsTenDonViTinh(data.tenDonViTinh, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên đơn vị tính đã tồn tại.');
        }
    }

    validateLoaiDonVi(loaiDonVi) {
        const hopLe = dsLoaiDonVi.some((item) => Number(item.value) === Number(loaiDonVi));

        if (!hopLe) {
            throw new ApiError(400, 'Loại đơn vị không hợp lệ.');
        }
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu);

        this.validateLoaiDonVi(duLieu.loaiDonVi);

        const duLieuTao = {
            maDonViTinh: duLieu.maDonViTinh.trim(),

            tenDonViTinh: duLieu.tenDonViTinh.trim(),

            kyHieu: duLieu.kyHieu?.trim() || null,

            loaiDonVi: Number(duLieu.loaiDonVi),

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await donViTinhRepository.create(duLieuTao);
    }

    async update(id, data) {
        const donViTinhId = this.parseId(id);

        const donViTinh = await donViTinhRepository.getChiTiet(donViTinhId);

        if (!donViTinh) {
            throw new ApiError(404, 'Đơn vị tính không tồn tại.');
        }

        const duLieuCapNhat = {
            maDonViTinh: data.maDonViTinh !== undefined ? data.maDonViTinh.trim() : donViTinh.maDonViTinh,

            tenDonViTinh: data.tenDonViTinh !== undefined ? data.tenDonViTinh.trim() : donViTinh.tenDonViTinh,

            kyHieu:
                data.kyHieu !== undefined
                    ? data.kyHieu === null
                        ? null
                        : data.kyHieu.trim() || null
                    : donViTinh.kyHieu,

            loaiDonVi: data.loaiDonVi !== undefined ? Number(data.loaiDonVi) : Number(donViTinh.loaiDonVi),

            active: data.active !== undefined ? data.active : donViTinh.active
        };

        await this.validateTrungDuLieu(duLieuCapNhat, donViTinhId);

        this.validateLoaiDonVi(duLieuCapNhat.loaiDonVi);

        const ketQua = await donViTinhRepository.update(donViTinhId, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Đơn vị tính không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new DonViTinhService();

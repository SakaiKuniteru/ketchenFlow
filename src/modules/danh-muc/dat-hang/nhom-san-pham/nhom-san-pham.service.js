"use strict";

const ApiError = require("../../../../utils/api-error");
const repository = require("./nhom-san-pham.repository");

class NhomSanPhamService {
    getTongHop(query) {
        return repository.getTongHop(query);
    }

    async getChiTiet(id) {
        const item = await repository.getChiTiet(id);
        if (!item) throw new ApiError(404, "Nhóm sản phẩm không tồn tại.");
        return item;
    }

    async validateTrung(data, excludeId = null) {
        if (await repository.exists("ma_nhom_san_pham", data.maNhomSanPham, excludeId)) {
            throw new ApiError(409, "Mã nhóm sản phẩm đã tồn tại.");
        }
        if (await repository.exists("ten_nhom_san_pham", data.tenNhomSanPham, excludeId)) {
            throw new ApiError(409, "Tên nhóm sản phẩm đã tồn tại.");
        }
    }

    normalize(data, current = {}) {
        return {
            maNhomSanPham: data.maNhomSanPham?.trim() ?? current.maNhomSanPham,
            tenNhomSanPham: data.tenNhomSanPham?.trim() ?? current.tenNhomSanPham,
            loaiSanPham: data.loaiSanPham ?? current.loaiSanPham,
            moTa: data.moTa !== undefined ? data.moTa?.trim() || null : current.moTa ?? null,
            thuTuHienThi: data.thuTuHienThi ?? current.thuTuHienThi ?? 0,
            active: data.active ?? current.active ?? true
        };
    }

    async create(data) {
        const normalized = this.normalize(data);
        await this.validateTrung(normalized);
        return repository.create(normalized);
    }

    async update(id, data) {
        const current = await this.getChiTiet(id);
        const normalized = this.normalize(data, current);
        await this.validateTrung(normalized, id);
        return repository.update(id, normalized);
    }
}

module.exports = new NhomSanPhamService();

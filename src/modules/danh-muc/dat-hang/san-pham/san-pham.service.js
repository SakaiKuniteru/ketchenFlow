"use strict";

const ApiError = require("../../../../utils/api-error");
const repository = require("./san-pham.repository");

class SanPhamService {
    getTongHop(q) {
        return repository.getTongHop(q);
    }

    async getChiTiet(id) {
        const x = await repository.getChiTiet(id);

        if (!x) {
            throw new ApiError(
                404,
                "Sản phẩm không tồn tại."
            );
        }

        return x;
    }

    normalize(
        d,
        c = {}
    ) {
        const val = (k, f) =>
            d[k] !== undefined
                ? d[k]
                : c[k] ??
                    f;

        return {
            maSanPham: (d.maSanPham?.trim() ?? c.maSanPham),
            tenSanPham: (d.tenSanPham?.trim() ?? c.tenSanPham),
            nhomSanPhamId: val("nhomSanPhamId"),
            monAnId: val("monAnId", null),
            donViTinhId: val("donViTinhId", null),
            giaBan: val("giaBan", 0),
            moTa:
                d.moTa !== undefined
                    ? d.moTa?.trim() || null
                    : c.moTa ?? null,
            hinhAnh:
                d.hinhAnh !== undefined
                    ? d.hinhAnh?.trim() || null
                    : c.hinhAnh ?? null,
            choPhepDat: val("choPhepDat", true),
            laSanPhamMoi: val("laSanPhamMoi", false),
            laSanPhamNoiBat: val("laSanPhamNoiBat", false),
            soLuongToiThieu: val("soLuongToiThieu", 1),
            soLuongToiDa: val("soLuongToiDa", null),
            buocSoLuong: val("buocSoLuong", 1),
            thoiGianChuanBiPhut: val("thoiGianChuanBiPhut", 0),
            thuTuHienThi: val("thuTuHienThi", 0),
            active: val("active", true),
            dsCoSo:
                d.dsCoSo !== undefined
                    ? d.dsCoSo
                    : c.dsCoSo
        };
    }

    async validate(
        d,
        id = null
    ) {
        if (
            d.soLuongToiDa !== null &&
            d.soLuongToiDa < d.soLuongToiThieu
        ) {
            throw new ApiError(
                400,
                "Số lượng tối đa phải lớn hơn hoặc bằng số lượng tối thiểu."
            );
        }

        if (
            await repository.existsCode(
                d.maSanPham,
                id
            )
        ) {
            throw new ApiError(
                409,
                "Mã sản phẩm đã tồn tại."
            );
        }

        const refs = await repository.referencesExist(d);

        if (!refs.nhom) {
            throw new ApiError(
                400,
                "Nhóm sản phẩm không tồn tại hoặc đã ngừng hoạt động."
            );
        }

        if (!refs.mon) {
            throw new ApiError(
                400,
                "Món ăn không tồn tại hoặc đã ngừng hoạt động."
            );
        }

        if (!refs.don_vi) {
            throw new ApiError(
                400,
                "Đơn vị tính không tồn tại hoặc đã ngừng hoạt động."
            );
        }
    }

    async create(data) {
        const d = this.normalize(data);

        await this.validate(d);

        return repository.save(d);
    }

    async update(
        id,
        data
    ) {
        const c = await this.getChiTiet(id);
        const d = this.normalize(data, c);

        await this.validate(
            d,
            id
        );

        return repository.save(
            d,
            id
        );
    }
}

module.exports = new SanPhamService();
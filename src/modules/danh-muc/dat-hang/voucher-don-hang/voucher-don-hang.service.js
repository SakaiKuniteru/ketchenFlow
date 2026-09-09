"use strict";

const ApiError = require("../../../../utils/api-error"),
    repository = require("./voucher-don-hang.repository");

class VoucherDonHangService {
    getTongHop(q) {
        return repository.getTongHop(q);
    }

    async getChiTiet(id) {
        const x = await repository.getChiTiet(id);

        if (!x) {
            throw new ApiError(
                404,
                "Voucher đơn hàng không tồn tại."
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
            maVoucher: d.maVoucher?.trim() ?? c.maVoucher,
            tenVoucher: d.tenVoucher?.trim() ?? c.tenVoucher,
            moTa:
                d.moTa !== undefined
                    ? d.moTa?.trim() || null
                    : c.moTa ?? null,
            loaiGiam: val("loaiGiam"),
            giaTri: val("giaTri"),
            giamToiDa: val("giamToiDa", null),
            giaTriDonHangToiThieu: val("giaTriDonHangToiThieu", 0),
            soLuongPhatHanh: val("soLuongPhatHanh", null),
            soLuotMoiNhanVien: val("soLuotMoiNhanVien", 1),
            phamViApDung: val("phamViApDung", 10),
            choPhepDungChung: val("choPhepDungChung", false),
            tuDongApDung: val("tuDongApDung", false),
            thoiGianBatDau: val("thoiGianBatDau"),
            thoiGianKetThuc: val("thoiGianKetThuc"),
            active: val("active", true),
            nguoiTaoId: val("nguoiTaoId"),
            nhomSanPhamIds:
                d.nhomSanPhamIds !== undefined
                    ? d.nhomSanPhamIds
                    : c.nhomSanPhamIds,
            sanPhamIds:
                d.sanPhamIds !== undefined
                    ? d.sanPhamIds
                    : c.sanPhamIds,
            coSoIds:
                d.coSoIds !== undefined
                    ? d.coSoIds
                    : c.coSoIds,
            phongBanIds:
                d.phongBanIds !== undefined
                    ? d.phongBanIds
                    : c.phongBanIds,
            chucVuIds:
                d.chucVuIds !== undefined
                    ? d.chucVuIds
                    : c.chucVuIds,
            nhanVienIds:
                d.nhanVienIds !== undefined
                    ? d.nhanVienIds
                    : c.nhanVienIds
        };
    }

    async validate(
        d,
        id = null
    ) {
        if (
            new Date(d.thoiGianBatDau) >=
            new Date(d.thoiGianKetThuc)
        ) {
            throw new ApiError(
                400,
                "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc."
            );
        }

        if (
            d.loaiGiam === 10 &&
            d.giaTri > 100
        ) {
            throw new ApiError(
                400,
                "Giá trị giảm theo phần trăm không được vượt quá 100."
            );
        }

        if (
            d.phamViApDung === 20 &&
            !d.nhomSanPhamIds?.length
        ) {
            throw new ApiError(
                400,
                "Voucher theo nhóm phải chọn ít nhất một nhóm sản phẩm."
            );
        }

        if (
            d.phamViApDung === 30 &&
            !d.sanPhamIds?.length
        ) {
            throw new ApiError(
                400,
                "Voucher theo sản phẩm phải chọn ít nhất một sản phẩm."
            );
        }

        if (
            await repository.existsCode(
                d.maVoucher,
                id
            )
        ) {
            throw new ApiError(
                409,
                "Mã voucher đơn hàng đã tồn tại."
            );
        }
    }

    async create(
        data,
        user
    ) {
        const d = this.normalize({
            ...data,
            nguoiTaoId: user.nhanVienId
        });

        if (!d.nguoiTaoId) {
            throw new ApiError(
                400,
                "Tài khoản chưa liên kết nhân viên."
            );
        }

        await this.validate(d);

        return repository.save(d);
    }

    async update(
        id,
        data
    ) {
        const c = await this.getChiTiet(id),
            d = this.normalize(data, c);

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

module.exports = new VoucherDonHangService();
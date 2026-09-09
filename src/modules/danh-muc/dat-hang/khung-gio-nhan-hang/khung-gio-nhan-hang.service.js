"use strict";

const ApiError = require("../../../../utils/api-error");
const repository = require("./khung-gio-nhan-hang.repository");

class KhungGioNhanHangService {
    getTongHop(q) {
        return repository.getTongHop(q);
    }

    async getChiTiet(id) {
        const x = await repository.getChiTiet(id);

        if (!x) {
            throw new ApiError(
                404,
                "Khung giờ nhận hàng không tồn tại."
            );
        }

        return x;
    }

    normalize(
        d,
        c = {}
    ) {
        return {
            maKhungGio: d.maKhungGio?.trim() ?? c.maKhungGio,
            tenKhungGio: d.tenKhungGio?.trim() ?? c.tenKhungGio,
            coSoId: d.coSoId ?? c.coSoId,
            gioBatDau: d.gioBatDau ?? c.gioBatDau,
            gioKetThuc: d.gioKetThuc ?? c.gioKetThuc,
            hanDatTruocPhut:
                d.hanDatTruocPhut ??
                c.hanDatTruocPhut ??
                0,
            soDonToiDa:
                d.soDonToiDa !== undefined
                    ? d.soDonToiDa
                    : c.soDonToiDa ?? null,
            active:
                d.active ??
                c.active ??
                true
        };
    }

    async validate(
        d,
        id = null
    ) {
        if (
            d.gioBatDau >=
            d.gioKetThuc
        ) {
            throw new ApiError(
                400,
                "Giờ bắt đầu phải nhỏ hơn giờ kết thúc."
            );
        }

        if (
            !await repository.existsCoSo(
                d.coSoId
            )
        ) {
            throw new ApiError(
                400,
                "Cơ sở không tồn tại hoặc đã ngừng hoạt động."
            );
        }

        if (
            await repository.existsCode(
                d.coSoId,
                d.maKhungGio,
                id
            )
        ) {
            throw new ApiError(
                409,
                "Mã khung giờ đã tồn tại trong cơ sở."
            );
        }
    }

    async create(data) {
        const d = this.normalize(data);

        await this.validate(d);

        return repository.create(d);
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

        return repository.update(
            id,
            d
        );
    }
}

module.exports = new KhungGioNhanHangService();
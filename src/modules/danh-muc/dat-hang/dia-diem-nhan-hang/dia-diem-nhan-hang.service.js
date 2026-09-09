"use strict";

const ApiError = require("../../../../utils/api-error");
const repository = require("./dia-diem-nhan-hang.repository");

class DiaDiemNhanHangService {
    getTongHop(query) {
        return repository.getTongHop(query);
    }

    async getChiTiet(id) {
        const item = await repository.getChiTiet(id);

        if (!item) {
            throw new ApiError(
                404,
                "Địa điểm nhận hàng không tồn tại."
            );
        }

        return item;
    }

    normalize(
        d,
        c = {}
    ) {
        return {
            maDiaDiem: d.maDiaDiem?.trim() ?? c.maDiaDiem,
            tenDiaDiem: d.tenDiaDiem?.trim() ?? c.tenDiaDiem,
            coSoId: d.coSoId ?? c.coSoId,
            moTaDiaChi:
                d.moTaDiaChi !== undefined
                    ? d.moTaDiaChi?.trim() || null
                    : c.moTaDiaChi ?? null,
            thuTuHienThi:
                d.thuTuHienThi ??
                c.thuTuHienThi ??
                0,
            active:
                d.active ??
                c.active ??
                true
        };
    }

    async validate(
        d,
        excludeId = null
    ) {
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
                d.maDiaDiem,
                excludeId
            )
        ) {
            throw new ApiError(
                409,
                "Mã địa điểm đã tồn tại trong cơ sở."
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

module.exports = new DiaDiemNhanHangService();
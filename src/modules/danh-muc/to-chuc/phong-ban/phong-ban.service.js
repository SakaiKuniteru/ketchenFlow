const ApiError = require('../../../../utils/api-error');
const phongBanRepository = require('./phong-ban.repository');

class PhongBanService {
    parseId(id) {
        const phongBanId = Number(id);

        if (!Number.isInteger(phongBanId) || phongBanId <= 0) {
            throw new ApiError(400, 'ID phòng ban không hợp lệ.');
        }

        return phongBanId;
    }

    async getTongHop(query) {
        return await phongBanRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const phongBan = await phongBanRepository.getChiTiet(id);

        if (!phongBan) {
            throw new ApiError(404, 'Phòng ban không tồn tại.');
        }

        return phongBan;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maCoSo) {
            const coSo = await phongBanRepository.getCoSoByMa(duLieu.maCoSo);

            if (!coSo) {
                throw new ApiError(400, 'Mã cơ sở không tồn tại.');
            }

            if (!coSo.active) {
                throw new ApiError(400, 'Cơ sở đã bị khóa.');
            }

            if (duLieu.coSoId !== undefined && duLieu.coSoId !== null && Number(duLieu.coSoId) !== Number(coSo.id)) {
                throw new ApiError(400, 'ID cơ sở và mã cơ sở không khớp.');
            }

            duLieu.coSoId = coSo.id;
        }

        if (duLieu.coSoId !== undefined && duLieu.coSoId !== null) {
            duLieu.coSoId = Number(duLieu.coSoId);
        }

        delete duLieu.maCoSo;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!data.coSoId) {
            throw new ApiError(400, 'Cơ sở là bắt buộc.');
        }

        const coSoTonTai = await phongBanRepository.existsCoSo(data.coSoId);

        if (!coSoTonTai) {
            throw new ApiError(400, 'Cơ sở không tồn tại hoặc đã bị khóa.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await phongBanRepository.existsMaPhongBan(data.maPhongBan, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã phòng ban đã tồn tại.');
        }

        const trungTen = await phongBanRepository.existsTenPhongBan(data.tenPhongBan, data.coSoId, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên phòng ban đã tồn tại trong cơ sở này.');
        }
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);

        await this.validateLienKet(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,
            maPhongBan: duLieu.maPhongBan.trim(),
            tenPhongBan: duLieu.tenPhongBan.trim(),
            moTa: duLieu.moTa?.trim() || null,
            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await phongBanRepository.create(duLieuTao);
    }

    async update(id, data) {
        const phongBanId = this.parseId(id);

        const phongBan = await phongBanRepository.getChiTiet(phongBanId);

        if (!phongBan) {
            throw new ApiError(404, 'Phòng ban không tồn tại.');
        }

        const duLieuCapNhat = {
            maPhongBan: data.maPhongBan !== undefined ? data.maPhongBan.trim() : phongBan.maPhongBan,

            tenPhongBan: data.tenPhongBan !== undefined ? data.tenPhongBan.trim() : phongBan.tenPhongBan,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : phongBan.moTa,

            coSoId: data.coSoId !== undefined ? data.coSoId : data.maCoSo !== undefined ? undefined : phongBan.coSoId,

            maCoSo: data.maCoSo !== undefined ? (data.maCoSo === null ? null : data.maCoSo.trim() || null) : undefined,

            active: data.active !== undefined ? data.active : phongBan.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, phongBanId);

        const ketQua = await phongBanRepository.update(phongBanId, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Phòng ban không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new PhongBanService();

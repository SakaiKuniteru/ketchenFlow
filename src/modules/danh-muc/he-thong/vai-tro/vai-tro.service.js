const ApiError = require('../../../../utils/api-error');

const vaiTroRepository = require('./vai-tro.repository');

class VaiTroService {
    parseId(id) {
        const vaiTroId = Number(id);

        if (!Number.isInteger(vaiTroId) || vaiTroId <= 0) {
            throw new ApiError(400, 'ID vai trò không hợp lệ.');
        }

        return vaiTroId;
    }
    async getTongHop(query) {
        return await vaiTroRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const vaiTroId = this.parseId(id);

        const vaiTro = await vaiTroRepository.getChiTiet(id);

        if (!vaiTro) {
            throw new ApiError(404, 'Vai trò không tồn tại.');
        }

        return vaiTro;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (Array.isArray(duLieu.dsMaQuyen)) {
            const danhSachMa = [
                ...new Set(duLieu.dsMaQuyen.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))
            ];

            const danhSachNhom = await vaiTroRepository.getDsQuyenByMas(danhSachMa);

            if (danhSachNhom.length !== danhSachMa.length) {
                const maTimThay = danhSachNhom.map((item) => item.maQuyen.toUpperCase());

                const maKhongTonTai = danhSachMa.filter((ma) => !maTimThay.includes(ma));

                throw new ApiError(400, `Mã quyền không tồn tại: ${maKhongTonTai.join(', ')}.`);
            }

            const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

            if (nhomBiKhoa) {
                throw new ApiError(400, `Quyền "${nhomBiKhoa.tenQuyen}" đã bị khóa.`);
            }

            const idsTheoMa = danhSachMa.map((ma) => {
                const nhom = danhSachNhom.find((item) => item.maQuyen.toUpperCase() === ma);

                return Number(nhom.id);
            });

            if (Array.isArray(duLieu.dsQuyenId)) {
                const idsDaTruyen = duLieu.dsQuyenId.map((id) => Number(id));

                const idsTheoMaSapXep = [...idsTheoMa].sort((a, b) => a - b);

                const idsDaTruyenSapXep = [...idsDaTruyen].sort((a, b) => a - b);

                if (JSON.stringify(idsTheoMaSapXep) !== JSON.stringify(idsDaTruyenSapXep)) {
                    throw new ApiError(400, 'Danh sách ID và mã quyền không khớp.');
                }
            }

            duLieu.dsQuyenId = idsTheoMa;
        } else if (Array.isArray(duLieu.dsQuyenId)) {
            duLieu.dsQuyenId = duLieu.dsQuyenId.map((id) => Number(id));
        }

        delete duLieu.dsMaQuyen;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!Array.isArray(data.dsQuyenId) || data.dsQuyenId.length === 0) {
            throw new ApiError(400, 'Phải chọn ít nhất một quyền.');
        }

        const danhSachId = [...new Set(data.dsQuyenId.map((id) => Number(id)))];

        const idKhongHopLe = danhSachId.some((id) => !Number.isInteger(id) || id <= 0);

        if (idKhongHopLe) {
            throw new ApiError(400, 'Danh sách quyền không hợp lệ.');
        }

        const danhSachNhom = await vaiTroRepository.getDsQuyenByIds(danhSachId);

        if (danhSachNhom.length !== danhSachId.length) {
            throw new ApiError(400, 'Có quyền không tồn tại.');
        }

        const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

        if (nhomBiKhoa) {
            throw new ApiError(400, `Quyền "${nhomBiKhoa.tenQuyen}" đã bị khóa.`);
        }

        data.dsQuyenId = danhSachId;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await vaiTroRepository.existsMaVaiTro(data.maVaiTro, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã vai trò đã tồn tại.');
        }

        const trungTen = await vaiTroRepository.existsTenVaiTro(data.tenVaiTro, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên vai trò đã tồn tại.');
        }
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);

        await this.validateLienKet(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maVaiTro: duLieu.maVaiTro.trim(),

            tenVaiTro: duLieu.tenVaiTro.trim(),

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await vaiTroRepository.create(duLieuTao);
    }

    async update(id, data) {
        const vaiTroId = this.parseId(id);

        const vaiTro = await vaiTroRepository.getChiTiet(vaiTroId);

        if (!vaiTro) {
            throw new ApiError(404, 'Vai trò không tồn tại.');
        }

        const duLieuCapNhat = {
            maVaiTro: data.maVaiTro !== undefined ? data.maVaiTro.trim() : vaiTro.maVaiTro,

            tenVaiTro: data.tenVaiTro !== undefined ? data.tenVaiTro.trim() : vaiTro.tenVaiTro,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : vaiTro.moTa,

            dsQuyenId:
                data.dsQuyenId !== undefined
                    ? data.dsQuyenId
                    : data.dsMaQuyen !== undefined
                      ? undefined
                      : vaiTro.dsQuyenId,

            dsMaQuyen: data.dsMaQuyen !== undefined ? data.dsMaQuyen : undefined,

            active: data.active !== undefined ? data.active : vaiTro.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, vaiTroId);

        const ketQua = await vaiTroRepository.update(vaiTroId, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Vai trò không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new VaiTroService();

const ApiError = require('../../../../utils/api-error');

const quyenRepository = require('./quyen.repository');

class QuyenService {
    parseId(id) {
        const quyenId = Number(id);

        if (!Number.isInteger(quyenId) || quyenId <= 0) {
            throw new ApiError(400, 'ID quyền không hợp lệ.');
        }

        return quyenId;
    }
    async getTongHop(query) {
        return await quyenRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const quyenId = this.parseId(id);

        const quyen = await quyenRepository.getChiTiet(id);

        if (!quyen) {
            throw new ApiError(404, 'Quyền không tồn tại.');
        }

        return quyen;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (Array.isArray(duLieu.dsMaNhomTinhNang)) {
            const danhSachMa = [
                ...new Set(duLieu.dsMaNhomTinhNang.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))
            ];

            const danhSachNhom = await quyenRepository.getDsNhomTinhNangByMas(danhSachMa);

            if (danhSachNhom.length !== danhSachMa.length) {
                const maTimThay = danhSachNhom.map((item) => item.maNhomTinhNang.toUpperCase());

                const maKhongTonTai = danhSachMa.filter((ma) => !maTimThay.includes(ma));

                throw new ApiError(400, `Mã nhóm tính năng không tồn tại: ${maKhongTonTai.join(', ')}.`);
            }

            const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

            if (nhomBiKhoa) {
                throw new ApiError(400, `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`);
            }

            const idsTheoMa = danhSachMa.map((ma) => {
                const nhom = danhSachNhom.find((item) => item.maNhomTinhNang.toUpperCase() === ma);

                return Number(nhom.id);
            });

            if (Array.isArray(duLieu.dsNhomTinhNangId)) {
                const idsDaTruyen = duLieu.dsNhomTinhNangId.map((id) => Number(id));

                const idsTheoMaSapXep = [...idsTheoMa].sort((a, b) => a - b);

                const idsDaTruyenSapXep = [...idsDaTruyen].sort((a, b) => a - b);

                if (JSON.stringify(idsTheoMaSapXep) !== JSON.stringify(idsDaTruyenSapXep)) {
                    throw new ApiError(400, 'Danh sách ID và mã nhóm tính năng không khớp.');
                }
            }

            duLieu.dsNhomTinhNangId = idsTheoMa;
        } else if (Array.isArray(duLieu.dsNhomTinhNangId)) {
            duLieu.dsNhomTinhNangId = [...new Set(duLieu.dsNhomTinhNangId.map((id) => Number(id)))];
        }

        delete duLieu.dsMaNhomTinhNang;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!Array.isArray(data.dsNhomTinhNangId) || data.dsNhomTinhNangId.length === 0) {
            throw new ApiError(400, 'Phải chọn ít nhất một nhóm tính năng.');
        }

        const danhSachId = [...new Set(data.dsNhomTinhNangId.map((id) => Number(id)))];

        const idKhongHopLe = danhSachId.some((id) => !Number.isInteger(id) || id <= 0);

        if (idKhongHopLe) {
            throw new ApiError(400, 'Danh sách nhóm tính năng không hợp lệ.');
        }

        const danhSachNhom = await quyenRepository.getDsNhomTinhNangByIds(danhSachId);

        if (danhSachNhom.length !== danhSachId.length) {
            throw new ApiError(400, 'Có nhóm tính năng không tồn tại.');
        }

        const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

        if (nhomBiKhoa) {
            throw new ApiError(400, `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`);
        }

        data.dsNhomTinhNangId = danhSachId;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await quyenRepository.existsMaQuyen(data.maQuyen, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã quyền đã tồn tại.');
        }

        const trungTen = await quyenRepository.existsTenQuyen(data.tenQuyen, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên quyền đã tồn tại.');
        }
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);

        await this.validateLienKet(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maQuyen: duLieu.maQuyen.trim(),

            tenQuyen: duLieu.tenQuyen.trim(),

            moTa: duLieu.moTa?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await quyenRepository.create(duLieuTao);
    }

    async update(id, data) {
        const quyenId = this.parseId(id);

        const quyen = await quyenRepository.getChiTiet(quyenId);

        if (!quyen) {
            throw new ApiError(404, 'Quyền không tồn tại.');
        }

        const duLieuCapNhat = {
            maQuyen: data.maQuyen !== undefined ? data.maQuyen.trim() : quyen.maQuyen,

            tenQuyen: data.tenQuyen !== undefined ? data.tenQuyen.trim() : quyen.tenQuyen,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : quyen.moTa,

            dsNhomTinhNangId:
                data.dsNhomTinhNangId !== undefined
                    ? data.dsNhomTinhNangId
                    : data.dsMaNhomTinhNang !== undefined
                      ? undefined
                      : quyen.dsNhomTinhNangId,

            dsMaNhomTinhNang: data.dsMaNhomTinhNang !== undefined ? data.dsMaNhomTinhNang : undefined,

            active: data.active !== undefined ? data.active : quyen.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, quyenId);

        const ketQua = await quyenRepository.update(quyenId, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Quyền không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new QuyenService();

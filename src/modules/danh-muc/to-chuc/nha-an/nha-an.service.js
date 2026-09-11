const ApiError = require('../../../../utils/api-error');

const nhaAnRepository = require('./nha-an.repository');

class NhaAnService {
    parseId(id) {
        const nhaAnId = Number(id);

        if (!Number.isInteger(nhaAnId) || nhaAnId <= 0) {
            throw new ApiError(400, 'ID nhà ăn không hợp lệ.');
        }

        return nhaAnId;
    }

    parseCoSoId(coSoId) {
        const id = Number(coSoId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, 'ID cơ sở không hợp lệ.');
        }

        return id;
    }

    chuanHoaDanhSachId(danhSach, tenTruong) {
        if (!Array.isArray(danhSach)) {
            throw new ApiError(400, `${tenTruong} phải là một mảng.`);
        }

        const danhSachId = danhSach.map((item) => Number(item));

        const coIdKhongHopLe = danhSachId.some((id) => !Number.isInteger(id) || id <= 0);

        if (coIdKhongHopLe) {
            throw new ApiError(400, `${tenTruong} chứa ID không hợp lệ.`);
        }

        return [...new Set(danhSachId)];
    }

    chuanHoaDanhSachMa(danhSach, tenTruong) {
        if (!Array.isArray(danhSach)) {
            throw new ApiError(400, `${tenTruong} phải là một mảng.`);
        }

        const danhSachMa = danhSach.map((item) => {
            if (typeof item !== 'string' || !item.trim()) {
                throw new ApiError(400, `${tenTruong} chứa mã không hợp lệ.`);
            }

            return item.trim();
        });

        return [...new Set(danhSachMa.map((ma) => ma.toUpperCase()))];
    }

    soSanhDanhSachId(danhSachThuNhat, danhSachThuHai) {
        if (danhSachThuNhat.length !== danhSachThuHai.length) {
            return false;
        }

        const tapId = new Set(danhSachThuNhat);

        return danhSachThuHai.every((id) => tapId.has(id));
    }

    async getTongHop() {
        return await nhaAnRepository.getTongHop();
    }

    async getChiTiet(id) {
        const nhaAnId = this.parseId(id);

        const nhaAn = await nhaAnRepository.getChiTiet(nhaAnId);

        if (!nhaAn) {
            throw new ApiError(404, 'Nhà ăn không tồn tại.');
        }

        return nhaAn;
    }

    async chuanHoaCoSo(data) {
        const duLieu = {
            ...data
        };

        let coSoTheoMa = null;

        if (duLieu.maCoSo !== undefined && duLieu.maCoSo !== null && duLieu.maCoSo !== '') {
            coSoTheoMa = await nhaAnRepository.getCoSoByMa(duLieu.maCoSo.trim());

            if (!coSoTheoMa) {
                throw new ApiError(400, 'Mã cơ sở không tồn tại hoặc đã bị khóa.');
            }
        }

        if (duLieu.coSoId !== undefined && duLieu.coSoId !== null) {
            duLieu.coSoId = this.parseCoSoId(duLieu.coSoId);
        }

        if (
            coSoTheoMa &&
            duLieu.coSoId !== undefined &&
            duLieu.coSoId !== null &&
            Number(duLieu.coSoId) !== Number(coSoTheoMa.id)
        ) {
            throw new ApiError(400, 'Mã cơ sở và ID cơ sở không khớp nhau.');
        }

        if (coSoTheoMa) {
            duLieu.coSoId = Number(coSoTheoMa.id);
        }

        delete duLieu.maCoSo;

        return duLieu;
    }

    async chuanHoaNhanVienQuanLy(data) {
        const duLieu = {
            ...data
        };

        const coDanhSachId = duLieu.dsNvQuanLyId !== undefined;
        const coDanhSachMa = duLieu.dsMaNvQuanLy !== undefined;

        let danhSachTheoId;
        let danhSachTheoMa;

        if (coDanhSachId) {
            danhSachTheoId = this.chuanHoaDanhSachId(duLieu.dsNvQuanLyId, 'Danh sách ID nhân viên quản lý');
        }

        if (coDanhSachMa) {
            const danhSachMa = this.chuanHoaDanhSachMa(duLieu.dsMaNvQuanLy, 'Danh sách mã nhân viên quản lý');

            if (danhSachMa.length === 0) {
                danhSachTheoMa = [];
            } else {
                const dsNhanVien = await nhaAnRepository.getDsNhanVienByMa(danhSachMa);

                const danhSachMaTonTai = dsNhanVien.map((item) => item.maNhanVien.trim().toUpperCase());

                const danhSachMaKhongTonTai = danhSachMa.filter((ma) => !danhSachMaTonTai.includes(ma));

                if (danhSachMaKhongTonTai.length > 0) {
                    throw new ApiError(
                        400,
                        `Mã nhân viên không tồn tại hoặc đã bị khóa: ${danhSachMaKhongTonTai.join(', ')}.`
                    );
                }

                danhSachTheoMa = dsNhanVien.map((item) => Number(item.id));
            }
        }

        if (coDanhSachId && coDanhSachMa && !this.soSanhDanhSachId(danhSachTheoId, danhSachTheoMa)) {
            throw new ApiError(
                400,
                'Danh sách mã nhân viên quản lý và danh sách ID nhân viên quản lý không khớp nhau.'
            );
        }

        if (coDanhSachMa) {
            duLieu.dsNvQuanLyId = danhSachTheoMa;
        } else if (coDanhSachId) {
            duLieu.dsNvQuanLyId = danhSachTheoId;
        }

        delete duLieu.dsMaNvQuanLy;

        return duLieu;
    }

    async chuanHoaDuLieu(data) {
        let duLieu = {
            ...data
        };

        duLieu = await this.chuanHoaCoSo(duLieu);

        duLieu = await this.chuanHoaNhanVienQuanLy(duLieu);

        return duLieu;
    }

    async validateDuLieu(data, excludeId = null) {
        const { maNhaAn, tenNhaAn, coSoId, dsNvQuanLyId } = data;

        const trungMa = await nhaAnRepository.existsMaNhaAn(maNhaAn, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã nhà ăn đã tồn tại.');
        }

        const trungTen = await nhaAnRepository.existsTenNhaAn(tenNhaAn, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên nhà ăn đã tồn tại.');
        }

        if (coSoId !== undefined && coSoId !== null) {
            const coSoTonTai = await nhaAnRepository.existsCoSo(coSoId);

            if (!coSoTonTai) {
                throw new ApiError(400, 'Cơ sở không tồn tại hoặc đã bị khóa.');
            }
        }

        if (dsNvQuanLyId !== undefined) {
            const danhSachId = this.chuanHoaDanhSachId(dsNvQuanLyId, 'Danh sách ID nhân viên quản lý');

            if (danhSachId.length > 0) {
                const danhSachIdTonTai = await nhaAnRepository.getDsNhanVienTonTai(danhSachId);

                const tapIdTonTai = new Set(danhSachIdTonTai.map((id) => Number(id)));

                const danhSachIdKhongTonTai = danhSachId.filter((id) => !tapIdTonTai.has(id));

                if (danhSachIdKhongTonTai.length > 0) {
                    throw new ApiError(
                        400,
                        `Nhân viên quản lý không tồn tại hoặc đã bị khóa: ${danhSachIdKhongTonTai.join(', ')}.`
                    );
                }
            }
        }
    }

    async create(data) {
        const duLieuBanDau = {
            maNhaAn: data.maNhaAn.trim(),
            tenNhaAn: data.tenNhaAn.trim(),
            coSoId: data.coSoId,
            maCoSo: data.maCoSo !== undefined ? data.maCoSo.trim() : undefined,
            dsNvQuanLyId: data.dsNvQuanLyId,
            dsMaNvQuanLy: data.dsMaNvQuanLy,
            active: data.active !== undefined ? data.active : true
        };

        const duLieuDaChuanHoa = await this.chuanHoaDuLieu(duLieuBanDau);

        await this.validateDuLieu(duLieuDaChuanHoa);

        return await nhaAnRepository.create(duLieuDaChuanHoa);
    }

    async update(id, data) {
        const nhaAnId = this.parseId(id);

        const nhaAnHienTai = await nhaAnRepository.getChiTiet(nhaAnId);

        if (!nhaAnHienTai) {
            throw new ApiError(404, 'Nhà ăn không tồn tại.');
        }

        const coCapNhatCoSo = data.coSoId !== undefined || data.maCoSo !== undefined;

        const coCapNhatNvQuanLy = data.dsNvQuanLyId !== undefined || data.dsMaNvQuanLy !== undefined;

        const duLieuCapNhat = {
            maNhaAn: data.maNhaAn !== undefined ? data.maNhaAn.trim() : nhaAnHienTai.maNhaAn,

            tenNhaAn: data.tenNhaAn !== undefined ? data.tenNhaAn.trim() : nhaAnHienTai.tenNhaAn,

            coSoId:
                data.coSoId !== undefined ? data.coSoId : data.maCoSo !== undefined ? undefined : nhaAnHienTai.coSoId,

            maCoSo: data.maCoSo !== undefined ? data.maCoSo.trim() : undefined,

            active: data.active !== undefined ? data.active : nhaAnHienTai.active
        };

        if (coCapNhatNvQuanLy) {
            duLieuCapNhat.dsNvQuanLyId = data.dsNvQuanLyId;
            duLieuCapNhat.dsMaNvQuanLy = data.dsMaNvQuanLy;
        }

        const duLieuDaChuanHoa = await this.chuanHoaDuLieu(duLieuCapNhat);

        if (!coCapNhatNvQuanLy) {
            delete duLieuDaChuanHoa.dsNvQuanLyId;
        }

        await this.validateDuLieu(duLieuDaChuanHoa, nhaAnId);

        const ketQua = await nhaAnRepository.update(nhaAnId, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Nhà ăn không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new NhaAnService();

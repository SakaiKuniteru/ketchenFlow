const { trangThaiThucDon: dsTrangThaiThucDon, loaiThucDon: dsLoaiThucDon } = require('../../../constants/enums');

const cauHinhService = require('../../cau-hinh/cau-hinh.service');

const ApiError = require('../../../utils/api-error');

const thucDonRepository = require('./thuc-don.repository');
const MA_BAT_BUOC_CHON_NHOM_MON = 'BAT_BUOC_CHON_NHOM_MON';
class ThucDonService {
    parseId(id) {
        const thucDonId = Number(id);

        if (!Number.isInteger(thucDonId) || thucDonId <= 0) {
            throw new ApiError(400, 'ID thực đơn không hợp lệ.');
        }

        return thucDonId;
    }

    async getTongHop(query) {
        await thucDonRepository.dongBoTrangThaiKetThuc();

        return await thucDonRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const thucDonId = this.parseId(id);

        await thucDonRepository.dongBoTrangThaiKetThuc(thucDonId);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        return thucDon;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maCoSo) {
            const coSo = await thucDonRepository.getCoSoByMa(duLieu.maCoSo);

            if (!coSo) {
                throw new ApiError(400, 'Mã cơ sở không tồn tại.');
            }

            if (!coSo.active) {
                throw new ApiError(400, 'Cơ sở đã bị khóa.');
            }

            if (duLieu.coSoId !== undefined && duLieu.coSoId !== null && Number(duLieu.coSoId) !== Number(coSo.id)) {
                throw new ApiError(400, 'ID cơ sở và mã cơ sở không khớp.');
            }

            duLieu.coSoId = Number(coSo.id);
        }

        if (duLieu.coSoId !== undefined && duLieu.coSoId !== null) {
            duLieu.coSoId = Number(duLieu.coSoId);
        }

        if (duLieu.maNhaAn) {
            if (!duLieu.coSoId) {
                throw new ApiError(400, 'Phải xác định cơ sở trước khi tìm nhà ăn theo mã.');
            }

            const nhaAn = await thucDonRepository.getNhaAnByMa(duLieu.maNhaAn, duLieu.coSoId);

            if (!nhaAn) {
                throw new ApiError(400, 'Mã nhà ăn không tồn tại trong cơ sở đã chọn.');
            }

            if (!nhaAn.active) {
                throw new ApiError(400, 'Nhà ăn đã bị khóa.');
            }

            if (
                duLieu.nhaAnId !== undefined &&
                duLieu.nhaAnId !== null &&
                Number(duLieu.nhaAnId) !== Number(nhaAn.id)
            ) {
                throw new ApiError(400, 'ID nhà ăn và mã nhà ăn không khớp.');
            }

            duLieu.nhaAnId = Number(nhaAn.id);
        }

        if (duLieu.nhaAnId !== undefined && duLieu.nhaAnId !== null) {
            duLieu.nhaAnId = Number(duLieu.nhaAnId);
        }

        if (duLieu.maCaAn) {
            const caAn = await thucDonRepository.getCaAnByMa(duLieu.maCaAn);

            if (!caAn) {
                throw new ApiError(400, 'Mã ca ăn không tồn tại.');
            }

            if (!caAn.active) {
                throw new ApiError(400, 'Ca ăn đã bị khóa.');
            }

            if (duLieu.caAnId !== undefined && duLieu.caAnId !== null && Number(duLieu.caAnId) !== Number(caAn.id)) {
                throw new ApiError(400, 'ID ca ăn và mã ca ăn không khớp.');
            }

            duLieu.caAnId = Number(caAn.id);
        }

        if (duLieu.caAnId !== undefined && duLieu.caAnId !== null) {
            duLieu.caAnId = Number(duLieu.caAnId);
        }

        if (Array.isArray(duLieu.dsNgay)) {
            for (const ngay of duLieu.dsNgay) {
                if (!Array.isArray(ngay.dsNhomMonAn)) {
                    continue;
                }

                for (const nhom of ngay.dsNhomMonAn) {
                    if (nhom.maNhomMonAn) {
                        const nhomMonAn = await thucDonRepository.getNhomMonAnByMa(nhom.maNhomMonAn);

                        if (!nhomMonAn) {
                            throw new ApiError(400, `Mã nhóm món ăn "${nhom.maNhomMonAn}" không tồn tại.`);
                        }

                        if (!nhomMonAn.active) {
                            throw new ApiError(400, `Nhóm món ăn "${nhom.maNhomMonAn}" đã bị khóa.`);
                        }

                        if (
                            nhom.nhomMonAnId !== undefined &&
                            nhom.nhomMonAnId !== null &&
                            Number(nhom.nhomMonAnId) !== Number(nhomMonAn.id)
                        ) {
                            throw new ApiError(
                                400,
                                `ID nhóm món ăn và mã nhóm món ăn "${nhom.maNhomMonAn}" không khớp.`
                            );
                        }

                        nhom.nhomMonAnId = Number(nhomMonAn.id);
                    }

                    if (nhom.nhomMonAnId !== undefined && nhom.nhomMonAnId !== null) {
                        nhom.nhomMonAnId = Number(nhom.nhomMonAnId);
                    }

                    if (!Array.isArray(nhom.dsMonAn)) {
                        continue;
                    }

                    for (const mon of nhom.dsMonAn) {
                        if (mon.maMonAn) {
                            const monAn = await thucDonRepository.getMonAnByMa(mon.maMonAn);

                            if (!monAn) {
                                throw new ApiError(400, `Mã món ăn "${mon.maMonAn}" không tồn tại.`);
                            }

                            if (!monAn.active) {
                                throw new ApiError(400, `Món ăn "${mon.maMonAn}" đã bị khóa.`);
                            }

                            if (Number(monAn.nhom_mon_an_id) !== Number(nhom.nhomMonAnId)) {
                                throw new ApiError(400, `Món ăn "${mon.maMonAn}" không thuộc nhóm món ăn đã chọn.`);
                            }

                            if (
                                mon.monAnId !== undefined &&
                                mon.monAnId !== null &&
                                Number(mon.monAnId) !== Number(monAn.id)
                            ) {
                                throw new ApiError(400, `ID món ăn và mã món ăn "${mon.maMonAn}" không khớp.`);
                            }

                            mon.monAnId = Number(monAn.id);
                        }

                        if (mon.monAnId !== undefined && mon.monAnId !== null) {
                            mon.monAnId = Number(mon.monAnId);
                        }

                        if (mon.maDonViTinh) {
                            const donViTinh = await thucDonRepository.getDonViTinhByMa(mon.maDonViTinh);

                            if (!donViTinh) {
                                throw new ApiError(400, `Mã đơn vị tính "${mon.maDonViTinh}" không tồn tại.`);
                            }

                            if (!donViTinh.active) {
                                throw new ApiError(400, `Đơn vị tính "${mon.maDonViTinh}" đã bị khóa.`);
                            }

                            if (
                                mon.donViTinhId !== undefined &&
                                mon.donViTinhId !== null &&
                                Number(mon.donViTinhId) !== Number(donViTinh.id)
                            ) {
                                throw new ApiError(
                                    400,
                                    `ID đơn vị tính và mã đơn vị tính "${mon.maDonViTinh}" không khớp.`
                                );
                            }

                            mon.donViTinhId = Number(donViTinh.id);
                        }

                        if (mon.donViTinhId !== undefined && mon.donViTinhId !== null) {
                            mon.donViTinhId = Number(mon.donViTinhId);
                        }

                        delete mon.maMonAn;
                        delete mon.maDonViTinh;
                    }

                    delete nhom.maNhomMonAn;
                }
            }
        }

        delete duLieu.maCoSo;
        delete duLieu.maNhaAn;
        delete duLieu.maCaAn;

        return duLieu;
    }

    chuanHoaNgay(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        /*
         * KHÔNG dùng:
         *
         * new Date(value)
         * toISOString()
         *
         * Ngày thực đơn là ngày nghiệp vụ
         * theo múi giờ Việt Nam.
         */
        const text = String(value).trim();

        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);

        if (!match) {
            return null;
        }

        const year = Number(match[1]);

        const month = Number(match[2]);

        const day = Number(match[3]);

        const check = new Date(Date.UTC(year, month - 1, day));

        if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
            return null;
        }

        return `${match[1]}-` + `${match[2]}-` + `${match[3]}`;
    }

    chuanHoaThoiGianNgay(value, laDenNgay = false) {
        const ngay = this.chuanHoaNgay(value);

        if (!ngay) {
            return null;
        }

        return laDenNgay ? `${ngay}T23:59:59+07:00` : `${ngay}T00:00:00+07:00`;
    }

    validateLoaiThucDon(loaiThucDon) {
        const hopLe = dsLoaiThucDon.some((item) => String(item.value) === String(loaiThucDon));

        if (!hopLe) {
            throw new ApiError(400, 'Loại thực đơn không hợp lệ.');
        }
    }

    validateTrangThai(trangThai) {
        const hopLe = dsTrangThaiThucDon.some((item) => String(item.value) === String(trangThai));

        if (!hopLe) {
            throw new ApiError(400, 'Trạng thái thực đơn không hợp lệ.');
        }
    }

    validateKhoangNgay(data) {
        const tuNgay = this.chuanHoaNgay(data.tuNgay);

        const denNgay = this.chuanHoaNgay(data.denNgay);

        if (!tuNgay) {
            throw new ApiError(400, 'Từ ngày không hợp lệ.');
        }

        if (!denNgay) {
            throw new ApiError(400, 'Đến ngày không hợp lệ.');
        }

        if (tuNgay > denNgay) {
            throw new ApiError(400, 'Từ ngày phải nhỏ hơn hoặc bằng đến ngày.');
        }

        if (Number(data.loaiThucDon) === 10 && tuNgay !== denNgay) {
            throw new ApiError(400, 'Thực đơn theo ngày phải có từ ngày và đến ngày giống nhau.');
        }

        data.tuNgay = `${tuNgay} 00:00:00+07:00`;
        data.denNgay = `${denNgay} 23:59:59+07:00`;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await thucDonRepository.existsMaThucDon(data.maThucDon, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã thực đơn đã tồn tại.');
        }
    }

    async validateLienKetChung(data) {
        if (!Number.isInteger(Number(data.coSoId)) || Number(data.coSoId) <= 0) {
            throw new ApiError(400, 'ID cơ sở không hợp lệ.');
        }

        data.coSoId = Number(data.coSoId);

        const coSoTonTai = await thucDonRepository.existsCoSo(data.coSoId);

        if (!coSoTonTai) {
            throw new ApiError(400, 'Cơ sở không tồn tại hoặc đã bị khóa.');
        }

        if (!Number.isInteger(Number(data.nhaAnId)) || Number(data.nhaAnId) <= 0) {
            throw new ApiError(400, 'ID nhà ăn không hợp lệ.');
        }

        data.nhaAnId = Number(data.nhaAnId);

        const nhaAnTonTai = await thucDonRepository.existsNhaAn(data.nhaAnId, data.coSoId);

        if (!nhaAnTonTai) {
            throw new ApiError(400, 'Nhà ăn không tồn tại, đã bị khóa hoặc không thuộc cơ sở đã chọn.');
        }

        if (data.caAnId !== undefined && data.caAnId !== null) {
            data.caAnId = Number(data.caAnId);

            if (!Number.isInteger(data.caAnId) || data.caAnId <= 0) {
                throw new ApiError(400, 'ID ca ăn không hợp lệ.');
            }

            const caAnTonTai = await thucDonRepository.existsCaAn(data.caAnId);

            if (!caAnTonTai) {
                throw new ApiError(400, 'Ca ăn không tồn tại hoặc đã bị khóa.');
            }
        }
    }

    async getBatBuocChonNhomMon() {
        try {
            const result = await cauHinhService.getGiaTri(MA_BAT_BUOC_CHON_NHOM_MON);

            const value = result?.giaTri ?? result?.value ?? result;

            if (value === null || value === undefined || String(value).trim() === '') {
                return true;
            }

            return String(value).trim().toLowerCase() === 'true';
        } catch {
            return true;
        }
    }

    async chuanHoaNhomMonTheoMonAn(data) {
        if (!Array.isArray(data?.dsNgay)) {
            return;
        }

        for (const itemNgay of data.dsNgay) {
            const dsNhomCu = Array.isArray(itemNgay.dsNhomMonAn) ? itemNgay.dsNhomMonAn : [];

            const dsMon = dsNhomCu.flatMap((nhom) => (Array.isArray(nhom?.dsMonAn) ? nhom.dsMonAn : []));

            if (dsMon.length === 0) {
                itemNgay.dsNhomMonAn = [];

                continue;
            }

            const nhomCuMap = new Map(dsNhomCu.map((nhom) => [String(nhom.nhomMonAnId ?? nhom.nhomMonAn?.id), nhom]));

            const nhomMoiMap = new Map();

            const monDaCo = new Set();

            for (const mon of dsMon) {
                const monAnId = Number(mon.monAnId ?? mon.monAn?.id);

                if (!Number.isInteger(monAnId) || monAnId <= 0) {
                    throw new ApiError(400, 'ID món ăn không hợp lệ.');
                }

                if (monDaCo.has(monAnId)) {
                    throw new ApiError(400, `Món ăn ID ${monAnId} bị lặp trong cùng ngày thực đơn.`);
                }

                monDaCo.add(monAnId);

                const monAn = await thucDonRepository.getMonAnById(monAnId);

                if (!monAn || !monAn.active) {
                    throw new ApiError(400, `Món ăn ID ${monAnId} không tồn tại hoặc đã bị khóa.`);
                }

                const nhomMonAnId = Number(monAn.nhom_mon_an_id);

                if (!Number.isInteger(nhomMonAnId) || nhomMonAnId <= 0) {
                    throw new ApiError(400, `Món ăn "${monAn.ten_mon_an}" chưa được gán nhóm món ăn.`);
                }

                const nhomMonAn = await thucDonRepository.getNhomMonAnById(nhomMonAnId);

                if (!nhomMonAn || !nhomMonAn.active) {
                    throw new ApiError(400, `Nhóm món của "${monAn.ten_mon_an}" không tồn tại hoặc đã bị khóa.`);
                }

                const key = String(nhomMonAnId);

                let nhom = nhomMoiMap.get(key);

                if (!nhom) {
                    const nhomCu = nhomCuMap.get(key);

                    nhom = {
                        ...(nhomCu || {}),

                        nhomMonAnId,

                        maNhomMonAn: nhomMonAn.ma_nhom_mon_an,

                        tenNhomMonAn: nhomMonAn.ten_nhom_mon_an,

                        dsMonAn: []
                    };

                    nhomMoiMap.set(key, nhom);
                }

                nhom.dsMonAn.push({
                    ...mon,

                    monAnId
                });
            }

            itemNgay.dsNhomMonAn = Array.from(nhomMoiMap.values()).map((nhom, index) => ({
                ...nhom,

                thuTuHienThi: index + 1,

                dsMonAn: (nhom.dsMonAn || []).map((mon, monIndex) => ({
                    ...mon,

                    thuTuHienThi: monIndex + 1
                }))
            }));
        }
    }

    async validateMonAn(mon, nhomMonAnId, dongMoTa) {
        mon.monAnId = Number(mon.monAnId);

        if (!Number.isInteger(mon.monAnId) || mon.monAnId <= 0) {
            throw new ApiError(400, `${dongMoTa}: ID món ăn không hợp lệ.`);
        }

        const monAn = await thucDonRepository.getMonAnById(mon.monAnId);

        if (!monAn) {
            throw new ApiError(400, `${dongMoTa}: Món ăn không tồn tại.`);
        }

        if (!monAn.active) {
            throw new ApiError(400, `${dongMoTa}: Món ăn đã bị khóa.`);
        }

        if (Number(monAn.nhom_mon_an_id) !== Number(nhomMonAnId)) {
            throw new ApiError(400, `${dongMoTa}: Món ăn không thuộc nhóm món ăn đã chọn.`);
        }

        if (mon.thuTuHienThi !== undefined && mon.thuTuHienThi !== null) {
            mon.thuTuHienThi = Number(mon.thuTuHienThi);

            if (!Number.isInteger(mon.thuTuHienThi) || mon.thuTuHienThi <= 0) {
                throw new ApiError(400, `${dongMoTa}: Thứ tự hiển thị món ăn không hợp lệ.`);
            }
        }

        if (mon.dinhLuong !== undefined && mon.dinhLuong !== null) {
            mon.dinhLuong = Number(mon.dinhLuong);

            if (!Number.isFinite(mon.dinhLuong) || mon.dinhLuong < 0) {
                throw new ApiError(400, `${dongMoTa}: Định lượng không hợp lệ.`);
            }
        }

        if (mon.donViTinhId !== undefined && mon.donViTinhId !== null) {
            mon.donViTinhId = Number(mon.donViTinhId);

            if (!Number.isInteger(mon.donViTinhId) || mon.donViTinhId <= 0) {
                throw new ApiError(400, `${dongMoTa}: ID đơn vị tính không hợp lệ.`);
            }

            const donViTinhTonTai = await thucDonRepository.existsDonViTinh(mon.donViTinhId);

            if (!donViTinhTonTai) {
                throw new ApiError(400, `${dongMoTa}: Đơn vị tính không tồn tại hoặc đã bị khóa.`);
            }
        }
    }

    async validateDsNgay(data, batBuoc = true) {
        if (data.dsNgay === undefined) {
            if (batBuoc) {
                throw new ApiError(400, 'Danh sách ngày thực đơn là bắt buộc.');
            }

            return;
        }

        if (!Array.isArray(data.dsNgay)) {
            throw new ApiError(400, 'Danh sách ngày thực đơn không hợp lệ.');
        }

        if (data.dsNgay.length === 0) {
            throw new ApiError(400, 'Danh sách ngày thực đơn không được để trống.');
        }

        const tuNgay = this.chuanHoaNgay(data.tuNgay);

        const denNgay = this.chuanHoaNgay(data.denNgay);

        if (!tuNgay || !denNgay) {
            throw new ApiError(400, 'Khoảng thời gian thực đơn không hợp lệ.');
        }

        const dsNgayDaCo = new Set();

        for (let i = 0; i < data.dsNgay.length; i++) {
            const itemNgay = data.dsNgay[i];

            const ngay = this.chuanHoaNgay(itemNgay.ngay);

            if (!ngay) {
                throw new ApiError(400, `Ngày thứ ${i + 1} không hợp lệ.`);
            }

            if (ngay < tuNgay || ngay > denNgay) {
                throw new ApiError(400, `Ngày ${ngay} không nằm trong khoảng thời gian của thực đơn.`);
            }

            if (dsNgayDaCo.has(ngay)) {
                throw new ApiError(400, `Ngày ${ngay} bị lặp trong thực đơn.`);
            }

            dsNgayDaCo.add(ngay);

            itemNgay.ngay = `${ngay}T00:00:00+07:00`;

            if (itemNgay.dsNhomMonAn === undefined) {
                itemNgay.dsNhomMonAn = [];
            }

            if (!Array.isArray(itemNgay.dsNhomMonAn)) {
                throw new ApiError(400, `Danh sách nhóm món ăn của ngày ${ngay} không hợp lệ.`);
            }

            const dsNhomDaCo = new Set();

            for (let j = 0; j < itemNgay.dsNhomMonAn.length; j++) {
                const nhom = itemNgay.dsNhomMonAn[j];

                nhom.nhomMonAnId = Number(nhom.nhomMonAnId);

                if (!Number.isInteger(nhom.nhomMonAnId) || nhom.nhomMonAnId <= 0) {
                    throw new ApiError(400, `Ngày ${ngay}: ID nhóm món ăn thứ ${j + 1} không hợp lệ.`);
                }

                if (dsNhomDaCo.has(nhom.nhomMonAnId)) {
                    throw new ApiError(400, `Ngày ${ngay}: Nhóm món ăn ID ${nhom.nhomMonAnId} bị lặp.`);
                }

                dsNhomDaCo.add(nhom.nhomMonAnId);

                const nhomMonAn = await thucDonRepository.getNhomMonAnById(nhom.nhomMonAnId);

                if (!nhomMonAn) {
                    throw new ApiError(400, `Ngày ${ngay}: Nhóm món ăn không tồn tại.`);
                }

                if (!nhomMonAn.active) {
                    throw new ApiError(400, `Ngày ${ngay}: Nhóm món ăn "${nhomMonAn.ten_nhom_mon_an}" đã bị khóa.`);
                }

                if (nhom.thuTuHienThi !== undefined && nhom.thuTuHienThi !== null) {
                    nhom.thuTuHienThi = Number(nhom.thuTuHienThi);

                    if (!Number.isInteger(nhom.thuTuHienThi) || nhom.thuTuHienThi <= 0) {
                        throw new ApiError(400, `Ngày ${ngay}: Thứ tự hiển thị nhóm món ăn không hợp lệ.`);
                    }
                }

                if (nhom.dsMonAn === undefined) {
                    nhom.dsMonAn = [];
                }

                if (!Array.isArray(nhom.dsMonAn)) {
                    throw new ApiError(
                        400,
                        `Ngày ${ngay}: Danh sách món ăn của nhóm "${nhomMonAn.ten_nhom_mon_an}" không hợp lệ.`
                    );
                }

                const dsMonDaCo = new Set();

                for (let k = 0; k < nhom.dsMonAn.length; k++) {
                    const mon = nhom.dsMonAn[k];

                    const monAnId = Number(mon.monAnId);

                    if (Number.isInteger(monAnId) && dsMonDaCo.has(monAnId)) {
                        throw new ApiError(400, `Ngày ${ngay}: Món ăn ID ${monAnId} bị lặp trong cùng nhóm món ăn.`);
                    }

                    if (Number.isInteger(monAnId)) {
                        dsMonDaCo.add(monAnId);
                    }

                    await this.validateMonAn(
                        mon,
                        nhom.nhomMonAnId,
                        `Ngày ${ngay}, nhóm "${nhomMonAn.ten_nhom_mon_an}", món thứ ${k + 1}`
                    );
                }
            }
        }
    }

    chuanHoaDuLieuTao(data) {
        return {
            ...data,
            maThucDon: data.maThucDon.trim(),
            tenThucDon: data.tenThucDon.trim(),
            loaiThucDon: Number(data.loaiThucDon),
            tuNgay: this.chuanHoaThoiGianNgay(data.tuNgay, false),
            denNgay: this.chuanHoaThoiGianNgay(data.denNgay, true),
            coSoId: Number(data.coSoId),
            nhaAnId: Number(data.nhaAnId),
            caAnId: data.caAnId !== undefined && data.caAnId !== null ? Number(data.caAnId) : null,
            trangThai: data.trangThai !== undefined ? Number(data.trangThai) : 10,
            moTa: data.moTa?.trim() || null,
            active: data.active !== undefined ? data.active : true,
            dsNgay: Array.isArray(data.dsNgay) ? data.dsNgay : []
        };
    }

    async create(data) {
        const duLieuLienKet = await this.chuanHoaLienKet(data);

        const duLieuTao = this.chuanHoaDuLieuTao(duLieuLienKet);

        this.validateLoaiThucDon(duLieuTao.loaiThucDon);

        this.validateTrangThai(duLieuTao.trangThai);

        this.validateKhoangNgay(duLieuTao);

        await this.validateLienKetChung(duLieuTao);

        await this.validateTrungDuLieu(duLieuTao);

        const batBuocChonNhomMon = await this.getBatBuocChonNhomMon();
        if (!batBuocChonNhomMon) {
            await this.chuanHoaNhomMonTheoMonAn(duLieuTao);
        }

        await this.validateDsNgay(duLieuTao, true);

        return await thucDonRepository.create(duLieuTao);
    }

    async update(id, data) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (![10, 20, 40, 60].includes(Number(thucDon.trangThai))) {
            throw new ApiError(400, 'Trạng thái hiện tại không cho phép cập nhật thực đơn.');
        }

        const trangThaiBanDau = Number(thucDon.trangThai);

        const duLieuTam = {
            maThucDon: data.maThucDon !== undefined ? data.maThucDon : thucDon.maThucDon,
            tenThucDon: data.tenThucDon !== undefined ? data.tenThucDon : thucDon.tenThucDon,
            loaiThucDon: data.loaiThucDon !== undefined ? data.loaiThucDon : thucDon.loaiThucDon,
            tuNgay: data.tuNgay !== undefined ? data.tuNgay : thucDon.tuNgay,
            denNgay: data.denNgay !== undefined ? data.denNgay : thucDon.denNgay,
            coSoId: data.coSoId !== undefined ? data.coSoId : data.maCoSo !== undefined ? undefined : thucDon.coSoId,
            maCoSo: data.maCoSo !== undefined ? data.maCoSo : undefined,
            nhaAnId:
                data.nhaAnId !== undefined ? data.nhaAnId : data.maNhaAn !== undefined ? undefined : thucDon.nhaAnId,
            maNhaAn: data.maNhaAn !== undefined ? data.maNhaAn : undefined,
            caAnId: data.caAnId !== undefined ? data.caAnId : data.maCaAn !== undefined ? undefined : thucDon.caAnId,
            maCaAn: data.maCaAn !== undefined ? data.maCaAn : undefined,
            trangThai: data.trangThai !== undefined ? Number(data.trangThai) : Number(thucDon.trangThai),
            moTa: data.moTa !== undefined ? data.moTa : thucDon.moTa,
            active: data.active !== undefined ? data.active : thucDon.active,
            dsNgay: data.dsNgay !== undefined ? data.dsNgay : undefined
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuTam);

        const duLieuCapNhat = {
            ...duLieuDaChuanHoa,
            maThucDon: duLieuDaChuanHoa.maThucDon.trim(),
            tenThucDon: duLieuDaChuanHoa.tenThucDon.trim(),
            loaiThucDon: Number(duLieuDaChuanHoa.loaiThucDon),
            tuNgay: this.chuanHoaThoiGianNgay(duLieuDaChuanHoa.tuNgay, false),
            denNgay: this.chuanHoaThoiGianNgay(duLieuDaChuanHoa.denNgay, true),
            moTa: duLieuDaChuanHoa.moTa === null ? null : duLieuDaChuanHoa.moTa?.trim() || null
        };

        this.validateLoaiThucDon(duLieuCapNhat.loaiThucDon);

        this.validateTrangThai(duLieuCapNhat.trangThai);

        this.validateKhoangNgay(duLieuCapNhat);

        await this.validateLienKetChung(duLieuCapNhat);

        await this.validateTrungDuLieu(duLieuCapNhat, thucDonId);

        if (duLieuCapNhat.dsNgay !== undefined) {
            const batBuocChonNhomMon = await this.getBatBuocChonNhomMon();

            if (!batBuocChonNhomMon) {
                await this.chuanHoaNhomMonTheoMonAn(duLieuCapNhat);
            }

            await this.validateDsNgay(duLieuCapNhat, false);
        }

        let ketQua = await thucDonRepository.update(thucDonId, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (trangThaiBanDau === 60) {
            const khoiPhuc = await thucDonRepository.khoiPhucTrangThaiKetThuc(thucDonId);

            if (khoiPhuc) {
                ketQua = khoiPhuc;
            }
        }

        await thucDonRepository.dongBoTrangThaiKetThuc(thucDonId);

        return await thucDonRepository.getChiTiet(thucDonId);
    }

    async xoa(id) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (![10, 20, 40].includes(Number(thucDon.trangThai))) {
            throw new ApiError(400, 'Trạng thái hiện tại không cho phép xóa thực đơn.');
        }

        const ketQua = await thucDonRepository.xoa(thucDonId);

        if (!ketQua) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        return ketQua;
    }

    validateDuLieuTruocKhiDuyet(thucDon) {
        if (!thucDon.active) {
            throw new ApiError(400, 'Không thể duyệt thực đơn đang bị khóa.');
        }

        if (!Array.isArray(thucDon.dsNgay) || thucDon.dsNgay.length === 0) {
            throw new ApiError(400, 'Thực đơn chưa có ngày áp dụng.');
        }

        const coMonAn = thucDon.dsNgay.some(
            (ngay) =>
                Array.isArray(ngay.dsNhomMonAn) &&
                ngay.dsNhomMonAn.some((nhom) => Array.isArray(nhom.dsMonAn) && nhom.dsMonAn.length > 0)
        );

        if (!coMonAn) {
            throw new ApiError(400, 'Thực đơn chưa có món ăn.');
        }
    }

    async duyet(id) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (![10, 20, 40].includes(Number(thucDon.trangThai))) {
            throw new ApiError(400, 'Trạng thái hiện tại không cho phép duyệt thực đơn.');
        }

        this.validateDuLieuTruocKhiDuyet(thucDon);

        const ketQua = await thucDonRepository.duyet(thucDonId);

        if (!ketQua) {
            throw new ApiError(400, 'Trạng thái thực đơn đã thay đổi, không thể duyệt.');
        }

        return ketQua;
    }

    async huyDuyet(id) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (Number(thucDon.trangThai) !== 30) {
            throw new ApiError(400, 'Chỉ có thể hủy duyệt thực đơn đang áp dụng.');
        }

        const daCoBinhChon = await thucDonRepository.existsBinhChonHieuLucTheoThucDon(thucDonId);

        if (daCoBinhChon) {
            throw new ApiError(
                409,
                'Thực đơn đã được tạo bình chọn. Vui lòng hủy đợt bình chọn trước khi hủy duyệt thực đơn.'
            );
        }

        const ketQua = await thucDonRepository.huyDuyet(thucDonId);

        if (!ketQua) {
            const phatSinhBinhChon = await thucDonRepository.existsBinhChonHieuLucTheoThucDon(thucDonId);

            if (phatSinhBinhChon) {
                throw new ApiError(
                    409,
                    'Thực đơn đã được tạo bình chọn. Vui lòng hủy đợt bình chọn trước khi hủy duyệt thực đơn.'
                );
            }

            throw new ApiError(400, 'Trạng thái thực đơn đã thay đổi, không thể hủy duyệt.');
        }

        return ketQua;
    }

    async huy(id) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (![10, 20, 40].includes(Number(thucDon.trangThai))) {
            throw new ApiError(400, 'Trạng thái hiện tại không cho phép hủy thực đơn.');
        }

        const ketQua = await thucDonRepository.huy(thucDonId);

        if (!ketQua) {
            throw new ApiError(400, 'Trạng thái thực đơn đã thay đổi, không thể hủy.');
        }

        return ketQua;
    }

    async hoanHuy(id) {
        const thucDonId = this.parseId(id);

        const thucDon = await thucDonRepository.getChiTiet(thucDonId);

        if (!thucDon) {
            throw new ApiError(404, 'Thực đơn không tồn tại.');
        }

        if (Number(thucDon.trangThai) !== 50) {
            throw new ApiError(400, 'Chỉ có thể hoàn hủy thực đơn đã hủy.');
        }

        if (![10, 20, 40].includes(Number(thucDon.trangThaiTruocHuy))) {
            throw new ApiError(400, 'Không xác định được trạng thái trước khi hủy.');
        }

        const ketQua = await thucDonRepository.hoanHuy(thucDonId);

        if (!ketQua) {
            throw new ApiError(400, 'Không thể hoàn hủy thực đơn.');
        }

        return ketQua;
    }
}

module.exports = new ThucDonService();

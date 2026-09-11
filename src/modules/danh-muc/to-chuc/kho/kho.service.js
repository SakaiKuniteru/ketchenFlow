'use strict';

const { loaiKho: dsLoaiKho } = require('../../../../constants/enums');

const ApiError = require('../../../../utils/api-error');
const khoRepository = require('./kho.repository');

class KhoService {
    parseId(id) {
        const khoId = Number(id);
        if (!Number.isInteger(khoId) || khoId <= 0) {
            throw new ApiError(400, 'ID kho không hợp lệ.');
        }
        return khoId;
    }

    async getTongHop(query) {
        return await khoRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const khoId = this.parseId(id);
        const kho = await khoRepository.getChiTiet(khoId);
        if (!kho) {
            throw new ApiError(404, 'Kho không tồn tại.');
        }
        return kho;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };
        if (duLieu.maNhaAn) {
            const nhaAn = await khoRepository.getNhaAnByMa(duLieu.maNhaAn);
            if (!nhaAn) {
                throw new ApiError(400, 'Mã nhà ăn không tồn tại.');
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
            duLieu.nhaAnId = nhaAn.id;
        }
        if (duLieu.nhaAnId !== undefined && duLieu.nhaAnId !== null) {
            duLieu.nhaAnId = Number(duLieu.nhaAnId);
        }
        delete duLieu.maNhaAn;
        return duLieu;
    }

    async validateLienKet(data) {
        if (!data.nhaAnId) {
            throw new ApiError(400, 'Nhà ăn là bắt buộc.');
        }
        if (!Number.isInteger(Number(data.nhaAnId)) || Number(data.nhaAnId) <= 0) {
            throw new ApiError(400, 'ID nhà ăn không hợp lệ.');
        }
        const nhaAnTonTai = await khoRepository.existsNhaAn(data.nhaAnId);
        if (!nhaAnTonTai) {
            throw new ApiError(400, 'Nhà ăn không tồn tại hoặc đã bị khóa.');
        }
    }

    async validateDsNvQuanLy(dsNvQuanLyId, dsNvQuanLyMa, nhaAnId) {
        const coId = dsNvQuanLyId !== undefined && dsNvQuanLyId !== null;

        const coMa = dsNvQuanLyMa !== undefined && dsNvQuanLyMa !== null;

        if (!coId && !coMa) {
            return [];
        }

        if (coId && coMa) {
            throw new ApiError(
                400,
                'Chỉ được nhập danh sách nhân viên quản lý theo ID hoặc mã nhân viên, không nhập đồng thời cả hai.'
            );
        }

        if (coId) {
            if (!Array.isArray(dsNvQuanLyId)) {
                throw new ApiError(400, 'Danh sách nhân viên quản lý theo ID phải là mảng.');
            }

            const dsId = [...new Set(dsNvQuanLyId.map((id) => Number(id)))];

            if (dsId.some((id) => !Number.isInteger(id) || id <= 0)) {
                throw new ApiError(400, 'Danh sách ID nhân viên quản lý không hợp lệ.');
            }

            const dsNhanVien = await khoRepository.getDsNhanVienByIds(dsId);

            const mapId = new Map(dsNhanVien.map((nhanVien) => [Number(nhanVien.id), nhanVien]));

            const dsIdKhongTonTai = dsId.filter((id) => !mapId.has(id));

            if (dsIdKhongTonTai.length > 0) {
                throw new ApiError(400, `Nhân viên có ID [${dsIdKhongTonTai.join(', ')}] không tồn tại.`);
            }

            const dsKhongHoatDong = dsNhanVien.filter((nhanVien) => nhanVien.active !== true);

            if (dsKhongHoatDong.length > 0) {
                throw new ApiError(
                    400,
                    `Nhân viên có ID [${dsKhongHoatDong.map((item) => item.id).join(', ')}] không hoạt động.`
                );
            }

            const dsThuocNhaAn = await khoRepository.getDsNhanVienThuocNhaAnByIds(dsId, nhaAnId);

            const tapThuocNhaAn = new Set(dsThuocNhaAn.map((item) => Number(item.id)));

            const dsKhongThuocNhaAn = dsId.filter((id) => !tapThuocNhaAn.has(id));

            if (dsKhongThuocNhaAn.length > 0) {
                throw new ApiError(
                    400,
                    `Nhân viên có ID [${dsKhongThuocNhaAn.join(', ')}] không thuộc nhà ăn của kho.`
                );
            }

            return dsId;
        }

        if (coMa) {
            if (!Array.isArray(dsNvQuanLyMa)) {
                throw new ApiError(400, 'Danh sách mã nhân viên quản lý phải là mảng.');
            }

            const dsMa = [...new Set(dsNvQuanLyMa.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))];

            const dsNhanVien = await khoRepository.getDsNhanVienByMa(dsMa);

            const mapMa = new Map(
                dsNhanVien.map((nhanVien) => [String(nhanVien.maNhanVien).trim().toUpperCase(), nhanVien])
            );

            const dsMaKhongTonTai = dsMa.filter((ma) => !mapMa.has(ma));

            if (dsMaKhongTonTai.length > 0) {
                throw new ApiError(400, `Nhân viên có mã [${dsMaKhongTonTai.join(', ')}] không tồn tại.`);
            }

            const dsKhongHoatDong = dsNhanVien.filter((nhanVien) => nhanVien.active !== true);

            if (dsKhongHoatDong.length > 0) {
                throw new ApiError(
                    400,
                    `Nhân viên có mã [${dsKhongHoatDong.map((item) => item.maNhanVien).join(', ')}] không hoạt động.`
                );
            }

            const dsThuocNhaAn = await khoRepository.getDsNhanVienThuocNhaAnByMa(dsMa, nhaAnId);

            const tapMaThuocNhaAn = new Set(dsThuocNhaAn.map((item) => String(item.maNhanVien).trim().toUpperCase()));

            const dsMaKhongThuocNhaAn = dsMa.filter((ma) => !tapMaThuocNhaAn.has(ma));

            if (dsMaKhongThuocNhaAn.length > 0) {
                throw new ApiError(
                    400,
                    `Nhân viên có mã [${dsMaKhongThuocNhaAn.join(', ')}] không thuộc nhà ăn của kho.`
                );
            }

            return dsMa.map((ma) => Number(mapMa.get(ma).id));
        }

        return [];
    }

    validateLoaiKho(loaiKho) {
        const giaTriSo = Number(loaiKho);
        const hopLe = dsLoaiKho.some((item) => Number(item.value) === giaTriSo);
        if (!hopLe) {
            throw new ApiError(400, 'Loại kho không hợp lệ.');
        }
        return giaTriSo;
    }

    validateNhietDo(nhietDoToiThieu, nhietDoToiDa) {
        if (
            nhietDoToiThieu === undefined ||
            nhietDoToiThieu === null ||
            nhietDoToiDa === undefined ||
            nhietDoToiDa === null
        ) {
            return;
        }
        const nhietDoMin = Number(nhietDoToiThieu);
        const nhietDoMax = Number(nhietDoToiDa);
        if (!Number.isFinite(nhietDoMin) || !Number.isFinite(nhietDoMax)) {
            throw new ApiError(400, 'Nhiệt độ kho không hợp lệ.');
        }
        if (nhietDoMin > nhietDoMax) {
            throw new ApiError(400, 'Nhiệt độ tối thiểu không được lớn hơn nhiệt độ tối đa.');
        }
    }

    validateGiaTriNhietDo(value, tenTruong) {
        if (value === undefined || value === null) {
            return;
        }
        const number = Number(value);
        if (!Number.isFinite(number)) {
            throw new ApiError(400, `${tenTruong} không hợp lệ.`);
        }
        const raw = String(Math.abs(number));
        const [phanNguyen, phanThapPhan = ''] = raw.split('.');
        const tongSoChuSo = phanNguyen.length + phanThapPhan.length;
        if (tongSoChuSo > 10) {
            throw new ApiError(400, `${tenTruong} chỉ được tối đa 10 chữ số.`);
        }
        if (phanThapPhan.length > 4) {
            throw new ApiError(400, `${tenTruong} chỉ được tối đa 4 chữ số sau dấu phẩy.`);
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await khoRepository.existsMaKho(data.maKho, excludeId);
        if (trungMa) {
            throw new ApiError(409, 'Mã kho đã tồn tại.');
        }
        const trungTen = await khoRepository.existsTenKho(data.tenKho, excludeId);
        if (trungTen) {
            throw new ApiError(409, 'Tên kho đã tồn tại.');
        }
    }

    xuLyDienTich(dienTich) {
        if (dienTich === undefined || dienTich === null) {
            return null;
        }
        const giaTri = Number(dienTich);
        if (!Number.isFinite(giaTri)) {
            throw new ApiError(400, 'Diện tích không hợp lệ.');
        }
        return giaTri;
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);
        await this.validateLienKet(duLieu);
        const loaiKho = this.validateLoaiKho(duLieu.loaiKho);
        this.validateGiaTriNhietDo(duLieu.nhietDoToiThieu, 'Nhiệt độ tối thiểu');
        this.validateGiaTriNhietDo(duLieu.nhietDoToiDa, 'Nhiệt độ tối đa');
        this.validateNhietDo(duLieu.nhietDoToiThieu, duLieu.nhietDoToiDa);
        await this.validateTrungDuLieu(duLieu);
        const dsNvQuanLyId = await this.validateDsNvQuanLy(duLieu.dsNvQuanLyId, duLieu.dsNvQuanLyMa, duLieu.nhaAnId);
        const duLieuTao = {
            ...duLieu,
            maKho: duLieu.maKho.trim(),
            tenKho: duLieu.tenKho.trim(),
            loaiKho,
            diaDiem: duLieu.diaDiem?.trim() || null,
            dienTich: duLieu.dienTich !== undefined && duLieu.dienTich !== null ? Number(duLieu.dienTich) : null,
            nhietDoToiThieu:
                duLieu.nhietDoToiThieu !== undefined && duLieu.nhietDoToiThieu !== null
                    ? Number(duLieu.nhietDoToiThieu)
                    : null,
            nhietDoToiDa:
                duLieu.nhietDoToiDa !== undefined && duLieu.nhietDoToiDa !== null ? Number(duLieu.nhietDoToiDa) : null,
            moTa: duLieu.moTa?.trim() || null,
            ghiChu: duLieu.ghiChu?.trim() || null,
            active: duLieu.active !== undefined ? duLieu.active : true,
            dsNvQuanLyId
        };
        duLieuTao.dienTich = await this.xuLyDienTich(duLieu.dienTich);
        return await khoRepository.create(duLieuTao);
    }

    async update(id, data) {
        const khoId = this.parseId(id);
        const kho = await khoRepository.getChiTiet(khoId);
        if (!kho) {
            throw new ApiError(404, 'Kho không tồn tại.');
        }
        const duLieuCapNhat = {
            maKho: data.maKho !== undefined ? data.maKho.trim() : kho.maKho,
            tenKho: data.tenKho !== undefined ? data.tenKho.trim() : kho.tenKho,
            nhaAnId: data.nhaAnId !== undefined ? data.nhaAnId : kho.nhaAnId,
            maNhaAn:
                data.maNhaAn !== undefined ? (data.maNhaAn === null ? null : data.maNhaAn.trim() || null) : undefined,
            loaiKho: data.loaiKho !== undefined ? data.loaiKho : kho.loaiKho,
            diaDiem:
                data.diaDiem !== undefined ? (data.diaDiem === null ? null : data.diaDiem.trim() || null) : kho.diaDiem,
            dienTich: data.dienTich !== undefined ? data.dienTich : kho.dienTich,
            nhietDoToiThieu: data.nhietDoToiThieu !== undefined ? data.nhietDoToiThieu : kho.nhietDoToiThieu,
            nhietDoToiDa: data.nhietDoToiDa !== undefined ? data.nhietDoToiDa : kho.nhietDoToiDa,
            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : kho.moTa,
            ghiChu: data.ghiChu !== undefined ? (data.ghiChu === null ? null : data.ghiChu.trim() || null) : kho.ghiChu,
            active: data.active !== undefined ? data.active : kho.active,
            dsNvQuanLyId: data.dsNvQuanLyId !== undefined ? data.dsNvQuanLyId : undefined,
            dsNvQuanLyMa: data.dsNvQuanLyMa !== undefined ? data.dsNvQuanLyMa : undefined
        };
        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);
        await this.validateLienKet(duLieuDaChuanHoa);
        const coDanhSachNhanVien = data.dsNvQuanLyId !== undefined || data.dsNvQuanLyMa !== undefined;
        const dsNvQuanLyId = coDanhSachNhanVien
            ? await this.validateDsNvQuanLy(data.dsNvQuanLyId, data.dsNvQuanLyMa, duLieuDaChuanHoa.nhaAnId)
            : undefined;
        duLieuDaChuanHoa.dsNvQuanLyId = dsNvQuanLyId;
        duLieuDaChuanHoa.loaiKho = this.validateLoaiKho(duLieuDaChuanHoa.loaiKho);
        this.validateGiaTriNhietDo(duLieuDaChuanHoa.nhietDoToiThieu, 'Nhiệt độ tối thiểu');
        this.validateGiaTriNhietDo(duLieuDaChuanHoa.nhietDoToiDa, 'Nhiệt độ tối đa');
        this.validateNhietDo(duLieuDaChuanHoa.nhietDoToiThieu, duLieuDaChuanHoa.nhietDoToiDa);
        if (duLieuDaChuanHoa.dienTich !== null) {
            duLieuDaChuanHoa.dienTich = Number(duLieuDaChuanHoa.dienTich);
        }
        if (duLieuDaChuanHoa.nhietDoToiThieu !== null) {
            duLieuDaChuanHoa.nhietDoToiThieu = Number(duLieuDaChuanHoa.nhietDoToiThieu);
        }
        if (duLieuDaChuanHoa.nhietDoToiDa !== null) {
            duLieuDaChuanHoa.nhietDoToiDa = Number(duLieuDaChuanHoa.nhietDoToiDa);
        }
        duLieuDaChuanHoa.dienTich = await this.xuLyDienTich(duLieuDaChuanHoa.dienTich);
        await this.validateTrungDuLieu(duLieuDaChuanHoa, khoId);
        const ketQua = await khoRepository.update(khoId, duLieuDaChuanHoa);
        if (!ketQua) {
            throw new ApiError(404, 'Kho không tồn tại.');
        }
        return ketQua;
    }
}

module.exports = new KhoService();

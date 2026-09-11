const fs = require('fs/promises');
const path = require('path');
const ApiError = require('../../../../utils/api-error');
const thucPhamRepository = require('./thuc-pham.repository');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');
const { loaiBaoQuan: dsLoaiBaoQuan } = require('../../../../constants/enums');

const LOAI_DON_VI = {
    KHOI_LUONG: 10,
    THE_TICH: 20,
    DEM: 30
};

class ThucPhamService {
    parseId(id) {
        const thucPhamId = Number(id);

        if (!Number.isInteger(thucPhamId) || thucPhamId <= 0) {
            throw new ApiError(400, 'ID thực phẩm không hợp lệ.');
        }

        return thucPhamId;
    }

    async luuHinhAnh(file, maThucPham, tenThucPham) {
        if (!file) {
            return null;
        }

        const ma = String(maThucPham).trim().toUpperCase();

        const ten = String(tenThucPham || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const maFile = ma
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const folder = path.join(process.cwd(), 'src', 'public', 'uploads', 'danh-muc', 'thuc-pham', ma);

        await fs.mkdir(folder, {
            recursive: true
        });

        const extension = path.extname(file.originalname).toLowerCase();

        const fileName = `${ten}-${maFile}${extension}`;

        const absolutePath = path.join(folder, fileName);

        await fs.rename(file.path, absolutePath);

        return path.join('uploads', 'danh-muc', 'thuc-pham', ma, fileName).replace(/\\/g, '/');
    }

    async xoaHinhAnhCu(hinhAnh) {
        if (!hinhAnh) {
            return;
        }

        const relativePath = String(hinhAnh).replace(/^\/+/, '').trim();

        if (!relativePath) {
            return;
        }

        const absolutePath = path.join(process.cwd(), 'src', 'public', relativePath);

        try {
            await fs.unlink(absolutePath);
        } catch (error) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async getTongHop(query) {
        return await thucPhamRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const thucPhamId = this.parseId(id);

        const thucPham = await thucPhamRepository.getChiTiet(thucPhamId);

        if (!thucPham) {
            throw new ApiError(404, 'Thực phẩm không tồn tại.');
        }

        return thucPham;
    }

    async chuanHoaDonViTheoMa(duLieu, truongMa, truongId, tenLoaiDonVi) {
        if (!duLieu[truongMa]) {
            return;
        }

        const donViTinh = await thucPhamRepository.getDonViTinhByMa(duLieu[truongMa]);

        if (!donViTinh) {
            throw new ApiError(400, `Mã ${tenLoaiDonVi} không tồn tại.`);
        }

        if (!donViTinh.active) {
            throw new ApiError(400, `${tenLoaiDonVi} đã bị khóa.`);
        }

        if (
            duLieu[truongId] !== undefined &&
            duLieu[truongId] !== null &&
            Number(duLieu[truongId]) !== Number(donViTinh.id)
        ) {
            throw new ApiError(400, `ID và mã ${tenLoaiDonVi} không khớp.`);
        }

        duLieu[truongId] = donViTinh.id;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        await this.chuanHoaDonViTheoMa(duLieu, 'maDonViSoCap', 'donViSoCapId', 'đơn vị sơ cấp');

        await this.chuanHoaDonViTheoMa(duLieu, 'maDonViSuDung', 'donViSuDungId', 'đơn vị sử dụng');

        if (duLieu.donViSoCapId !== undefined && duLieu.donViSoCapId !== null) {
            duLieu.donViSoCapId = Number(duLieu.donViSoCapId);
        }

        if (duLieu.donViSuDungId !== undefined && duLieu.donViSuDungId !== null) {
            duLieu.donViSuDungId = Number(duLieu.donViSuDungId);
        }

        delete duLieu.maDonViSoCap;
        delete duLieu.maDonViSuDung;

        return duLieu;
    }

    async chuanHoaXuatXu(data) {
        const duLieu = {
            ...data
        };

        const coId = duLieu.xuatXuId !== undefined && duLieu.xuatXuId !== null && duLieu.xuatXuId !== '';

        const coMa = duLieu.maXuatXu !== undefined && duLieu.maXuatXu !== null && String(duLieu.maXuatXu).trim();

        if (!coId && !coMa) {
            duLieu.xuatXuId = null;
            delete duLieu.maXuatXu;

            return duLieu;
        }

        let quocGiaTheoId = null;
        let quocGiaTheoMa = null;

        if (coId) {
            const id = Number(duLieu.xuatXuId);

            if (!Number.isInteger(id) || id <= 0) {
                throw new ApiError(400, 'Xuất xứ không hợp lệ.');
            }

            quocGiaTheoId = await thucPhamRepository.getQuocGia(id);

            if (!quocGiaTheoId) {
                throw new ApiError(400, 'Quốc gia xuất xứ không tồn tại.');
            }
        }

        if (coMa) {
            const ma = String(duLieu.maXuatXu).trim().toUpperCase();

            quocGiaTheoMa = await thucPhamRepository.getQuocGiaByMa(ma);

            if (!quocGiaTheoMa) {
                throw new ApiError(400, `Quốc gia có mã "${ma}" không tồn tại.`);
            }
        }

        if (quocGiaTheoId && quocGiaTheoMa && Number(quocGiaTheoId.id) !== Number(quocGiaTheoMa.id)) {
            throw new ApiError(400, 'ID và mã quốc gia xuất xứ không khớp.');
        }

        const quocGia = quocGiaTheoId || quocGiaTheoMa;

        if (quocGia.active === false) {
            throw new ApiError(400, `Quốc gia "${quocGia.ten}" đã bị khóa.`);
        }

        duLieu.xuatXuId = Number(quocGia.id);

        delete duLieu.maXuatXu;

        return duLieu;
    }

    async validateQuyTacLoaiDonVi(donViSoCap, donViSuDung) {
        const quyTac = await cauHinhService.getQuyTacChonDonViQuyDoi();

        const loaiSoCap = Number(donViSoCap.loaiDonVi);
        const loaiSuDung = Number(donViSuDung.loaiDonVi);

        if (quyTac === 1) {
            return;
        }

        if (quyTac === 2) {
            if (loaiSoCap !== loaiSuDung) {
                throw new ApiError(400, 'Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị.');
            }

            return;
        }

        if (quyTac === 3) {
            const hopLe =
                loaiSoCap === LOAI_DON_VI.DEM ||
                (loaiSoCap === LOAI_DON_VI.KHOI_LUONG &&
                    (loaiSuDung === LOAI_DON_VI.KHOI_LUONG || loaiSuDung === LOAI_DON_VI.DEM)) ||
                (loaiSoCap === LOAI_DON_VI.THE_TICH &&
                    (loaiSuDung === LOAI_DON_VI.THE_TICH || loaiSuDung === LOAI_DON_VI.DEM));

            if (!hopLe) {
                throw new ApiError(
                    400,
                    'Loại đơn vị sơ cấp và đơn vị sử dụng không phù hợp với quy tắc quy đổi hiện tại.'
                );
            }

            return;
        }

        const hopLe =
            loaiSoCap === LOAI_DON_VI.DEM ||
            (loaiSoCap === LOAI_DON_VI.KHOI_LUONG && loaiSuDung === LOAI_DON_VI.KHOI_LUONG) ||
            (loaiSoCap === LOAI_DON_VI.THE_TICH && loaiSuDung === LOAI_DON_VI.THE_TICH);

        if (!hopLe) {
            throw new ApiError(400, 'Loại đơn vị sơ cấp và đơn vị sử dụng không phù hợp với quy tắc quy đổi hiện tại.');
        }
    }

    async validateDonVi(data) {
        if (!data.donViSoCapId) {
            throw new ApiError(400, 'Đơn vị sơ cấp là bắt buộc.');
        }

        if (!data.donViSuDungId) {
            throw new ApiError(400, 'Đơn vị sử dụng là bắt buộc.');
        }

        const donViSoCap = await thucPhamRepository.getDonViTinh(data.donViSoCapId);

        if (!donViSoCap) {
            throw new ApiError(400, 'Đơn vị sơ cấp không tồn tại.');
        }

        if (!donViSoCap.active) {
            throw new ApiError(400, 'Đơn vị sơ cấp đã bị khóa.');
        }

        const donViSuDung = await thucPhamRepository.getDonViTinh(data.donViSuDungId);

        if (!donViSuDung) {
            throw new ApiError(400, 'Đơn vị sử dụng không tồn tại.');
        }

        if (!donViSuDung.active) {
            throw new ApiError(400, 'Đơn vị sử dụng đã bị khóa.');
        }

        await this.validateQuyTacLoaiDonVi(donViSoCap, donViSuDung);

        return {
            donViSoCap,
            donViSuDung
        };
    }

    validateHeSoQuyDoi(data) {
        const heSoQuyDoi = Number(data.heSoQuyDoi);

        if (!Number.isFinite(heSoQuyDoi) || heSoQuyDoi <= 0) {
            throw new ApiError(400, 'Hệ số quy đổi phải là số lớn hơn 0.');
        }

        if (Number(data.donViSoCapId) === Number(data.donViSuDungId) && heSoQuyDoi !== 1) {
            throw new ApiError(400, 'Khi đơn vị sơ cấp và đơn vị sử dụng giống nhau, hệ số quy đổi phải bằng 1.');
        }

        data.heSoQuyDoi = heSoQuyDoi;
    }

    validateGiaNhap(data) {
        if (data.giaNhap === undefined || data.giaNhap === null) {
            return;
        }

        const giaNhap = Number(data.giaNhap);

        if (!Number.isFinite(giaNhap) || giaNhap < 0) {
            throw new ApiError(400, 'Giá nhập phải là số lớn hơn hoặc bằng 0.');
        }

        data.giaNhap = giaNhap;
    }

    validateTyLeHaoHut(data) {
        if (data.tyLeHaoHutDuKien === undefined || data.tyLeHaoHutDuKien === null) {
            return;
        }

        const tyLeHaoHut = Number(data.tyLeHaoHutDuKien);

        if (!Number.isFinite(tyLeHaoHut) || tyLeHaoHut < 0 || tyLeHaoHut > 100) {
            throw new ApiError(400, 'Tỷ lệ hao hụt dự kiến phải nằm trong khoảng từ 0 đến 100.');
        }

        data.tyLeHaoHutDuKien = tyLeHaoHut;
    }

    validateDieuKienBaoQuan(dieuKienBaoQuan) {
        if (dieuKienBaoQuan === undefined || dieuKienBaoQuan === null || dieuKienBaoQuan === '') {
            return null;
        }

        const value = Number(dieuKienBaoQuan);

        const hopLe = dsLoaiBaoQuan.some((item) => Number(item.value) === value);

        if (!hopLe) {
            throw new ApiError(400, 'Điều kiện bảo quản không hợp lệ.');
        }

        return value;
    }

    taoQuyCachMacDinh(data, donViSoCap, donViSuDung) {
        if (data.quyCach !== undefined && data.quyCach !== null && String(data.quyCach).trim()) {
            return String(data.quyCach).trim();
        }

        const tenDonViSoCap = donViSoCap.kyHieu || donViSoCap.tenDonViTinh;

        const tenDonViSuDung = donViSuDung.kyHieu || donViSuDung.tenDonViTinh;

        return `1 ${tenDonViSoCap}` + ` = ${data.heSoQuyDoi}` + ` ${tenDonViSuDung}`;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await thucPhamRepository.existsMaThucPham(data.maThucPham, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã thực phẩm đã tồn tại.');
        }

        const trungTen = await thucPhamRepository.existsTenThucPham(data.tenThucPham, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên thực phẩm đã tồn tại.');
        }
    }

    async create(data, file = null) {
        let duLieu = await this.chuanHoaLienKet(data);

        duLieu = await this.chuanHoaXuatXu(duLieu);

        duLieu.dieuKienBaoQuan = this.validateDieuKienBaoQuan(duLieu.dieuKienBaoQuan);

        duLieu.heSoQuyDoi = duLieu.heSoQuyDoi !== undefined ? duLieu.heSoQuyDoi : 1;

        const { donViSoCap, donViSuDung } = await this.validateDonVi(duLieu);

        this.validateHeSoQuyDoi(duLieu);
        this.validateGiaNhap(duLieu);
        this.validateTyLeHaoHut(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maThucPham: duLieu.maThucPham.trim(),

            tenThucPham: duLieu.tenThucPham.trim(),

            heSoQuyDoi: duLieu.heSoQuyDoi,

            quyCach: this.taoQuyCachMacDinh(duLieu, donViSoCap, donViSuDung),

            giaNhap: duLieu.giaNhap !== undefined ? duLieu.giaNhap : null,

            tyLeHaoHutDuKien: duLieu.tyLeHaoHutDuKien !== undefined ? duLieu.tyLeHaoHutDuKien : 0,

            xuatXuId: duLieu.xuatXuId !== undefined ? duLieu.xuatXuId : null,

            dieuKienBaoQuan: duLieu.dieuKienBaoQuan !== undefined ? duLieu.dieuKienBaoQuan : null,

            moTa: duLieu.moTa?.trim() || null,

            hinhAnh: duLieu.hinhAnh || null,

            ghiChu: duLieu.ghiChu?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        if (file) {
            duLieuTao.hinhAnh = await this.luuHinhAnh(file, duLieuTao.maThucPham, duLieuTao.tenThucPham);
        }

        return await thucPhamRepository.create(duLieuTao);
    }

    async update(id, data, file = null) {
        const thucPhamId = this.parseId(id);

        const thucPham = await thucPhamRepository.getChiTiet(thucPhamId);

        if (!thucPham) {
            throw new ApiError(404, 'Thực phẩm không tồn tại.');
        }

        const duLieuCapNhat = {
            maThucPham: data.maThucPham !== undefined ? data.maThucPham.trim() : thucPham.maThucPham,

            tenThucPham: data.tenThucPham !== undefined ? data.tenThucPham.trim() : thucPham.tenThucPham,

            donViSoCapId: data.donViSoCapId !== undefined ? data.donViSoCapId : thucPham.donViSoCapId,

            maDonViSoCap:
                data.maDonViSoCap !== undefined
                    ? data.maDonViSoCap === null
                        ? null
                        : data.maDonViSoCap.trim() || null
                    : undefined,

            donViSuDungId: data.donViSuDungId !== undefined ? data.donViSuDungId : thucPham.donViSuDungId,

            maDonViSuDung:
                data.maDonViSuDung !== undefined
                    ? data.maDonViSuDung === null
                        ? null
                        : data.maDonViSuDung.trim() || null
                    : undefined,

            heSoQuyDoi: data.heSoQuyDoi !== undefined ? data.heSoQuyDoi : thucPham.heSoQuyDoi,

            quyCach:
                data.quyCach !== undefined
                    ? data.quyCach === null
                        ? null
                        : data.quyCach.trim() || null
                    : thucPham.quyCach,

            giaNhap: data.giaNhap !== undefined ? data.giaNhap : thucPham.giaNhap,

            tyLeHaoHutDuKien: data.tyLeHaoHutDuKien !== undefined ? data.tyLeHaoHutDuKien : thucPham.tyLeHaoHutDuKien,

            xuatXuId:
                data.xuatXuId !== undefined
                    ? data.xuatXuId
                    : data.maXuatXu !== undefined
                      ? undefined
                      : thucPham.xuatXuId,

            maXuatXu: data.maXuatXu !== undefined ? data.maXuatXu : undefined,

            dieuKienBaoQuan: data.dieuKienBaoQuan !== undefined ? data.dieuKienBaoQuan : thucPham.dieuKienBaoQuan,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : thucPham.moTa,

            hinhAnh: data.hinhAnh !== undefined ? data.hinhAnh : thucPham.hinhAnh,

            ghiChu:
                data.ghiChu !== undefined
                    ? data.ghiChu === null
                        ? null
                        : data.ghiChu.trim() || null
                    : thucPham.ghiChu,

            active: data.active !== undefined ? data.active : thucPham.active
        };

        let duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        duLieuDaChuanHoa = await this.chuanHoaXuatXu(duLieuDaChuanHoa);

        duLieuDaChuanHoa.dieuKienBaoQuan = this.validateDieuKienBaoQuan(duLieuDaChuanHoa.dieuKienBaoQuan);

        const { donViSoCap, donViSuDung } = await this.validateDonVi(duLieuDaChuanHoa);

        this.validateHeSoQuyDoi(duLieuDaChuanHoa);
        this.validateGiaNhap(duLieuDaChuanHoa);
        this.validateTyLeHaoHut(duLieuDaChuanHoa);

        const thayDoiQuyDoi =
            data.donViSoCapId !== undefined ||
            data.maDonViSoCap !== undefined ||
            data.donViSuDungId !== undefined ||
            data.maDonViSuDung !== undefined ||
            data.heSoQuyDoi !== undefined;

        if (data.quyCach === undefined && !thayDoiQuyDoi) {
            duLieuDaChuanHoa.quyCach = thucPham.quyCach;
        } else {
            duLieuDaChuanHoa.quyCach = this.taoQuyCachMacDinh(
                {
                    ...duLieuDaChuanHoa,
                    quyCach: data.quyCach
                },
                donViSoCap,
                donViSuDung
            );
        }

        await this.validateTrungDuLieu(duLieuDaChuanHoa, thucPhamId);

        let hinhAnhCuCanXoa = null;

        if (file) {
            const hinhAnhMoi = await this.luuHinhAnh(file, duLieuDaChuanHoa.maThucPham, duLieuDaChuanHoa.tenThucPham);

            if (thucPham.hinhAnh && thucPham.hinhAnh !== hinhAnhMoi) {
                hinhAnhCuCanXoa = thucPham.hinhAnh;
            }

            duLieuDaChuanHoa.hinhAnh = hinhAnhMoi;
        }

        const ketQua = await thucPhamRepository.update(thucPhamId, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Thực phẩm không tồn tại.');
        }

        if (hinhAnhCuCanXoa) {
            await this.xoaHinhAnhCu(hinhAnhCuCanXoa);
        }

        return ketQua;
    }
}

module.exports = new ThucPhamService();

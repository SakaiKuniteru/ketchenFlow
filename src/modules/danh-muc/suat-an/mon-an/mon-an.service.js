const fs = require('fs/promises');
const path = require('path');
const ApiError = require('../../../../utils/api-error');
const monAnRepository = require('./mon-an.repository');
const monAnCongThucService = require('./mon-an-cong-thuc.service');

class MonAnService {
    parseId(id) {
        const monAnId = Number(id);

        if (!Number.isInteger(monAnId) || monAnId <= 0) {
            throw new ApiError(400, 'ID món ăn không hợp lệ.');
        }

        return monAnId;
    }

    async luuHinhAnh(file, maMonAn, tenMonAn) {
        if (!file) {
            return null;
        }

        const ma = String(maMonAn).trim().toUpperCase();

        const ten = String(tenMonAn || '')
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

        const folder = path.join(process.cwd(), 'src', 'public', 'uploads', 'danh-muc', 'mon-an', ma);

        await fs.mkdir(folder, {
            recursive: true
        });

        const extension = path.extname(file.originalname).toLowerCase();

        const fileName = `${ten}-${maFile}${extension}`;

        const absolutePath = path.join(folder, fileName);

        try {
            await fs.unlink(absolutePath);
        } catch (error) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }

        await fs.rename(file.path, absolutePath);

        return path.join('uploads', 'danh-muc', 'mon-an', ma, fileName).replace(/\\/g, '/');
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
        return await monAnRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const monAnId = this.parseId(id);

        const monAn = await monAnRepository.getChiTiet(monAnId);

        if (!monAn) {
            throw new ApiError(404, 'Món ăn không tồn tại.');
        }

        const dsCongThuc = await monAnRepository.getCongThuc(monAnId);

        const congThuc = await monAnCongThucService.build(dsCongThuc);

        return {
            ...monAn,
            giaDuKien: congThuc.tongTien.thanhTien,
            dsThucPham: congThuc.dsThucPham,
            congThuc
        };
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maNhomMonAn) {
            const nhomMonAn = await monAnRepository.getNhomMonAnByMa(duLieu.maNhomMonAn);

            if (!nhomMonAn) {
                throw new ApiError(400, 'Mã nhóm món ăn không tồn tại.');
            }

            if (!nhomMonAn.active) {
                throw new ApiError(400, 'Nhóm món ăn đã bị khóa.');
            }

            if (
                duLieu.nhomMonAnId !== undefined &&
                duLieu.nhomMonAnId !== null &&
                Number(duLieu.nhomMonAnId) !== Number(nhomMonAn.id)
            ) {
                throw new ApiError(400, 'ID nhóm món ăn và mã nhóm món ăn không khớp.');
            }

            duLieu.nhomMonAnId = nhomMonAn.id;
        }

        if (duLieu.nhomMonAnId !== undefined && duLieu.nhomMonAnId !== null) {
            duLieu.nhomMonAnId = Number(duLieu.nhomMonAnId);
        }

        delete duLieu.maNhomMonAn;

        return duLieu;
    }

    async validateDsThucPham(data) {
        if (data.dsThucPham === undefined) {
            return;
        }

        if (!Array.isArray(data.dsThucPham)) {
            throw new ApiError(400, 'Danh sách thực phẩm không hợp lệ.');
        }

        const thucPhamIdDaCo = new Set();

        for (const item of data.dsThucPham) {
            const thucPhamId = Number(item.thucPhamId);

            const dinhLuong = Number(item.dinhLuong);

            if (!Number.isInteger(thucPhamId) || thucPhamId <= 0) {
                throw new ApiError(400, 'Thực phẩm không hợp lệ.');
            }

            if (!Number.isFinite(dinhLuong) || dinhLuong <= 0) {
                throw new ApiError(400, 'Định lượng thực phẩm phải lớn hơn 0.');
            }

            if (thucPhamIdDaCo.has(thucPhamId)) {
                throw new ApiError(400, 'Một thực phẩm không được xuất hiện nhiều lần trong công thức.');
            }

            thucPhamIdDaCo.add(thucPhamId);

            item.thucPhamId = thucPhamId;

            item.dinhLuong = dinhLuong;

            item.ghiChu = item.ghiChu?.trim() || null;
        }
    }

    async validateLienKet(data) {
        if (!data.nhomMonAnId) {
            throw new ApiError(400, 'Nhóm món ăn là bắt buộc.');
        }

        if (!Number.isInteger(Number(data.nhomMonAnId)) || Number(data.nhomMonAnId) <= 0) {
            throw new ApiError(400, 'ID nhóm món ăn không hợp lệ.');
        }

        const nhomMonAnTonTai = await monAnRepository.existsNhomMonAn(data.nhomMonAnId);

        if (!nhomMonAnTonTai) {
            throw new ApiError(400, 'Nhóm món ăn không tồn tại hoặc đã bị khóa.');
        }
    }

    validateGiaTien(data) {
        if (data.giaTien === undefined || data.giaTien === null) {
            return;
        }

        data.giaTien = Number(data.giaTien);

        if (!Number.isFinite(data.giaTien)) {
            throw new ApiError(400, 'Giá món ăn không hợp lệ.');
        }

        if (data.giaTien < 0) {
            throw new ApiError(400, 'Giá món ăn không được nhỏ hơn 0.');
        }
    }

    validateCalories(data) {
        if (data.calories === undefined || data.calories === null) {
            return;
        }

        data.calories = Number(data.calories);

        if (!Number.isInteger(data.calories) || data.calories < 0) {
            throw new ApiError(400, 'Calories phải là số nguyên lớn hơn hoặc bằng 0.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await monAnRepository.existsMaMonAn(data.maMonAn, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã món ăn đã tồn tại.');
        }

        const trungTen = await monAnRepository.existsTenMonAn(data.tenMonAn, data.nhomMonAnId, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên món ăn đã tồn tại trong nhóm món ăn này.');
        }
    }

    async create(data, file = null) {
        let hinhAnhMoi = null;

        try {
            const duLieu = await this.chuanHoaLienKet(data);

            await this.validateLienKet(duLieu);

            await this.validateDsThucPham(duLieu);

            this.validateGiaTien(duLieu);

            this.validateCalories(duLieu);

            await this.validateTrungDuLieu(duLieu);

            const duLieuTao = {
                ...duLieu,
                maMonAn: duLieu.maMonAn.trim(),
                tenMonAn: duLieu.tenMonAn.trim(),
                giaTien: duLieu.giaTien !== undefined ? duLieu.giaTien : null,
                giaDuKien: 0,
                calories: duLieu.calories !== undefined ? duLieu.calories : null,
                moTa: duLieu.moTa?.trim() || null,
                hinhAnh: null,
                active: duLieu.active !== undefined ? duLieu.active : true
            };

            if (file) {
                hinhAnhMoi = await this.luuHinhAnh(file, duLieuTao.maMonAn, duLieuTao.tenMonAn);

                duLieuTao.hinhAnh = hinhAnhMoi;
            }

            const monAnMoi = await monAnRepository.create(duLieuTao);

            await this.capNhatGiaDuKien(monAnMoi.id);

            return await this.getChiTiet(monAnMoi.id);
        } catch (error) {
            if (hinhAnhMoi) {
                try {
                    await this.xoaHinhAnhCu(hinhAnhMoi);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh món ăn mới:', deleteError);
                }
            } else if (file?.path) {
                try {
                    await fs.unlink(file.path);
                } catch (deleteTempError) {
                    if (deleteTempError?.code !== 'ENOENT') {
                        console.error('Không thể xóa file temp món ăn:', deleteTempError);
                    }
                }
            }

            throw error;
        }
    }

    async update(id, data, file = null) {
        data = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

        const coCapNhatCongThuc = Array.isArray(data.dsThucPham);

        const monAnId = this.parseId(id);

        const monAn = await monAnRepository.getChiTiet(monAnId);

        if (!monAn) {
            throw new ApiError(404, 'Món ăn không tồn tại.');
        }

        const duLieuCapNhat = {
            maMonAn: data.maMonAn !== undefined ? data.maMonAn.trim() : monAn.maMonAn,

            tenMonAn: data.tenMonAn !== undefined ? data.tenMonAn.trim() : monAn.tenMonAn,

            nhomMonAnId:
                data.nhomMonAnId !== undefined
                    ? data.nhomMonAnId
                    : data.maNhomMonAn !== undefined
                      ? undefined
                      : monAn.nhomMonAnId,

            maNhomMonAn:
                data.maNhomMonAn !== undefined
                    ? data.maNhomMonAn === null
                        ? null
                        : data.maNhomMonAn.trim() || null
                    : undefined,

            giaTien: data.giaTien !== undefined ? data.giaTien : monAn.giaTien,

            giaDuKien: monAn.giaDuKien,

            calories: data.calories !== undefined ? data.calories : monAn.calories,

            moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : monAn.moTa,

            hinhAnh: monAn.hinhAnh,

            dsThucPham: data.dsThucPham !== undefined ? data.dsThucPham : undefined,

            active: data.active !== undefined ? data.active : monAn.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateDsThucPham(duLieuDaChuanHoa);

        this.validateGiaTien(duLieuDaChuanHoa);

        this.validateCalories(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, monAnId);

        let hinhAnhMoi = null;
        let hinhAnhCuCanXoa = null;

        if (file) {
            hinhAnhMoi = await this.luuHinhAnh(file, duLieuDaChuanHoa.maMonAn, duLieuDaChuanHoa.tenMonAn);

            duLieuDaChuanHoa.hinhAnh = hinhAnhMoi;

            if (monAn.hinhAnh && monAn.hinhAnh !== hinhAnhMoi) {
                hinhAnhCuCanXoa = monAn.hinhAnh;
            }
        }

        let ketQua;

        try {
            ketQua = await monAnRepository.update(monAnId, duLieuDaChuanHoa);
        } catch (error) {
            if (hinhAnhMoi) {
                try {
                    await this.xoaHinhAnhCu(hinhAnhMoi);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh món ăn mới:', deleteError);
                }
            }

            throw error;
        }

        if (!ketQua) {
            if (hinhAnhMoi) {
                try {
                    await this.xoaHinhAnhCu(hinhAnhMoi);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh món ăn mới:', deleteError);
                }
            }

            throw new ApiError(404, 'Món ăn không tồn tại.');
        }

        if (hinhAnhCuCanXoa) {
            try {
                await this.xoaHinhAnhCu(hinhAnhCuCanXoa);
            } catch (deleteError) {
                console.error('Không thể xóa ảnh món ăn cũ:', deleteError);
            }
        }

        if (coCapNhatCongThuc) {
            await this.capNhatGiaDuKien(monAnId);
        }

        return await this.getChiTiet(monAnId);
    }

    async capNhatGiaDuKien(monAnId) {
        const dsCongThuc = await monAnRepository.getCongThuc(monAnId);

        const congThuc = await monAnCongThucService.build(dsCongThuc);

        const giaDuKien = congThuc.tongTien.thanhTien;

        await monAnRepository.updateGiaDuKien(monAnId, giaDuKien);

        return {
            giaDuKien,
            congThuc
        };
    }

    async capNhatToanBoGiaMonAn(monAnId) {
        const dsCongThuc = await monAnRepository.getCongThuc(monAnId);

        const congThuc = await monAnCongThucService.build(dsCongThuc);

        const giaMoi = Number(congThuc?.tongTien?.thanhTien) || 0;

        const ketQua = await monAnRepository.updateGia(monAnId, giaMoi, giaMoi);

        if (!ketQua) {
            throw new ApiError(404, 'Món ăn không tồn tại.');
        }

        return {
            giaTien: ketQua.giaTien,

            giaDuKien: ketQua.giaDuKien,

            congThuc
        };
    }

    async capNhatGia(data = {}) {
        if (!Array.isArray(data.dsMonAnId) || data.dsMonAnId.length === 0) {
            throw new ApiError(400, 'Danh sách món ăn cần cập nhật giá không hợp lệ.');
        }

        const dsMonAnId = [...new Set(data.dsMonAnId.map((id) => this.parseId(id)))];

        const ketQua = [];

        for (const monAnId of dsMonAnId) {
            const monAn = await monAnRepository.getChiTiet(monAnId);

            if (!monAn) {
                throw new ApiError(404, `Món ăn có ID ${monAnId} không tồn tại.`);
            }

            await this.capNhatToanBoGiaMonAn(monAnId);

            const chiTietMoi = await this.getChiTiet(monAnId);

            ketQua.push(chiTietMoi);
        }

        return {
            soLuong: ketQua.length,

            dsMonAn: ketQua
        };
    }
}

module.exports = new MonAnService();

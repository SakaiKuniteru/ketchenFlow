const ApiError = require('../../../../utils/api-error');
const nhanVienRepository = require('./nhan-vien.repository');
const nhanVienFileService = require('./nhan-vien-file.service');

class NhanVienService {
    parseId(id) {
        const nhanVienId = Number(id);

        if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
            throw new ApiError(400, 'ID nhân viên không hợp lệ.');
        }

        return nhanVienId;
    }

    async getTongHop() {
        return await nhanVienRepository.getTongHop();
    }

    async getChiTiet(id) {
        const nhanVien = await nhanVienRepository.getChiTiet(id);

        if (!nhanVien) {
            throw new ApiError(404, 'Nhân viên không tồn tại.');
        }

        return nhanVien;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maQuocGia) {
            const quocGia = await nhanVienRepository.getQuocGiaByMa(duLieu.maQuocGia);

            if (!quocGia) {
                throw new ApiError(400, 'Mã quốc gia không tồn tại hoặc đã bị khóa.');
            }

            if (duLieu.quocGiaId && Number(duLieu.quocGiaId) !== Number(quocGia.id)) {
                throw new ApiError(400, 'Mã quốc gia và ID quốc gia không khớp nhau.');
            }

            duLieu.quocGiaId = quocGia.id;
        }

        if (duLieu.maTinhThanh) {
            const tinhThanh = await nhanVienRepository.getTinhThanhByMa(duLieu.maTinhThanh, duLieu.quocGiaId || null);

            if (!tinhThanh) {
                throw new ApiError(400, 'Mã tỉnh/thành không tồn tại, đã bị khóa hoặc không thuộc quốc gia đã chọn.');
            }

            if (duLieu.tinhThanhId && Number(duLieu.tinhThanhId) !== Number(tinhThanh.id)) {
                throw new ApiError(400, 'Mã tỉnh/thành và ID tỉnh/thành không khớp nhau.');
            }

            duLieu.tinhThanhId = tinhThanh.id;
        }

        if (duLieu.maXaPhuong) {
            const xaPhuong = await nhanVienRepository.getXaPhuongByMa(duLieu.maXaPhuong, duLieu.tinhThanhId || null);

            if (!xaPhuong) {
                throw new ApiError(400, 'Mã xã/phường không tồn tại, đã bị khóa hoặc không thuộc tỉnh/thành đã chọn.');
            }

            if (duLieu.xaPhuongId && Number(duLieu.xaPhuongId) !== Number(xaPhuong.id)) {
                throw new ApiError(400, 'Mã xã/phường và ID xã/phường không khớp nhau.');
            }

            duLieu.xaPhuongId = xaPhuong.id;
        }

        if (duLieu.maCoSo) {
            const coSo = await nhanVienRepository.getCoSoByMa(duLieu.maCoSo);

            if (!coSo) {
                throw new ApiError(400, 'Mã cơ sở không tồn tại hoặc đã bị khóa.');
            }

            if (duLieu.coSoId && Number(duLieu.coSoId) !== Number(coSo.id)) {
                throw new ApiError(400, 'Mã cơ sở và ID cơ sở không khớp nhau.');
            }

            duLieu.coSoId = coSo.id;
        }

        if (duLieu.maPhongBan) {
            const phongBan = await nhanVienRepository.getPhongBanByMa(duLieu.maPhongBan, duLieu.coSoId || null);

            if (!phongBan) {
                throw new ApiError(400, 'Mã phòng ban không tồn tại, đã bị khóa hoặc không thuộc cơ sở đã chọn.');
            }

            if (duLieu.phongBanId && Number(duLieu.phongBanId) !== Number(phongBan.id)) {
                throw new ApiError(400, 'Mã phòng ban và ID phòng ban không khớp nhau.');
            }

            duLieu.phongBanId = phongBan.id;
        }

        if (duLieu.maChucVu) {
            const chucVu = await nhanVienRepository.getChucVuByMa(duLieu.maChucVu);

            if (!chucVu) {
                throw new ApiError(400, 'Mã chức vụ không tồn tại hoặc đã bị khóa.');
            }

            if (duLieu.chucVuId && Number(duLieu.chucVuId) !== Number(chucVu.id)) {
                throw new ApiError(400, 'Mã chức vụ và ID chức vụ không khớp nhau.');
            }

            duLieu.chucVuId = chucVu.id;
        }

        const cacTruongId = ['quocGiaId', 'tinhThanhId', 'xaPhuongId', 'coSoId', 'phongBanId', 'chucVuId'];

        for (const tenTruong of cacTruongId) {
            if (duLieu[tenTruong] === '') {
                duLieu[tenTruong] = null;
                continue;
            }

            if (duLieu[tenTruong] !== null && duLieu[tenTruong] !== undefined) {
                duLieu[tenTruong] = Number(duLieu[tenTruong]);
            }
        }

        delete duLieu.maQuocGia;
        delete duLieu.maTinhThanh;
        delete duLieu.maXaPhuong;
        delete duLieu.maCoSo;
        delete duLieu.maPhongBan;
        delete duLieu.maChucVu;

        return duLieu;
    }

    async validateLienKet(data) {
        const { quocGiaId, tinhThanhId, xaPhuongId, coSoId, phongBanId, chucVuId } = data;

        if (quocGiaId) {
            const exists = await nhanVienRepository.existsQuocGia(quocGiaId);

            if (!exists) {
                throw new ApiError(400, 'Quốc gia không tồn tại hoặc đã bị khóa.');
            }
        }

        if (tinhThanhId) {
            const exists = await nhanVienRepository.existsTinhThanh(tinhThanhId, quocGiaId || null);

            if (!exists) {
                throw new ApiError(400, 'Tỉnh/thành không tồn tại, đã bị khóa hoặc không thuộc quốc gia đã chọn.');
            }
        }

        if (xaPhuongId) {
            const exists = await nhanVienRepository.existsXaPhuong(xaPhuongId, tinhThanhId || null);

            if (!exists) {
                throw new ApiError(400, 'Xã/phường không tồn tại, đã bị khóa hoặc không thuộc tỉnh/thành đã chọn.');
            }
        }

        if (coSoId) {
            const exists = await nhanVienRepository.existsCoSo(coSoId);

            if (!exists) {
                throw new ApiError(400, 'Cơ sở không tồn tại hoặc đã bị khóa.');
            }
        }

        if (phongBanId) {
            const exists = await nhanVienRepository.existsPhongBan(phongBanId, coSoId || null);

            if (!exists) {
                throw new ApiError(400, 'Phòng ban không tồn tại, đã bị khóa hoặc không thuộc cơ sở đã chọn.');
            }
        }

        if (chucVuId) {
            const exists = await nhanVienRepository.existsChucVu(chucVuId);

            if (!exists) {
                throw new ApiError(400, 'Chức vụ không tồn tại hoặc đã bị khóa.');
            }
        }
    }

    async validateTrungDuLieu(data, excludeId = 0) {
        const existsMaNhanVien = await nhanVienRepository.existsMaNhanVien(data.maNhanVien, excludeId);

        if (existsMaNhanVien) {
            throw new ApiError(400, 'Mã nhân viên đã tồn tại.');
        }

        if (data.soDienThoai) {
            const existsPhone = await nhanVienRepository.existsPhone(data.soDienThoai, excludeId);

            if (existsPhone) {
                throw new ApiError(400, 'Số điện thoại đã tồn tại.');
            }
        }

        if (data.email) {
            const existsEmail = await nhanVienRepository.existsEmail(data.email, excludeId);

            if (existsEmail) {
                throw new ApiError(400, 'Email đã tồn tại.');
            }
        }
    }

    async create(data, file) {
        let fileMoi = null;

        try {
            if (!data || typeof data !== 'object') {
                throw new ApiError(400, 'Dữ liệu nhân viên không hợp lệ.');
            }

            const duLieuDaChuanHoa = await this.chuanHoaLienKet(data);

            await this.validateTrungDuLieu(duLieuDaChuanHoa);

            await this.validateLienKet(duLieuDaChuanHoa);

            if (file) {
                fileMoi = await nhanVienFileService.saveFile(duLieuDaChuanHoa.maNhanVien, duLieuDaChuanHoa.hoTen, file);

                duLieuDaChuanHoa.anhDaiDien = fileMoi.relativePath;
            } else {
                duLieuDaChuanHoa.anhDaiDien = null;
            }

            const result = await nhanVienRepository.create(duLieuDaChuanHoa);

            if (file) {
                await nhanVienFileService.cleanupOldFiles(duLieuDaChuanHoa.maNhanVien, 3);
            }

            return await nhanVienRepository.getChiTiet(result.id);
        } catch (error) {
            if (fileMoi) {
                await nhanVienFileService.deletePhysicalFile(fileMoi.fullPath);
            } else {
                await nhanVienFileService.deleteTempFile(file);
            }

            throw error;
        }
    }

    async update(id, data, file) {
        let fileMoi = null;
        let daDoiThuMuc = false;
        let maNhanVienCu = null;
        let maNhanVienMoi = null;

        try {
            const nhanVienId = this.parseId(id);

            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new ApiError(400, 'Dữ liệu cập nhật nhân viên không hợp lệ.');
            }

            const nhanVien = await nhanVienRepository.getChiTiet(nhanVienId);

            if (!nhanVien) {
                throw new ApiError(404, 'Nhân viên không tồn tại.');
            }

            maNhanVienCu = nhanVien.maNhanVien;

            maNhanVienMoi = data.maNhanVien !== undefined ? data.maNhanVien.trim() : nhanVien.maNhanVien;

            const duLieuCapNhat = {
                maNhanVien: maNhanVienMoi,

                hoTen: data.hoTen !== undefined ? data.hoTen.trim() : nhanVien.hoTen,

                ngaySinh: data.ngaySinh !== undefined ? data.ngaySinh : nhanVien.ngaySinh,

                gioiTinh: data.gioiTinh !== undefined ? data.gioiTinh : nhanVien.gioiTinh,

                soDienThoai:
                    data.soDienThoai !== undefined
                        ? data.soDienThoai === null
                            ? null
                            : data.soDienThoai.trim() || null
                        : nhanVien.soDienThoai,

                email:
                    data.email !== undefined
                        ? data.email === null
                            ? null
                            : data.email.trim() || null
                        : nhanVien.email,

                anhDaiDien: nhanVien.anhDaiDien,

                diaChi:
                    data.diaChi !== undefined
                        ? data.diaChi === null
                            ? null
                            : data.diaChi.trim() || null
                        : nhanVien.diaChi,

                ghiChu:
                    data.ghiChu !== undefined
                        ? data.ghiChu === null
                            ? null
                            : data.ghiChu.trim() || null
                        : nhanVien.ghiChu,

                maThe:
                    data.maThe !== undefined
                        ? data.maThe === null
                            ? null
                            : data.maThe.trim() || null
                        : nhanVien.maThe,

                maQr: data.maQr !== undefined ? (data.maQr === null ? null : data.maQr.trim() || null) : nhanVien.maQr,

                maBarcode:
                    data.maBarcode !== undefined
                        ? data.maBarcode === null
                            ? null
                            : data.maBarcode.trim() || null
                        : nhanVien.maBarcode,

                quocGiaId:
                    data.quocGiaId !== undefined
                        ? data.quocGiaId
                        : data.maQuocGia !== undefined
                          ? undefined
                          : nhanVien.quocGiaId,

                maQuocGia:
                    data.maQuocGia !== undefined
                        ? data.maQuocGia === null
                            ? null
                            : data.maQuocGia.trim() || null
                        : undefined,

                tinhThanhId:
                    data.tinhThanhId !== undefined
                        ? data.tinhThanhId
                        : data.maTinhThanh !== undefined
                          ? undefined
                          : nhanVien.tinhThanhId,

                maTinhThanh:
                    data.maTinhThanh !== undefined
                        ? data.maTinhThanh === null
                            ? null
                            : data.maTinhThanh.trim() || null
                        : undefined,

                xaPhuongId:
                    data.xaPhuongId !== undefined
                        ? data.xaPhuongId
                        : data.maXaPhuong !== undefined
                          ? undefined
                          : nhanVien.xaPhuongId,

                maXaPhuong:
                    data.maXaPhuong !== undefined
                        ? data.maXaPhuong === null
                            ? null
                            : data.maXaPhuong.trim() || null
                        : undefined,

                coSoId:
                    data.coSoId !== undefined ? data.coSoId : data.maCoSo !== undefined ? undefined : nhanVien.coSoId,

                maCoSo:
                    data.maCoSo !== undefined ? (data.maCoSo === null ? null : data.maCoSo.trim() || null) : undefined,

                phongBanId:
                    data.phongBanId !== undefined
                        ? data.phongBanId
                        : data.maPhongBan !== undefined
                          ? undefined
                          : nhanVien.phongBanId,

                maPhongBan:
                    data.maPhongBan !== undefined
                        ? data.maPhongBan === null
                            ? null
                            : data.maPhongBan.trim() || null
                        : undefined,

                chucVuId:
                    data.chucVuId !== undefined
                        ? data.chucVuId
                        : data.maChucVu !== undefined
                          ? undefined
                          : nhanVien.chucVuId,

                maChucVu:
                    data.maChucVu !== undefined
                        ? data.maChucVu === null
                            ? null
                            : data.maChucVu.trim() || null
                        : undefined,

                active: data.active !== undefined ? data.active : nhanVien.active
            };

            const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

            await this.validateTrungDuLieu(duLieuDaChuanHoa, nhanVienId);

            await this.validateLienKet(duLieuDaChuanHoa);

            if (maNhanVienCu !== maNhanVienMoi) {
                await nhanVienFileService.renameNhanVienDirectory(maNhanVienCu, maNhanVienMoi);

                daDoiThuMuc = true;

                duLieuDaChuanHoa.anhDaiDien = nhanVienFileService.replaceMaNhanVienInPath(
                    duLieuDaChuanHoa.anhDaiDien,
                    maNhanVienCu,
                    maNhanVienMoi
                );
            }

            if (file) {
                fileMoi = await nhanVienFileService.saveFile(maNhanVienMoi, duLieuDaChuanHoa.hoTen, file);

                duLieuDaChuanHoa.anhDaiDien = fileMoi.relativePath;
            }

            const ketQua = await nhanVienRepository.update(nhanVienId, duLieuDaChuanHoa);

            if (!ketQua) {
                throw new ApiError(404, 'Nhân viên không tồn tại.');
            }

            if (file) {
                await nhanVienFileService.cleanupOldFiles(maNhanVienMoi, 3);
            }

            return ketQua;
        } catch (error) {
            if (fileMoi) {
                try {
                    await nhanVienFileService.deletePhysicalFile(fileMoi.fullPath);
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh nhân viên mới:', deleteError);
                }
            } else {
                try {
                    await nhanVienFileService.deleteTempFile(file);
                } catch (deleteTempError) {
                    console.error('Không thể xóa file temp nhân viên:', deleteTempError);
                }
            }

            if (daDoiThuMuc && maNhanVienCu && maNhanVienMoi) {
                try {
                    await nhanVienFileService.renameNhanVienDirectory(maNhanVienMoi, maNhanVienCu);
                } catch (rollbackError) {
                    console.error('Không thể rollback thư mục ảnh nhân viên:', rollbackError);
                }
            }

            throw error;
        }
    }
}

module.exports = new NhanVienService();

const fs = require('fs');

const path = require('path');

const { loaiXuatFile: dsLoaiXuatFile } = require('../../../../constants/enums');

const ApiError = require('../../../../utils/api-error');

const baoCaoRepository = require('./bao-cao.repository');

const DS_DUOI_WORD = ['.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm'];

const DS_DUOI_EXCEL = ['.xls', '.xlsx', '.xlsm', '.xlsb', '.xlt', '.xltx', '.xltm'];

const DS_MIME_WORD = [
    'application/msword',

    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'application/vnd.ms-word.document.macroenabled.12',

    'application/vnd.ms-word.template.macroenabled.12'
];

const DS_MIME_EXCEL = [
    'application/vnd.ms-excel',

    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'application/vnd.ms-excel.sheet.macroenabled.12',

    'application/vnd.ms-excel.sheet.binary.macroenabled.12',

    'application/vnd.ms-excel.template.macroenabled.12'
];

class BaoCaoService {
    parseId(id) {
        const baoCaoId = Number(id);

        if (!Number.isInteger(baoCaoId) || baoCaoId <= 0) {
            throw new ApiError(400, 'ID báo cáo không hợp lệ.');
        }

        return baoCaoId;
    }

    async getTongHop(query) {
        return await baoCaoRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const baoCaoId = this.parseId(id);

        const baoCao = await baoCaoRepository.getChiTiet(baoCaoId);

        if (!baoCao) {
            throw new ApiError(404, 'Báo cáo không tồn tại.');
        }

        return baoCao;
    }

    async getChiTietByMa(maBaoCao) {
        const maDaChuanHoa = String(maBaoCao || '').trim();

        if (!maDaChuanHoa) {
            throw new ApiError(400, 'Mã báo cáo không hợp lệ.');
        }

        const baoCao = await baoCaoRepository.getChiTietByMa(maDaChuanHoa);

        if (!baoCao) {
            throw new ApiError(404, 'Báo cáo không tồn tại.');
        }

        return baoCao;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await baoCaoRepository.existsMaBaoCao(data.maBaoCao, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã báo cáo đã tồn tại.');
        }

        const trungTen = await baoCaoRepository.existsTenBaoCao(data.tenBaoCao, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên báo cáo đã tồn tại.');
        }
    }

    validateLoaiXuatFile(loaiXuatFile) {
        if (loaiXuatFile === undefined || loaiXuatFile === null || loaiXuatFile === '') {
            return;
        }

        const hopLe = dsLoaiXuatFile.some((item) => Number(item.value) === Number(loaiXuatFile));

        if (!hopLe) {
            throw new ApiError(400, 'Loại xuất file không hợp lệ.');
        }
    }

    validateFileUpload(file) {
        if (!file) {
            return;
        }

        const duoiFile = path.extname(file.originalname).toLowerCase();

        const duoiFileHopLe = DS_DUOI_WORD.includes(duoiFile) || DS_DUOI_EXCEL.includes(duoiFile);

        const mimeTypeHopLe = DS_MIME_WORD.includes(file.mimetype) || DS_MIME_EXCEL.includes(file.mimetype);

        if (!duoiFileHopLe || !mimeTypeHopLe) {
            throw new ApiError(400, 'File mẫu không hợp lệ. Chỉ chấp nhận file Word hoặc Excel.');
        }
    }

    getDuongDanFileMau(file) {
        if (!file) {
            return null;
        }

        return path.posix.join('uploads', 'danh-muc', 'bao-cao', file.filename);
    }

    async xoaFileUpload(file) {
        if (!file || !file.path) {
            return;
        }

        try {
            await fs.promises.unlink(file.path);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Không thể xóa file báo cáo đã tải lên:', error);
            }
        }
    }

    async xoaFileMauCu(fileMau) {
        if (!fileMau) {
            return;
        }

        const duongDanTuongDoi = String(fileMau).trim().replace(/^\/+/, '');

        if (!duongDanTuongDoi.startsWith('uploads/')) {
            return;
        }

        const duongDanFile = path.join(process.cwd(), 'src', 'public', duongDanTuongDoi);

        try {
            await fs.promises.unlink(duongDanFile);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Không thể xóa file mẫu cũ: ${duongDanFile}`, error);
            }
        }
    }

    getLoaiFileMau(fileMau) {
        if (!fileMau) {
            throw new ApiError(400, 'Báo cáo chưa có file mẫu.');
        }

        const duoiFile = path.extname(fileMau).toLowerCase();

        if (DS_DUOI_WORD.includes(duoiFile)) {
            return 20;
        }

        if (DS_DUOI_EXCEL.includes(duoiFile)) {
            return 30;
        }

        throw new ApiError(400, 'File mẫu không hợp lệ. Chỉ chấp nhận file Word hoặc Excel.');
    }

    getDuoiFileTheoLoai(loaiXuatFile, fileMau) {
        if (Number(loaiXuatFile) === 10) {
            return '.pdf';
        }

        return path.extname(fileMau).toLowerCase();
    }

    xacDinhLoaiXuatThucTe(fileMau, loaiXuatFile) {
        const loaiFileMau = this.getLoaiFileMau(fileMau);

        this.validateLoaiXuatFile(loaiXuatFile);

        /*
         * Nếu chọn PDF thì xuất PDF.
         */
        if (Number(loaiXuatFile) === 10) {
            return 10;
        }

        /*
         * Word và Excel không chuyển đổi
         * qua lại với nhau.
         *
         * File mẫu Word  => xuất Word.
         * File mẫu Excel => xuất Excel.
         */
        return loaiFileMau;
    }

    async create(data, file) {
        try {
            const duLieu = {
                ...data
            };

            this.validateFileUpload(file);

            await this.validateTrungDuLieu(duLieu);

            this.validateLoaiXuatFile(duLieu.loaiXuatFile);

            const fileMau = this.getDuongDanFileMau(file);

            if (fileMau) {
                this.getLoaiFileMau(fileMau);
            }

            const duLieuTao = {
                maBaoCao: duLieu.maBaoCao.trim(),

                tenBaoCao: duLieu.tenBaoCao.trim(),

                fileMau,

                loaiXuatFile:
                    duLieu.loaiXuatFile !== undefined && duLieu.loaiXuatFile !== null && duLieu.loaiXuatFile !== ''
                        ? Number(duLieu.loaiXuatFile)
                        : null,

                moTa: duLieu.moTa?.trim() || null,

                active: duLieu.active !== undefined ? duLieu.active : true
            };

            return await baoCaoRepository.create(duLieuTao);
        } catch (error) {
            await this.xoaFileUpload(file);

            throw error;
        }
    }

    async update(id, data, file) {
        try {
            const baoCaoId = this.parseId(id);

            const baoCao = await baoCaoRepository.getChiTiet(baoCaoId);

            if (!baoCao) {
                throw new ApiError(404, 'Báo cáo không tồn tại.');
            }

            const coDuLieuCapNhat = Object.keys(data || {}).length > 0;

            if (!coDuLieuCapNhat && !file) {
                throw new ApiError(400, 'Phải truyền ít nhất một trường cần cập nhật hoặc file mẫu.');
            }

            const fileMauCu = baoCao.fileMau;

            this.validateFileUpload(file);

            const fileMauMoi = file ? this.getDuongDanFileMau(file) : baoCao.fileMau;

            const duLieuCapNhat = {
                maBaoCao: data.maBaoCao !== undefined ? data.maBaoCao.trim() : baoCao.maBaoCao,

                tenBaoCao: data.tenBaoCao !== undefined ? data.tenBaoCao.trim() : baoCao.tenBaoCao,

                fileMau: fileMauMoi,

                loaiXuatFile:
                    data.loaiXuatFile !== undefined
                        ? data.loaiXuatFile === null || data.loaiXuatFile === ''
                            ? null
                            : Number(data.loaiXuatFile)
                        : baoCao.loaiXuatFile,

                moTa: data.moTa !== undefined ? (data.moTa === null ? null : data.moTa.trim() || null) : baoCao.moTa,

                active: data.active !== undefined ? data.active : baoCao.active
            };

            await this.validateTrungDuLieu(duLieuCapNhat, baoCaoId);

            this.validateLoaiXuatFile(duLieuCapNhat.loaiXuatFile);

            if (duLieuCapNhat.fileMau) {
                this.getLoaiFileMau(duLieuCapNhat.fileMau);
            }

            const ketQua = await baoCaoRepository.update(baoCaoId, duLieuCapNhat);

            if (!ketQua) {
                throw new ApiError(404, 'Báo cáo không tồn tại.');
            }

            if (file && fileMauCu && fileMauCu !== ketQua.fileMau) {
                await this.xoaFileMauCu(fileMauCu);
            }

            return ketQua;
        } catch (error) {
            await this.xoaFileUpload(file);

            throw error;
        }
    }

    async getThongTinXuatBaoCao(idHoacMa) {
        let baoCao;

        const giaTri = String(idHoacMa || '').trim();

        if (!giaTri) {
            throw new ApiError(400, 'ID hoặc mã báo cáo là bắt buộc.');
        }

        if (/^\d+$/.test(giaTri)) {
            baoCao = await baoCaoRepository.getChiTiet(this.parseId(giaTri));
        } else {
            baoCao = await baoCaoRepository.getChiTietByMa(giaTri.trim());
        }

        if (!baoCao) {
            throw new ApiError(404, 'Báo cáo không tồn tại.');
        }

        if (!baoCao.active) {
            throw new ApiError(400, 'Báo cáo đã bị khóa.');
        }

        if (!baoCao.fileMau) {
            throw new ApiError(400, 'Báo cáo chưa được thiết lập file mẫu.');
        }

        const loaiFileMau = this.getLoaiFileMau(baoCao.fileMau);

        const loaiXuatThucTe = this.xacDinhLoaiXuatThucTe(baoCao.fileMau, baoCao.loaiXuatFile);

        const duoiFileXuat = this.getDuoiFileTheoLoai(loaiXuatThucTe, baoCao.fileMau);

        return {
            ...baoCao,

            loaiFileMau,

            loaiXuatThucTe,

            duoiFileXuat,

            tenFileXuat: `${baoCao.maBaoCao}${duoiFileXuat}`
        };
    }

    async xuatBaoCao(idHoacMa, loaiXuatFile) {
        const thongTin = await this.getThongTinXuatBaoCao(idHoacMa);

        const duongDanFile = path.join(process.cwd(), 'src', 'public', thongTin.fileMau);

        if (!fs.existsSync(duongDanFile)) {
            throw new ApiError(404, 'Không tìm thấy file mẫu báo cáo.');
        }

        const loaiXuatThucTe = this.xacDinhLoaiXuatThucTe(
            thongTin.fileMau,
            loaiXuatFile !== undefined ? loaiXuatFile : thongTin.loaiXuatFile
        );

        const duoiFile = this.getDuoiFileTheoLoai(loaiXuatThucTe, thongTin.fileMau);

        /*
         * Hiện tại chưa convert PDF.
         * Nếu yêu cầu PDF thì cần bổ sung bước chuyển đổi.
         */
        if (Number(loaiXuatThucTe) === 10) {
            throw new ApiError(501, 'Chức năng chuyển file sang PDF chưa được triển khai.');
        }

        return {
            duongDanFile,

            tenFile: `${thongTin.maBaoCao}${duoiFile}`
        };
    }
}
module.exports = new BaoCaoService();

const ApiError = require('../../../../utils/api-error');
const coSoRepository = require('./co-so.repository');
const coSoFileService = require('./co-so-file.service');

class CoSoService {
    parseId(id) {
        const coSoId = Number(id);

        if (!Number.isInteger(coSoId) || coSoId <= 0) {
            throw new ApiError(400, 'ID cơ sở không hợp lệ.');
        }

        return coSoId;
    }

    async getTongHop() {
        return await coSoRepository.getTongHop();
    }

    async getChiTiet(id) {
        const coSoId = Number(id);

        if (!Number.isInteger(coSoId) || coSoId <= 0) {
            throw new ApiError(400, 'ID cơ sở không hợp lệ.');
        }

        const coSo = await coSoRepository.getChiTiet(coSoId);

        if (!coSo) {
            throw new ApiError(404, 'Cơ sở không tồn tại.');
        }

        return coSo;
    }

    async chuanHoaDiaChi(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maQuocGia) {
            const quocGiaTheoMa = await coSoRepository.getQuocGiaByMa(duLieu.maQuocGia);

            if (!quocGiaTheoMa) {
                throw new ApiError(400, 'Mã quốc gia không tồn tại hoặc đã bị khóa.');
            }

            if (
                duLieu.quocGiaId !== undefined &&
                duLieu.quocGiaId !== null &&
                Number(duLieu.quocGiaId) !== Number(quocGiaTheoMa.id)
            ) {
                throw new ApiError(400, 'Mã quốc gia và ID quốc gia không khớp nhau.');
            }

            duLieu.quocGiaId = quocGiaTheoMa.id;
        }

        if (duLieu.maTinhThanh) {
            if (duLieu.quocGiaId === undefined || duLieu.quocGiaId === null) {
                throw new ApiError(400, 'Phải chọn quốc gia trước khi chọn tỉnh/thành.');
            }

            const tinhThanhTheoMa = await coSoRepository.getTinhThanhByMa(duLieu.maTinhThanh, Number(duLieu.quocGiaId));

            if (!tinhThanhTheoMa) {
                throw new ApiError(400, 'Mã tỉnh/thành không tồn tại, đã bị khóa hoặc không thuộc quốc gia đã chọn.');
            }

            if (
                duLieu.tinhThanhId !== undefined &&
                duLieu.tinhThanhId !== null &&
                Number(duLieu.tinhThanhId) !== Number(tinhThanhTheoMa.id)
            ) {
                throw new ApiError(400, 'Mã tỉnh/thành và ID tỉnh/thành không khớp nhau.');
            }

            duLieu.tinhThanhId = tinhThanhTheoMa.id;
        }

        if (duLieu.maXaPhuong) {
            if (duLieu.tinhThanhId === undefined || duLieu.tinhThanhId === null) {
                throw new ApiError(400, 'Phải chọn tỉnh/thành trước khi chọn xã/phường.');
            }

            const xaPhuongTheoMa = await coSoRepository.getXaPhuongByMa(duLieu.maXaPhuong, Number(duLieu.tinhThanhId));

            if (!xaPhuongTheoMa) {
                throw new ApiError(400, 'Mã xã/phường không tồn tại, đã bị khóa hoặc không thuộc tỉnh/thành đã chọn.');
            }

            if (
                duLieu.xaPhuongId !== undefined &&
                duLieu.xaPhuongId !== null &&
                Number(duLieu.xaPhuongId) !== Number(xaPhuongTheoMa.id)
            ) {
                throw new ApiError(400, 'Mã xã/phường và ID xã/phường không khớp nhau.');
            }

            duLieu.xaPhuongId = xaPhuongTheoMa.id;
        }

        if (
            duLieu.tinhThanhId !== undefined &&
            duLieu.tinhThanhId !== null &&
            (duLieu.quocGiaId === undefined || duLieu.quocGiaId === null)
        ) {
            throw new ApiError(400, 'Tỉnh/thành phải thuộc một quốc gia.');
        }

        if (
            duLieu.xaPhuongId !== undefined &&
            duLieu.xaPhuongId !== null &&
            (duLieu.tinhThanhId === undefined || duLieu.tinhThanhId === null)
        ) {
            throw new ApiError(400, 'Xã/phường phải thuộc một tỉnh/thành.');
        }

        duLieu.quocGiaId =
            duLieu.quocGiaId !== undefined && duLieu.quocGiaId !== null ? Number(duLieu.quocGiaId) : null;

        duLieu.tinhThanhId =
            duLieu.tinhThanhId !== undefined && duLieu.tinhThanhId !== null ? Number(duLieu.tinhThanhId) : null;

        duLieu.xaPhuongId =
            duLieu.xaPhuongId !== undefined && duLieu.xaPhuongId !== null ? Number(duLieu.xaPhuongId) : null;

        delete duLieu.maQuocGia;
        delete duLieu.maTinhThanh;
        delete duLieu.maXaPhuong;

        return duLieu;
    }

    async validateDuLieu(data, excludeId = null) {
        const { maCoSo, tenCoSo, quocGiaId, tinhThanhId, xaPhuongId } = data;

        const trungMa = await coSoRepository.existsMaCoSo(maCoSo, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã cơ sở đã tồn tại.');
        }

        const trungTen = await coSoRepository.existsTenCoSo(tenCoSo, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên cơ sở đã tồn tại.');
        }

        if (quocGiaId !== undefined && quocGiaId !== null) {
            const quocGiaTonTai = await coSoRepository.existsQuocGia(quocGiaId);

            if (!quocGiaTonTai) {
                throw new ApiError(400, 'Quốc gia không tồn tại hoặc đã bị khóa.');
            }
        }

        if (tinhThanhId !== undefined && tinhThanhId !== null && (quocGiaId === undefined || quocGiaId === null)) {
            throw new ApiError(400, 'Phải chọn quốc gia trước khi chọn tỉnh/thành.');
        }

        if (tinhThanhId !== undefined && tinhThanhId !== null) {
            const tinhThanhTonTai = await coSoRepository.existsTinhThanh(tinhThanhId, quocGiaId);

            if (!tinhThanhTonTai) {
                throw new ApiError(400, 'Tỉnh/thành không tồn tại, đã bị khóa hoặc không thuộc quốc gia đã chọn.');
            }
        }

        if (xaPhuongId !== undefined && xaPhuongId !== null && (tinhThanhId === undefined || tinhThanhId === null)) {
            throw new ApiError(400, 'Phải chọn tỉnh/thành trước khi chọn xã/phường.');
        }

        if (xaPhuongId !== undefined && xaPhuongId !== null) {
            const xaPhuongTonTai = await coSoRepository.existsXaPhuong(xaPhuongId, tinhThanhId);

            if (!xaPhuongTonTai) {
                throw new ApiError(400, 'Xã/phường không tồn tại, đã bị khóa hoặc không thuộc tỉnh/thành đã chọn.');
            }
        }
    }

    async create(data, files) {
        const danhSachFileMoi = [];

        try {
            const duLieuDaChuanHoa = await this.chuanHoaDiaChi(data);

            await this.validateDuLieu(duLieuDaChuanHoa);

            const maCoSo = duLieuDaChuanHoa.maCoSo.trim();

            const duLieuTao = {
                ...duLieuDaChuanHoa,
                logo: null,
                favicon: null,
                logoDoiTac: null
            };

            const logo = files?.logo?.[0];

            if (logo) {
                const fileMoi = await coSoFileService.saveFile(maCoSo, 'logo', logo);

                danhSachFileMoi.push(fileMoi);

                duLieuTao.logo = fileMoi.relativePath;
            }

            const favicon = files?.favicon?.[0];

            if (favicon) {
                const fileMoi = await coSoFileService.saveFile(maCoSo, 'favicon', favicon);

                danhSachFileMoi.push(fileMoi);

                duLieuTao.favicon = fileMoi.relativePath;
            }

            const logoDoiTac = files?.logoDoiTac?.[0];

            if (logoDoiTac) {
                const fileMoi = await coSoFileService.saveFile(maCoSo, 'logoDoiTac', logoDoiTac);

                danhSachFileMoi.push(fileMoi);

                duLieuTao.logoDoiTac = fileMoi.relativePath;
            }

            const ketQua = await coSoRepository.create(duLieuTao);

            if (logo) {
                await coSoFileService.cleanupOldFiles(maCoSo, 'logo', 3);
            }

            if (favicon) {
                await coSoFileService.cleanupOldFiles(maCoSo, 'favicon', 3);
            }

            if (logoDoiTac) {
                await coSoFileService.cleanupOldFiles(maCoSo, 'logoDoiTac', 3);
            }

            return ketQua;
        } catch (error) {
            for (const file of danhSachFileMoi) {
                await coSoFileService.deletePhysicalFile(file.fullPath);
            }

            await coSoFileService.deleteTempFiles(files);

            throw error;
        }
    }

    async update(id, data, files) {
        const danhSachFileMoi = [];

        try {
            const coSoId = this.parseId(id);

            const coSoHienTai = await coSoRepository.getChiTiet(coSoId);

            if (!coSoHienTai) {
                throw new ApiError(404, 'Cơ sở không tồn tại.');
            }

            const maCoSoCu = coSoHienTai.maCoSo;

            const maCoSoMoi = data.maCoSo !== undefined ? data.maCoSo.trim() : maCoSoCu;

            const duLieuCapNhat = {
                maCoSo: maCoSoMoi,

                tenCoSo: data.tenCoSo !== undefined ? data.tenCoSo.trim() : coSoHienTai.tenCoSo,

                diaChi:
                    data.diaChi !== undefined
                        ? data.diaChi === null
                            ? null
                            : data.diaChi.trim() || null
                        : coSoHienTai.diaChi,

                logo: coSoHienTai.logo,
                favicon: coSoHienTai.favicon,
                logoDoiTac: coSoHienTai.logoDoiTac,

                quocGiaId:
                    data.quocGiaId !== undefined
                        ? data.quocGiaId
                        : data.maQuocGia !== undefined
                          ? undefined
                          : coSoHienTai.quocGiaId,

                maQuocGia: data.maQuocGia !== undefined ? data.maQuocGia.trim() : undefined,

                tinhThanhId:
                    data.tinhThanhId !== undefined
                        ? data.tinhThanhId
                        : data.maTinhThanh !== undefined
                          ? undefined
                          : coSoHienTai.tinhThanhId,

                maTinhThanh: data.maTinhThanh !== undefined ? data.maTinhThanh.trim() : undefined,

                xaPhuongId:
                    data.xaPhuongId !== undefined
                        ? data.xaPhuongId
                        : data.maXaPhuong !== undefined
                          ? undefined
                          : coSoHienTai.xaPhuongId,

                maXaPhuong: data.maXaPhuong !== undefined ? data.maXaPhuong.trim() : undefined,

                active: data.active !== undefined ? data.active : coSoHienTai.active
            };

            const duLieuDaChuanHoa = await this.chuanHoaDiaChi(duLieuCapNhat);

            await this.validateDuLieu(duLieuDaChuanHoa, coSoId);

            if (maCoSoCu !== maCoSoMoi) {
                await coSoFileService.renameCoSoDirectory(maCoSoCu, maCoSoMoi);

                duLieuDaChuanHoa.logo = coSoFileService.replaceMaCoSoInPath(duLieuDaChuanHoa.logo, maCoSoCu, maCoSoMoi);

                duLieuDaChuanHoa.favicon = coSoFileService.replaceMaCoSoInPath(
                    duLieuDaChuanHoa.favicon,
                    maCoSoCu,
                    maCoSoMoi
                );

                duLieuDaChuanHoa.logoDoiTac = coSoFileService.replaceMaCoSoInPath(
                    duLieuDaChuanHoa.logoDoiTac,
                    maCoSoCu,
                    maCoSoMoi
                );
            }

            const logo = files?.logo?.[0];

            if (logo) {
                const fileMoi = await coSoFileService.saveFile(maCoSoMoi, 'logo', logo);

                danhSachFileMoi.push(fileMoi);

                duLieuDaChuanHoa.logo = fileMoi.relativePath;
            }

            const favicon = files?.favicon?.[0];

            if (favicon) {
                const fileMoi = await coSoFileService.saveFile(maCoSoMoi, 'favicon', favicon);

                danhSachFileMoi.push(fileMoi);

                duLieuDaChuanHoa.favicon = fileMoi.relativePath;
            }

            const logoDoiTac = files?.logoDoiTac?.[0];

            if (logoDoiTac) {
                const fileMoi = await coSoFileService.saveFile(maCoSoMoi, 'logoDoiTac', logoDoiTac);

                danhSachFileMoi.push(fileMoi);

                duLieuDaChuanHoa.logoDoiTac = fileMoi.relativePath;
            }

            const ketQua = await coSoRepository.update(coSoId, duLieuDaChuanHoa);

            if (!ketQua) {
                throw new ApiError(404, 'Cơ sở không tồn tại.');
            }

            if (logo) {
                await coSoFileService.cleanupOldFiles(maCoSoMoi, 'logo', 3);
            }

            if (favicon) {
                await coSoFileService.cleanupOldFiles(maCoSoMoi, 'favicon', 3);
            }

            if (logoDoiTac) {
                await coSoFileService.cleanupOldFiles(maCoSoMoi, 'logoDoiTac', 3);
            }

            return ketQua;
        } catch (error) {
            for (const file of danhSachFileMoi) {
                await coSoFileService.deletePhysicalFile(file.fullPath);
            }

            await coSoFileService.deleteTempFiles(files);

            throw error;
        }
    }
}

module.exports = new CoSoService();

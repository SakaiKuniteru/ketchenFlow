const ApiError = require('../../../../utils/api-error');

const tinhThanhRepository = require('./tinh-thanh.repository');

class TinhThanhService {
    async getTongHop(query) {
        return await tinhThanhRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const tinhThanh = await tinhThanhRepository.getChiTiet(id);

        if (!tinhThanh) {
            throw new ApiError(404, 'Tỉnh thành không tồn tại.');
        }

        return tinhThanh;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maQuocGia) {
            const quocGia = await tinhThanhRepository.getQuocGiaByMa(duLieu.maQuocGia);

            if (!quocGia) {
                throw new ApiError(400, 'Mã quốc gia không tồn tại.');
            }

            if (!quocGia.active) {
                throw new ApiError(400, 'Quốc gia đã bị khóa.');
            }

            if (duLieu.quocGiaId && Number(duLieu.quocGiaId) !== Number(quocGia.id)) {
                throw new ApiError(400, 'ID quốc gia và mã quốc gia không khớp.');
            }

            duLieu.quocGiaId = quocGia.id;
        }

        if (duLieu.quocGiaId) {
            duLieu.quocGiaId = Number(duLieu.quocGiaId);
        }

        delete duLieu.maQuocGia;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!data.quocGiaId) {
            throw new ApiError(400, 'Quốc gia là bắt buộc.');
        }

        const quocGiaTonTai = await tinhThanhRepository.existsQuocGia(data.quocGiaId);

        if (!quocGiaTonTai) {
            throw new ApiError(400, 'Quốc gia không tồn tại hoặc đã bị khóa.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await tinhThanhRepository.existsMaTinhThanh(data.maTinhThanh, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã tỉnh thành đã tồn tại.');
        }

        const trungTen = await tinhThanhRepository.existsTenTinhThanh(data.tenTinhThanh, data.quocGiaId, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên tỉnh thành đã tồn tại trong quốc gia này.');
        }
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);

        await this.validateLienKet(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maTinhThanh: duLieu.maTinhThanh.trim(),

            tenTinhThanh: duLieu.tenTinhThanh.trim(),

            tenVietTat: duLieu.tenVietTat?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await tinhThanhRepository.create(duLieuTao);
    }

    async update(id, data) {
        const tinhThanh = await tinhThanhRepository.getChiTiet(id);

        if (!tinhThanh) {
            throw new ApiError(404, 'Tỉnh thành không tồn tại.');
        }

        const duLieuCapNhat = {
            maTinhThanh: data.maTinhThanh !== undefined ? data.maTinhThanh.trim() : tinhThanh.maTinhThanh,

            tenTinhThanh: data.tenTinhThanh !== undefined ? data.tenTinhThanh.trim() : tinhThanh.tenTinhThanh,

            tenVietTat:
                data.tenVietTat !== undefined
                    ? data.tenVietTat === null
                        ? null
                        : data.tenVietTat.trim() || null
                    : tinhThanh.tenVietTat,

            quocGiaId: data.quocGiaId !== undefined ? data.quocGiaId : tinhThanh.quocGiaId,

            maQuocGia:
                data.maQuocGia !== undefined
                    ? data.maQuocGia === null
                        ? null
                        : data.maQuocGia.trim() || null
                    : undefined,

            active: data.active !== undefined ? data.active : tinhThanh.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, id);

        const ketQua = await tinhThanhRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Tỉnh thành không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new TinhThanhService();

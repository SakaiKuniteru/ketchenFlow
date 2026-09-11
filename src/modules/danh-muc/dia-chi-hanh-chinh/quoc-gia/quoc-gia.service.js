const ApiError = require('../../../../utils/api-error');

const quocGiaRepository = require('./quoc-gia.repository');

class QuocGiaService {
    async getTongHop(query) {
        return await quocGiaRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const quocGia = await quocGiaRepository.getChiTiet(id);

        if (!quocGia) {
            throw new ApiError(404, 'Quốc gia không tồn tại.');
        }

        return quocGia;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMaQuocGia = await quocGiaRepository.existsMaQuocGia(data.maQuocGia, excludeId);

        if (trungMaQuocGia) {
            throw new ApiError(409, 'Mã quốc gia đã tồn tại.');
        }

        const trungTenQuocGia = await quocGiaRepository.existsTenQuocGia(data.tenQuocGia, excludeId);

        if (trungTenQuocGia) {
            throw new ApiError(409, 'Tên quốc gia đã tồn tại.');
        }

        const trungMaDienThoai = await quocGiaRepository.existsMaDienThoai(data.maDienThoai, excludeId);

        if (trungMaDienThoai) {
            throw new ApiError(409, 'Mã điện thoại đã tồn tại.');
        }

        const trungMaIso2 = await quocGiaRepository.existsMaIso2(data.maIso2, excludeId);

        if (trungMaIso2) {
            throw new ApiError(409, 'Mã ISO 2 đã tồn tại.');
        }

        const trungMaIso3 = await quocGiaRepository.existsMaIso3(data.maIso3, excludeId);

        if (trungMaIso3) {
            throw new ApiError(409, 'Mã ISO 3 đã tồn tại.');
        }
    }

    async create(data) {
        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maQuocGia: duLieu.maQuocGia.trim(),

            tenQuocGia: duLieu.tenQuocGia.trim(),

            tenTiengAnh: duLieu.tenTiengAnh?.trim(),

            maDienThoai: duLieu.maDienThoai?.trim(),

            tenVietTat: duLieu.tenVietTat?.trim(),

            maIso2: duLieu.maIso2?.trim(),

            maIso3: duLieu.maIso3?.trim(),

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await quocGiaRepository.create(duLieuTao);
    }

    async update(id, data) {
        const quocGia = await quocGiaRepository.getChiTiet(id);

        if (!quocGia) {
            throw new ApiError(404, 'Quốc gia không tồn tại.');
        }

        await this.validateTrungDuLieu(data, id);

        const duLieuCapNhat = {
            maQuocGia: data.maQuocGia !== undefined ? data.maQuocGia.trim() : quocGia.maQuocGia,

            tenQuocGia: data.tenQuocGia !== undefined ? data.tenQuocGia.trim() : quocGia.tenQuocGia,

            tenTiengAnh:
                data.tenTiengAnh !== undefined
                    ? data.tenTiengAnh === null
                        ? null
                        : data.tenTiengAnh.trim() || null
                    : quocGia.tenTiengAnh,

            maDienThoai:
                data.maDienThoai !== undefined
                    ? data.maDienThoai === null
                        ? null
                        : data.maDienThoai.trim() || null
                    : quocGia.maDienThoai,

            tenVietTat:
                data.tenVietTat !== undefined
                    ? data.tenVietTat === null
                        ? null
                        : data.tenVietTat.trim() || null
                    : quocGia.tenVietTat,

            maIso2:
                data.maIso2 !== undefined ? (data.maIso2 === null ? null : data.maIso2.trim() || null) : quocGia.maIso2,

            maIso3:
                data.maIso3 !== undefined ? (data.maIso3 === null ? null : data.maIso3.trim() || null) : quocGia.maIso3,

            active: data.active !== undefined ? data.active : quocGia.active
        };

        const ketQua = await quocGiaRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Quốc gia không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new QuocGiaService();

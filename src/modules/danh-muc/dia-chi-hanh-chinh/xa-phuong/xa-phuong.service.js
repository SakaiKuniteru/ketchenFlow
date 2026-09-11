const ApiError = require('../../../../utils/api-error');

const xaPhuongRepository = require('./xa-phuong.repository');

class XaPhuongService {
    async getTongHop(query) {
        return await xaPhuongRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const xaPhuong = await xaPhuongRepository.getChiTiet(id);

        if (!xaPhuong) {
            throw new ApiError(404, 'Xã/Phường không tồn tại.');
        }

        return xaPhuong;
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (duLieu.maTinhThanh) {
            const tinhThanh = await xaPhuongRepository.getTinhThanhByMa(duLieu.maTinhThanh);

            if (!tinhThanh) {
                throw new ApiError(400, 'Mã Tỉnh/Thành phố không tồn tại.');
            }

            if (!tinhThanh.active) {
                throw new ApiError(400, 'Tỉnh/Thành phố đã bị khóa.');
            }

            if (duLieu.tinhThanhId && Number(duLieu.tinhThanhId) !== Number(tinhThanh.id)) {
                throw new ApiError(400, 'ID Tỉnh/Thành phố và mã Tỉnh/Thành phố không khớp.');
            }

            duLieu.tinhThanhId = tinhThanh.id;
        }

        if (duLieu.tinhThanhId) {
            duLieu.tinhThanhId = Number(duLieu.tinhThanhId);
        }

        delete duLieu.maTinhThanh;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!data.tinhThanhId) {
            throw new ApiError(400, 'Tỉnh/Thành phố là bắt buộc.');
        }

        const tinhThanhTonTai = await xaPhuongRepository.existsTinhThanh(data.tinhThanhId);

        if (!tinhThanhTonTai) {
            throw new ApiError(400, 'Tỉnh/Thành phố không tồn tại hoặc đã bị khóa.');
        }
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await xaPhuongRepository.existsMaXaPhuong(data.maXaPhuong, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã Xã/Phường đã tồn tại.');
        }

        const trungTen = await xaPhuongRepository.existsTenXaPhuong(data.tenXaPhuong, data.tinhThanhId, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên Xã/Phường đã tồn tại trong Tỉnh/Thành phố này.');
        }
    }

    async create(data) {
        const duLieu = await this.chuanHoaLienKet(data);

        await this.validateLienKet(duLieu);

        await this.validateTrungDuLieu(duLieu);

        const duLieuTao = {
            ...duLieu,

            maXaPhuong: duLieu.maXaPhuong.trim(),

            tenXaPhuong: duLieu.tenXaPhuong.trim(),

            tenVietTat: duLieu.tenVietTat?.trim() || null,

            active: duLieu.active !== undefined ? duLieu.active : true
        };

        return await xaPhuongRepository.create(duLieuTao);
    }

    async update(id, data) {
        const xaPhuong = await xaPhuongRepository.getChiTiet(id);

        if (!xaPhuong) {
            throw new ApiError(404, 'Xã/Phường không tồn tại.');
        }

        const duLieuCapNhat = {
            maXaPhuong: data.maXaPhuong !== undefined ? data.maXaPhuong.trim() : xaPhuong.maXaPhuong,

            tenXaPhuong: data.tenXaPhuong !== undefined ? data.tenXaPhuong.trim() : xaPhuong.tenXaPhuong,

            tenVietTat:
                data.tenVietTat !== undefined
                    ? data.tenVietTat === null
                        ? null
                        : data.tenVietTat.trim() || null
                    : xaPhuong.tenVietTat,

            tinhThanhId: data.tinhThanhId !== undefined ? data.tinhThanhId : xaPhuong.tinhThanhId,

            maTinhThanh:
                data.maTinhThanh !== undefined
                    ? data.maTinhThanh === null
                        ? null
                        : data.maTinhThanh.trim() || null
                    : undefined,

            active: data.active !== undefined ? data.active : xaPhuong.active
        };

        const duLieuDaChuanHoa = await this.chuanHoaLienKet(duLieuCapNhat);

        await this.validateLienKet(duLieuDaChuanHoa);

        await this.validateTrungDuLieu(duLieuDaChuanHoa, id);

        console.log('duLieuDaChuanHoa:', duLieuDaChuanHoa);

        const ketQua = await xaPhuongRepository.update(id, duLieuDaChuanHoa);

        if (!ketQua) {
            throw new ApiError(404, 'Xã/Phường không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new XaPhuongService();

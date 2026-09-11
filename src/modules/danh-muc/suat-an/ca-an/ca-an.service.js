const ApiError = require('../../../../utils/api-error');
const caAnRepository = require('./ca-an.repository');

class CaAnService {
    async getTongHop(query) {
        return await caAnRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const caAn = await caAnRepository.getChiTiet(id);

        if (!caAn) {
            throw new ApiError(404, 'Ca ăn không tồn tại.');
        }

        return caAn;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        if (data.maCaAn !== undefined) {
            const trungMa = await caAnRepository.existsMaCaAn(data.maCaAn, excludeId);

            if (trungMa) {
                throw new ApiError(409, 'Mã ca ăn đã tồn tại.');
            }
        }

        if (data.tenCaAn !== undefined) {
            const trungTen = await caAnRepository.existsTenCaAn(data.tenCaAn, excludeId);

            if (trungTen) {
                throw new ApiError(409, 'Tên ca ăn đã tồn tại.');
            }
        }

        if (data.thoiGianBatDau !== undefined && data.thoiGianKetThuc !== undefined) {
            const trungKhoangThoiGian = await caAnRepository.existsKhoangThoiGian(
                data.thoiGianBatDau,
                data.thoiGianKetThuc,
                excludeId
            );

            if (trungKhoangThoiGian) {
                throw new ApiError(
                    409,
                    `Đã tồn tại thời gian trong khoảng ${data.thoiGianBatDau} - ${data.thoiGianKetThuc}.`
                );
            }
        }
    }

    validateThoiGian(thoiGianBatDau, thoiGianKetThuc) {
        if (!thoiGianBatDau || !thoiGianKetThuc) {
            throw new ApiError(400, 'Thời gian bắt đầu và thời gian kết thúc không được để trống.');
        }

        const chuyenThoiGianThanhGiay = (thoiGian) => {
            if (typeof thoiGian !== 'string') {
                throw new ApiError(400, 'Thời gian ca ăn không hợp lệ.');
            }

            const dinhDangThoiGian = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

            if (!dinhDangThoiGian.test(thoiGian)) {
                throw new ApiError(400, 'Thời gian ca ăn phải có định dạng HH:mm hoặc HH:mm:ss.');
            }

            const [gio, phut, giay = 0] = thoiGian.split(':').map(Number);

            return gio * 3600 + phut * 60 + giay;
        };

        const batDauTheoGiay = chuyenThoiGianThanhGiay(thoiGianBatDau);

        const ketThucTheoGiay = chuyenThoiGianThanhGiay(thoiGianKetThuc);

        if (ketThucTheoGiay <= batDauTheoGiay) {
            throw new ApiError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
        }
    }

    async create(data) {
        const duLieuTao = {
            maCaAn: data.maCaAn.trim(),
            tenCaAn: data.tenCaAn.trim(),
            thoiGianBatDau: data.thoiGianBatDau.trim(),
            thoiGianKetThuc: data.thoiGianKetThuc.trim(),
            active: data.active !== undefined ? data.active : true
        };

        this.validateThoiGian(duLieuTao.thoiGianBatDau, duLieuTao.thoiGianKetThuc);

        await this.validateTrungDuLieu(duLieuTao);

        return await caAnRepository.create(duLieuTao);
    }

    async update(id, data) {
        const caAn = await caAnRepository.getChiTiet(id);

        if (!caAn) {
            throw new ApiError(404, 'Ca ăn không tồn tại.');
        }

        const duLieuCapNhat = {
            maCaAn: data.maCaAn !== undefined ? data.maCaAn.trim() : caAn.maCaAn,

            tenCaAn: data.tenCaAn !== undefined ? data.tenCaAn.trim() : caAn.tenCaAn,

            thoiGianBatDau: data.thoiGianBatDau !== undefined ? data.thoiGianBatDau.trim() : caAn.thoiGianBatDau,

            thoiGianKetThuc: data.thoiGianKetThuc !== undefined ? data.thoiGianKetThuc.trim() : caAn.thoiGianKetThuc,

            active: data.active !== undefined ? data.active : caAn.active
        };

        this.validateThoiGian(duLieuCapNhat.thoiGianBatDau, duLieuCapNhat.thoiGianKetThuc);

        await this.validateTrungDuLieu(
            {
                maCaAn: data.maCaAn !== undefined ? duLieuCapNhat.maCaAn : undefined,

                tenCaAn: data.tenCaAn !== undefined ? duLieuCapNhat.tenCaAn : undefined,

                thoiGianBatDau:
                    data.thoiGianBatDau !== undefined || data.thoiGianKetThuc !== undefined
                        ? duLieuCapNhat.thoiGianBatDau
                        : undefined,

                thoiGianKetThuc:
                    data.thoiGianBatDau !== undefined || data.thoiGianKetThuc !== undefined
                        ? duLieuCapNhat.thoiGianKetThuc
                        : undefined
            },
            id
        );

        const ketQua = await caAnRepository.update(id, duLieuCapNhat);

        if (!ketQua) {
            throw new ApiError(404, 'Ca ăn không tồn tại.');
        }

        return ketQua;
    }
}

module.exports = new CaAnService();

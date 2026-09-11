const ApiError = require('../../../../utils/api-error');

const diaChiRepository = require('./dia-chi.repository');

class DiaChiService {
    parseId(id) {
        const diaChiId = Number(id);

        if (!Number.isInteger(diaChiId) || diaChiId <= 0) {
            throw new ApiError(400, 'ID địa chỉ không hợp lệ.');
        }

        return diaChiId;
    }

    async getTongHop() {
        return await diaChiRepository.getTongHop();
    }

    async getChiTiet(id) {
        const diaChiId = this.parseId(id);

        const diaChi = await diaChiRepository.getChiTiet(diaChiId);

        if (!diaChi) {
            throw new ApiError(404, 'Địa chỉ không tồn tại.');
        }

        return diaChi;
    }
}

module.exports = new DiaChiService();

"use strict";

const enums = require("../../../../constants/enums");
const repository = require("./lich-su-don-hang.repository");
const { enumName } = require("../don-hang/don-hang.mapper");

class LichSuDonHangService {
    async list(donHangId, client) {
        const rows = await repository.list(donHangId, client);
        return rows.map(item => ({
            ...item,
            tenTrangThaiCu: enumName(enums.trangThaiDonHang, item.trangThaiCu),
            tenTrangThaiMoi: enumName(enums.trangThaiDonHang, item.trangThaiMoi)
        }));
    }
}

module.exports = new LichSuDonHangService();

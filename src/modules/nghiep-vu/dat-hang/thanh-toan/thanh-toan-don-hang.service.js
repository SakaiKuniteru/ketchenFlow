"use strict";

const pool = require("../../../../config/database");
const ApiError = require("../../../../utils/api-error");
const orderRepository = require("../don-hang/don-hang.repository");
const repository = require("./thanh-toan-don-hang.repository");
const { PHUONG_THUC_THANH_TOAN, TRANG_THAI_THANH_TOAN } = require("../don-hang/don-hang.constants");
const { LOAI_GIAO_DICH, TRANG_THAI_GIAO_DICH } = require("./thanh-toan.constants");
const gateways = {
    [PHUONG_THUC_THANH_TOAN.NOI_BO]: require("./gateways/noi-bo-payment.gateway"),
    [PHUONG_THUC_THANH_TOAN.TIEN_MAT]: require("./gateways/tien-mat-payment.gateway"),
    [PHUONG_THUC_THANH_TOAN.CHUYEN_KHOAN]: require("./gateways/chuyen-khoan-payment.gateway"),
    [PHUONG_THUC_THANH_TOAN.QR]: require("./gateways/qr-payment.gateway")
};

class ThanhToanService {
    async create(donHangId, user) {
        const order = await orderRepository.getById(donHangId);
        if (!order || Number(order.nguoi_dat_id) !== Number(user.nhanVienId)) throw new ApiError(404, "Đơn hàng không tồn tại.");
        if (order.trang_thai_thanh_toan === TRANG_THAI_THANH_TOAN.DA_THANH_TOAN) throw new ApiError(409, "Đơn hàng đã được thanh toán.");
        const gateway = gateways[order.phuong_thuc_thanh_toan];
        const gatewayData = await gateway.create(order);
        return repository.create({ donHangId, loaiGiaoDich: LOAI_GIAO_DICH.THANH_TOAN, phuongThuc: order.phuong_thuc_thanh_toan, soTien: order.tong_thanh_toan, trangThai: gatewayData.choXuLy ? TRANG_THAI_GIAO_DICH.CHO_XU_LY : TRANG_THAI_GIAO_DICH.KHOI_TAO, nguoiKhoiTaoId: user.nhanVienId, ...gatewayData });
    }

    async list(donHangId, user) {
        const order = await orderRepository.getById(donHangId);
        if (!order || Number(order.nguoi_dat_id) !== Number(user.nhanVienId)) {
            throw new ApiError(404, "Đơn hàng không tồn tại.");
        }
        return repository.list(donHangId);
    }

    async confirm(id, data, user) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const result = await repository.confirm(id, { ...data, trangThai: TRANG_THAI_GIAO_DICH.THANH_CONG }, user.nhanVienId, client);
            if (!result.rowCount) throw new ApiError(404, "Giao dịch không tồn tại hoặc mã giao dịch không đúng.");
            await client.query(`UPDATE nv_don_hang SET trang_thai_thanh_toan = $2, updated_at = NOW() WHERE id = $1`, [result.rows[0].don_hang_id, TRANG_THAI_THANH_TOAN.DA_THANH_TOAN]);
            await client.query("COMMIT");
            return repository.list(result.rows[0].don_hang_id);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally { client.release(); }
    }
}

module.exports = new ThanhToanService();

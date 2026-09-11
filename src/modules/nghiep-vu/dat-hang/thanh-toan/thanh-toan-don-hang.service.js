'use strict';

const pool = require('../../../../config/database');
const ApiError = require('../../../../utils/api-error');
const orderRepository = require('../don-hang/don-hang.repository');
const repository = require('./thanh-toan-don-hang.repository');
const { PHUONG_THUC_THANH_TOAN, TRANG_THAI_THANH_TOAN } = require('../don-hang/don-hang.constants');
const cartService = require('../gio-hang/gio-hang.service');
const historyRepository = require('../lich-su/lich-su-don-hang.repository');
const { LOAI_GIAO_DICH, TRANG_THAI_GIAO_DICH } = require('./thanh-toan.constants');
const gateways = {
    [PHUONG_THUC_THANH_TOAN.NOI_BO]: require('./gateways/noi-bo-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.TIEN_MAT]: require('./gateways/tien-mat-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.CHUYEN_KHOAN]: require('./gateways/chuyen-khoan-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.QR]: require('./gateways/qr-payment.gateway')
};

class ThanhToanService {
    async create(donHangId, user, manager = false) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const order = await orderRepository.getById(donHangId, client, true);
            const profile = manager ? await cartService.getNhanVien(user.nhanVienId, client) : null;
            if (
                !order ||
                (manager
                    ? Number(order.co_so_id) !== Number(profile.coSoId)
                    : Number(order.nguoi_dat_id) !== Number(user.nhanVienId))
            )
                throw new ApiError(404, 'Đơn hàng không tồn tại.');
            if (
                order.trang_thai < 0 ||
                [TRANG_THAI_THANH_TOAN.DA_THANH_TOAN, TRANG_THAI_THANH_TOAN.DA_HOAN_TIEN].includes(
                    order.trang_thai_thanh_toan
                )
            )
                throw new ApiError(409, 'Đơn hàng không còn cho phép thanh toán.');
            const transactions = await repository.list(donHangId, client);
            const pending = transactions.find(
                (row) =>
                    [TRANG_THAI_GIAO_DICH.KHOI_TAO, TRANG_THAI_GIAO_DICH.CHO_XU_LY].includes(row.trangThai) &&
                    (!row.qrHetHanLuc || new Date(row.qrHetHanLuc) > new Date())
            );
            if (pending) {
                await client.query('COMMIT');
                return pending;
            }
            const gateway = gateways[order.phuong_thuc_thanh_toan];
            const gatewayData = await gateway.create(order);
            const transaction = await repository.create(
                {
                    donHangId,
                    loaiGiaoDich: LOAI_GIAO_DICH.THANH_TOAN,
                    phuongThuc: order.phuong_thuc_thanh_toan,
                    soTien: order.tong_thanh_toan,
                    trangThai: gatewayData.choXuLy ? TRANG_THAI_GIAO_DICH.CHO_XU_LY : TRANG_THAI_GIAO_DICH.KHOI_TAO,
                    nguoiKhoiTaoId: user.nhanVienId,
                    ...gatewayData
                },
                client
            );
            await client.query('COMMIT');
            return transaction;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async list(donHangId, user) {
        const order = await orderRepository.getById(donHangId);
        if (!order || Number(order.nguoi_dat_id) !== Number(user.nhanVienId)) {
            throw new ApiError(404, 'Đơn hàng không tồn tại.');
        }
        return repository.list(donHangId);
    }

    async confirm(id, data, user) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const transaction = await client.query('SELECT don_hang_id FROM nv_thanh_toan_don_hang WHERE id = $1', [
                id
            ]);
            if (!transaction.rows.length) throw new ApiError(404, 'Giao dịch không tồn tại.');
            const order = await orderRepository.getById(transaction.rows[0].don_hang_id, client, true);
            const profile = await cartService.getNhanVien(user.nhanVienId, client);
            if (Number(order.co_so_id) !== Number(profile.coSoId))
                throw new ApiError(403, 'Không thể xác nhận thanh toán của cơ sở khác.');
            if (
                order.trang_thai < 0 ||
                [TRANG_THAI_THANH_TOAN.DA_THANH_TOAN, TRANG_THAI_THANH_TOAN.DA_HOAN_TIEN].includes(
                    order.trang_thai_thanh_toan
                )
            )
                throw new ApiError(409, 'Đơn đã hủy, đã thanh toán hoặc đã hoàn tiền.');
            const result = await repository.confirm(
                id,
                { ...data, trangThai: TRANG_THAI_GIAO_DICH.THANH_CONG },
                user.nhanVienId,
                client
            );
            if (!result.rowCount)
                throw new ApiError(409, 'Giao dịch đã xử lý, đã hết hạn hoặc mã giao dịch không đúng.');
            await client.query(
                `UPDATE nv_don_hang SET trang_thai_thanh_toan = $2, version = version + 1, updated_at = NOW() WHERE id = $1`,
                [result.rows[0].don_hang_id, TRANG_THAI_THANH_TOAN.DA_THANH_TOAN]
            );
            await historyRepository.create(
                {
                    donHangId: order.id,
                    trangThaiCu: order.trang_thai,
                    trangThaiMoi: order.trang_thai,
                    hanhDong: 'XAC_NHAN_THANH_TOAN',
                    noiDung: `Đã xác nhận nhận thanh toán · ${data.maGiaoDich}`,
                    nguoiThucHienId: user.nhanVienId
                },
                client
            );
            await client.query('COMMIT');
            return repository.list(result.rows[0].don_hang_id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new ThanhToanService();

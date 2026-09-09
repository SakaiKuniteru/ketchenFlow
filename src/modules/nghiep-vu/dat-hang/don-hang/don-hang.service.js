"use strict";

const pool = require("../../../../config/database");
const ApiError = require("../../../../utils/api-error");
const repository = require("./don-hang.repository");
const historyRepository = require("../lich-su/lich-su-don-hang.repository");
const historyService = require("../lich-su/lich-su-don-hang.service");
const voucherUsageRepository = require("../voucher/voucher-su-dung.repository");
const cartService = require("../gio-hang/gio-hang.service");
const { generateOrderCode } = require("./don-hang-code.service");
const { mapOrder, enumName } = require("./don-hang.mapper");
const { TRANG_THAI_DON_HANG, TRANG_THAI_CHI_TIET, TRANG_THAI_THANH_TOAN, PHUONG_THUC_THANH_TOAN, CHUYEN_TRANG_THAI } = require("./don-hang.constants");
const enums = require("../../../../constants/enums");
const { listSchema } = require("./don-hang.validation");
const notificationService = require("../thong-bao/thong-bao-don-hang.service");
const paymentRepository = require("../thanh-toan/thanh-toan-don-hang.repository");

function validateQuery(query) {
    const { error, value } = listSchema.validate(query, { abortEarly: false, stripUnknown: true });
    if (error) throw new ApiError(400, error.details.map(item => item.message).join(", "));
    return value;
}

class DonHangService {
    async validateDelivery(data, client) {
        const result = await client.query(
            `
                SELECT
                    EXISTS(
                        SELECT 1 FROM dm_dia_diem_nhan_hang
                        WHERE id = $1 AND co_so_id = $3 AND active = TRUE
                    ) AS dia_diem_hop_le,
                    EXISTS(
                        SELECT 1 FROM dm_khung_gio_nhan_hang
                        WHERE id = $2 AND co_so_id = $3 AND active = TRUE
                    ) AS khung_gio_hop_le,
                    (
                        SELECT so_don_toi_da FROM dm_khung_gio_nhan_hang
                        WHERE id = $2
                    ) AS so_don_toi_da,
                    (
                        SELECT COUNT(*) FROM nv_don_hang
                        WHERE khung_gio_nhan_id = $2
                            AND thoi_gian_nhan_tu::DATE = $4::TIMESTAMP::DATE
                            AND trang_thai NOT IN ($5, $6)
                    )::INTEGER AS so_don_da_dat
            `,
            [data.diaDiemNhanId, data.khungGioNhanId, data.coSoId, data.thoiGianNhanTu, TRANG_THAI_DON_HANG.DA_HUY, TRANG_THAI_DON_HANG.TU_CHOI]
        );
        const delivery = result.rows[0];

        if (data.diaDiemNhanId && !delivery.dia_diem_hop_le) {
            throw new ApiError(400, "Địa điểm nhận hàng không hợp lệ tại cơ sở đã chọn.");
        }
        if (data.khungGioNhanId && !delivery.khung_gio_hop_le) {
            throw new ApiError(400, "Khung giờ nhận hàng không hợp lệ tại cơ sở đã chọn.");
        }
        if (delivery.so_don_toi_da !== null && delivery.so_don_da_dat >= delivery.so_don_toi_da) {
            throw new ApiError(409, "Khung giờ nhận hàng đã đủ số lượng đơn tối đa.");
        }
    }

    async create(data, user) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await this.validateDelivery(data, client);
            const cart = await cartService.tinhGioHang(data, user, client, true);
            const profile = await cartService.getNhanVien(user.nhanVienId, client);
            const paymentStatus = data.phuongThucThanhToan === PHUONG_THUC_THANH_TOAN.QR ? TRANG_THAI_THANH_TOAN.CHO_THANH_TOAN : TRANG_THAI_THANH_TOAN.CHUA_THANH_TOAN;
            const orderId = await repository.create({
                ...data,
                ...cart,
                maDonHang: generateOrderCode(),
                nguoiDatId: user.nhanVienId,
                phongBanId: profile.phongBanId,
                tongMienGiam: cart.tongMienGiam,
                trangThaiThanhToan: paymentStatus,
                trangThai: TRANG_THAI_DON_HANG.CHO_XAC_NHAN
            }, client);
            await repository.createItems(orderId, cart.items.map(item => ({ ...item, trangThai: TRANG_THAI_CHI_TIET.CHO_XU_LY })), client);
            if (cart.voucher) {
                await repository.createVoucher(orderId, cart.voucher, client);
                await voucherUsageRepository.create({ voucherId: cart.voucher.id, donHangId: orderId, nhanVienId: user.nhanVienId, soTienGiam: cart.voucher.soTienGiam }, client);
            }
            await historyRepository.create({ donHangId: orderId, trangThaiCu: null, trangThaiMoi: TRANG_THAI_DON_HANG.CHO_XAC_NHAN, hanhDong: "TAO_DON_HANG", noiDung: "Đơn hàng được tạo và gửi chờ xác nhận.", nguoiThucHienId: user.nhanVienId }, client);
            await client.query("COMMIT");

            await notificationService.sendToEmployee({
                nhanVienId: user.nhanVienId,
                donHangId: orderId,
                maSuKien: "DON_HANG_DA_TAO",
                tieuDe: "Đặt hàng thành công",
                noiDung: "Đơn hàng của bạn đã được ghi nhận và đang chờ xác nhận.",
                nguoiTaoId: user.nhanVienId
            }).catch(() => null);

            return this.getDetail(orderId, user, true);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getDetail(id, user, manager = false) {
        const row = await repository.getById(id);
        if (!row || (!manager && Number(row.nguoi_dat_id) !== Number(user.nhanVienId))) throw new ApiError(404, "Đơn hàng không tồn tại.");
        const [items, vouchers, payments, history] = await Promise.all([
            repository.getItems(id),
            repository.getVouchers(id),
            paymentRepository.list(id),
            historyService.list(id)
        ]);

        return {
            ...mapOrder(row),
            items: items.map(item => ({
                ...item,
                tenTrangThai: enumName(enums.trangThaiChiTietDonHang, item.trangThai)
            })),
            vouchers,
            payments,
            history
        };
    }

    async getManagementDetail(id, user) {
        const profile = await cartService.getNhanVien(user.nhanVienId);
        const row = await repository.getById(id);

        if (!row || Number(row.co_so_id) !== Number(profile.coSoId)) {
            throw new ApiError(404, "Đơn hàng không tồn tại tại cơ sở của bạn.");
        }

        return this.getDetail(id, user, true);
    }

    listMine(query, user) {
        return repository.list(validateQuery(query), user.nhanVienId);
    }

    async listManagement(query, user) {
        const profile = await cartService.getNhanVien(user.nhanVienId);
        const data = validateQuery({
            ...query,
            coSoId: profile.coSoId
        });
        const [orders, thongKe] = await Promise.all([
            repository.list(data),
            repository.getSummary(profile.coSoId)
        ]);

        return {
            ...orders,
            thongKe
        };
    }

    async changeStatus(id, targetStatus, action, body, user) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const order = await repository.getById(id, client, true);
            if (!order) throw new ApiError(404, "Đơn hàng không tồn tại.");
            const profile = await cartService.getNhanVien(user.nhanVienId, client);
            const isSelfCancellation = action === "HUY_DON_HANG";

            if (isSelfCancellation && Number(order.nguoi_dat_id) !== Number(user.nhanVienId)) {
                throw new ApiError(403, "Bạn không có quyền huỷ đơn hàng này.");
            }

            if (!isSelfCancellation && Number(order.co_so_id) !== Number(profile.coSoId)) {
                throw new ApiError(403, "Bạn không có quyền xử lý đơn hàng của cơ sở khác.");
            }

            if (!CHUYEN_TRANG_THAI[order.trang_thai]?.includes(targetStatus)) throw new ApiError(409, "Không thể chuyển đơn hàng sang trạng thái được yêu cầu.");
            const isCancel = [TRANG_THAI_DON_HANG.DA_HUY, TRANG_THAI_DON_HANG.TU_CHOI].includes(targetStatus);
            if (isCancel && !body.lyDo) throw new ApiError(400, "Vui lòng nhập lý do huỷ hoặc từ chối đơn hàng.");
            const result = await repository.updateStatus(id, body.version, { trangThai: targetStatus, nguoiThucHienId: user.nhanVienId, tiepNhan: targetStatus === TRANG_THAI_DON_HANG.DANG_CHUAN_BI, huy: isCancel, lyDo: body.lyDo }, client);
            if (!result.rowCount) throw new ApiError(409, "Đơn hàng đã được người khác cập nhật. Vui lòng tải lại dữ liệu.");
            if (isCancel) await voucherUsageRepository.refund(id, client);
            await historyRepository.create({ donHangId: id, trangThaiCu: order.trang_thai, trangThaiMoi: targetStatus, hanhDong: action, noiDung: body.lyDo || null, nguoiThucHienId: user.nhanVienId }, client);
            await client.query("COMMIT");

            await notificationService.sendToEmployee({
                nhanVienId: order.nguoi_dat_id,
                donHangId: Number(id),
                maSuKien: action,
                tieuDe: "Đơn hàng đã được cập nhật",
                noiDung: body.lyDo || `Đơn hàng đã chuyển sang ${enumName(enums.trangThaiDonHang, targetStatus)}.`,
                nguoiTaoId: user.nhanVienId
            }).catch(() => null);

            return this.getDetail(id, user, true);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new DonHangService();

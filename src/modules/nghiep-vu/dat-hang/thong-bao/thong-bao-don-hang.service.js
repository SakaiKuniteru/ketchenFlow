'use strict';

const cauHinhRepository = require('../../../cau-hinh/cau-hinh.repository');
const thongBaoRepository = require('../../thong-bao/thong-bao.repository');
const thongBaoService = require('../../thong-bao/thong-bao.service');

const TITLES = {
    XAC_NHAN_DON_HANG: 'Đơn hàng đã được xác nhận',
    SAN_SANG_GIAO: 'Đơn hàng sẵn sàng giao',
    BAT_DAU_GIAO: 'Đơn hàng đang được giao',
    HOAN_THANH_DON_HANG: 'Đơn hàng đã hoàn thành',

    HUY_DON_HANG: 'Đơn hàng đã bị hủy',
    NHA_AN_HUY_DON_HANG: 'Nhà ăn đã hủy đơn hàng',
    TU_CHOI_DON_HANG: 'Đơn hàng đã bị từ chối'
};

const PROGRESS_EVENTS = [
    'DON_HANG_TIEN_TRINH',
    'DON_HANG_DA_TAO',
    ...Object.keys(TITLES)
];

class ThongBaoDonHangService {
    async sendNewOrder(order, user, client) {
        const setting = await cauHinhRepository.getThietLapByMa(
            'VAI_TRO_NHAN_VIEN_NHAN_MON',
            client
        );

        if (!setting?.active) return null;

        const codes = [
            ...new Set(
                String(setting.gia_tri || '')
                    .split(',')
                    .map(code => code.trim().toUpperCase())
                    .filter(Boolean)
            )
        ];

        if (!codes.length) return null;

        const roles = await client.query(
            `SELECT id
             FROM dm_vai_tro
             WHERE active = TRUE
               AND UPPER(TRIM(ma_vai_tro)) = ANY($1::text[])`,
            [codes]
        );

        const ids = await thongBaoRepository.getTaiKhoanIdsTheoVaiTro(
            roles.rows.map(row => Number(row.id)),
            client
        );

        if (!ids.length) return null;

        return thongBaoService.send(
            {
                tieuDe: 'Có đơn hàng mới',
                noiDung:
                    `Đơn ${order.ma_don_hang} đang chờ nhà ăn xử lý.`,
                guiTatCa: false,
                doiTuong: ids.map(id => ({
                    loaiDoiTuong: 30,
                    doiTuongId: id
                })),
                maSuKien: 'DON_HANG_MOI_NHA_AN',
                loaiThamChieu: 'DON_HANG',
                thamChieuId: order.id,
                duongDan:
                    `/dat-hang/chi-tiet-xu-ly-don-hang/${order.nguoi_dat_id}/${order.id}`,
                nguoiTaoId: user.taiKhoanId
            },
            client
        );
    }

    async sendProgress(order, action, user, client, reason = '') {
        const title = TITLES[action];

        // Không gửi tiếp khi đóng đơn sau trạng thái hoàn thành.
        if (!title) return null;

        await client.query(
            `UPDATE nv_thong_bao
             SET trang_thai = 30,
                 updated_at = NOW()
             WHERE tu_dong = TRUE
               AND loai_tham_chieu = 'DON_HANG'
               AND tham_chieu_id = $1
               AND ma_su_kien = ANY($2::text[])
               AND trang_thai IN (10, 20)`,
            [order.id, PROGRESS_EVENTS]
        );

        const { rows } = await client.query(
            `SELECT tk.id
             FROM dm_tai_khoan tk
             JOIN dm_nhan_vien nv ON nv.id = tk.nhan_vien_id
             WHERE tk.nhan_vien_id = $1
               AND tk.active = TRUE
               AND tk.bi_khoa = FALSE
               AND nv.active = TRUE`,
            [order.nguoi_dat_id]
        );

        for (const account of rows) {
            await thongBaoService.send(
                {
                    tieuDe: title,
                    noiDung:
                        `Đơn ${order.ma_don_hang}: ${reason || title}.`,
                    guiTatCa: false,
                    doiTuong: [{
                        loaiDoiTuong: 30,
                        doiTuongId: account.id
                    }],
                    maSuKien: 'DON_HANG_TIEN_TRINH',
                    loaiThamChieu: 'DON_HANG',
                    thamChieuId: order.id,
                    duongDan:
                        `/dat-hang/chi-tiet-don-hang-cua-toi/${account.id}/${order.id}`,
                    nguoiTaoId: user.taiKhoanId
                },
                client
            );
        }
    }
}

module.exports = new ThongBaoDonHangService();
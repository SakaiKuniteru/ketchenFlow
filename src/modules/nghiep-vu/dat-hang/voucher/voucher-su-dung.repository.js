'use strict';

const pool = require('../../../../config/database');
const { TRANG_THAI_SU_DUNG } = require('./voucher.constants');

class VoucherSuDungRepository {
    create(data, client = pool) {
        return client.query(
            `INSERT INTO nv_voucher_don_hang_su_dung (voucher_don_hang_id, don_hang_id, nhan_vien_id, so_tien_giam, trang_thai, het_han_giu_luc, thoi_gian_su_dung) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 minutes', NOW())`,
            [data.voucherId, data.donHangId, data.nhanVienId, data.soTienGiam, TRANG_THAI_SU_DUNG.DA_SU_DUNG]
        );
    }

    refund(donHangId, client = pool) {
        return client.query(
            `UPDATE nv_voucher_don_hang_su_dung SET trang_thai = $2, thoi_gian_hoan = NOW(), updated_at = NOW() WHERE don_hang_id = $1 AND trang_thai <> $2`,
            [donHangId, TRANG_THAI_SU_DUNG.DA_HOAN]
        );
    }
}

module.exports = new VoucherSuDungRepository();

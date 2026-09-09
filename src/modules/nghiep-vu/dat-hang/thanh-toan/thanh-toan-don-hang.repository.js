"use strict";

const pool = require("../../../../config/database");

class ThanhToanRepository {
    async create(data, client = pool) {
        const result = await client.query(
            `INSERT INTO nv_thanh_toan_don_hang (don_hang_id, loai_giao_dich, phuong_thuc, so_tien, ma_giao_dich, qr_payload, qr_het_han_luc, trang_thai, nguoi_khoi_tao_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [data.donHangId, data.loaiGiaoDich, data.phuongThuc, data.soTien, data.maGiaoDich, data.qrPayload || null, data.qrHetHanLuc || null, data.trangThai, data.nguoiKhoiTaoId]
        );
        return result.rows[0];
    }

    async list(donHangId) {
        const result = await pool.query(`SELECT id, loai_giao_dich AS "loaiGiaoDich", phuong_thuc AS "phuongThuc", so_tien AS "soTien", ma_giao_dich AS "maGiaoDich", ma_tham_chieu AS "maThamChieu", qr_payload AS "qrPayload", qr_het_han_luc AS "qrHetHanLuc", trang_thai AS "trangThai", thoi_gian_thanh_toan AS "thoiGianThanhToan", created_at AS "createdAt" FROM nv_thanh_toan_don_hang WHERE don_hang_id = $1 ORDER BY created_at DESC`, [donHangId]);
        return result.rows;
    }

    confirm(id, data, userId, client = pool) {
        return client.query(`UPDATE nv_thanh_toan_don_hang SET trang_thai = $2, ma_tham_chieu = $3, ma_chuan_chi = $4, nguoi_xac_nhan_id = $5, thoi_gian_thanh_toan = NOW(), updated_at = NOW() WHERE id = $1 AND ma_giao_dich = $6 RETURNING don_hang_id`, [id, data.trangThai, data.maThamChieu || null, data.maChuanChi || null, userId, data.maGiaoDich]);
    }
}

module.exports = new ThanhToanRepository();

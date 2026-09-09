"use strict";

const pool = require("../../../../config/database");

class DonHangReportRepository {
    async getData(query) {
        const values = [query.coSoId];
        const conditions = ["dh.co_so_id = $1"];

        if (query.tuNgay) {
            values.push(query.tuNgay);
            conditions.push(`dh.created_at >= $${values.length}`);
        }

        if (query.denNgay) {
            values.push(query.denNgay);
            conditions.push(`dh.created_at < ($${values.length}::DATE + INTERVAL '1 day')`);
        }

        const result = await pool.query(
            `
                SELECT
                    dh.ma_don_hang AS "maDonHang",
                    dh.created_at AS "thoiGianDat",
                    nd.ho_ten AS "nguoiDat",
                    dh.ten_nguoi_nhan AS "nguoiNhan",
                    pb.ten_phong_ban AS "phongBan",
                    dh.tam_tinh AS "tamTinh",
                    dh.tong_mien_giam AS "tongMienGiam",
                    dh.phi_dich_vu AS "phiDichVu",
                    dh.tong_thanh_toan AS "tongThanhToan",
                    dh.phuong_thuc_thanh_toan AS "phuongThucThanhToan",
                    dh.trang_thai_thanh_toan AS "trangThaiThanhToan",
                    dh.trang_thai AS "trangThai"
                FROM nv_don_hang dh
                JOIN dm_nhan_vien nd ON nd.id = dh.nguoi_dat_id
                LEFT JOIN dm_phong_ban pb ON pb.id = dh.phong_ban_id
                WHERE ${conditions.join(" AND ")}
                ORDER BY dh.created_at DESC
            `,
            values
        );

        return result.rows;
    }
}

module.exports = new DonHangReportRepository();

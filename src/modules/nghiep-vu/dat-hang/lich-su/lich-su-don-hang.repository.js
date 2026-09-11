'use strict';

const pool = require('../../../../config/database');

class LichSuDonHangRepository {
    create(data, client = pool) {
        return client.query(
            `INSERT INTO nv_lich_su_don_hang (don_hang_id, trang_thai_cu, trang_thai_moi, hanh_dong, noi_dung, nguoi_thuc_hien_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                data.donHangId,
                data.trangThaiCu,
                data.trangThaiMoi,
                data.hanhDong,
                data.noiDung || null,
                data.nguoiThucHienId || null,
                data.metadata ? JSON.stringify(data.metadata) : null
            ]
        );
    }

    async list(donHangId, client = pool) {
        const result = await client.query(
            `SELECT ls.id, ls.trang_thai_cu AS "trangThaiCu", ls.trang_thai_moi AS "trangThaiMoi", ls.hanh_dong AS "hanhDong", ls.noi_dung AS "noiDung", ls.metadata, ls.created_at AS "createdAt", nv.id AS "nguoiThucHienId", nv.ho_ten AS "tenNguoiThucHien" FROM nv_lich_su_don_hang ls LEFT JOIN dm_nhan_vien nv ON nv.id = ls.nguoi_thuc_hien_id WHERE ls.don_hang_id = $1 ORDER BY ls.created_at, ls.id`,
            [donHangId]
        );
        return result.rows;
    }
}

module.exports = new LichSuDonHangRepository();

const pool = require('../../../../config/database');

class DiaChiRepository {
    mapDiaChi(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maDiaChi: row.ma_dia_chi,

            tenDiaChi: row.ten_dia_chi,

            quocGiaId: row.quoc_gia_id,

            quocGia: row.quoc_gia_id
                ? {
                      id: row.quoc_gia_id,

                      ma: row.ma_quoc_gia,

                      ten: row.ten_quoc_gia,

                      tenTiengAnh: row.ten_tieng_anh,

                      tenVietTat: row.quoc_gia_ten_viet_tat,

                      maDienThoai: row.ma_dien_thoai,

                      maIso2: row.ma_iso2,

                      maIso3: row.ma_iso3,

                      active: row.quoc_gia_active
                  }
                : null,

            tinhThanhId: row.tinh_thanh_id,

            tinhThanh: row.tinh_thanh_id
                ? {
                      id: row.tinh_thanh_id,

                      ma: row.ma_tinh_thanh,

                      ten: row.ten_tinh_thanh,

                      tenVietTat: row.tinh_thanh_ten_viet_tat,

                      active: row.tinh_thanh_active
                  }
                : null,

            xaPhuongId: row.xa_phuong_id,

            xaPhuong: row.xa_phuong_id
                ? {
                      id: row.xa_phuong_id,

                      ma: row.ma_xa_phuong,

                      ten: row.ten_xa_phuong,

                      tenVietTat: row.xa_phuong_ten_viet_tat,

                      active: row.xa_phuong_active
                  }
                : null,

            active: row.active
        };
    }

    getBaseQuery() {
        return `

            SELECT

                dc.id,
                dc.ma_dia_chi,
                dc.ten_dia_chi,

                dc.quoc_gia_id,
                dc.ma_quoc_gia,
                dc.ten_quoc_gia,
                dc.ten_tieng_anh,
                dc.quoc_gia_ten_viet_tat,
                dc.ma_dien_thoai,
                dc.ma_iso2,
                dc.ma_iso3,
                dc.quoc_gia_active,

                dc.tinh_thanh_id,
                dc.ma_tinh_thanh,
                dc.ten_tinh_thanh,
                dc.tinh_thanh_ten_viet_tat,
                dc.tinh_thanh_active,

                dc.xa_phuong_id,
                dc.ma_xa_phuong,
                dc.ten_xa_phuong,
                dc.xa_phuong_ten_viet_tat,
                dc.xa_phuong_active,

                dc.active

            FROM dm_dia_chi dc

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY
                dc.ten_quoc_gia ASC,
                dc.ten_tinh_thanh ASC,
                dc.ten_xa_phuong ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapDiaChi(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE dc.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapDiaChi(result.rows[0]);
    }
}

module.exports = new DiaChiRepository();

const pool = require('../../../../config/database');

class XaPhuongRepository {
    mapXaPhuong(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maXaPhuong: row.ma_xa_phuong,

            tenXaPhuong: row.ten_xa_phuong,

            tenVietTat: row.xa_phuong_ten_viet_tat,

            tinhThanhId: row.tinh_thanh_id,

            tinhThanh: row.tinh_thanh_id
                ? {
                      id: row.tinh_thanh_id,
                      ma: row.ma_tinh_thanh,
                      ten: row.ten_tinh_thanh,
                      tenVietTat: row.tinh_thanh_ten_viet_tat,
                      quocGiaId: row.quoc_gia_id,
                      quocGia: row.quoc_gia_id
                          ? {
                                id: row.quoc_gia_id,

                                maQuocGia: row.ma_quoc_gia,

                                tenQuocGia: row.ten_quoc_gia,

                                tenTiengAnh: row.ten_tieng_anh,

                                maIso2: row.ma_iso2,

                                maIso3: row.ma_iso3,

                                tenVietTat: row.quoc_gia_ten_viet_tat
                            }
                          : null
                  }
                : null,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                xp.id,
                xp.ma_xa_phuong,
                xp.ten_xa_phuong,
                xp.ten_viet_tat
                    AS xa_phuong_ten_viet_tat,

                xp.tinh_thanh_id,

                xp.active,
                xp.created_at,
                xp.updated_at,

                tt.ma_tinh_thanh,
                tt.ten_tinh_thanh,
                tt.quoc_gia_id,
                tt.ten_viet_tat
                    AS tinh_thanh_ten_viet_tat,

                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_tieng_anh,
                qg.ma_iso2,
                qg.ma_iso3,
                qg.ten_viet_tat
                    AS quoc_gia_ten_viet_tat

            FROM dm_xa_phuong xp

            LEFT JOIN dm_tinh_thanh tt
                ON tt.id = xp.tinh_thanh_id

            LEFT JOIN dm_quoc_gia qg
                ON qg.id = tt.quoc_gia_id

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY xp.ma_xa_phuong ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapXaPhuong(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE xp.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapXaPhuong(result.rows[0]);
    }

    async getChiTietByMa(maXaPhuong) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(xp.ma_xa_phuong)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maXaPhuong]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapXaPhuong(result.rows[0]);
    }

    async getTinhThanhByMa(maTinhThanh) {
        const sql = `
            SELECT
                id,
                ma_tinh_thanh,
                ten_tinh_thanh,
                active
            FROM dm_tinh_thanh
            WHERE UPPER(ma_tinh_thanh) = UPPER($1)
            LIMIT 1
        `;

        const result = await pool.query(sql, [maTinhThanh]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maTinhThanh: result.rows[0].ma_tinh_thanh,
            tenTinhThanh: result.rows[0].ten_tinh_thanh,
            active: result.rows[0].active
        };
    }

    async existsTinhThanh(tinhThanhId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_tinh_thanh
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await pool.query(sql, [tinhThanhId]);

        return result.rows[0].exists;
    }

    async existsMaXaPhuong(maXaPhuong, excludeId = null) {
        const values = [maXaPhuong];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_xa_phuong
                WHERE UPPER(ma_xa_phuong)
                    = UPPER($1)
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $2
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async existsTenXaPhuong(tenXaPhuong, tinhThanhId, excludeId = null) {
        const values = [tenXaPhuong, tinhThanhId];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_xa_phuong
                WHERE LOWER(TRIM(ten_xa_phuong))
                    = LOWER(TRIM($1))
                AND tinh_thanh_id = $2
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $3
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_xa_phuong (
                ma_xa_phuong,
                ten_xa_phuong,
                ten_viet_tat,
                tinh_thanh_id,
                active,
                created_at,
                updated_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maXaPhuong,

            data.tenXaPhuong,

            data.tenVietTat || null,

            data.tinhThanhId,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_xa_phuong
            SET
                ma_xa_phuong = $1,
                ten_xa_phuong = $2,
                ten_viet_tat = $3,
                tinh_thanh_id = $4,
                active = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING id
        `;

        const values = [data.maXaPhuong, data.tenXaPhuong, data.tenVietTat || null, data.tinhThanhId, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new XaPhuongRepository();

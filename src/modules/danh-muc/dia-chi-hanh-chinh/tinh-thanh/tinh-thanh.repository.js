const pool = require('../../../../config/database');

class TinhThanhRepository {
    mapTinhThanh(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maTinhThanh: row.ma_tinh_thanh,

            tenTinhThanh: row.ten_tinh_thanh,

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
                : null,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                tt.id,
                tt.ma_tinh_thanh,
                tt.ten_tinh_thanh,
                tt.ten_viet_tat
                    AS tinh_thanh_ten_viet_tat,

                tt.quoc_gia_id,

                tt.active,
                tt.created_at,
                tt.updated_at,

                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_tieng_anh,
                qg.ma_iso2,
                qg.ma_iso3,
                qg.ten_viet_tat
                    AS quoc_gia_ten_viet_tat

            FROM dm_tinh_thanh tt

            LEFT JOIN dm_quoc_gia qg
                ON qg.id = tt.quoc_gia_id

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY tt.ma_tinh_thanh ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapTinhThanh(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tt.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTinhThanh(result.rows[0]);
    }

    async getChiTietByMa(maTinhThanh) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(tt.ma_tinh_thanh)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maTinhThanh]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTinhThanh(result.rows[0]);
    }

    async getQuocGiaByMa(maQuocGia) {
        const sql = `
            SELECT
                id,
                ma_quoc_gia,
                ten_quoc_gia,
                active
            FROM dm_quoc_gia
            WHERE UPPER(ma_quoc_gia) = UPPER($1)
            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuocGia]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maQuocGia: result.rows[0].ma_quoc_gia,
            tenQuocGia: result.rows[0].ten_quoc_gia,
            active: result.rows[0].active
        };
    }

    async existsQuocGia(quocGiaId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await pool.query(sql, [quocGiaId]);

        return result.rows[0].exists;
    }

    async existsMaTinhThanh(maTinhThanh, excludeId = null) {
        const values = [maTinhThanh];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_tinh_thanh
                WHERE UPPER(ma_tinh_thanh)
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

    async existsTenTinhThanh(tenTinhThanh, quocGiaId, excludeId = null) {
        const values = [tenTinhThanh, quocGiaId];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_tinh_thanh
                WHERE LOWER(TRIM(ten_tinh_thanh))
                    = LOWER(TRIM($1))
                AND quoc_gia_id = $2
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
            INSERT INTO dm_tinh_thanh (
                ma_tinh_thanh,
                ten_tinh_thanh,
                ten_viet_tat,
                quoc_gia_id,
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
            data.maTinhThanh,

            data.tenTinhThanh,

            data.tenVietTat || null,

            data.quocGiaId,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_tinh_thanh
            SET
                ma_tinh_thanh = $1,
                ten_tinh_thanh = $2,
                ten_viet_tat = $3,
                quoc_gia_id = $4,
                active = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING id
        `;

        const values = [data.maTinhThanh, data.tenTinhThanh, data.tenVietTat || null, data.quocGiaId, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new TinhThanhRepository();

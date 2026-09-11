const pool = require('../../../../config/database');

class NhomTinhNangRepository {
    mapNhomTinhNang(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maNhomTinhNang: row.ma_nhom_tinh_nang,

            tenNhomTinhNang: row.ten_nhom_tinh_nang,

            moTa: row.mo_ta,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                ntn.id,
                ntn.ma_nhom_tinh_nang,
                ntn.ten_nhom_tinh_nang,
                ntn.mo_ta,


                ntn.active,
                ntn.created_at,
                ntn.updated_at

            FROM dm_nhom_tinh_nang ntn

        `;
    }

    getGroupBy() {
        return `
            GROUP BY
                ntn.id,
                ntn.ma_nhom_tinh_nang,
                ntn.ten_nhom_tinh_nang,
                ntn.mo_ta,
                ntn.active,
                ntn.created_at,
                ntn.updated_at
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ${this.getGroupBy()}

            ORDER BY ntn.ma_nhom_tinh_nang ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapNhomTinhNang(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE ntn.id = $1

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhomTinhNang(result.rows[0]);
    }

    async getChiTietByMa(maNhomTinhNang) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(ntn.ma_nhom_tinh_nang)
            ) = UPPER(
                TRIM($1)
            )

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhomTinhNang]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhomTinhNang(result.rows[0]);
    }

    async existsMaNhomTinhNang(maNhomTinhNang, excludeId = null) {
        const values = [maNhomTinhNang];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_tinh_nang
                WHERE UPPER(ma_nhom_tinh_nang)
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

    async existsTenNhomTinhNang(tenNhomTinhNang, excludeId = null) {
        const values = [tenNhomTinhNang];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_tinh_nang
                WHERE LOWER(TRIM(ten_nhom_tinh_nang))
                    = LOWER(TRIM($1))
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

    async create(data) {
        const sql = `
            INSERT INTO dm_nhom_tinh_nang (
                ma_nhom_tinh_nang,
                ten_nhom_tinh_nang,
                mo_ta,
                active,
                created_at,
                updated_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maNhomTinhNang,

            data.tenNhomTinhNang,

            data.moTa || null,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_nhom_tinh_nang
            SET
                ma_nhom_tinh_nang = $1,
                ten_nhom_tinh_nang = $2,
                mo_ta = $3,
                active = $4,
                updated_at = NOW()
            WHERE id = $5
            RETURNING id
        `;

        const values = [data.maNhomTinhNang, data.tenNhomTinhNang, data.moTa, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new NhomTinhNangRepository();

const pool = require('../../../../config/database');

class NhomMonAnRepository {
    mapNhomMonAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maNhomMonAn: row.ma_nhom_mon_an,

            tenNhomMonAn: row.ten_nhom_mon_an,

            moTa: row.mo_ta,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                nma.id,
                nma.ma_nhom_mon_an,
                nma.ten_nhom_mon_an,
                nma.mo_ta,


                nma.active,
                nma.created_at,
                nma.updated_at

            FROM dm_nhom_mon_an nma

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY nma.ma_nhom_mon_an ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapNhomMonAn(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE nma.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhomMonAn(result.rows[0]);
    }

    async getChiTietByMa(maNhomMonAn) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(nma.ma_nhom_mon_an)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhomMonAn]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhomMonAn(result.rows[0]);
    }

    async existsMaNhomMonAn(maNhomMonAn, excludeId = null) {
        const values = [maNhomMonAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_mon_an
                WHERE UPPER(ma_nhom_mon_an)
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

    async existsTenNhomMonAn(tenNhomMonAn, excludeId = null) {
        const values = [tenNhomMonAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_mon_an
                WHERE LOWER(TRIM(ten_nhom_mon_an))
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
            INSERT INTO dm_nhom_mon_an (
                ma_nhom_mon_an,
                ten_nhom_mon_an,
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
            data.maNhomMonAn,

            data.tenNhomMonAn,

            data.moTa || null,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_nhom_mon_an
            SET
                ma_nhom_mon_an = $1,
                ten_nhom_mon_an = $2,
                mo_ta = $3,
                active = $4,
                updated_at = NOW()
            WHERE id = $5
            RETURNING id
        `;

        const values = [data.maNhomMonAn, data.tenNhomMonAn, data.moTa, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new NhomMonAnRepository();

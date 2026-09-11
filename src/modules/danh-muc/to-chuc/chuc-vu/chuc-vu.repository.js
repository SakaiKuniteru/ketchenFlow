const pool = require('../../../../config/database');

class ChucVuRepository {
    mapChucVu(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maChucVu: row.ma_chuc_vu,

            tenChucVu: row.ten_chuc_vu,

            moTa: row.mo_ta,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                cv.id,
                cv.ma_chuc_vu,
                cv.ten_chuc_vu,
                cv.mo_ta,


                cv.active,
                cv.created_at,
                cv.updated_at

            FROM dm_chuc_vu cv

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY cv.ma_chuc_vu ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapChucVu(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE cv.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapChucVu(result.rows[0]);
    }

    async existsMaChucVu(maChucVu, excludeId = null) {
        const values = [maChucVu];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_chuc_vu
                WHERE UPPER(ma_chuc_vu)
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

    async existsTenChucVu(tenChucVu, excludeId = null) {
        const values = [tenChucVu];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_chuc_vu
                WHERE LOWER(TRIM(ten_chuc_vu))
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

    async getChiTietByMa(maChucVu) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(cv.ma_chuc_vu)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maChucVu]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapChucVu(result.rows[0]);
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_chuc_vu (
                ma_chuc_vu,
                ten_chuc_vu,
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
            data.maChucVu,

            data.tenChucVu,

            data.moTa || null,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_chuc_vu
            SET
                ma_chuc_vu = $1,
                ten_chuc_vu = $2,
                mo_ta = $3,
                active = $4,
                updated_at = NOW()
            WHERE id = $5
            RETURNING id
        `;

        const values = [data.maChucVu, data.tenChucVu, data.moTa, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new ChucVuRepository();

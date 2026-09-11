const pool = require('../../../../config/database');

class CaAnRepository {
    mapCaAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maCaAn: row.ma_ca_an,
            tenCaAn: row.ten_ca_an,
            thoiGianBatDau: row.thoi_gian_bat_dau,
            thoiGianKetThuc: row.thoi_gian_ket_thuc,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                ca.id,
                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc,
                ca.active,
                ca.created_at,
                ca.updated_at
            FROM dm_ca_an ca
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY ca.ma_ca_an ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapCaAn(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE ca.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapCaAn(result.rows[0]);
    }

    async getChiTietByMa(maCaAn) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(
                TRIM(ca.ma_ca_an)
            ) = UPPER(
                TRIM($1)
            )
            LIMIT 1
        `;

        const result = await pool.query(sql, [maCaAn]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapCaAn(result.rows[0]);
    }

    async existsMaCaAn(maCaAn, excludeId = null) {
        const values = [maCaAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_ca_an
                WHERE UPPER(ma_ca_an)
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

    async existsTenCaAn(tenCaAn, excludeId = null) {
        const values = [tenCaAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_ca_an
                WHERE LOWER(TRIM(ten_ca_an))
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

    async existsKhoangThoiGian(thoiGianBatDau, thoiGianKetThuc, excludeId = null) {
        const values = [thoiGianBatDau, thoiGianKetThuc];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_ca_an
                WHERE thoi_gian_bat_dau = $1::time
                AND thoi_gian_ket_thuc = $2::time
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
            INSERT INTO dm_ca_an (
                ma_ca_an,
                ten_ca_an,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
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
            data.maCaAn,
            data.tenCaAn,
            data.thoiGianBatDau,
            data.thoiGianKetThuc,
            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_ca_an
            SET
                ma_ca_an = $1,
                ten_ca_an = $2,
                thoi_gian_bat_dau = $3,
                thoi_gian_ket_thuc = $4,
                active = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING id
        `;

        const values = [data.maCaAn, data.tenCaAn, data.thoiGianBatDau, data.thoiGianKetThuc, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new CaAnRepository();

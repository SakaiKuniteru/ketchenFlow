const pool = require('../../../../config/database');

class PhongBanRepository {
    mapPhongBan(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maPhongBan: row.ma_phong_ban,
            tenPhongBan: row.ten_phong_ban,
            moTa: row.mo_ta,
            coSoId: row.co_so_id,
            coSo: row.co_so_id
                ? {
                      id: row.co_so_id,
                      ma: row.ma_co_so,
                      ten: row.ten_co_so,
                      diaChi: row.dia_chi
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
                pb.id,
                pb.ma_phong_ban,
                pb.ten_phong_ban,
                pb.mo_ta,
                pb.co_so_id,
                pb.active,
                pb.created_at,
                pb.updated_at,
                cs.ma_co_so,
                cs.ten_co_so,
                cs.dia_chi
            FROM dm_phong_ban pb
            LEFT JOIN dm_co_so cs
                ON cs.id = pb.co_so_id
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY pb.ma_phong_ban ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapPhongBan(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE pb.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapPhongBan(result.rows[0]);
    }

    async getCoSoByMa(maCoSo) {
        const sql = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                active
            FROM dm_co_so
            WHERE UPPER(ma_co_so) = UPPER($1)
            LIMIT 1
        `;

        const result = await pool.query(sql, [maCoSo]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maCoSo: result.rows[0].ma_co_so,
            tenCoSo: result.rows[0].ten_co_so,
            active: result.rows[0].active
        };
    }

    async existsCoSo(coSoId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_co_so
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await pool.query(sql, [coSoId]);

        return result.rows[0].exists;
    }

    async existsMaPhongBan(maPhongBan, excludeId = null) {
        const values = [maPhongBan];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_phong_ban
                WHERE UPPER(ma_phong_ban) = UPPER($1)
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

    async existsTenPhongBan(tenPhongBan, coSoId, excludeId = null) {
        const values = [tenPhongBan, coSoId];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_phong_ban
                WHERE LOWER(TRIM(ten_phong_ban)) = LOWER(TRIM($1))
                AND co_so_id = $2
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

    async getChiTietByMa(maPhongBan) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(
                TRIM(pb.ma_phong_ban)
            ) = UPPER(
                TRIM($1)
            )
            LIMIT 1
        `;

        const result = await pool.query(sql, [maPhongBan]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapPhongBan(result.rows[0]);
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_phong_ban (
                ma_phong_ban,
                ten_phong_ban,
                mo_ta,
                co_so_id,
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
            data.maPhongBan,
            data.tenPhongBan,
            data.moTa || null,
            data.coSoId,
            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_phong_ban
            SET
                ma_phong_ban = $1,
                ten_phong_ban = $2,
                mo_ta = $3,
                co_so_id = $4,
                active = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING id
        `;

        const values = [data.maPhongBan, data.tenPhongBan, data.moTa || null, data.coSoId, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new PhongBanRepository();

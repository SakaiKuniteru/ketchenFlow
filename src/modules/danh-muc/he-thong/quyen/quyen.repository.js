const pool = require('../../../../config/database');

class QuyenRepository {
    mapQuyen(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maQuyen: row.ma_quyen,

            tenQuyen: row.ten_quyen,

            moTa: row.mo_ta,

            dsNhomTinhNangId: Array.isArray(row.nhom_tinh_nangs) ? row.nhom_tinh_nangs.map((item) => item.id) : [],

            dsMaNhomTinhNang: Array.isArray(row.nhom_tinh_nangs)
                ? row.nhom_tinh_nangs.map((item) => item.maNhomTinhNang)
                : [],

            dsNhomTinhNang: Array.isArray(row.nhom_tinh_nangs) ? row.nhom_tinh_nangs : [],

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                q.id,
                q.ma_quyen,
                q.ten_quyen,
                q.mo_ta,

                q.active,
                q.created_at,
                q.updated_at,

                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', ntn.id,
                            'maNhomTinhNang', ntn.ma_nhom_tinh_nang,
                            'tenNhomTinhNang', ntn.ten_nhom_tinh_nang,
                            'active', qntn.active
                        )
                        ORDER BY ntn.ma_nhom_tinh_nang ASC
                    ) FILTER (
                        WHERE ntn.id IS NOT NULL
                    ),
                    '[]'::JSON
                ) AS nhom_tinh_nangs

            FROM dm_quyen q

            LEFT JOIN dm_quyen_nhom_tinh_nang qntn
                ON qntn.quyen_id = q.id
                AND qntn.active = TRUE

            LEFT JOIN dm_nhom_tinh_nang ntn
                ON ntn.id = qntn.nhom_tinh_nang_id

        `;
    }

    getGroupBy() {
        return `
            GROUP BY
                q.id,
                q.ma_quyen,
                q.ten_quyen,
                q.mo_ta,
                q.active,
                q.created_at,
                q.updated_at
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ${this.getGroupBy()}

            ORDER BY q.ma_quyen ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapQuyen(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE q.id = $1

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapQuyen(result.rows[0]);
    }

    async getChiTietByMa(maQuyen) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(q.ma_quyen)
            ) = UPPER(
                TRIM($1)
            )

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuyen]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapQuyen(result.rows[0]);
    }

    async getDsNhomTinhNangByIds(ids) {
        const sql = `
            SELECT
                id,
                ma_nhom_tinh_nang,
                ten_nhom_tinh_nang,
                active
            FROM dm_nhom_tinh_nang
            WHERE id = ANY($1::BIGINT[])
        `;

        const result = await pool.query(sql, [ids]);

        return result.rows.map((row) => ({
            id: row.id,

            maNhomTinhNang: row.ma_nhom_tinh_nang,

            tenNhomTinhNang: row.ten_nhom_tinh_nang,

            active: row.active
        }));
    }

    async getDsNhomTinhNangByMas(mas) {
        const sql = `
            SELECT
                id,
                ma_nhom_tinh_nang,
                ten_nhom_tinh_nang,
                active
            FROM dm_nhom_tinh_nang
            WHERE UPPER(ma_nhom_tinh_nang)
                IN (
                    SELECT UPPER(
                        UNNEST($1::TEXT[])
                    )
                )
        `;

        const result = await pool.query(sql, [mas]);

        return result.rows.map((row) => ({
            id: row.id,

            maNhomTinhNang: row.ma_nhom_tinh_nang,

            tenNhomTinhNang: row.ten_nhom_tinh_nang,

            active: row.active
        }));
    }

    async ganDsNhomTinhNang(client, quyenId, dsNhomTinhNangId) {
        if (!Array.isArray(dsNhomTinhNangId) || dsNhomTinhNangId.length === 0) {
            return;
        }

        const sql = `
            INSERT INTO dm_quyen_nhom_tinh_nang (
                quyen_id,
                nhom_tinh_nang_id,
                active,
                created_at,
                updated_at
            )
            SELECT
                $1,
                UNNEST($2::BIGINT[]),
                TRUE,
                NOW(),
                NOW()
            ON CONFLICT (
                quyen_id,
                nhom_tinh_nang_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [quyenId, dsNhomTinhNangId]);
    }

    async existsMaQuyen(maQuyen, excludeId = null) {
        const values = [maQuyen];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quyen
                WHERE UPPER(ma_quyen)
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

    async existsTenQuyen(tenQuyen, excludeId = null) {
        const values = [tenQuyen];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quyen
                WHERE LOWER(TRIM(ten_quyen))
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
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                INSERT INTO dm_quyen (
                    ma_quyen,
                    ten_quyen,
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
                data.maQuyen,

                data.tenQuyen,

                data.moTa || null,

                data.active !== undefined ? data.active : true
            ];

            const result = await client.query(sql, values);

            const quyenId = result.rows[0].id;

            await this.ganDsNhomTinhNang(client, quyenId, data.dsNhomTinhNangId);

            await client.query('COMMIT');

            return await this.getChiTiet(quyenId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async khoaTatCaNhomTinhNang(client, quyenId) {
        const sql = `
            UPDATE dm_quyen_nhom_tinh_nang
            SET
                active = FALSE,
                updated_at = NOW()
            WHERE quyen_id = $1
        `;

        await client.query(sql, [quyenId]);
    }

    async update(id, data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                UPDATE dm_quyen
                SET
                    ma_quyen = $1,
                    ten_quyen = $2,
                    mo_ta = $3,
                    active = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING id
            `;

            const values = [data.maQuyen, data.tenQuyen, data.moTa || null, data.active, id];

            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            await this.khoaTatCaNhomTinhNang(client, id);

            await this.ganDsNhomTinhNang(client, id, data.dsNhomTinhNangId);

            await client.query('COMMIT');

            return await this.getChiTiet(id);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new QuyenRepository();

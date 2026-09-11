const pool = require('../../../../config/database');

class VaiTroRepository {
    mapVaiTro(row) {
        if (!row) {
            return null;
        }

        const dsQuyen = Array.isArray(row.quyens) ? row.quyens : [];

        const dsNhomTinhNang = [];

        const nhomTinhNangMap = new Map();

        dsQuyen.forEach((quyen) => {
            const danhSachNhom = Array.isArray(quyen.dsNhomTinhNang) ? quyen.dsNhomTinhNang : [];

            danhSachNhom.forEach((nhom) => {
                const id = Number(nhom.id);

                if (!Number.isInteger(id) || nhomTinhNangMap.has(id)) {
                    return;
                }

                nhomTinhNangMap.set(id, nhom);

                dsNhomTinhNang.push(nhom);
            });
        });

        return {
            id: row.id,

            maVaiTro: row.ma_vai_tro,

            tenVaiTro: row.ten_vai_tro,

            moTa: row.mo_ta,

            dsQuyenId: dsQuyen.map((item) => Number(item.id)),

            dsMaQuyen: dsQuyen.map((item) => item.maQuyen),

            dsTenQuyen: dsQuyen.map((item) => item.tenQuyen),

            dsQuyen,

            dsNhomTinhNang,

            dsNhomTinhNangId: dsNhomTinhNang.map((item) => Number(item.id)),

            dsMaNhomTinhNang: dsNhomTinhNang.map((item) => item.maNhomTinhNang),

            dsTenNhomTinhNang: dsNhomTinhNang.map((item) => item.tenNhomTinhNang),

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                vt.id,
                vt.ma_vai_tro,
                vt.ten_vai_tro,
                vt.mo_ta,

                vt.active,
                vt.created_at,
                vt.updated_at,

                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', q.id,
                            'maQuyen', q.ma_quyen,
                            'tenQuyen', q.ten_quyen,
                            'active', vtq.active,
                            'dsNhomTinhNang',
                                COALESCE(
                                    (
                                        SELECT
                                            JSON_AGG(
                                                JSON_BUILD_OBJECT(

                                                    'id',
                                                        ntn.id,

                                                    'maNhomTinhNang',
                                                        ntn.ma_nhom_tinh_nang,

                                                    'tenNhomTinhNang',
                                                        ntn.ten_nhom_tinh_nang

                                                )

                                                ORDER BY
                                                    ntn.ma_nhom_tinh_nang ASC
                                            )

                                        FROM dm_quyen_nhom_tinh_nang qntn

                                        INNER JOIN dm_nhom_tinh_nang ntn
                                            ON ntn.id =
                                                qntn.nhom_tinh_nang_id

                                        WHERE
                                            qntn.quyen_id =
                                                q.id

                                            AND qntn.active =
                                                TRUE
                                    ),

                                    '[]'::JSON
                                )
                        )
                        ORDER BY q.ma_quyen ASC
                    ) FILTER (
                        WHERE q.id IS NOT NULL
                    ),
                    '[]'::JSON
                ) AS quyens

            FROM dm_vai_tro vt

            LEFT JOIN dm_vai_tro_quyen vtq
                ON vtq.vai_tro_id = vt.id
                AND vtq.active = TRUE

            LEFT JOIN dm_quyen q
                ON q.id = vtq.quyen_id

        `;
    }

    getGroupBy() {
        return `
            GROUP BY
                vt.id,
                vt.ma_vai_tro,
                vt.ten_vai_tro,
                vt.mo_ta,
                vt.active,
                vt.created_at,
                vt.updated_at
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ${this.getGroupBy()}

            ORDER BY vt.ma_vai_tro ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapVaiTro(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE vt.id = $1

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapVaiTro(result.rows[0]);
    }

    async getChiTietByMa(maVaiTro) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(vt.ma_vai_tro)
            ) = UPPER(
                TRIM($1)
            )

            ${this.getGroupBy()}

            LIMIT 1
        `;

        const result = await pool.query(sql, [maVaiTro]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapVaiTro(result.rows[0]);
    }

    async getDsQuyenByIds(ids) {
        const sql = `
            SELECT
                id,
                ma_quyen,
                ten_quyen,
                active
            FROM dm_quyen
            WHERE id = ANY($1::BIGINT[])
        `;

        const result = await pool.query(sql, [ids]);

        return result.rows.map((row) => ({
            id: row.id,

            maQuyen: row.ma_quyen,

            tenQuyen: row.ten_quyen,

            active: row.active
        }));
    }

    async getDsQuyenByMas(mas) {
        const sql = `
            SELECT
                id,
                ma_quyen,
                ten_quyen,
                active
            FROM dm_quyen
            WHERE UPPER(ma_quyen)
                IN (
                    SELECT UPPER(
                        UNNEST($1::TEXT[])
                    )
                )
        `;

        const result = await pool.query(sql, [mas]);

        return result.rows.map((row) => ({
            id: row.id,

            maQuyen: row.ma_quyen,

            tenQuyen: row.ten_quyen,

            active: row.active
        }));
    }

    async ganDsQuyen(client, vaiTroId, dsQuyenId) {
        if (!Array.isArray(dsQuyenId) || dsQuyenId.length === 0) {
            return;
        }

        const sql = `
            INSERT INTO dm_vai_tro_quyen (
                vai_tro_id,
                quyen_id,
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
                vai_tro_id,
                quyen_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [vaiTroId, dsQuyenId]);
    }

    async existsMaVaiTro(maVaiTro, excludeId = null) {
        const values = [maVaiTro];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_vai_tro
                WHERE UPPER(ma_vai_tro)
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

    async existsTenVaiTro(tenVaiTro, excludeId = null) {
        const values = [tenVaiTro];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_vai_tro
                WHERE LOWER(TRIM(ten_vai_tro))
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
                INSERT INTO dm_vai_tro (
                    ma_vai_tro,
                    ten_vai_tro,
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
                data.maVaiTro,

                data.tenVaiTro,

                data.moTa || null,

                data.active !== undefined ? data.active : true
            ];

            const result = await client.query(sql, values);

            const vaiTroId = result.rows[0].id;

            await this.ganDsQuyen(client, vaiTroId, data.dsQuyenId);

            await client.query('COMMIT');

            return await this.getChiTiet(vaiTroId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async khoaTatCaQuyen(client, vaiTroId) {
        const sql = `
            UPDATE dm_vai_tro_quyen
            SET
                active = FALSE,
                updated_at = NOW()
            WHERE vai_tro_id = $1
        `;

        await client.query(sql, [vaiTroId]);
    }

    async update(id, data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                UPDATE dm_vai_tro
                SET
                    ma_vai_tro = $1,
                    ten_vai_tro = $2,
                    mo_ta = $3,
                    active = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING id
            `;

            const values = [data.maVaiTro, data.tenVaiTro, data.moTa || null, data.active, id];

            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            await this.khoaTatCaQuyen(client, id);

            await this.ganDsQuyen(client, id, data.dsQuyenId);

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

module.exports = new VaiTroRepository();

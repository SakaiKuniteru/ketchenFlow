const pool = require('../../../../config/database');

class ThietLapRepository {
    mapThietLap(row) {
        if (!row) { return null; }

        const dsCoSo = Array.isArray(row.co_sos) ? row.co_sos : [];
        const dsNhomTinhNang = Array.isArray(row.nhom_tinh_nangs) ? row.nhom_tinh_nangs : [];
        const dsGiaTri = Array.isArray(row.gia_tris) ? row.gia_tris : [];

        return {
            id: row.id,
            maThietLap: row.ma_thiet_lap,
            tenThietLap: row.ten_thiet_lap,
            moTa: row.mo_ta,
            dsGiaTri: dsGiaTri.map(
                (item) => ({
                    id: Number(item.id),
                    giaTri: item.giaTri,
                    tuNgay: item.tuNgay,
                    denNgay: item.denNgay,
                    active: item.active,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                })
            ),
            dsCoSoId: dsCoSo.map((item) => Number(item.id)),
            dsMaCoSo: dsCoSo.map((item) => item.maCoSo),
            dsCoSo,
            coSo: dsCoSo.map((item) => item.tenCoSo).join(', '),
            dsNhomTinhNangId: dsNhomTinhNang.map((item) => Number(item.id)),
            dsMaNhomTinhNang: dsNhomTinhNang.map((item) => item.maNhomTinhNang),
            dsNhomTinhNang,
            nhomTinhNang: dsNhomTinhNang.map((item) => item.tenNhomTinhNang).join(', '),
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                tl.id,
                tl.ma_thiet_lap,
                tl.ten_thiet_lap,
                tl.mo_ta,
                tl.active,
                tl.created_at,
                tl.updated_at,

                COALESCE(
                    (
                        SELECT
                            JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'id',
                                        gt.id,

                                    'giaTri',
                                        gt.gia_tri,

                                    'tuNgay',
                                        gt.tu_ngay,

                                    'denNgay',
                                        gt.den_ngay,

                                    'active',
                                        gt.active,

                                    'createdAt',
                                        gt.created_at,

                                    'updatedAt',
                                        gt.updated_at
                                )
                                ORDER BY
                                    gt.tu_ngay ASC NULLS FIRST,
                                    gt.id ASC
                            )

                        FROM dm_thiet_lap_gia_tri gt

                        WHERE
                            gt.thiet_lap_id =
                                tl.id
                    ),

                    '[]'::JSON
                ) AS gia_tris,

                COALESCE(
                    (
                        SELECT
                            JSON_AGG(

                                JSON_BUILD_OBJECT(

                                    'id',
                                        cs.id,

                                    'maCoSo',
                                        cs.ma_co_so,

                                    'tenCoSo',
                                        cs.ten_co_so,

                                    'diaChi',
                                        cs.dia_chi,

                                    'active',
                                        lkcs.active

                                )

                                ORDER BY
                                    cs.ma_co_so ASC

                            )

                        FROM dm_thiet_lap_co_so lkcs

                        INNER JOIN dm_co_so cs
                            ON cs.id =
                                lkcs.co_so_id

                        WHERE
                            lkcs.thiet_lap_id =
                                tl.id

                            AND lkcs.active =
                                TRUE

                    ),

                    '[]'::JSON

                ) AS co_sos,


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
                                        ntn.ten_nhom_tinh_nang,

                                    'active',
                                        lkntn.active

                                )

                                ORDER BY
                                    ntn.ma_nhom_tinh_nang ASC

                            )

                        FROM dm_thiet_lap_nhom_tinh_nang lkntn

                        INNER JOIN dm_nhom_tinh_nang ntn
                            ON ntn.id =
                                lkntn.nhom_tinh_nang_id

                        WHERE
                            lkntn.thiet_lap_id =
                                tl.id

                            AND lkntn.active =
                                TRUE
                    ),

                    '[]'::JSON

                ) AS nhom_tinh_nangs

            FROM dm_thiet_lap tl
        `;
    }

    async getGiaTriTheoMa(maThietLap) {
        const sql = `
            SELECT
                gt.gia_tri

            FROM dm_thiet_lap tl

            INNER JOIN LATERAL (
                SELECT
                    value.gia_tri

                FROM dm_thiet_lap_gia_tri value

                WHERE
                    value.thiet_lap_id = tl.id

                    AND value.active = TRUE

                    AND (
                        value.tu_ngay IS NULL
                        OR value.tu_ngay <= NOW()
                    )

                    AND (
                        value.den_ngay IS NULL
                        OR value.den_ngay >= NOW()
                    )

                ORDER BY
                    value.tu_ngay DESC NULLS LAST,
                    value.id DESC

                LIMIT 1
            ) gt
                ON TRUE

            WHERE
                UPPER(
                    TRIM(
                        tl.ma_thiet_lap
                    )
                ) = UPPER(
                    TRIM(
                        $1
                    )
                )

                AND tl.active = TRUE

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [maThietLap]
            );

        if (
            result.rows.length === 0
        ) {
            return null;
        }

        return result.rows[0].gia_tri;
    }

    async getGiaTriTheoId(maThietLap) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE
                UPPER(
                    tl.ma_thiet_lap
                ) = UPPER(
                    $1
                )

                AND tl.active = TRUE

            LIMIT 1
        `;

        const result = await pool.query(sql, [maThietLap]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThietLap(result.rows[0]);
    }

    async getChiTietByMa(maThietLap) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(tl.ma_thiet_lap)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maThietLap]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThietLap(result.rows[0]);
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY
                tl.ma_thiet_lap ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapThietLap(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tl.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThietLap(result.rows[0]);
    }

    async getDsCoSoByIds(ids) {
        const sql = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                dia_chi,
                active

            FROM dm_co_so

            WHERE id = ANY(
                $1::BIGINT[]
            )
        `;

        const result = await pool.query(sql, [ids]);

        return result.rows.map((row) => ({
            id: row.id,

            maCoSo: row.ma_co_so,

            tenCoSo: row.ten_co_so,

            diaChi: row.dia_chi,

            active: row.active
        }));
    }

    async getDsCoSoByMas(mas) {
        const sql = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                dia_chi,
                active

            FROM dm_co_so

            WHERE UPPER(
                TRIM(ma_co_so)
            ) IN (

                SELECT
                    UPPER(
                        TRIM(
                            UNNEST(
                                $1::TEXT[]
                            )
                        )
                    )

            )
        `;

        const result = await pool.query(sql, [mas]);

        return result.rows.map((row) => ({
            id: row.id,

            maCoSo: row.ma_co_so,

            tenCoSo: row.ten_co_so,

            diaChi: row.dia_chi,

            active: row.active
        }));
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
            AND active = TRUE
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

            AND active = TRUE
        `;

        const result = await pool.query(sql, [mas]);

        return result.rows.map((row) => ({
            id: row.id,

            maNhomTinhNang: row.ma_nhom_tinh_nang,

            tenNhomTinhNang: row.ten_nhom_tinh_nang,

            active: row.active
        }));
    }

    async existsMaThietLap(maThietLap, excludeId = null) {
        const values = [maThietLap];

        let sql = `
            SELECT EXISTS (

                SELECT 1

                FROM dm_thiet_lap

                WHERE UPPER(ma_thiet_lap)
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

    async existsTenThietLap(tenThietLap, excludeId = null) {
        const values = [tenThietLap];

        let sql = `
            SELECT EXISTS (

                SELECT 1

                FROM dm_thiet_lap

                WHERE LOWER(
                    TRIM(
                        ten_thiet_lap
                    )
                ) = LOWER(
                    TRIM(
                        $1
                    )
                )
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

    async ganDsNhomTinhNang(client, thietLapId, dsNhomTinhNangId) {
        if (!Array.isArray(dsNhomTinhNangId) || dsNhomTinhNangId.length === 0) {
            return;
        }

        const sql = `
            INSERT INTO dm_thiet_lap_nhom_tinh_nang (
                thiet_lap_id,
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
                thiet_lap_id,
                nhom_tinh_nang_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [thietLapId, dsNhomTinhNangId]);
    }

    async ganDsCoSo(client, thietLapId, dsCoSoId) {
        if (!Array.isArray(dsCoSoId) || dsCoSoId.length === 0) {
            return;
        }

        const sql = `
            INSERT INTO dm_thiet_lap_co_so
            (
                thiet_lap_id,
                co_so_id,
                active,
                created_at,
                updated_at
            )

            SELECT
                $1,
                UNNEST(
                    $2::BIGINT[]
                ),
                TRUE,
                NOW(),
                NOW()

            ON CONFLICT
            (
                thiet_lap_id,
                co_so_id
            )

            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [thietLapId, dsCoSoId]);
    }

    async khoaTatCaNhomTinhNang(client, thietLapId) {
        const sql = `
            UPDATE dm_thiet_lap_nhom_tinh_nang

            SET
                active = FALSE,
                updated_at = NOW()

            WHERE thiet_lap_id = $1
        `;

        await client.query(sql, [thietLapId]);
    }

    async khoaTatCaCoSo(client, thietLapId) {
        const sql = `
            UPDATE dm_thiet_lap_co_so

            SET
                active = FALSE,
                updated_at = NOW()

            WHERE thiet_lap_id = $1
        `;

        await client.query(sql, [thietLapId]);
    }

    async createGiaTri(
        client,
        thietLapId,
        item
    ) {
        const sql = `
            INSERT INTO dm_thiet_lap_gia_tri (
                thiet_lap_id,
                gia_tri,
                tu_ngay,
                den_ngay,
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

        const result =
            await client.query(
                sql,
                [
                    thietLapId,

                    item.giaTri !== undefined &&
                    item.giaTri !== null
                        ? String(
                            item.giaTri
                        )
                        : null,

                    item.tuNgay || null,

                    item.denNgay || null,

                    item.active !== false
                ]
            );

        return result.rows[0].id;
    }

    async khoaTatCaGiaTri(
        client,
        thietLapId
    ) {
        const sql = `
            UPDATE dm_thiet_lap_gia_tri

            SET
                active = FALSE,
                updated_at = NOW()

            WHERE
                thiet_lap_id = $1
        `;

        await client.query(
            sql,
            [thietLapId]
        );
    }

    async updateGiaTri(
        client,
        thietLapId,
        item
    ) {
        const sql = `
            UPDATE dm_thiet_lap_gia_tri

            SET
                gia_tri = $3,
                tu_ngay = $4,
                den_ngay = $5,
                active = $6,
                updated_at = NOW()

            WHERE
                id = $1

                AND thiet_lap_id = $2

            RETURNING id
        `;

        const result =
            await client.query(
                sql,
                [
                    item.id,
                    thietLapId,

                    item.giaTri !== undefined &&
                    item.giaTri !== null
                        ? String(
                            item.giaTri
                        )
                        : null,

                    item.tuNgay || null,

                    item.denNgay || null,

                    item.active !== false
                ]
            );

        return result.rows[0] || null;
    }

    async create(data) {
        const client =
            await pool.connect();

        try {
            await client.query(
                'BEGIN'
            );

            const result =
                await client.query(
                    `
                        INSERT INTO dm_thiet_lap (
                            ma_thiet_lap,
                            ten_thiet_lap,
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
                    `,
                    [
                        data.maThietLap,
                        data.tenThietLap,
                        data.moTa || null,
                        data.active !== false
                    ]
                );

            const thietLapId =
                result.rows[0].id;

            await this.ganDsCoSo(
                client,
                thietLapId,
                data.dsCoSoId
            );

            await this.ganDsNhomTinhNang(
                client,
                thietLapId,
                data.dsNhomTinhNangId
            );

            for (
                const item of data.dsGiaTri
            ) {
                await this.createGiaTri(
                    client,
                    thietLapId,
                    item
                );
            }

            await client.query(
                'COMMIT'
            );

            return await this.getChiTiet(
                thietLapId
            );
        } catch (error) {
            await client.query(
                'ROLLBACK'
            );

            throw error;
        } finally {
            client.release();
        }
    }

    async update(id, data) {
        const client =
            await pool.connect();

        try {
            await client.query(
                'BEGIN'
            );

            const result =
                await client.query(
                    `
                        UPDATE dm_thiet_lap

                        SET
                            ma_thiet_lap = $1,
                            ten_thiet_lap = $2,
                            mo_ta = $3,
                            active = $4,
                            updated_at = NOW()

                        WHERE
                            id = $5

                        RETURNING id
                    `,
                    [
                        data.maThietLap,
                        data.tenThietLap,
                        data.moTa || null,
                        data.active,
                        id
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                await client.query(
                    'ROLLBACK'
                );

                return null;
            }

            await this.khoaTatCaCoSo(
                client,
                id
            );

            await this.ganDsCoSo(
                client,
                id,
                data.dsCoSoId
            );

            await this.khoaTatCaNhomTinhNang(
                client,
                id
            );

            await this.ganDsNhomTinhNang(
                client,
                id,
                data.dsNhomTinhNangId
            );

            await this.khoaTatCaGiaTri(
                client,
                id
            );

            for (
                const item of data.dsGiaTri
            ) {
                if (
                    item.id !== undefined &&
                    item.id !== null
                ) {
                    const giaTriDaCapNhat =
                        await this.updateGiaTri(
                            client,
                            id,
                            item
                        );

                    if (!giaTriDaCapNhat) {
                        throw new Error(
                            `Không tìm thấy giá trị thiết lập ID ${item.id}.`
                        );
                    }

                    continue;
                }

                await this.createGiaTri(
                    client,
                    id,
                    item
                );
            }

            await client.query(
                'COMMIT'
            );

            return await this.getChiTiet(
                id
            );
        } catch (error) {
            await client.query(
                'ROLLBACK'
            );

            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new ThietLapRepository();

'use strict';

const pool = require('../../config/database');

class CauHinhRepository {
    async getThietLapByMa(ma, client = pool) {
        const query = `
            SELECT
                tl.id,
                tl.ma_thiet_lap,
                tl.ten_thiet_lap,
                tl.active,

                gt.id AS gia_tri_id,
                gt.gia_tri,
                gt.tu_ngay,
                gt.den_ngay

            FROM dm_thiet_lap tl

            LEFT JOIN LATERAL (
                SELECT
                    value.id,
                    value.gia_tri,
                    value.tu_ngay,
                    value.den_ngay

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

            LIMIT 1
        `;

        const { rows } =
            await client.query(
                query,
                [ma]
            );

        return rows[0] || null;
    }

    async getGiaTriHieuLuc(
        maThietLap,
        {
            coSoId = null,
            thoiDiem = new Date()
        } = {},
        client = pool
    ) {
        const query = `
            SELECT
                tl.id,
                tl.ma_thiet_lap,
                tl.ten_thiet_lap,
                tl.active,

                gt.id AS gia_tri_id,
                gt.gia_tri,
                gt.tu_ngay,
                gt.den_ngay

            FROM dm_thiet_lap tl

            INNER JOIN dm_thiet_lap_gia_tri gt
                ON gt.thiet_lap_id = tl.id

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

                AND gt.active = TRUE

                AND (
                    gt.tu_ngay IS NULL
                    OR gt.tu_ngay <= $2
                )

                AND (
                    gt.den_ngay IS NULL
                    OR gt.den_ngay >= $2
                )

                AND (
                    NOT EXISTS (
                        SELECT 1

                        FROM dm_thiet_lap_co_so lkcs

                        WHERE
                            lkcs.thiet_lap_id =
                                tl.id

                            AND lkcs.active =
                                TRUE
                    )

                    OR EXISTS (
                        SELECT 1

                        FROM dm_thiet_lap_co_so lkcs

                        WHERE
                            lkcs.thiet_lap_id =
                                tl.id

                            AND lkcs.active =
                                TRUE

                            AND lkcs.co_so_id =
                                $3
                    )
                )

            ORDER BY
                gt.tu_ngay DESC NULLS LAST,
                gt.id DESC

            LIMIT 1
        `;

        const { rows } =
            await client.query(
                query,
                [
                    maThietLap,
                    thoiDiem,
                    coSoId
                ]
            );

        return rows[0] || null;
    }

    async getCoSoByMa(maCoSo) {
        const query = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                logo
            FROM dm_co_so
            WHERE UPPER(
                TRIM(
                    ma_co_so
                )
            ) = UPPER(
                TRIM(
                    $1
                )
            )
            AND active = TRUE
            LIMIT 1
        `;

        const { rows } = await pool.query(query, [maCoSo]);

        return rows[0] || null;
    }
}

module.exports = new CauHinhRepository();

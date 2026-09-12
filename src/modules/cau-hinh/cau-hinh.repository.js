'use strict';

const pool = require('../../config/database');

class CauHinhRepository {
    async getThietLapByMa(ma, client = pool) {
        const query = `
            SELECT
                id,
                ma_thiet_lap,
                ten_thiet_lap,
                gia_tri,
                active
            FROM dm_thiet_lap
            WHERE UPPER(
                TRIM(
                    ma_thiet_lap
                )
            ) = UPPER(
                TRIM(
                    $1
                )
            )
            LIMIT 1
        `;

        const { rows } = await client.query(query, [ma]);

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

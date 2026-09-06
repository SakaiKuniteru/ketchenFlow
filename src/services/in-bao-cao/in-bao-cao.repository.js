"use strict";

const pool =
    require(
        "../../config/database"
    );


class InBaoCaoRepository {

    async getByMa(
        maBaoCao
    ) {

        const sql = `

            SELECT

                id,
                ma_bao_cao,
                ten_bao_cao,
                file_mau,
                loai_xuat_file,
                mo_ta,
                active,
                created_at,
                updated_at

            FROM dm_bao_cao

            WHERE
                LOWER(
                    TRIM(
                        ma_bao_cao
                    )
                ) =
                LOWER(
                    TRIM(
                        $1
                    )
                )

                AND active = TRUE

            LIMIT 1

        `;


        const result =
            await pool.query(
                sql,
                [
                    maBaoCao
                ]
            );


        return result.rows[0] ||
            null;

    }

}


module.exports =
    new InBaoCaoRepository();
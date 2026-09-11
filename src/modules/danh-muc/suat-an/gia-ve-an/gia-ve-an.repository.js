const pool = require('../../../../config/database');

class GiaVeAnRepository {
    mapGiaVeAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            doiTuongLayVe: row.doi_tuong_lay_ve,
            coSoId: row.co_so_id,
            maCoSo: row.ma_co_so,
            tenCoSo: row.ten_co_so,
            nhaAnId: row.nha_an_id,
            maNhaAn: row.ma_nha_an,
            tenNhaAn: row.ten_nha_an,
            caAnId: row.ca_an_id,
            maCaAn: row.ma_ca_an,
            tenCaAn: row.ten_ca_an,
            thoiGianBatDau: row.thoi_gian_bat_dau,
            thoiGianKetThuc: row.thoi_gian_ket_thuc,
            donGia: Number(row.don_gia),
            tuNgay: row.tu_ngay,
            denNgay: row.den_ngay,
            mucDoUuTien: row.muc_do_uu_tien,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                gva.id,

                gva.doi_tuong_lay_ve,

                gva.co_so_id,

                cs.ma_co_so,
                cs.ten_co_so,

                gva.nha_an_id,

                na.ma_nha_an,
                na.ten_nha_an,

                gva.ca_an_id,

                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc,

                gva.don_gia,

                gva.tu_ngay,
                gva.den_ngay,

                gva.muc_do_uu_tien,

                gva.ghi_chu,

                gva.active,
                gva.created_at,
                gva.updated_at

            FROM dm_gia_ve_an gva

            LEFT JOIN dm_co_so cs
                ON cs.id =
                   gva.co_so_id

            LEFT JOIN dm_nha_an na
                ON na.id =
                   gva.nha_an_id

            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   gva.ca_an_id

        `;
    }

    async getTongHop(query = {}) {
        const conditions = [];
        const values = [];

        if (query.active !== undefined) {
            values.push(query.active === true || query.active === 'true');

            conditions.push(`gva.active = $${values.length}`);
        }

        if (query.doiTuongLayVe) {
            values.push(Number(query.doiTuongLayVe));

            conditions.push(`gva.doi_tuong_lay_ve = $${values.length}`);
        }

        if (query.coSoId) {
            values.push(Number(query.coSoId));

            conditions.push(`gva.co_so_id = $${values.length}`);
        }

        if (query.nhaAnId) {
            values.push(Number(query.nhaAnId));

            conditions.push(`gva.nha_an_id = $${values.length}`);
        }

        if (query.caAnId) {
            values.push(Number(query.caAnId));

            conditions.push(`gva.ca_an_id = $${values.length}`);
        }

        let sql = `
            ${this.getBaseQuery()}
        `;

        if (conditions.length > 0) {
            sql += `
                WHERE
                    ${conditions.join('\nAND ')}
            `;
        }

        sql += `

            ORDER BY

                gva.muc_do_uu_tien DESC,

                gva.tu_ngay DESC,

                gva.id DESC

        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapGiaVeAn(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE gva.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapGiaVeAn(result.rows[0]);
    }

    async getTimGia(thucDonNgayId, doiTuongLayVe) {
        const sql = `

            SELECT

                gva.id,

                gva.doi_tuong_lay_ve,

                gva.co_so_id,

                cs.ma_co_so,
                cs.ten_co_so,

                gva.nha_an_id,

                na.ma_nha_an,
                na.ten_nha_an,

                gva.ca_an_id,

                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc,

                gva.don_gia,

                gva.tu_ngay,
                gva.den_ngay,

                gva.muc_do_uu_tien,

                gva.ghi_chu,

                gva.active,
                gva.created_at,
                gva.updated_at

            FROM ct_thuc_don_ngay tdn

            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id

            INNER JOIN dm_gia_ve_an gva
                ON gva.doi_tuong_lay_ve = $2

                AND gva.active = TRUE

                AND (
                    gva.co_so_id IS NULL
                    OR gva.co_so_id =
                       td.co_so_id
                )

                AND (
                    gva.nha_an_id IS NULL
                    OR gva.nha_an_id =
                       td.nha_an_id
                )

                AND (
                    gva.ca_an_id IS NULL
                    OR gva.ca_an_id =
                       td.ca_an_id
                )

                AND gva.tu_ngay <=
                    tdn.ngay

                AND (
                    gva.den_ngay IS NULL
                    OR gva.den_ngay >=
                       tdn.ngay
                )

            LEFT JOIN dm_co_so cs
                ON cs.id =
                   gva.co_so_id

            LEFT JOIN dm_nha_an na
                ON na.id =
                   gva.nha_an_id

            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   gva.ca_an_id

            WHERE
                tdn.id = $1

                AND tdn.active = TRUE

                AND td.active = TRUE

            ORDER BY

                (
                    CASE
                        WHEN gva.co_so_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                    +
                    CASE
                        WHEN gva.nha_an_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                    +
                    CASE
                        WHEN gva.ca_an_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                ) DESC,

                gva.muc_do_uu_tien DESC,

                gva.tu_ngay DESC,

                gva.id DESC

            LIMIT 1

        `;

        const result = await pool.query(sql, [thucDonNgayId, doiTuongLayVe]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapGiaVeAn(result.rows[0]);
    }

    async existsCauHinhTrung(data, excludeId = null) {
        const values = [data.doiTuongLayVe, data.coSoId, data.nhaAnId, data.caAnId, data.tuNgay, data.denNgay];

        let sql = `

            SELECT EXISTS (

                SELECT 1

                FROM dm_gia_ve_an

                WHERE
                    doi_tuong_lay_ve = $1

                    AND (
                        co_so_id IS NULL
                        OR $2::BIGINT IS NULL
                        OR co_so_id = $2
                    )

                    AND (
                        nha_an_id IS NULL
                        OR $3::BIGINT IS NULL
                        OR nha_an_id = $3
                    )

                    AND (
                        ca_an_id IS NULL
                        OR $4::BIGINT IS NULL
                        OR ca_an_id = $4
                    )

                    AND daterange(
                        tu_ngay,
                        COALESCE(
                            den_ngay,
                            'infinity'::date
                        ),
                        '[]'
                    )
                    &&
                    daterange(
                        $5::date,
                        COALESCE(
                            $6::date,
                            'infinity'::date
                        ),
                        '[]'
                    )

        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `

                AND id <> $${values.length}

            `;
        }

        sql += `

            ) AS "exists"

        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async existsCoSo(id) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM dm_co_so

                WHERE id = $1

            ) AS "exists"

        `;

        const result = await pool.query(sql, [id]);

        return result.rows[0].exists;
    }

    async getNhaAnById(id) {
        const sql = `

            SELECT

                id,
                co_so_id

            FROM dm_nha_an

            WHERE id = $1

            LIMIT 1

        `;

        const result = await pool.query(sql, [id]);

        return result.rows[0] || null;
    }

    async existsCaAn(id) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM dm_ca_an

                WHERE id = $1

            ) AS "exists"

        `;

        const result = await pool.query(sql, [id]);

        return result.rows[0].exists;
    }

    async create(data) {
        const sql = `

            INSERT INTO dm_gia_ve_an (

                doi_tuong_lay_ve,

                co_so_id,
                nha_an_id,
                ca_an_id,

                don_gia,

                tu_ngay,
                den_ngay,

                muc_do_uu_tien,

                ghi_chu,

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

                $6,
                $7,

                $8,

                $9,

                $10,

                NOW(),
                NOW()

            )

            RETURNING id

        `;

        const values = [
            data.doiTuongLayVe,
            data.coSoId,
            data.nhaAnId,
            data.caAnId,
            data.donGia,
            data.tuNgay,
            data.denNgay,
            data.mucDoUuTien,
            data.ghiChu,
            data.active
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `

            UPDATE dm_gia_ve_an

            SET

                doi_tuong_lay_ve = $1,

                co_so_id = $2,
                nha_an_id = $3,
                ca_an_id = $4,

                don_gia = $5,

                tu_ngay = $6,
                den_ngay = $7,

                muc_do_uu_tien = $8,

                ghi_chu = $9,

                active = $10,

                updated_at = NOW()

            WHERE id = $11

            RETURNING id

        `;

        const values = [
            data.doiTuongLayVe,
            data.coSoId,
            data.nhaAnId,
            data.caAnId,
            data.donGia,
            data.tuNgay,
            data.denNgay,
            data.mucDoUuTien,
            data.ghiChu,
            data.active,
            id
        ];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new GiaVeAnRepository();

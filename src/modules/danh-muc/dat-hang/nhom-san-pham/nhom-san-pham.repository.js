const pool =
    require(
        "../../../../config/database"
    );


class NhomSanPhamRepository {

    mapNhomSanPham(
        row
    ) {

        if (!row) {
            return null;
        }

        return {

            id:
                row.id,

            maNhomSanPham:
                row.ma_nhom_san_pham,

            tenNhomSanPham:
                row.ten_nhom_san_pham,

            loaiSanPham:
                row.loai_san_pham,

            moTa:
                row.mo_ta,

            thuTuHienThi:
                row.thu_tu_hien_thi,

            active:
                row.active,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at

        };

    }


    getBaseQuery() {

        return `

            SELECT

                nsp.id,
                nsp.ma_nhom_san_pham,
                nsp.ten_nhom_san_pham,
                nsp.loai_san_pham,
                nsp.mo_ta,
                nsp.thu_tu_hien_thi,
                nsp.active,
                nsp.created_at,
                nsp.updated_at

            FROM dm_nhom_san_pham nsp

        `;

    }


    async getTongHop(
        query = {}
    ) {

        const values =
            [];

        const conditions =
            [];

        if (query.keyword) {

            values.push(
                `%${String(
                    query.keyword
                ).trim()}%`
            );

            conditions.push(`
                (
                    nsp.ma_nhom_san_pham
                        ILIKE $${values.length}

                    OR nsp.ten_nhom_san_pham
                        ILIKE $${values.length}

                    OR nsp.mo_ta
                        ILIKE $${values.length}
                )
            `);

        }

        if (
            query.loaiSanPham !== undefined &&
            query.loaiSanPham !== ""
        ) {

            values.push(
                Number(
                    query.loaiSanPham
                )
            );

            conditions.push(
                `nsp.loai_san_pham = $${values.length}`
            );

        }

        if (
            query.active !== undefined &&
            query.active !== ""
        ) {

            values.push(
                String(
                    query.active
                ) === "true"
            );

            conditions.push(
                `nsp.active = $${values.length}`
            );

        }

        const where =
            conditions.length > 0
                ? `WHERE ${conditions.join(
                    " AND "
                )}`
                : "";

        const sql = `
            ${this.getBaseQuery()}

            ${where}

            ORDER BY
                nsp.thu_tu_hien_thi ASC,
                nsp.ma_nhom_san_pham ASC
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows.map(
            row =>
                this.mapNhomSanPham(
                    row
                )
        );

    }


    async getChiTiet(
        id
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE nsp.id = $1

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [
                    id
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapNhomSanPham(
            result.rows[0]
        );

    }


    async getChiTietByMa(
        maNhomSanPham
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(
                    nsp.ma_nhom_san_pham
                )
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [
                    maNhomSanPham
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapNhomSanPham(
            result.rows[0]
        );

    }


    async existsMaNhomSanPham(
        maNhomSanPham,
        excludeId = null
    ) {

        const values = [
            maNhomSanPham
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_nhom_san_pham

                WHERE UPPER(
                    TRIM(
                        ma_nhom_san_pham
                    )
                ) = UPPER(
                    TRIM($1)
                )
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

            sql += `
                AND id <> $2
            `;

        }

        sql += `
            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows[0].exists;

    }


    async existsTenNhomSanPham(
        tenNhomSanPham,
        excludeId = null
    ) {

        const values = [
            tenNhomSanPham
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_nhom_san_pham

                WHERE LOWER(
                    TRIM(
                        ten_nhom_san_pham
                    )
                ) = LOWER(
                    TRIM($1)
                )
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

            sql += `
                AND id <> $2
            `;

        }

        sql += `
            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows[0].exists;

    }


    async create(
        data
    ) {

        const sql = `
            INSERT INTO dm_nhom_san_pham (

                ma_nhom_san_pham,
                ten_nhom_san_pham,
                loai_san_pham,
                mo_ta,
                thu_tu_hien_thi,
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
                NOW(),
                NOW()

            )
            RETURNING id
        `;

        const values = [

            data.maNhomSanPham,

            data.tenNhomSanPham,

            data.loaiSanPham,

            data.moTa,

            data.thuTuHienThi,

            data.active

        ];

        const result =
            await pool.query(
                sql,
                values
            );

        return await this.getChiTiet(
            result.rows[0].id
        );

    }


    async update(
        id,
        data
    ) {

        const sql = `
            UPDATE dm_nhom_san_pham
            SET

                ma_nhom_san_pham = $1,
                ten_nhom_san_pham = $2,
                loai_san_pham = $3,
                mo_ta = $4,
                thu_tu_hien_thi = $5,
                active = $6,
                updated_at = NOW()

            WHERE id = $7

            RETURNING id
        `;

        const values = [

            data.maNhomSanPham,

            data.tenNhomSanPham,

            data.loaiSanPham,

            data.moTa,

            data.thuTuHienThi,

            data.active,

            id

        ];

        const result =
            await pool.query(
                sql,
                values
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return await this.getChiTiet(
            result.rows[0].id
        );

    }

}


module.exports =
    new NhomSanPhamRepository();
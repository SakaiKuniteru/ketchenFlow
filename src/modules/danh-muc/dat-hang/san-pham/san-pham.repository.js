const pool =
    require(
        "../../../../config/database"
    );


class SanPhamRepository {

    mapSanPham(
        row
    ) {

        if (!row) {
            return null;
        }

        return {

            id:
                row.id,

            maSanPham:
                row.ma_san_pham,

            tenSanPham:
                row.ten_san_pham,

            nhomSanPhamId:
                row.nhom_san_pham_id,

            maNhomSanPham:
                row.ma_nhom_san_pham,

            tenNhomSanPham:
                row.ten_nhom_san_pham,

            loaiSanPham:
                row.loai_san_pham,

            donViTinhId:
                row.don_vi_tinh_id,

            maDonViTinh:
                row.ma_don_vi_tinh,

            tenDonViTinh:
                row.ten_don_vi_tinh,

            kyHieuDonVi:
                row.ky_hieu_don_vi,

            giaBan:
                row.gia_ban,

            moTa:
                row.mo_ta,

            hinhAnh:
                row.hinh_anh,

            choPhepDat:
                row.cho_phep_dat,

            laSanPhamMoi:
                row.la_san_pham_moi,

            laSanPhamNoiBat:
                row.la_san_pham_noi_bat,

            soLuongToiThieu:
                row.so_luong_toi_thieu,

            soLuongToiDa:
                row.so_luong_toi_da,

            buocSoLuong:
                row.buoc_so_luong,

            thoiGianChuanBiPhut:
                row.thoi_gian_chuan_bi_phut,

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

                sp.id,
                sp.ma_san_pham,
                sp.ten_san_pham,
                sp.nhom_san_pham_id,
                sp.don_vi_tinh_id,
                sp.gia_ban,
                sp.mo_ta,
                sp.hinh_anh,
                sp.cho_phep_dat,
                sp.la_san_pham_moi,
                sp.la_san_pham_noi_bat,
                sp.so_luong_toi_thieu,
                sp.so_luong_toi_da,
                sp.buoc_so_luong,
                sp.thoi_gian_chuan_bi_phut,
                sp.thu_tu_hien_thi,
                sp.active,
                sp.created_at,
                sp.updated_at,

                nsp.ma_nhom_san_pham,
                nsp.ten_nhom_san_pham,
                nsp.loai_san_pham,

                dvt.ma_don_vi_tinh,
                dvt.ten_don_vi_tinh,
                dvt.ky_hieu AS ky_hieu_don_vi

            FROM dm_san_pham sp

            JOIN dm_nhom_san_pham nsp
                ON nsp.id =
                    sp.nhom_san_pham_id

            LEFT JOIN dm_don_vi_tinh dvt
                ON dvt.id =
                    sp.don_vi_tinh_id

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
                    sp.ma_san_pham
                        ILIKE $${values.length}

                    OR sp.ten_san_pham
                        ILIKE $${values.length}

                    OR sp.mo_ta
                        ILIKE $${values.length}
                )
            `);

        }

        if (
            query.nhomSanPhamId !== undefined &&
            query.nhomSanPhamId !== ""
        ) {

            values.push(
                Number(
                    query.nhomSanPhamId
                )
            );

            conditions.push(
                `sp.nhom_san_pham_id = $${values.length}`
            );

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
            query.donViTinhId !== undefined &&
            query.donViTinhId !== ""
        ) {

            values.push(
                Number(
                    query.donViTinhId
                )
            );

            conditions.push(
                `sp.don_vi_tinh_id = $${values.length}`
            );

        }

        for (
            const [
                key,
                column
            ] of [
                [
                    "choPhepDat",
                    "sp.cho_phep_dat"
                ],
                [
                    "laSanPhamMoi",
                    "sp.la_san_pham_moi"
                ],
                [
                    "laSanPhamNoiBat",
                    "sp.la_san_pham_noi_bat"
                ],
                [
                    "active",
                    "sp.active"
                ]
            ]
        ) {

            if (
                query[key] !== undefined &&
                query[key] !== ""
            ) {

                values.push(
                    String(
                        query[key]
                    ) === "true"
                );

                conditions.push(
                    `${column} = $${values.length}`
                );

            }

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
                sp.thu_tu_hien_thi ASC,
                sp.ma_san_pham ASC
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows.map(
            row =>
                this.mapSanPham(
                    row
                )
        );

    }


    async getChiTiet(
        id
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE sp.id = $1

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

        return this.mapSanPham(
            result.rows[0]
        );

    }


    async getChiTietByMa(
        maSanPham
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(
                    sp.ma_san_pham
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
                    maSanPham
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapSanPham(
            result.rows[0]
        );

    }


    async existsMaSanPham(
        maSanPham,
        excludeId = null
    ) {

        const values = [
            maSanPham
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_san_pham

                WHERE UPPER(
                    TRIM(
                        ma_san_pham
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


    async existsTenSanPham(
        tenSanPham,
        excludeId = null
    ) {

        const values = [
            tenSanPham
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_san_pham

                WHERE LOWER(
                    TRIM(
                        ten_san_pham
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


    async existsNhomSanPham(
        nhomSanPhamId
    ) {

        const sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_nhom_san_pham

                WHERE id = $1
                    AND active = TRUE

            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                [
                    nhomSanPhamId
                ]
            );

        return result.rows[0].exists;

    }


    async existsDonViTinh(
        donViTinhId
    ) {

        if (
            donViTinhId === null ||
            donViTinhId === undefined
        ) {
            return true;
        }

        const sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_don_vi_tinh

                WHERE id = $1
                    AND active = TRUE

            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                [
                    donViTinhId
                ]
            );

        return result.rows[0].exists;

    }


    async create(
        data
    ) {

        const sql = `
            INSERT INTO dm_san_pham (

                ma_san_pham,
                ten_san_pham,
                nhom_san_pham_id,
                don_vi_tinh_id,
                gia_ban,
                mo_ta,
                hinh_anh,
                cho_phep_dat,
                la_san_pham_moi,
                la_san_pham_noi_bat,
                so_luong_toi_thieu,
                so_luong_toi_da,
                buoc_so_luong,
                thoi_gian_chuan_bi_phut,
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
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                NOW(),
                NOW()

            )
            RETURNING id
        `;

        const values = [

            data.maSanPham,

            data.tenSanPham,

            data.nhomSanPhamId,

            data.donViTinhId,

            data.giaBan,

            data.moTa,

            data.hinhAnh,

            data.choPhepDat,

            data.laSanPhamMoi,

            data.laSanPhamNoiBat,

            data.soLuongToiThieu,

            data.soLuongToiDa,

            data.buocSoLuong,

            data.thoiGianChuanBiPhut,

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
            UPDATE dm_san_pham
            SET

                ma_san_pham = $1,
                ten_san_pham = $2,
                nhom_san_pham_id = $3,
                don_vi_tinh_id = $4,
                gia_ban = $5,
                mo_ta = $6,
                hinh_anh = $7,
                cho_phep_dat = $8,
                la_san_pham_moi = $9,
                la_san_pham_noi_bat = $10,
                so_luong_toi_thieu = $11,
                so_luong_toi_da = $12,
                buoc_so_luong = $13,
                thoi_gian_chuan_bi_phut = $14,
                thu_tu_hien_thi = $15,
                active = $16,
                updated_at = NOW()

            WHERE id = $17

            RETURNING id
        `;

        const values = [

            data.maSanPham,

            data.tenSanPham,

            data.nhomSanPhamId,

            data.donViTinhId,

            data.giaBan,

            data.moTa,

            data.hinhAnh,

            data.choPhepDat,

            data.laSanPhamMoi,

            data.laSanPhamNoiBat,

            data.soLuongToiThieu,

            data.soLuongToiDa,

            data.buocSoLuong,

            data.thoiGianChuanBiPhut,

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
    new SanPhamRepository();
const pool =
    require("../../../../config/database");


class DiaDiemNhanHangRepository {

    mapDiaDiemNhanHang(
        row
    ) {

        if (!row) {
            return null;
        }

        return {
            id:
                row.id,

            nhanVienId:
                row.nhan_vien_id,

            maNhanVien:
                row.ma_nhan_vien,

            tenNhanVien:
                row.ten_nhan_vien,

            soDienThoaiNhanVien:
                row.so_dien_thoai_nhan_vien,

            coSoId:
                row.co_so_id,

            tenCoSo:
                row.ten_co_so,

            phongBanId:
                row.phong_ban_id,

            tenPhongBan:
                row.ten_phong_ban,

            maDiaDiem:
                row.ma_dia_diem,

            tenDiaDiem:
                row.ten_dia_diem,

            diaChiChiTiet:
                row.dia_chi_chi_tiet,

            loaiDiaDiem:
                row.loai_dia_diem,

            laMacDinh:
                row.la_mac_dinh,

            ghiChu:
                row.ghi_chu,

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

                dd.id,
                dd.nhan_vien_id,
                dd.ma_dia_diem,
                dd.ten_dia_diem,
                dd.dia_chi_chi_tiet,
                dd.loai_dia_diem,
                dd.la_mac_dinh,
                dd.ghi_chu,
                dd.thu_tu_hien_thi,
                dd.active,
                dd.created_at,
                dd.updated_at,

                nv.ma_nhan_vien,
                nv.ho_ten AS ten_nhan_vien,
                nv.so_dien_thoai AS so_dien_thoai_nhan_vien,

                nv.co_so_id,
                cs.ten_co_so,

                nv.phong_ban_id,
                pb.ten_phong_ban

            FROM dm_dia_diem_nhan_hang dd

            JOIN dm_nhan_vien nv
                ON nv.id = dd.nhan_vien_id

            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

        `;

    }


    async getTongHop(
        nhanVienId,
        query = {}
    ) {

        const values = [
            nhanVienId
        ];

        const conditions = [
            "dd.nhan_vien_id = $1"
        ];

        if (query.keyword) {

            values.push(
                `%${query.keyword}%`
            );

            conditions.push(`
                (
                    dd.ma_dia_diem ILIKE $${values.length}
                    OR dd.ten_dia_diem ILIKE $${values.length}
                    OR dd.dia_chi_chi_tiet ILIKE $${values.length}
                )
            `);

        }

        if (
            query.loaiDiaDiem !== undefined
        ) {

            values.push(
                query.loaiDiaDiem
            );

            conditions.push(
                `dd.loai_dia_diem = $${values.length}`
            );

        }

        if (
            query.laMacDinh !== undefined
        ) {

            values.push(
                query.laMacDinh
            );

            conditions.push(
                `dd.la_mac_dinh = $${values.length}`
            );

        }

        if (
            query.active !== undefined
        ) {

            values.push(
                query.active
            );

            conditions.push(
                `dd.active = $${values.length}`
            );

        }

        const sql = `
            ${this.getBaseQuery()}

            WHERE ${conditions.join(" AND ")}

            ORDER BY
                dd.la_mac_dinh DESC,
                dd.thu_tu_hien_thi ASC,
                dd.ten_dia_diem ASC
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows.map(
            row =>
                this.mapDiaDiemNhanHang(
                    row
                )
        );

    }


    async getChiTiet(
        id,
        nhanVienId,
        client = pool
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE dd.id = $1
                AND dd.nhan_vien_id = $2

            LIMIT 1
        `;

        const result =
            await client.query(
                sql,
                [
                    id,
                    nhanVienId
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapDiaDiemNhanHang(
            result.rows[0]
        );

    }


    async getChiTietByMa(
        nhanVienId,
        maDiaDiem
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE dd.nhan_vien_id = $1
                AND UPPER(
                    TRIM(dd.ma_dia_diem)
                ) = UPPER(
                    TRIM($2)
                )

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [
                    nhanVienId,
                    maDiaDiem
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapDiaDiemNhanHang(
            result.rows[0]
        );

    }


    async existsNhanVien(
        nhanVienId
    ) {

        const sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_nhan_vien
                WHERE id = $1
                    AND active = TRUE

            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                [
                    nhanVienId
                ]
            );

        return result.rows[0].exists;

    }


    async existsMaDiaDiem(
        nhanVienId,
        maDiaDiem,
        excludeId = null
    ) {

        const values = [
            nhanVienId,
            maDiaDiem
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_dia_diem_nhan_hang
                WHERE nhan_vien_id = $1
                    AND UPPER(
                        TRIM(ma_dia_diem)
                    ) = UPPER(
                        TRIM($2)
                    )
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

            sql += `
                AND id <> $3
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


    async existsTenDiaDiem(
        nhanVienId,
        tenDiaDiem,
        excludeId = null
    ) {

        const values = [
            nhanVienId,
            tenDiaDiem
        ];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_dia_diem_nhan_hang
                WHERE nhan_vien_id = $1
                    AND LOWER(
                        TRIM(ten_dia_diem)
                    ) = LOWER(
                        TRIM($2)
                    )
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

            sql += `
                AND id <> $3
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


    async boMacDinhCu(
        nhanVienId,
        excludeId = null,
        client = pool
    ) {

        const values = [
            nhanVienId
        ];

        let dieuKienLoaiTru =
            "";

        if (excludeId) {

            values.push(
                excludeId
            );

            dieuKienLoaiTru =
                "AND id <> $2";

        }

        const sql = `
            UPDATE dm_dia_diem_nhan_hang
            SET
                la_mac_dinh = FALSE,
                updated_at = NOW()
            WHERE nhan_vien_id = $1
                AND la_mac_dinh = TRUE
                ${dieuKienLoaiTru}
        `;

        await client.query(
            sql,
            values
        );

    }


    async create(
        nhanVienId,
        data
    ) {

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            if (
                data.laMacDinh === true
            ) {

                await this.boMacDinhCu(
                    nhanVienId,
                    null,
                    client
                );

            }

            const sql = `
                INSERT INTO dm_dia_diem_nhan_hang (

                    nhan_vien_id,
                    ma_dia_diem,
                    ten_dia_diem,
                    dia_chi_chi_tiet,
                    loai_dia_diem,
                    la_mac_dinh,
                    ghi_chu,
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
                    NOW(),
                    NOW()

                )
                RETURNING id
            `;

            const values = [
                nhanVienId,
                data.maDiaDiem,
                data.tenDiaDiem,
                data.diaChiChiTiet,
                data.loaiDiaDiem,
                data.laMacDinh,
                data.ghiChu,
                data.thuTuHienThi,
                data.active
            ];

            const result =
                await client.query(
                    sql,
                    values
                );

            await client.query(
                "COMMIT"
            );

            return await this.getChiTiet(
                result.rows[0].id,
                nhanVienId
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            throw error;

        } finally {

            client.release();

        }

    }


    async update(
        id,
        nhanVienId,
        data
    ) {

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            if (
                data.laMacDinh === true &&
                data.active === true
            ) {

                await this.boMacDinhCu(
                    nhanVienId,
                    id,
                    client
                );

            }

            const sql = `
                UPDATE dm_dia_diem_nhan_hang
                SET

                    ma_dia_diem = $1,
                    ten_dia_diem = $2,
                    dia_chi_chi_tiet = $3,
                    loai_dia_diem = $4,
                    la_mac_dinh = $5,
                    ghi_chu = $6,
                    thu_tu_hien_thi = $7,
                    active = $8,
                    updated_at = NOW()

                WHERE id = $9
                    AND nhan_vien_id = $10

                RETURNING id
            `;

            const values = [
                data.maDiaDiem,
                data.tenDiaDiem,
                data.diaChiChiTiet,
                data.loaiDiaDiem,
                data.laMacDinh,
                data.ghiChu,
                data.thuTuHienThi,
                data.active,
                id,
                nhanVienId
            ];

            const result =
                await client.query(
                    sql,
                    values
                );

            if (
                result.rows.length ===
                0
            ) {

                await client.query(
                    "ROLLBACK"
                );

                return null;

            }

            await client.query(
                "COMMIT"
            );

            return await this.getChiTiet(
                result.rows[0].id,
                nhanVienId
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            throw error;

        } finally {

            client.release();

        }

    }

}


module.exports =
    new DiaDiemNhanHangRepository();

const pool = require('../../../../config/database');

class ChinhSachRepository {
    mapChinhSach(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maChinhSach: row.ma_chinh_sach,
            tenChinhSach: row.ten_chinh_sach,
            loaiChinhSach: Number(row.loai_chinh_sach),

            dsVoucherId: Array.isArray(row.ds_voucher_id) ? row.ds_voucher_id.map((item) => Number(item)) : [],

            dsVoucher: Array.isArray(row.ds_voucher)
                ? row.ds_voucher.map((voucher) => ({
                      id: Number(voucher.id),
                      maVoucher: voucher.maVoucher,
                      tenVoucher: voucher.tenVoucher,
                      loaiMienGiam: Number(voucher.loaiMienGiam),
                      giaTri: Number(voucher.giaTri),
                      soLuong: voucher.soLuong,
                      daSuDung: voucher.daSuDung,
                      soLuongConLai: Number(voucher.soLuongConLai),
                      thoiGianBatDau: voucher.thoiGianBatDau,
                      thoiGianKetThuc: voucher.thoiGianKetThuc,
                      active: voucher.active
                  }))
                : [],

            moTa: row.mo_ta,

            mucDoUuTien: Number(row.muc_do_uu_tien),

            soLuongDoiTuong: row.so_luong_doi_tuong !== undefined ? Number(row.so_luong_doi_tuong) : undefined,

            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    mapVaiTro(row) {
        return {
            id: row.id,
            maVaiTro: row.ma_vai_tro,
            tenVaiTro: row.ten_vai_tro,
            moTa: row.mo_ta,
            active: row.active
        };
    }

    mapChucVu(row) {
        return {
            id: row.id,
            maChucVu: row.ma_chuc_vu,
            tenChucVu: row.ten_chuc_vu,
            moTa: row.mo_ta,
            active: row.active
        };
    }

    mapTaiKhoan(row) {
        return {
            id: row.id,
            tenDangNhap: row.ten_dang_nhap,

            nhanVien: row.nhan_vien_id
                ? {
                      id: row.nhan_vien_id,
                      maNhanVien: row.ma_nhan_vien,
                      hoTen: row.ho_ten
                  }
                : null,

            active: row.active
        };
    }

    getBaseQuery() {
        return `
            SELECT
                cs.id,
                cs.ma_chinh_sach,
                cs.ten_chinh_sach,
                cs.loai_chinh_sach,
                cs.mo_ta,
                cs.muc_do_uu_tien,
                cs.active,
                cs.created_at,
                cs.updated_at,

                COALESCE(
                    (
                        SELECT ARRAY_AGG(
                            csv.voucher_id
                            ORDER BY csv.voucher_id
                        )
                        FROM ct_chinh_sach_voucher csv
                        WHERE
                            csv.chinh_sach_id =
                                cs.id
                    ),
                    ARRAY[]::INTEGER[]
                ) AS ds_voucher_id,

                COALESCE(
                    (
                        SELECT JSONB_AGG(
                            JSONB_BUILD_OBJECT(
                                'id',
                                    v.id,
                                'maVoucher',
                                    v.ma_voucher,
                                'tenVoucher',
                                    v.ten_voucher,
                                'loaiMienGiam',
                                    v.loai_mien_giam,
                                'giaTri',
                                    v.gia_tri,
                                'soLuong',
                                    v.so_luong,
                                'daSuDung',
                                    v.da_su_dung,
                                'soLuongConLai',
                                    GREATEST(
                                        v.so_luong -
                                        v.da_su_dung,
                                        0
                                    ),
                                'thoiGianBatDau',
                                    v.thoi_gian_bat_dau,
                                'thoiGianKetThuc',
                                    v.thoi_gian_ket_thuc,
                                'active',
                                    v.active
                            )
                            ORDER BY
                                v.ma_voucher ASC
                        )
                        FROM ct_chinh_sach_voucher csv
                        INNER JOIN dm_voucher v
                            ON v.id =
                                csv.voucher_id
                        WHERE
                            csv.chinh_sach_id =
                                cs.id
                    ),
                    '[]'::JSONB
                ) AS ds_voucher,

                CASE
                    WHEN cs.loai_chinh_sach = 10
                    THEN (
                        SELECT COUNT(*)
                        FROM ct_chinh_sach_vai_tro csvt
                        WHERE
                            csvt.chinh_sach_id =
                                cs.id
                            AND csvt.active =
                                TRUE
                    )

                    WHEN cs.loai_chinh_sach = 20
                    THEN (
                        SELECT COUNT(*)
                        FROM ct_chinh_sach_chuc_vu cscv
                        WHERE
                            cscv.chinh_sach_id =
                                cs.id
                            AND cscv.active =
                                TRUE
                    )

                    WHEN cs.loai_chinh_sach = 30
                    THEN (
                        SELECT COUNT(*)
                        FROM ct_chinh_sach_tai_khoan cstk
                        WHERE
                            cstk.chinh_sach_id =
                                cs.id
                            AND cstk.active =
                                TRUE
                    )

                    ELSE 0
                END AS so_luong_doi_tuong

            FROM dm_chinh_sach cs
        `;
    }

    async getTongHop(filters = {}) {
        const conditions = [];
        const values = [];

        let paramIndex = 1;

        if (filters.voucherId !== undefined) {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM ct_chinh_sach_voucher csv
                    WHERE
                        csv.chinh_sach_id =
                            cs.id
                        AND csv.voucher_id =
                            $${paramIndex}
                )
            `);

            values.push(filters.voucherId);

            paramIndex++;
        }

        if (filters.loaiChinhSach !== undefined) {
            conditions.push(`
                cs.loai_chinh_sach
                    = $${paramIndex}
            `);

            values.push(String(filters.loaiChinhSach));

            paramIndex++;
        }

        if (filters.active !== undefined) {
            conditions.push(`
                cs.active
                    = $${paramIndex}
            `);

            values.push(filters.active);

            paramIndex++;
        }

        let sql = `
            ${this.getBaseQuery()}
        `;

        if (conditions.length > 0) {
            sql += `
                WHERE
                    ${conditions.join(' AND ')}
            `;
        }

        sql += `
            ORDER BY
                cs.muc_do_uu_tien DESC,
                cs.ma_chinh_sach ASC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapChinhSach(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE cs.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const chinhSach = this.mapChinhSach(result.rows[0]);

        chinhSach.doiTuongApDung = await this.getDoiTuongTheoChinhSach(id, result.rows[0].loai_chinh_sach);

        return chinhSach;
    }

    async getDoiTuongTheoChinhSach(chinhSachId, loaiChinhSach) {
        switch (String(loaiChinhSach)) {
            case '10':
                return await this.getVaiTroTheoChinhSach(chinhSachId);

            case '20':
                return await this.getChucVuTheoChinhSach(chinhSachId);

            case '30':
                return await this.getTaiKhoanTheoChinhSach(chinhSachId);

            default:
                return [];
        }
    }

    async getVaiTroTheoChinhSach(chinhSachId) {
        const sql = `
            SELECT
                vt.id,
                vt.ma_vai_tro,
                vt.ten_vai_tro,
                vt.mo_ta,
                vt.active
            FROM ct_chinh_sach_vai_tro csvt
            INNER JOIN dm_vai_tro vt
                ON vt.id = csvt.vai_tro_id
            WHERE
                csvt.chinh_sach_id = $1
                AND csvt.active = TRUE
            ORDER BY
                vt.ma_vai_tro ASC
        `;

        const result = await pool.query(sql, [chinhSachId]);

        return result.rows.map((row) => this.mapVaiTro(row));
    }

    async getChucVuTheoChinhSach(chinhSachId) {
        const sql = `
            SELECT
                cv.id,
                cv.ma_chuc_vu,
                cv.ten_chuc_vu,
                cv.mo_ta,
                cv.active
            FROM ct_chinh_sach_chuc_vu cscv
            INNER JOIN dm_chuc_vu cv
                ON cv.id = cscv.chuc_vu_id
            WHERE
                cscv.chinh_sach_id = $1
                AND cscv.active = TRUE
            ORDER BY
                cv.ma_chuc_vu ASC
        `;

        const result = await pool.query(sql, [chinhSachId]);

        return result.rows.map((row) => this.mapChucVu(row));
    }

    async getTaiKhoanTheoChinhSach(chinhSachId) {
        const sql = `
            SELECT
                tk.id,
                tk.ten_dang_nhap,
                tk.nhan_vien_id,
                tk.active,
                nv.ma_nhan_vien,
                nv.ho_ten
            FROM ct_chinh_sach_tai_khoan cstk
            INNER JOIN dm_tai_khoan tk
                ON tk.id =
                    cstk.tai_khoan_id
            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id
            WHERE
                cstk.chinh_sach_id = $1
                AND cstk.active = TRUE
            ORDER BY
                nv.ma_nhan_vien ASC,
                tk.ten_dang_nhap ASC
        `;

        const result = await pool.query(sql, [chinhSachId]);

        return result.rows.map((row) => this.mapTaiKhoan(row));
    }

    async getTongHopDoiTuong(loaiChinhSach) {
        switch (String(loaiChinhSach)) {
            case '10':
                return await this.getTongHopVaiTro();

            case '20':
                return await this.getTongHopChucVu();

            case '30':
                return await this.getTongHopTaiKhoan();

            default:
                return [];
        }
    }

    async getTongHopVaiTro() {
        const sql = `
            SELECT
                id,
                ma_vai_tro,
                ten_vai_tro,
                mo_ta,
                active
            FROM dm_vai_tro
            WHERE active = TRUE
            ORDER BY
                ma_vai_tro ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapVaiTro(row));
    }

    async getTongHopChucVu() {
        const sql = `
            SELECT
                id,
                ma_chuc_vu,
                ten_chuc_vu,
                mo_ta,
                active
            FROM dm_chuc_vu
            WHERE active = TRUE
            ORDER BY
                ma_chuc_vu ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapChucVu(row));
    }

    async getTongHopTaiKhoan() {
        const sql = `
            SELECT
                tk.id,
                tk.ten_dang_nhap,
                tk.nhan_vien_id,
                tk.active,
                nv.ma_nhan_vien,
                nv.ho_ten
            FROM dm_tai_khoan tk
            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id
            WHERE tk.active = TRUE
            ORDER BY
                nv.ma_nhan_vien ASC,
                tk.ten_dang_nhap ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapTaiKhoan(row));
    }

    async getTongHopVoucher() {
        const sql = `
            SELECT
                v.id,
                v.ma_voucher,
                v.ten_voucher,
                v.loai_mien_giam,
                v.gia_tri,
                v.so_luong,
                v.da_su_dung,
                GREATEST(
                    v.so_luong - v.da_su_dung,
                    0
                ) AS so_luong_con_lai,
                v.thoi_gian_bat_dau,
                v.thoi_gian_ket_thuc,
                v.active
            FROM dm_voucher v
            WHERE v.active = TRUE
            ORDER BY
                v.ma_voucher ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => ({
            id: row.id,
            maVoucher: row.ma_voucher,
            tenVoucher: row.ten_voucher,
            loaiMienGiam: row.loai_mien_giam,
            giaTri: Number(row.gia_tri),
            soLuong: row.so_luong,
            daSuDung: row.da_su_dung,
            soLuongConLai: Number(row.so_luong_con_lai),
            thoiGianBatDau: row.thoi_gian_bat_dau,
            thoiGianKetThuc: row.thoi_gian_ket_thuc,
            active: row.active
        }));
    }

    async existsMaChinhSach(maChinhSach, excludeId = null) {
        const values = [maChinhSach];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_chinh_sach
                WHERE UPPER(
                    TRIM(ma_chinh_sach)
                ) = UPPER(
                    TRIM($1)
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

    async existsTenChinhSach(tenChinhSach, excludeId = null) {
        const values = [tenChinhSach];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_chinh_sach
                WHERE LOWER(
                    TRIM(ten_chinh_sach)
                ) = LOWER(
                    TRIM($1)
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

    async existsVoucherIds(voucherIds, client = pool) {
        if (!Array.isArray(voucherIds) || voucherIds.length === 0) {
            return false;
        }

        const sql = `
            SELECT
                COUNT(*)::INTEGER
                    AS total
            FROM dm_voucher
            WHERE
                id = ANY(
                    $1::INTEGER[]
                )
                AND active = TRUE
        `;

        const result = await client.query(sql, [voucherIds]);

        return Number(result.rows[0].total) === voucherIds.length;
    }

    async existsDoiTuongIds(loaiChinhSach, doiTuongIds, client = pool) {
        if (!Array.isArray(doiTuongIds) || doiTuongIds.length === 0) {
            return false;
        }

        let tableName;

        switch (String(loaiChinhSach)) {
            case '10':
                tableName = 'dm_vai_tro';
                break;

            case '20':
                tableName = 'dm_chuc_vu';
                break;

            case '30':
                tableName = 'dm_tai_khoan';
                break;

            default:
                return false;
        }

        const sql = `
            SELECT COUNT(*)::INTEGER
                AS total
            FROM ${tableName}
            WHERE
                id = ANY($1::BIGINT[])
                AND active = TRUE
        `;

        const result = await client.query(sql, [doiTuongIds]);

        return Number(result.rows[0].total) === doiTuongIds.length;
    }

    async create(data, client = pool) {
        const sql = `
            INSERT INTO dm_chinh_sach (
                ma_chinh_sach,
                ten_chinh_sach,
                loai_chinh_sach,
                mo_ta,
                muc_do_uu_tien,
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
            data.maChinhSach,
            data.tenChinhSach,

            Number(data.loaiChinhSach),

            data.moTa || null,

            data.mucDoUuTien !== undefined ? Number(data.mucDoUuTien) : 1,

            data.active !== undefined ? data.active : true
        ];

        const result = await client.query(sql, values);

        return result.rows[0];
    }

    async update(id, data, client = pool) {
        const sql = `
            UPDATE dm_chinh_sach
            SET
                ma_chinh_sach = $1,
                ten_chinh_sach = $2,
                loai_chinh_sach = $3,
                mo_ta = $4,
                muc_do_uu_tien = $5,
                active = $6,
                updated_at = NOW()
            WHERE id = $7
            RETURNING id
        `;

        const values = [
            data.maChinhSach,
            data.tenChinhSach,

            Number(data.loaiChinhSach),

            data.moTa,

            Number(data.mucDoUuTien),

            data.active,
            id
        ];

        const result = await client.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async disableAllDoiTuong(chinhSachId, client = pool) {
        const queries = [
            `
                UPDATE ct_chinh_sach_vai_tro
                SET
                    active = FALSE,
                    updated_at = NOW()
                WHERE chinh_sach_id = $1
            `,
            `
                UPDATE ct_chinh_sach_chuc_vu
                SET
                    active = FALSE,
                    updated_at = NOW()
                WHERE chinh_sach_id = $1
            `,
            `
                UPDATE ct_chinh_sach_tai_khoan
                SET
                    active = FALSE,
                    updated_at = NOW()
                WHERE chinh_sach_id = $1
            `
        ];

        for (const sql of queries) {
            await client.query(sql, [chinhSachId]);
        }
    }

    async saveDoiTuongApDung(chinhSachId, loaiChinhSach, doiTuongIds, client = pool) {
        switch (String(loaiChinhSach)) {
            case '10':
                return await this.saveVaiTros(chinhSachId, doiTuongIds, client);

            case '20':
                return await this.saveChucVus(chinhSachId, doiTuongIds, client);

            case '30':
                return await this.saveTaiKhoans(chinhSachId, doiTuongIds, client);

            default:
                return null;
        }
    }

    async saveVouchers(chinhSachId, voucherIds, client = pool) {
        await client.query(
            `
                DELETE FROM
                    ct_chinh_sach_voucher
                WHERE
                    chinh_sach_id = $1
            `,
            [chinhSachId]
        );

        const sql = `
            INSERT INTO ct_chinh_sach_voucher (
                chinh_sach_id,
                voucher_id
            )
            SELECT
                $1,
                UNNEST(
                    $2::INTEGER[]
                )
            ON CONFLICT DO NOTHING
        `;

        await client.query(sql, [chinhSachId, voucherIds]);
    }

    async saveVaiTros(chinhSachId, vaiTroIds, client = pool) {
        const sql = `
            INSERT INTO ct_chinh_sach_vai_tro (
                chinh_sach_id,
                vai_tro_id,
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
                chinh_sach_id,
                vai_tro_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [chinhSachId, vaiTroIds]);
    }

    async saveChucVus(chinhSachId, chucVuIds, client = pool) {
        const sql = `
            INSERT INTO ct_chinh_sach_chuc_vu (
                chinh_sach_id,
                chuc_vu_id,
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
                chinh_sach_id,
                chuc_vu_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [chinhSachId, chucVuIds]);
    }

    async saveTaiKhoans(chinhSachId, taiKhoanIds, client = pool) {
        const sql = `
            INSERT INTO ct_chinh_sach_tai_khoan (
                chinh_sach_id,
                tai_khoan_id,
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
                chinh_sach_id,
                tai_khoan_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [chinhSachId, taiKhoanIds]);
    }
}

module.exports = new ChinhSachRepository();

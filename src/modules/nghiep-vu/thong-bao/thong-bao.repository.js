const pool = require('../../../config/database');

class ThongBaoRepository {
    mapThongBao(row) {
        if (!row) {
            return null;
        }

        return {
            id: Number(row.id),

            tieuDe: row.tieu_de,

            noiDung: row.noi_dung,

            guiTatCa: row.gui_tat_ca,

            tuDong: row.tu_dong,

            maSuKien: row.ma_su_kien,

            loaiThamChieu: row.loai_tham_chieu,

            thamChieuId: row.tham_chieu_id !== null ? Number(row.tham_chieu_id) : null,

            duongDan: row.duong_dan,

            trangThai: Number(row.trang_thai),

            nguoiTao: row.nguoi_tao_id
                ? {
                      id: Number(row.nguoi_tao_id),

                      tenDangNhap: row.ten_dang_nhap,

                      nhanVien: row.nhan_vien_id
                          ? {
                                id: Number(row.nhan_vien_id),

                                maNhanVien: row.ma_nhan_vien,

                                hoTen: row.ho_ten
                            }
                          : null
                  }
                : null,

            thoiGianGui: row.thoi_gian_gui,

            soLuongNguoiNhan: row.so_luong_nguoi_nhan !== undefined ? Number(row.so_luong_nguoi_nhan) : undefined,

            soLuongDaDoc: row.so_luong_da_doc !== undefined ? Number(row.so_luong_da_doc) : undefined,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    mapThongBaoCuaToi(row) {
        if (!row) {
            return null;
        }

        return {
            id: Number(row.id),

            tieuDe: row.tieu_de,

            noiDung: row.noi_dung,

            maSuKien: row.ma_su_kien,

            loaiThamChieu: row.loai_tham_chieu,

            thamChieuId: row.tham_chieu_id !== null ? Number(row.tham_chieu_id) : null,

            duongDan: row.duong_dan,

            thoiGianGui: row.thoi_gian_gui,

            daDoc: row.da_doc,

            thoiGianDoc: row.thoi_gian_doc,

            nguoiTao: row.nguoi_tao_id
                ? {
                      id: Number(row.nguoi_tao_id),

                      tenDangNhap: row.ten_dang_nhap,

                      nhanVien: row.nhan_vien_id
                          ? {
                                id: Number(row.nhan_vien_id),

                                maNhanVien: row.ma_nhan_vien,

                                hoTen: row.ho_ten
                            }
                          : null
                  }
                : null,

            createdAt: row.created_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                tb.id,
                tb.tieu_de,
                tb.noi_dung,
                tb.gui_tat_ca,
                tb.tu_dong,
                tb.ma_su_kien,
                tb.loai_tham_chieu,
                tb.tham_chieu_id,
                tb.duong_dan,
                tb.trang_thai,
                tb.nguoi_tao_id,
                tb.thoi_gian_gui,
                tb.created_at,
                tb.updated_at,

                tk.ten_dang_nhap,
                tk.nhan_vien_id,

                nv.ma_nhan_vien,
                nv.ho_ten,

                (
                    SELECT COUNT(*)
                    FROM ct_thong_bao_nguoi_nhan nn
                    WHERE
                        nn.thong_bao_id =
                            tb.id
                ) AS so_luong_nguoi_nhan,

                (
                    SELECT COUNT(*)
                    FROM ct_thong_bao_nguoi_nhan nn
                    WHERE
                        nn.thong_bao_id =
                            tb.id
                        AND nn.da_doc =
                            TRUE
                ) AS so_luong_da_doc

            FROM nv_thong_bao tb

            LEFT JOIN dm_tai_khoan tk
                ON tk.id =
                    tb.nguoi_tao_id

            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id
        `;
    }

    async getTongHop(filters = {}) {
        const conditions = [];
        const values = [];

        let paramIndex = 1;

        if (filters.trangThai !== undefined) {
            conditions.push(`tb.trang_thai = $${paramIndex}`);

            values.push(filters.trangThai);

            paramIndex++;
        }

        if (filters.tuDong !== undefined) {
            conditions.push(`tb.tu_dong = $${paramIndex}`);

            values.push(filters.tuDong);

            paramIndex++;
        }

        if (filters.guiTatCa !== undefined) {
            conditions.push(`tb.gui_tat_ca = $${paramIndex}`);

            values.push(filters.guiTatCa);

            paramIndex++;
        }

        if (filters.maSuKien) {
            conditions.push(`tb.ma_su_kien = $${paramIndex}`);

            values.push(filters.maSuKien);

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
                tb.created_at DESC,
                tb.id DESC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapThongBao(row));
    }

    async getChiTiet(id, client = pool) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tb.id = $1

            LIMIT 1
        `;

        const result = await client.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const thongBao = this.mapThongBao(result.rows[0]);

        thongBao.doiTuong = await this.getDoiTuong(id, client);

        return thongBao;
    }

    async getDoiTuong(thongBaoId, client = pool) {
        const sql = `
            SELECT
                dt.loai_doi_tuong,
                dt.doi_tuong_id,

                CASE
                    WHEN dt.loai_doi_tuong = 10
                        THEN vt.ma_vai_tro

                    WHEN dt.loai_doi_tuong = 20
                        THEN cv.ma_chuc_vu

                    WHEN dt.loai_doi_tuong = 30
                        THEN tk.ten_dang_nhap

                    ELSE NULL
                END AS ma_doi_tuong,

                CASE
                    WHEN dt.loai_doi_tuong = 10
                        THEN vt.ten_vai_tro

                    WHEN dt.loai_doi_tuong = 20
                        THEN cv.ten_chuc_vu

                    WHEN dt.loai_doi_tuong = 30
                        THEN COALESCE(
                            nv.ho_ten,
                            tk.ten_dang_nhap
                        )

                    ELSE NULL
                END AS ten_doi_tuong

            FROM ct_thong_bao_doi_tuong dt

            LEFT JOIN dm_vai_tro vt
                ON dt.loai_doi_tuong = 10
                AND vt.id =
                    dt.doi_tuong_id

            LEFT JOIN dm_chuc_vu cv
                ON dt.loai_doi_tuong = 20
                AND cv.id =
                    dt.doi_tuong_id

            LEFT JOIN dm_tai_khoan tk
                ON dt.loai_doi_tuong = 30
                AND tk.id =
                    dt.doi_tuong_id

            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id

            WHERE
                dt.thong_bao_id = $1

            ORDER BY
                dt.loai_doi_tuong ASC,
                dt.doi_tuong_id ASC
        `;

        const result = await client.query(sql, [thongBaoId]);

        return result.rows.map((row) => ({
            loaiDoiTuong: Number(row.loai_doi_tuong),

            doiTuongId: Number(row.doi_tuong_id),

            maDoiTuong: row.ma_doi_tuong,

            tenDoiTuong: row.ten_doi_tuong
        }));
    }

    async getTongHopDoiTuong(loaiDoiTuong) {
        switch (Number(loaiDoiTuong)) {
            case 10:
                return await this.getTongHopVaiTro();

            case 20:
                return await this.getTongHopChucVu();

            case 30:
                return await this.getTongHopTaiKhoan();

            default:
                return [];
        }
    }

    async getTongHopVaiTro() {
        const result = await pool.query(`
                SELECT
                    id,
                    ma_vai_tro,
                    ten_vai_tro
                FROM dm_vai_tro
                WHERE active = TRUE
                ORDER BY
                    ma_vai_tro ASC
            `);

        return result.rows.map((row) => ({
            id: Number(row.id),

            ma: row.ma_vai_tro,

            ten: row.ten_vai_tro
        }));
    }

    async getTongHopChucVu() {
        const result = await pool.query(`
                SELECT
                    id,
                    ma_chuc_vu,
                    ten_chuc_vu
                FROM dm_chuc_vu
                WHERE active = TRUE
                ORDER BY
                    ma_chuc_vu ASC
            `);

        return result.rows.map((row) => ({
            id: Number(row.id),

            ma: row.ma_chuc_vu,

            ten: row.ten_chuc_vu
        }));
    }

    async getTongHopTaiKhoan() {
        const result = await pool.query(`
                SELECT
                    tk.id,
                    tk.ten_dang_nhap,
                    nv.ma_nhan_vien,
                    nv.ho_ten

                FROM dm_tai_khoan tk

                INNER JOIN dm_nhan_vien nv
                    ON nv.id =
                        tk.nhan_vien_id

                WHERE
                    tk.active = TRUE
                    AND tk.bi_khoa = FALSE
                    AND nv.active = TRUE

                ORDER BY
                    nv.ma_nhan_vien ASC,
                    tk.ten_dang_nhap ASC
            `);

        return result.rows.map((row) => ({
            id: Number(row.id),

            ma: row.ten_dang_nhap,

            ten: row.ho_ten,

            maNhanVien: row.ma_nhan_vien
        }));
    }

    async deleteNguoiNhan(thongBaoId, client = pool) {
        await client.query(
            `
                DELETE FROM
                    ct_thong_bao_nguoi_nhan

                WHERE
                    thong_bao_id = $1
            `,
            [thongBaoId]
        );
    }

    async existsDoiTuongIds(loaiDoiTuong, ids, client = pool) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return false;
        }

        let sql;

        switch (Number(loaiDoiTuong)) {
            case 10:
                sql = `
                    SELECT COUNT(*)::INTEGER
                        AS total
                    FROM dm_vai_tro
                    WHERE
                        id = ANY(
                            $1::INTEGER[]
                        )
                        AND active = TRUE
                `;

                break;

            case 20:
                sql = `
                    SELECT COUNT(*)::INTEGER
                        AS total
                    FROM dm_chuc_vu
                    WHERE
                        id = ANY(
                            $1::INTEGER[]
                        )
                        AND active = TRUE
                `;

                break;

            case 30:
                sql = `
                    SELECT COUNT(*)::INTEGER
                        AS total

                    FROM dm_tai_khoan tk

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                            tk.nhan_vien_id

                    WHERE
                        tk.id = ANY(
                            $1::INTEGER[]
                        )
                        AND tk.active = TRUE
                        AND tk.bi_khoa = FALSE
                        AND nv.active = TRUE
                `;

                break;

            default:
                return false;
        }

        const result = await client.query(sql, [ids]);

        return Number(result.rows[0].total) === ids.length;
    }

    async create(data, client = pool) {
        const sql = `
            INSERT INTO nv_thong_bao (
                tieu_de,
                noi_dung,
                gui_tat_ca,
                tu_dong,
                ma_su_kien,
                loai_tham_chieu,
                tham_chieu_id,
                duong_dan,
                trang_thai,
                nguoi_tao_id,
                thoi_gian_gui,
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
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.tieuDe,

            data.noiDung,

            data.guiTatCa,

            data.tuDong,

            data.maSuKien || null,

            data.loaiThamChieu || null,

            data.thamChieuId || null,

            data.duongDan || null,

            data.trangThai,

            data.nguoiTaoId || null,

            data.thoiGianGui || null
        ];

        const result = await client.query(sql, values);

        return result.rows[0];
    }

    async update(id, data, client = pool) {
        const sql = `
            UPDATE nv_thong_bao
            SET
                tieu_de = $1,
                noi_dung = $2,
                gui_tat_ca = $3,
                loai_tham_chieu = $4,
                tham_chieu_id = $5,
                duong_dan = $6,
                updated_at = NOW()
            WHERE id = $7
            RETURNING id
        `;

        const result = await client.query(sql, [
            data.tieuDe,
            data.noiDung,
            data.guiTatCa,
            data.loaiThamChieu,
            data.thamChieuId,
            data.duongDan,
            id
        ]);

        return result.rows[0] || null;
    }

    async saveDoiTuong(thongBaoId, doiTuong, client = pool) {
        await client.query(
            `
                DELETE FROM
                    ct_thong_bao_doi_tuong
                WHERE
                    thong_bao_id = $1
            `,
            [thongBaoId]
        );

        if (!Array.isArray(doiTuong) || doiTuong.length === 0) {
            return;
        }

        const loaiDoiTuong = doiTuong.map((item) => Number(item.loaiDoiTuong));

        const doiTuongIds = doiTuong.map((item) => Number(item.doiTuongId));

        await client.query(
            `
                INSERT INTO
                    ct_thong_bao_doi_tuong (
                        thong_bao_id,
                        loai_doi_tuong,
                        doi_tuong_id,
                        created_at
                    )

                SELECT
                    $1,
                    loai,
                    id,
                    NOW()

                FROM UNNEST(
                    $2::SMALLINT[],
                    $3::INTEGER[]
                ) AS x(
                    loai,
                    id
                )

                ON CONFLICT DO NOTHING
            `,
            [thongBaoId, loaiDoiTuong, doiTuongIds]
        );
    }

    async getByIdForUpdate(id, client) {
        const result = await client.query(
            `
                    SELECT *
                    FROM nv_thong_bao
                    WHERE id = $1
                    FOR UPDATE
                `,
            [id]
        );

        return result.rows[0] || null;
    }

    async getCuaToi(taiKhoanId, filters = {}, client = pool) {
        const conditions = [
            `
                nn.tai_khoan_id = $1
            `,
            `
                tb.trang_thai = 20
            `
        ];

        const values = [taiKhoanId];

        let paramIndex = 2;

        if (filters.daDoc !== undefined) {
            conditions.push(`nn.da_doc = $${paramIndex}`);

            values.push(filters.daDoc);

            paramIndex++;
        }

        const sql = `
            SELECT
                tb.id,
                tb.tieu_de,
                tb.noi_dung,
                tb.ma_su_kien,
                tb.loai_tham_chieu,
                tb.tham_chieu_id,
                tb.duong_dan,
                tb.nguoi_tao_id,
                tb.thoi_gian_gui,

                tk.ten_dang_nhap,
                tk.nhan_vien_id,

                nv.ma_nhan_vien,
                nv.ho_ten,

                nn.da_doc,
                nn.thoi_gian_doc,
                nn.created_at

            FROM ct_thong_bao_nguoi_nhan nn

            INNER JOIN nv_thong_bao tb
                ON tb.id =
                    nn.thong_bao_id

            LEFT JOIN dm_tai_khoan tk
                ON tk.id =
                    tb.nguoi_tao_id

            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id

            WHERE
                ${conditions.join(' AND ')}

            ORDER BY
                nn.da_doc ASC,
                tb.thoi_gian_gui DESC,
                tb.id DESC
        `;

        const result = await client.query(sql, values);

        return result.rows.map((row) => this.mapThongBaoCuaToi(row));
    }

    async getSoChuaDoc(taiKhoanId, client = pool) {
        const sql = `
            SELECT
                COUNT(*)::INTEGER
                    AS so_chua_doc

            FROM ct_thong_bao_nguoi_nhan nn

            INNER JOIN nv_thong_bao tb
                ON tb.id =
                    nn.thong_bao_id

            WHERE
                nn.tai_khoan_id = $1
                AND nn.da_doc = FALSE
                AND tb.trang_thai = 20
        `;

        const result = await client.query(sql, [taiKhoanId]);

        return {
            soChuaDoc: Number(result.rows[0].so_chua_doc)
        };
    }

    async danhDauDaDoc(thongBaoId, taiKhoanId, client = pool) {
        const sql = `
            UPDATE
                ct_thong_bao_nguoi_nhan nn

            SET
                da_doc = TRUE,

                thoi_gian_doc =
                    COALESCE(
                        nn.thoi_gian_doc,
                        NOW()
                    )

            FROM nv_thong_bao tb

            WHERE
                nn.thong_bao_id = $1
                AND nn.tai_khoan_id = $2
                AND tb.id =
                    nn.thong_bao_id
                AND tb.trang_thai = 20

            RETURNING
                nn.thong_bao_id,
                nn.tai_khoan_id,
                nn.da_doc,
                nn.thoi_gian_doc
        `;

        const result = await client.query(sql, [thongBaoId, taiKhoanId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            thongBaoId: Number(row.thong_bao_id),

            taiKhoanId: Number(row.tai_khoan_id),

            daDoc: row.da_doc,

            thoiGianDoc: row.thoi_gian_doc
        };
    }

    async danhDauTatCaDaDoc(taiKhoanId, client = pool) {
        const sql = `
            UPDATE
                ct_thong_bao_nguoi_nhan nn

            SET
                da_doc = TRUE,
                thoi_gian_doc = NOW()

            FROM nv_thong_bao tb

            WHERE
                nn.tai_khoan_id = $1
                AND nn.da_doc = FALSE
                AND tb.id =
                    nn.thong_bao_id
                AND tb.trang_thai = 20
        `;

        const result = await client.query(sql, [taiKhoanId]);

        return {
            soLuongDaCapNhat: Number(result.rowCount)
        };
    }

    async getTaiKhoanIdsTatCa(client = pool) {
        const result = await client.query(`
                SELECT
                    tk.id

                FROM dm_tai_khoan tk

                INNER JOIN dm_nhan_vien nv
                    ON nv.id =
                        tk.nhan_vien_id

                WHERE
                    tk.active = TRUE
                    AND tk.bi_khoa = FALSE
                    AND nv.active = TRUE
            `);

        return result.rows.map((row) => Number(row.id));
    }

    async getTaiKhoanIdsTheoVaiTro(vaiTroIds, client = pool) {
        if (vaiTroIds.length === 0) {
            return [];
        }

        const result = await client.query(
            `
                    SELECT DISTINCT
                        tk.id

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id =
                            tkvt.vai_tro_id

                    INNER JOIN dm_tai_khoan tk
                        ON tk.id =
                            tkvt.tai_khoan_id

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                            tk.nhan_vien_id

                    WHERE
                        tkvt.vai_tro_id =
                            ANY(
                                $1::INTEGER[]
                            )

                        AND tkvt.active =
                            TRUE

                        AND vt.active =
                            TRUE

                        AND tk.active =
                            TRUE

                        AND tk.bi_khoa =
                            FALSE

                        AND nv.active =
                            TRUE
                `,
            [vaiTroIds]
        );

        return result.rows.map((row) => Number(row.id));
    }

    async getTaiKhoanIdsTheoChucVu(chucVuIds, client = pool) {
        if (chucVuIds.length === 0) {
            return [];
        }

        const result = await client.query(
            `
                    SELECT DISTINCT
                        tk.id

                    FROM dm_tai_khoan tk

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                            tk.nhan_vien_id

                    INNER JOIN dm_chuc_vu cv
                        ON cv.id =
                            nv.chuc_vu_id

                    WHERE
                        nv.chuc_vu_id =
                            ANY(
                                $1::INTEGER[]
                            )

                        AND cv.active =
                            TRUE

                        AND nv.active =
                            TRUE

                        AND tk.active =
                            TRUE

                        AND tk.bi_khoa =
                            FALSE
                `,
            [chucVuIds]
        );

        return result.rows.map((row) => Number(row.id));
    }

    async thuHoiDuongDanTheoThamChieu(loaiThamChieu, thamChieuId, maSuKien, client = pool) {
        const result = await client.query(
            `
                    UPDATE nv_thong_bao

                    SET
                        duong_dan = NULL,
                        updated_at = NOW()

                    WHERE tu_dong = TRUE

                    AND loai_tham_chieu = $1

                    AND tham_chieu_id = $2

                    AND ma_su_kien = $3

                    AND trang_thai = 20

                    AND duong_dan IS NOT NULL

                    RETURNING id
                `,
            [loaiThamChieu, thamChieuId, maSuKien]
        );

        return result.rows;
    }

    async getTaiKhoanIdsTrucTiep(taiKhoanIds, client = pool) {
        if (taiKhoanIds.length === 0) {
            return [];
        }

        const result = await client.query(
            `
                    SELECT
                        tk.id

                    FROM dm_tai_khoan tk

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                            tk.nhan_vien_id

                    WHERE
                        tk.id =
                            ANY(
                                $1::INTEGER[]
                            )

                        AND tk.active =
                            TRUE

                        AND tk.bi_khoa =
                            FALSE

                        AND nv.active =
                            TRUE
                `,
            [taiKhoanIds]
        );

        return result.rows.map((row) => Number(row.id));
    }

    async saveNguoiNhan(thongBaoId, taiKhoanIds, client = pool) {
        if (taiKhoanIds.length === 0) {
            return;
        }

        await client.query(
            `
                INSERT INTO
                    ct_thong_bao_nguoi_nhan (
                        thong_bao_id,
                        tai_khoan_id,
                        da_doc,
                        thoi_gian_doc,
                        created_at
                    )

                SELECT
                    $1,
                    UNNEST(
                        $2::INTEGER[]
                    ),
                    FALSE,
                    NULL,
                    NOW()

                ON CONFLICT (
                    thong_bao_id,
                    tai_khoan_id
                )
                DO NOTHING
            `,
            [thongBaoId, taiKhoanIds]
        );
    }

    async danhDauDaGui(id, client = pool) {
        const result = await client.query(
            `
                    UPDATE nv_thong_bao

                    SET
                        trang_thai = 20,
                        thoi_gian_gui = NOW(),
                        updated_at = NOW()

                    WHERE id = $1

                    RETURNING id
                `,
            [id]
        );

        return result.rows[0] || null;
    }

    async danhDauDaHuy(id, client = pool) {
        const result = await client.query(
            `
                    UPDATE nv_thong_bao

                    SET
                        trang_thai = 30,
                        updated_at = NOW()

                    WHERE id = $1

                    RETURNING id
                `,
            [id]
        );

        return result.rows[0] || null;
    }
}

module.exports = new ThongBaoRepository();

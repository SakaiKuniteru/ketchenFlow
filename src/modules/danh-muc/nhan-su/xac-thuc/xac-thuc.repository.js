const pool = require('../../../../config/database');

class XacThucRepository {
    mapTaiKhoanDangNhap(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            nhanVienId: row.nhan_vien_id,
            taiKhoan: row.ten_dang_nhap,
            matKhauHash: row.mat_khau_hash,
            active: row.active,
            doiMatKhauLanDau: row.doi_mat_khau_lan_dau,
            soLanDangNhapSai: row.so_lan_dang_nhap_sai,
            biKhoa: row.bi_khoa,
            khoaDen: row.khoa_den,
            lanDangNhapCuoi: row.lan_dang_nhap_cuoi,
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            email: row.email,
            soDienThoai: row.so_dien_thoai,
            anhDaiDien: row.anh_dai_dien,
            ngaySinh: row.ngay_sinh,
            gioiTinh: row.gioi_tinh,
            diaChi: row.dia_chi,
            ghiChu: row.ghi_chu,
            maThe: row.ma_the,
            maQr: row.ma_qr,
            maBarcode: row.ma_barcode,
            quocGiaId: row.quoc_gia_id,
            tinhThanhId: row.tinh_thanh_id,
            xaPhuongId: row.xa_phuong_id,
            coSoId: row.co_so_id,
            coSo: row.co_so,
            phongBanId: row.phong_ban_id,
            phongBan: row.phong_ban,
            chucVuId: row.chuc_vu_id,
            chucVu: row.chuc_vu,
            dsVaiTroId: row.ds_vai_tro_id || [],
            dsVaiTro: row.ds_vai_tro || [],
            roles: row.vai_tros || [],
            dsQuyenId: row.ds_quyen_id || [],
            dsQuyen: row.ds_quyen || [],
            createdAt: row.nhan_vien_created_at,
            updatedAt: row.nhan_vien_updated_at
        };
    }

    async findByTaiKhoan(taiKhoan) {
        const sql = `
            SELECT
                tk.id,
                tk.nhan_vien_id,
                tk.ten_dang_nhap,
                tk.mat_khau_hash,
                tk.active,
                tk.doi_mat_khau_lan_dau,
                tk.so_lan_dang_nhap_sai,
                tk.bi_khoa,
                tk.khoa_den,
                tk.lan_dang_nhap_cuoi,

                nv.ma_nhan_vien,
                nv.ho_ten,
                nv.email,
                nv.so_dien_thoai,
                nv.anh_dai_dien,
                nv.ngay_sinh,
                nv.gioi_tinh,
                nv.dia_chi,
                nv.ghi_chu,
                nv.ma_the,
                nv.ma_qr,
                nv.ma_barcode,

                nv.chuc_vu_id,
                nv.co_so_id,
                nv.phong_ban_id,
                nv.quoc_gia_id,
                nv.tinh_thanh_id,
                nv.xa_phuong_id,

                nv.active AS nhan_vien_active,
                nv.created_at AS nhan_vien_created_at,
                nv.updated_at AS nhan_vien_updated_at,

                CASE
                    WHEN cs.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cs.id,
                        'maCoSo', cs.ma_co_so,
                        'tenCoSo', cs.ten_co_so,
                        'active', cs.active
                    )
                END AS co_so,

                CASE
                    WHEN pb.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', pb.id,
                        'maPhongBan', pb.ma_phong_ban,
                        'tenPhongBan', pb.ten_phong_ban,
                        'active', pb.active
                    )
                END AS phong_ban,

                CASE
                    WHEN cv.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cv.id,
                        'maChucVu', cv.ma_chuc_vu,
                        'tenChucVu', cv.ten_chuc_vu,
                        'active', cv.active
                    )
                END AS chuc_vu,

                COALESCE(
                    vai_tro.ds_vai_tro_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_vai_tro_id,

                COALESCE(
                    vai_tro.vai_tros,
                    ARRAY[]::VARCHAR[]
                ) AS vai_tros,

                COALESCE(
                    vai_tro.ds_vai_tro,
                    '[]'::JSONB
                ) AS ds_vai_tro,

                COALESCE(
                    quyen.ds_quyen_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_quyen_id,

                COALESCE(
                    quyen.ds_quyen,
                    '[]'::JSONB
                ) AS ds_quyen

            FROM dm_tai_khoan tk

            INNER JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id

            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro_id,

                    ARRAY_AGG(
                        danh_sach.ma_vai_tro
                        ORDER BY danh_sach.id
                    ) AS vai_tros,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maVaiTro', danh_sach.ma_vai_tro,
                            'tenVaiTro', danh_sach.ten_vai_tro,
                            'moTa', danh_sach.mo_ta,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro

                FROM (
                    SELECT DISTINCT
                        vt.id,
                        vt.ma_vai_tro,
                        vt.ten_vai_tro,
                        vt.mo_ta,
                        vt.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id
                        AND vt.active = TRUE

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                ) danh_sach
            ) vai_tro
                ON TRUE

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_quyen_id,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maQuyen', danh_sach.ma_quyen,
                            'tenQuyen', danh_sach.ten_quyen,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_quyen

                FROM (
                    SELECT DISTINCT
                        q.id,
                        q.ma_quyen,
                        q.ten_quyen,
                        q.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id
                        AND vt.active = TRUE

                    INNER JOIN dm_vai_tro_quyen vtq
                        ON vtq.vai_tro_id = vt.id
                        AND vtq.active = TRUE

                    INNER JOIN dm_quyen q
                        ON q.id = vtq.quyen_id
                        AND q.active = TRUE

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                ) danh_sach
            ) quyen
                ON TRUE

            WHERE
                LOWER(TRIM(tk.ten_dang_nhap)) =
                LOWER(TRIM($1))

            LIMIT 1
        `;

        const result = await pool.query(sql, [taiKhoan]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTaiKhoanDangNhap(result.rows[0]);
    }

    async increaseFailedLogin(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                so_lan_dang_nhap_sai =
                    COALESCE(
                        so_lan_dang_nhap_sai,
                        0
                    ) + 1,
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                so_lan_dang_nhap_sai
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        if (result.rows.length === 0) {
            return 0;
        }

        return Number(result.rows[0].so_lan_dang_nhap_sai);
    }

    async getFailedLoginCount(taiKhoanId) {
        const sql = `
            SELECT
                so_lan_dang_nhap_sai
            FROM dm_tai_khoan
            WHERE id = $1
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        if (result.rows.length === 0) {
            return 0;
        }

        return result.rows[0].so_lan_dang_nhap_sai;
    }

    async resetFailedLogin(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                so_lan_dang_nhap_sai = 0,
                bi_khoa = FALSE,
                khoa_den = NULL,
                updated_at = NOW()
            WHERE id = $1
        `;

        await pool.query(sql, [taiKhoanId]);
    }

    async lockAccount(taiKhoanId, lockUntil = null) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                bi_khoa = TRUE,
                khoa_den = $1,
                updated_at = NOW()
            WHERE id = $2
        `;

        await pool.query(sql, [lockUntil, taiKhoanId]);
    }

    async unlockAccount(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                so_lan_dang_nhap_sai = 0,
                bi_khoa = FALSE,
                khoa_den = NULL,
                updated_at = NOW()
            WHERE id = $1
        `;

        await pool.query(sql, [taiKhoanId]);
    }

    async updateLastLogin(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                so_lan_dang_nhap =
                    COALESCE(
                        so_lan_dang_nhap,
                        0
                    ) + 1,
                lan_dang_nhap_cuoi = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                so_lan_dang_nhap,
                lan_dang_nhap_cuoi
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows[0] || null;
    }

    async saveRefreshToken(taiKhoanId, refreshToken, expiresAt) {
        const sql = `
            INSERT INTO nv_refresh_token
            (
                tai_khoan_id,
                token,
                expires_at,
                revoked
            )
            VALUES
            (
                $1,
                $2,
                $3,
                FALSE
            )
        `;

        await pool.query(sql, [taiKhoanId, refreshToken, expiresAt]);
    }

    async findRefreshToken(refreshToken) {
        const sql = `
            SELECT *
            FROM nv_refresh_token
            WHERE
                token = $1
                AND revoked = FALSE
        `;

        const result = await pool.query(sql, [refreshToken]);

        return result.rows[0];
    }

    async deleteRefreshToken(refreshToken) {
        const sql = `
            UPDATE nv_refresh_token
            SET
                revoked = TRUE,
                updated_at = NOW()
            WHERE token = $1
        `;

        await pool.query(sql, [refreshToken]);
    }

    async changeMatKhau(taiKhoanId, matKhauHash) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                mat_khau_hash = $1,
                doi_mat_khau_lan_dau = FALSE,
                doi_mat_khau_lan_cuoi = NOW(),
                updated_at = NOW()
            WHERE id = $2
        `;

        await pool.query(sql, [matKhauHash, taiKhoanId]);
    }

    async updateMatKhauChangedAt(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                doi_mat_khau_lan_cuoi = NOW(),
                updated_at = NOW()
            WHERE id = $1
        `;

        await pool.query(sql, [taiKhoanId]);
    }

    async revokeRefreshToken(token) {
        const sql = `
            UPDATE nv_refresh_token
            SET
                revoked = TRUE,
                updated_at = NOW()
            WHERE token = $1
        `;

        await pool.query(sql, [token]);
    }

    async revokeAllRefreshToken(taiKhoanId) {
        const sql = `
            UPDATE nv_refresh_token
            SET
                revoked = TRUE,
                updated_at = NOW()
            WHERE
                tai_khoan_id = $1
                AND revoked = FALSE
        `;

        await pool.query(sql, [taiKhoanId]);
    }

    async findById(taiKhoanId) {
        const sql = `
            SELECT
                tk.id,
                tk.nhan_vien_id,
                tk.ten_dang_nhap,
                tk.active,
                tk.doi_mat_khau_lan_dau,
                tk.so_lan_dang_nhap_sai,
                tk.bi_khoa,
                tk.khoa_den,
                tk.lan_dang_nhap_cuoi,

                nv.ma_nhan_vien,
                nv.ho_ten,
                nv.email,
                nv.so_dien_thoai,
                nv.anh_dai_dien,
                nv.ngay_sinh,
                nv.gioi_tinh,
                nv.dia_chi,
                nv.ghi_chu,
                nv.ma_the,
                nv.ma_qr,
                nv.ma_barcode,

                nv.chuc_vu_id,
                nv.co_so_id,
                nv.phong_ban_id,
                nv.quoc_gia_id,
                nv.tinh_thanh_id,
                nv.xa_phuong_id,

                nv.active AS nhan_vien_active,
                nv.created_at AS nhan_vien_created_at,
                nv.updated_at AS nhan_vien_updated_at,

                CASE
                    WHEN cs.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cs.id,
                        'maCoSo', cs.ma_co_so,
                        'tenCoSo', cs.ten_co_so,
                        'active', cs.active
                    )
                END AS co_so,

                CASE
                    WHEN pb.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', pb.id,
                        'maPhongBan', pb.ma_phong_ban,
                        'tenPhongBan', pb.ten_phong_ban,
                        'active', pb.active
                    )
                END AS phong_ban,

                CASE
                    WHEN cv.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cv.id,
                        'maChucVu', cv.ma_chuc_vu,
                        'tenChucVu', cv.ten_chuc_vu,
                        'active', cv.active
                    )
                END AS chuc_vu,

                COALESCE(
                    vai_tro.ds_vai_tro_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_vai_tro_id,

                COALESCE(
                    vai_tro.vai_tros,
                    ARRAY[]::VARCHAR[]
                ) AS vai_tros,

                COALESCE(
                    vai_tro.ds_vai_tro,
                    '[]'::JSONB
                ) AS ds_vai_tro,

                COALESCE(
                    quyen.ds_quyen_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_quyen_id,

                COALESCE(
                    quyen.ds_quyen,
                    '[]'::JSONB
                ) AS ds_quyen

            FROM dm_tai_khoan tk

            INNER JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id

            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro_id,

                    ARRAY_AGG(
                        danh_sach.ma_vai_tro
                        ORDER BY danh_sach.id
                    ) AS vai_tros,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maVaiTro', danh_sach.ma_vai_tro,
                            'tenVaiTro', danh_sach.ten_vai_tro,
                            'moTa', danh_sach.mo_ta,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro

                FROM (
                    SELECT DISTINCT
                        vt.id,
                        vt.ma_vai_tro,
                        vt.ten_vai_tro,
                        vt.mo_ta,
                        vt.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id
                        AND vt.active = TRUE

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                ) danh_sach
            ) vai_tro
                ON TRUE

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_quyen_id,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maQuyen', danh_sach.ma_quyen,
                            'tenQuyen', danh_sach.ten_quyen,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_quyen

                FROM (
                    SELECT DISTINCT
                        q.id,
                        q.ma_quyen,
                        q.ten_quyen,
                        q.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id
                        AND vt.active = TRUE

                    INNER JOIN dm_vai_tro_quyen vtq
                        ON vtq.vai_tro_id = vt.id
                        AND vtq.active = TRUE

                    INNER JOIN dm_quyen q
                        ON q.id = vtq.quyen_id
                        AND q.active = TRUE

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                ) danh_sach
            ) quyen
                ON TRUE

            WHERE
                tk.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTaiKhoanDangNhap(result.rows[0]);
    }

    async getMatKhauHash(taiKhoanId) {
        const sql = `
            SELECT
                mat_khau_hash
            FROM dm_tai_khoan
            WHERE id = $1
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows[0];
    }

    async getThongTinNhanVien(nhanVienId) {
        const sql = `
            SELECT
                nv.id AS nhan_vien_id,

                tk.id AS tai_khoan_id,
                tk.ten_dang_nhap,
                tk.active AS tai_khoan_active,
                tk.doi_mat_khau_lan_dau,
                tk.so_lan_dang_nhap_sai,
                tk.khoa_den,
                tk.khoa_den,
                tk.lan_dang_nhap_cuoi,

                nv.ma_nhan_vien,
                nv.ho_ten,
                nv.email,
                nv.so_dien_thoai,
                nv.anh_dai_dien,
                nv.ngay_sinh,
                nv.gioi_tinh,
                nv.dia_chi,
                nv.ghi_chu,
                nv.ma_the,
                nv.ma_qr,
                nv.ma_barcode,

                nv.quoc_gia_id,
                nv.tinh_thanh_id,
                nv.xa_phuong_id,

                nv.co_so_id,
                nv.phong_ban_id,
                nv.chuc_vu_id,

                nv.active AS nhan_vien_active,
                nv.created_at AS nhan_vien_created_at,
                nv.updated_at AS nhan_vien_updated_at,

                CASE
                    WHEN cs.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cs.id,
                        'maCoSo', cs.ma_co_so,
                        'tenCoSo', cs.ten_co_so,
                        'diaChi', cs.dia_chi,
                        'logo', cs.logo,
                        'favicon', cs.favicon,
                        'active', cs.active
                    )
                END AS co_so,

                CASE
                    WHEN pb.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', pb.id,
                        'maPhongBan', pb.ma_phong_ban,
                        'tenPhongBan', pb.ten_phong_ban,
                        'active', pb.active
                    )
                END AS phong_ban,

                CASE
                    WHEN cv.id IS NULL THEN NULL
                    ELSE JSONB_BUILD_OBJECT(
                        'id', cv.id,
                        'maChucVu', cv.ma_chuc_vu,
                        'tenChucVu', cv.ten_chuc_vu,
                        'active', cv.active
                    )
                END AS chuc_vu,

                COALESCE(
                    vai_tro.ds_vai_tro_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_vai_tro_id,

                COALESCE(
                    vai_tro.vai_tros,
                    ARRAY[]::VARCHAR[]
                ) AS vai_tros,

                COALESCE(
                    vai_tro.ds_vai_tro,
                    '[]'::JSONB
                ) AS ds_vai_tro,

                COALESCE(
                    quyen.ds_quyen_id,
                    ARRAY[]::INTEGER[]
                ) AS ds_quyen_id,

                COALESCE(
                    quyen.ds_quyen,
                    '[]'::JSONB
                ) AS ds_quyen

            FROM dm_nhan_vien nv

            LEFT JOIN dm_tai_khoan tk
                ON tk.nhan_vien_id = nv.id

            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro_id,

                    ARRAY_AGG(
                        danh_sach.ma_vai_tro
                        ORDER BY danh_sach.id
                    ) AS vai_tros,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maVaiTro', danh_sach.ma_vai_tro,
                            'tenVaiTro', danh_sach.ten_vai_tro,
                            'moTa', danh_sach.mo_ta,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_vai_tro

                FROM (
                    SELECT DISTINCT
                        vt.id,
                        vt.ma_vai_tro,
                        vt.ten_vai_tro,
                        vt.mo_ta,
                        vt.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                        AND vt.active = TRUE
                ) danh_sach
            ) vai_tro
                ON TRUE

            LEFT JOIN LATERAL (
                SELECT
                    ARRAY_AGG(
                        danh_sach.id
                        ORDER BY danh_sach.id
                    ) AS ds_quyen_id,

                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'id', danh_sach.id,
                            'maQuyen', danh_sach.ma_quyen,
                            'tenQuyen', danh_sach.ten_quyen,
                            'moTa', danh_sach.mo_ta,
                            'active', danh_sach.active
                        )
                        ORDER BY danh_sach.id
                    ) AS ds_quyen

                FROM (
                    SELECT DISTINCT
                        q.id,
                        q.ma_quyen,
                        q.ten_quyen,
                        q.mo_ta,
                        q.active

                    FROM dm_tai_khoan_vai_tro tkvt

                    INNER JOIN dm_vai_tro vt
                        ON vt.id = tkvt.vai_tro_id
                        AND vt.active = TRUE

                    INNER JOIN dm_vai_tro_quyen vtq
                        ON vtq.vai_tro_id = vt.id
                        AND vtq.active = TRUE

                    INNER JOIN dm_quyen q
                        ON q.id = vtq.quyen_id
                        AND q.active = TRUE

                    WHERE
                        tkvt.tai_khoan_id = tk.id
                        AND tkvt.active = TRUE
                ) danh_sach
            ) quyen
                ON TRUE

            WHERE nv.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [nhanVienId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.nhan_vien_id,
            nhanVienId: row.nhan_vien_id,
            taiKhoanId: row.tai_khoan_id,
            tenDangNhap: row.ten_dang_nhap,
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            email: row.email,
            soDienThoai: row.so_dien_thoai,
            anhDaiDien: row.anh_dai_dien,
            ngaySinh: row.ngay_sinh,
            gioiTinh: row.gioi_tinh,
            diaChi: row.dia_chi,
            ghiChu: row.ghi_chu,
            maThe: row.ma_the,
            maQr: row.ma_qr,
            maBarcode: row.ma_barcode,
            quocGiaId: row.quoc_gia_id,
            tinhThanhId: row.tinh_thanh_id,
            xaPhuongId: row.xa_phuong_id,
            coSoId: row.co_so_id,
            coSo: row.co_so,
            phongBanId: row.phong_ban_id,
            phongBan: row.phong_ban,
            chucVuId: row.chuc_vu_id,
            chucVu: row.chuc_vu,
            dsVaiTroId: row.ds_vai_tro_id || [],
            roles: row.vai_tros || [],
            dsVaiTro: row.ds_vai_tro || [],
            dsQuyenId: row.ds_quyen_id || [],
            dsQuyen: row.ds_quyen || [],
            active: row.nhan_vien_active,
            taiKhoanActive: row.tai_khoan_active,
            doiMatKhauLanDau: row.doi_mat_khau_lan_dau,
            soLanDangNhapSai: row.so_lan_dang_nhap_sai,
            khoaDen: row.khoa_den,
            lanDangNhapCuoi: row.lan_dang_nhap_cuoi,
            createdAt: row.nhan_vien_created_at,
            updatedAt: row.nhan_vien_updated_at
        };
    }

    async getMaQuyenHienTai(taiKhoanId) {
        const id = Number(taiKhoanId);

        if (!Number.isInteger(id) || id <= 0) {
            return [];
        }

        const sql = `
            SELECT DISTINCT
                q.ma_quyen
            FROM dm_tai_khoan tk

            INNER JOIN dm_tai_khoan_vai_tro tkvt
                ON tkvt.tai_khoan_id = tk.id
                AND tkvt.active = TRUE

            INNER JOIN dm_vai_tro vt
                ON vt.id = tkvt.vai_tro_id
                AND vt.active = TRUE

            INNER JOIN dm_vai_tro_quyen vtq
                ON vtq.vai_tro_id = vt.id
                AND vtq.active = TRUE

            INNER JOIN dm_quyen q
                ON q.id = vtq.quyen_id
                AND q.active = TRUE

            WHERE
                tk.id = $1
                AND tk.active = TRUE
                AND COALESCE(
                    tk.bi_khoa,
                    FALSE
                ) = FALSE

            ORDER BY
                q.ma_quyen ASC
        `;

        const result = await pool.query(sql, [id]);

        return [
            ...new Set(
                result.rows
                    .map((row) =>
                        String(row.ma_quyen || '')
                            .trim()
                            .toUpperCase()
                    )
                    .filter(Boolean)
            )
        ];
    }
}

module.exports = new XacThucRepository();

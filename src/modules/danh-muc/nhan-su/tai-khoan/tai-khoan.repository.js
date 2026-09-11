const pool = require('../../../../config/database');

class TaiKhoanRepository {
    mapTaiKhoan(row) {
        if (!row) {
            return null;
        }

        const dsVaiTro = Array.isArray(row.vai_tros) ? row.vai_tros : [];

        const dsQuyen = Array.isArray(row.quyens) ? row.quyens : [];

        return {
            id: row.id,
            tenDangNhap: row.ten_dang_nhap,
            soLanDangNhap: row.so_lan_dang_nhap,
            soLanDangNhapSai: row.so_lan_dang_nhap_sai,
            biKhoa: row.bi_khoa,
            khoaDen: row.khoa_den,
            lanDangNhapCuoi: row.lan_dang_nhap_cuoi,
            doiMatKhauLanCuoi: row.doi_mat_khau_lan_cuoi,
            doiMatKhauLanDau: row.doi_mat_khau_lan_dau,
            nhanVienId: row.nhan_vien_id,
            nhanVien: row.nhan_vien || null,
            dsVaiTroId: dsVaiTro.map((item) => item.id),
            dsMaVaiTro: dsVaiTro.map((item) => item.maVaiTro),
            dsVaiTro: dsVaiTro,
            dsQuyenId: dsQuyen.map((item) => item.id),
            dsMaQuyen: dsQuyen.map((item) => item.maQuyen),
            dsQuyen: dsQuyen,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                tk.id,
                tk.nhan_vien_id,
                tk.ten_dang_nhap,
                tk.so_lan_dang_nhap,
                tk.so_lan_dang_nhap_sai,
                tk.bi_khoa,
                tk.khoa_den,
                tk.lan_dang_nhap_cuoi,
                tk.doi_mat_khau_lan_cuoi,
                tk.doi_mat_khau_lan_dau,
                tk.active,
                tk.created_at,
                tk.updated_at,

                JSON_BUILD_OBJECT(
                    'id', nv.id,
                    'maNhanVien', nv.ma_nhan_vien,
                    'hoTen', nv.ho_ten,
                    'email', nv.email,
                    'soDienThoai', nv.so_dien_thoai,
                    'ngaySinh', nv.ngay_sinh,
                    'anhDaiDien', nv.anh_dai_dien,
                    'active', nv.active,
                    'coSo',
                        CASE
                            WHEN cs.id IS NOT NULL THEN
                                JSON_BUILD_OBJECT(
                                    'id', cs.id,
                                    'maCoSo', cs.ma_co_so,
                                    'tenCoSo', cs.ten_co_so,
                                    'diaChi', cs.dia_chi,
                                    'active', cs.active
                                )
                            ELSE NULL
                        END,
                    'phongBan',
                        CASE
                            WHEN pb.id IS NOT NULL THEN
                                JSON_BUILD_OBJECT(
                                    'id', pb.id,
                                    'maPhongBan', pb.ma_phong_ban,
                                    'tenPhongBan', pb.ten_phong_ban,
                                    'active', pb.active
                                )
                            ELSE NULL
                        END,
                    'chucVu',
                        CASE
                            WHEN cv.id IS NOT NULL THEN
                                JSON_BUILD_OBJECT(
                                    'id', cv.id,
                                    'maChucVu', cv.ma_chuc_vu,
                                    'tenChucVu', cv.ten_chuc_vu,
                                    'active', cv.active
                                )
                            ELSE NULL
                        END
                ) AS nhan_vien,

                COALESCE(
                    (
                        SELECT
                            JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'id', ds_vai_tro.id,
                                    'maVaiTro', ds_vai_tro.ma_vai_tro,
                                    'tenVaiTro', ds_vai_tro.ten_vai_tro,
                                    'moTa', ds_vai_tro.mo_ta,
                                    'active', ds_vai_tro.active
                                )
                                ORDER BY ds_vai_tro.ma_vai_tro ASC
                            )
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
                            WHERE tkvt.tai_khoan_id = tk.id
                                AND tkvt.active = TRUE
                        ) AS ds_vai_tro
                    ),
                    '[]'::JSON
                ) AS vai_tros,

                COALESCE(
                    (
                        SELECT
                            JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'id', ds_quyen.id,
                                    'maQuyen', ds_quyen.ma_quyen,
                                    'tenQuyen', ds_quyen.ten_quyen,
                                    'moTa', ds_quyen.mo_ta,
                                    'active', ds_quyen.active
                                )
                                ORDER BY ds_quyen.ma_quyen ASC
                            )
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
                            WHERE tkvt.tai_khoan_id = tk.id
                                AND tkvt.active = TRUE
                        ) AS ds_quyen
                    ),
                    '[]'::JSON
                ) AS quyens

            FROM dm_tai_khoan tk
            INNER JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id
            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id
            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id
            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id
        `;
    }

    async getNhanVienById(id) {
        const query = `
            SELECT
                nv.id,
                nv.ma_nhan_vien AS "maNhanVien",
                nv.ho_ten AS "hoTen",
                nv.anh_dai_dien AS "anhDaiDien",
                nv.active
            FROM dm_nhan_vien nv
            WHERE nv.id = $1
            LIMIT 1
        `;

        const result = await pool.query(query, [id]);

        return result.rows[0] || null;
    }

    async getNhanVienKhaDung(taiKhoanId = null) {
        const sql = `
            SELECT
                nv.id,
                nv.ma_nhan_vien AS "maNhanVien",
                nv.ho_ten AS "hoTen",
                nv.anh_dai_dien AS "anhDaiDien",
                nv.active

            FROM dm_nhan_vien nv

            LEFT JOIN dm_tai_khoan tk
                ON tk.nhan_vien_id = nv.id

            WHERE nv.active = TRUE
            AND (
                tk.id IS NULL
                OR (
                    $1::INTEGER IS NOT NULL
                    AND tk.id = $1
                )
            )

            ORDER BY
                nv.ma_nhan_vien ASC,
                nv.ho_ten ASC
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY
                tk.ten_dang_nhap ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapTaiKhoan(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tk.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTaiKhoan(result.rows[0]);
    }

    async getChiTietByTenDangNhap(tenDangNhap) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(tk.ten_dang_nhap)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [tenDangNhap]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapTaiKhoan(result.rows[0]);
    }

    async findNhanVienByMa(maNhanVien) {
        const sql = `
            SELECT
                id,
                ma_nhan_vien,
                ho_ten,
                email,
                so_dien_thoai,
                ngay_sinh,
                anh_dai_dien,
                co_so_id,
                phong_ban_id,
                chuc_vu_id,
                active
            FROM dm_nhan_vien
            WHERE
                UPPER(ma_nhan_vien) = UPPER($1)
            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhanVien]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maNhanVien: result.rows[0].ma_nhan_vien,
            hoTen: result.rows[0].ho_ten,
            email: result.rows[0].email,
            soDienThoai: result.rows[0].so_dien_thoai,
            ngaySinh: result.rows[0].ngay_sinh,
            anhDaiDien: result.rows[0].anh_dai_dien,
            coSoId: result.rows[0].co_so_id,
            phongBanId: result.rows[0].phong_ban_id,
            chucVuId: result.rows[0].chuc_vu_id,
            active: result.rows[0].active
        };
    }

    async existsNhanVien(nhanVienId, excludeId = null) {
        const values = [nhanVienId];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_tai_khoan
                WHERE nhan_vien_id = $1
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

    async existsTenDangNhap(tenDangNhap, excludeId = null) {
        const values = [tenDangNhap];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_tai_khoan
                WHERE
                    UPPER(ten_dang_nhap) = UPPER($1)
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

    async getDsVaiTroByIds(ids) {
        const sql = `
            SELECT
                id,
                ma_vai_tro,
                ten_vai_tro,
                mo_ta,
                active
            FROM dm_vai_tro
            WHERE id = ANY($1::BIGINT[])
            ORDER BY ma_vai_tro ASC
        `;

        const result = await pool.query(sql, [ids]);

        return result.rows.map((row) => ({
            id: row.id,
            maVaiTro: row.ma_vai_tro,
            tenVaiTro: row.ten_vai_tro,
            moTa: row.mo_ta,
            active: row.active
        }));
    }

    async getDsVaiTroByMas(mas) {
        const sql = `
            SELECT
                id,
                ma_vai_tro,
                ten_vai_tro,
                mo_ta,
                active
            FROM dm_vai_tro
            WHERE UPPER(ma_vai_tro)
                IN (
                    SELECT UPPER(
                        UNNEST($1::TEXT[])
                    )
                )
            ORDER BY ma_vai_tro ASC
        `;

        const result = await pool.query(sql, [mas]);

        return result.rows.map((row) => ({
            id: row.id,
            maVaiTro: row.ma_vai_tro,
            tenVaiTro: row.ten_vai_tro,
            moTa: row.mo_ta,
            active: row.active
        }));
    }

    async ganDsVaiTro(client, taiKhoanId, dsVaiTroId) {
        if (!Array.isArray(dsVaiTroId) || dsVaiTroId.length === 0) {
            return;
        }

        const sql = `
            INSERT INTO dm_tai_khoan_vai_tro (
                tai_khoan_id,
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
                tai_khoan_id,
                vai_tro_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [taiKhoanId, dsVaiTroId]);
    }

    async khoaTatCaVaiTro(client, taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan_vai_tro
            SET
                active = FALSE,
                updated_at = NOW()
            WHERE tai_khoan_id = $1
        `;

        await client.query(sql, [taiKhoanId]);
    }

    async updateAnhDaiDien(nhanVienId, anhDaiDien) {
        const sql = `
            UPDATE dm_nhan_vien
            SET
                anh_dai_dien = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [anhDaiDien || null, nhanVienId]);

        return result.rows.length > 0;
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                INSERT INTO dm_tai_khoan (
                    nhan_vien_id,
                    ten_dang_nhap,
                    mat_khau_hash,
                    so_lan_dang_nhap,
                    so_lan_dang_nhap_sai,
                    bi_khoa,
                    khoa_den,
                    lan_dang_nhap_cuoi,
                    doi_mat_khau_lan_cuoi,
                    doi_mat_khau_lan_dau,
                    active,
                    created_at,
                    updated_at
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    0,
                    0,
                    $4,
                    $5,
                    NULL,
                    NULL,
                    TRUE,
                    $6,
                    NOW(),
                    NOW()
                )
                RETURNING id
            `;

            const values = [
                data.nhanVienId,
                data.tenDangNhap,
                data.matKhauHash,
                data.biKhoa === true,
                data.khoaDen || null,
                data.active !== undefined ? data.active : true
            ];

            const result = await client.query(sql, values);

            const taiKhoanId = result.rows[0].id;

            await this.ganDsVaiTro(client, taiKhoanId, data.dsVaiTroId);

            await client.query('COMMIT');

            return await this.getChiTiet(taiKhoanId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async update(id, data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const fields = [];
            const values = [];

            let parameterIndex = 1;

            if (data.nhanVienId !== undefined) {
                fields.push(`nhan_vien_id = $${parameterIndex}`);

                values.push(data.nhanVienId);

                parameterIndex++;
            }

            if (data.tenDangNhap !== undefined) {
                fields.push(`ten_dang_nhap = $${parameterIndex}`);

                values.push(data.tenDangNhap);

                parameterIndex++;
            }

            if (data.biKhoa !== undefined) {
                fields.push(`bi_khoa = $${parameterIndex}`);

                values.push(data.biKhoa);

                parameterIndex++;
            }

            if (data.khoaDen !== undefined) {
                fields.push(`khoa_den = $${parameterIndex}`);

                values.push(data.khoaDen);

                parameterIndex++;
            }

            if (data.resetSoLanDangNhapSai === true) {
                fields.push('so_lan_dang_nhap_sai = 0');
            }

            if (data.active !== undefined) {
                fields.push(`active = $${parameterIndex}`);

                values.push(data.active);

                parameterIndex++;
            }

            fields.push('updated_at = NOW()');

            values.push(id);

            const sql = `
                UPDATE dm_tai_khoan
                SET
                    ${fields.join(',\n')}
                WHERE id = $${parameterIndex}
                RETURNING id
            `;

            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            if (data.dsVaiTroId !== undefined) {
                await this.khoaTatCaVaiTro(client, id);

                await this.ganDsVaiTro(client, id, data.dsVaiTroId);
            }

            await client.query('COMMIT');

            return await this.getChiTiet(id);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async getThongTinMatKhau(id) {
        const query = `
            SELECT
                id,
                mat_khau_hash,
                active
            FROM dm_tai_khoan
            WHERE id = $1
            LIMIT 1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            matKhauHash: row.mat_khau_hash,
            active: row.active
        };
    }

    async doiMatKhau(taiKhoanId, matKhauHashMoi) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                mat_khau_hash = $1,
                doi_mat_khau_lan_cuoi = NOW(),
                doi_mat_khau_lan_dau = FALSE,
                so_lan_dang_nhap_sai = 0,
                bi_khoa = FALSE,
                khoa_den = NULL,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [matKhauHashMoi, taiKhoanId]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(taiKhoanId);
    }

    async datLaiMatKhau(taiKhoanId, matKhauHash) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                mat_khau_hash = $1,
                doi_mat_khau_lan_dau = TRUE,
                doi_mat_khau_lan_cuoi = NOW(),
                so_lan_dang_nhap_sai = 0,
                bi_khoa = FALSE,
                khoa_den = NULL,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [matKhauHash, taiKhoanId]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(taiKhoanId);
    }

    async tangSoLanDangNhapSai(taiKhoanId) {
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
            return null;
        }

        return Number(result.rows[0].so_lan_dang_nhap_sai);
    }

    async khoaTaiKhoan(taiKhoanId, khoaDen = null) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                bi_khoa = TRUE,
                khoa_den = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [khoaDen, taiKhoanId]);

        return result.rows.length > 0;
    }

    async moKhoaTaiKhoan(taiKhoanId) {
        const sql = `
            UPDATE dm_tai_khoan
            SET
                so_lan_dang_nhap_sai = 0,
                bi_khoa = FALSE,
                khoa_den = NULL,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id
        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows.length > 0;
    }

    async resetDangNhapSai(taiKhoanId) {
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

    async updateAnhDaiDien(nhanVienId, anhDaiDien) {
        const sql = `
            UPDATE dm_nhan_vien
            SET
                anh_dai_dien = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [anhDaiDien, nhanVienId]);

        return result.rows.length > 0;
    }
}

module.exports = new TaiKhoanRepository();

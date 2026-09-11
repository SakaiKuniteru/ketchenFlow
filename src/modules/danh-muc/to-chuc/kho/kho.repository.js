const pool = require('../../../../config/database');

class KhoRepository {
    mapKho(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maKho: row.ma_kho,
            tenKho: row.ten_kho,
            nhaAnId: row.nha_an_id,
            nhaAn: row.nha_an_id
                ? {
                      id: row.nha_an_id,
                      ma: row.ma_nha_an,
                      ten: row.ten_nha_an,
                      coSoId: row.co_so_id,
                      coSo: row.co_so_id
                          ? {
                                id: row.co_so_id,
                                ma: row.ma_co_so,
                                ten: row.ten_co_so,
                                diaChi: row.dia_chi_co_so,
                                logo: row.logo_co_so,
                                favicon: row.favicon_co_so,
                                logoDoiTac: row.logo_doi_tac,
                                quocGiaId: row.quoc_gia_id,
                                quocGia: row.quoc_gia_id
                                    ? {
                                          id: row.quoc_gia_id,
                                          ma: row.ma_quoc_gia,
                                          ten: row.ten_quoc_gia,
                                          tenTiengAnh: row.ten_tieng_anh,
                                          tenQuocGiaEn: row.ten_quoc_gia_en,
                                          tenVietTat: row.ten_viet_tat_quoc_gia,
                                          maDienThoai: row.ma_dien_thoai,
                                          maIso2: row.ma_iso2,
                                          maIso3: row.ma_iso3
                                      }
                                    : null,
                                tinhThanhId: row.tinh_thanh_id,
                                tinhThanh: row.tinh_thanh_id
                                    ? {
                                          id: row.tinh_thanh_id,
                                          ma: row.ma_tinh_thanh,
                                          ten: row.ten_tinh_thanh,
                                          tenVietTat: row.ten_viet_tat_tinh_thanh,
                                          active: row.tinh_thanh_active
                                      }
                                    : null,
                                xaPhuongId: row.xa_phuong_id,
                                xaPhuong: row.xa_phuong_id
                                    ? {
                                          id: row.xa_phuong_id,
                                          ma: row.ma_xa_phuong,
                                          ten: row.ten_xa_phuong,
                                          tenVietTat: row.ten_viet_tat_xa_phuong,
                                          active: row.xa_phuong_active
                                      }
                                    : null,
                                active: row.co_so_active
                            }
                          : null,
                      active: row.nha_an_active
                  }
                : null,
            loaiKho: row.loai_kho,
            diaDiem: row.dia_diem,
            dienTich: row.dien_tich !== null ? Number(row.dien_tich) : null,
            nhietDoToiThieu: row.nhiet_do_toi_thieu !== null ? Number(row.nhiet_do_toi_thieu) : null,
            nhietDoToiDa: row.nhiet_do_toi_da !== null ? Number(row.nhiet_do_toi_da) : null,
            moTa: row.mo_ta,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                k.id,
                k.ma_kho,
                k.ten_kho,
                k.nha_an_id,
                k.loai_kho,
                k.dia_diem,
                k.dien_tich,
                k.nhiet_do_toi_thieu,
                k.nhiet_do_toi_da,
                k.mo_ta,
                k.ghi_chu,
                k.active,
                k.created_at,
                k.updated_at,
                na.ma_nha_an,
                na.ten_nha_an,
                na.co_so_id,
                na.active AS nha_an_active,
                cs.ma_co_so,
                cs.ten_co_so,
                cs.dia_chi AS dia_chi_co_so,
                cs.logo AS logo_co_so,
                cs.favicon AS favicon_co_so,
                cs.logo_doi_tac,
                cs.quoc_gia_id,
                cs.tinh_thanh_id,
                cs.xa_phuong_id,
                cs.active AS co_so_active,
                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_tieng_anh,
                qg.ten_quoc_gia_en,
                qg.ma_dien_thoai,
                qg.ma_iso2,
                qg.ma_iso3,
                qg.ten_viet_tat AS ten_viet_tat_quoc_gia,
                qg.active AS quoc_gia_active,
                tt.ma_tinh_thanh,
                tt.ten_tinh_thanh,
                tt.ten_viet_tat AS ten_viet_tat_tinh_thanh,
                tt.active AS tinh_thanh_active,
                xp.ma_xa_phuong,
                xp.ten_xa_phuong,
                xp.ten_viet_tat AS ten_viet_tat_xa_phuong,
                xp.active AS xa_phuong_active
            FROM dm_kho k
            LEFT JOIN dm_nha_an na ON na.id = k.nha_an_id
            LEFT JOIN dm_co_so cs ON cs.id = na.co_so_id
            LEFT JOIN dm_quoc_gia qg ON qg.id = cs.quoc_gia_id
            LEFT JOIN dm_tinh_thanh tt ON tt.id = cs.tinh_thanh_id
            LEFT JOIN dm_xa_phuong xp ON xp.id = cs.xa_phuong_id
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY k.ma_kho ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapKho(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE k.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const kho = this.mapKho(result.rows[0]);

        kho.dsNvQuanLy = await this.getDsNvQuanLy(id);

        return kho;
    }

    async getNhaAnByMa(maNhaAn) {
        const sql = `
            SELECT
                id,
                ma_nha_an,
                ten_nha_an,
                active
            FROM dm_nha_an
            WHERE UPPER(TRIM(ma_nha_an)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhaAn]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            maNhaAn: row.ma_nha_an,
            tenNhaAn: row.ten_nha_an,
            active: row.active
        };
    }

    async existsNhaAn(nhaAnId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nha_an
                WHERE id = $1
                    AND active = TRUE
            ) AS "exists"
        `;

        const result = await pool.query(sql, [nhaAnId]);

        return result.rows[0].exists;
    }

    async existsMaKho(maKho, excludeId = null) {
        const values = [maKho];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_kho
                WHERE UPPER(TRIM(ma_kho)) = UPPER(TRIM($1))
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

    async existsTenKho(tenKho, excludeId = null) {
        const values = [tenKho];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_kho
                WHERE LOWER(TRIM(ten_kho)) = LOWER(TRIM($1))
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

    async getDsNvQuanLy(khoId) {
        const sql = `
            SELECT
                nv.id,
                nv.ma_nhan_vien,
                nv.ho_ten,
                nv.email,
                nv.active,

                cv.id AS chuc_vu_id,
                cv.ma_chuc_vu,
                cv.ten_chuc_vu,

                pb.id AS phong_ban_id,
                pb.ma_phong_ban,
                pb.ten_phong_ban

            FROM ct_kho_nhan_vien_quan_ly knvql

            INNER JOIN dm_nhan_vien nv
                ON nv.id = knvql.nhan_vien_id

            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            WHERE knvql.kho_id = $1
                AND knvql.active = TRUE

            ORDER BY
                nv.ho_ten ASC
        `;

        const result = await pool.query(sql, [khoId]);

        return result.rows.map((row) => ({
            id: row.id,
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            email: row.email,
            active: row.active,

            chucVu: row.chuc_vu_id
                ? {
                      id: row.chuc_vu_id,
                      ma: row.ma_chuc_vu,
                      ten: row.ten_chuc_vu
                  }
                : null,

            phongBan: row.phong_ban_id
                ? {
                      id: row.phong_ban_id,
                      ma: row.ma_phong_ban,
                      ten: row.ten_phong_ban
                  }
                : null
        }));
    }

    async getDsNhanVienByIds(dsId) {
        if (!Array.isArray(dsId) || dsId.length === 0) {
            return [];
        }

        const sql = `
            SELECT
                id,
                ma_nhan_vien,
                ho_ten,
                active
            FROM dm_nhan_vien
            WHERE id = ANY($1::INTEGER[])
            ORDER BY id ASC
        `;

        const result = await pool.query(sql, [dsId]);

        return result.rows.map((row) => ({
            id: Number(row.id),
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            active: row.active
        }));
    }

    async getDsNhanVienByMa(dsMaNhanVien) {
        if (!Array.isArray(dsMaNhanVien) || dsMaNhanVien.length === 0) {
            return [];
        }

        const dsMa = [...new Set(dsMaNhanVien.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))];

        if (dsMa.length === 0) {
            return [];
        }

        const sql = `
            SELECT
                id,
                ma_nhan_vien,
                ho_ten,
                active
            FROM dm_nhan_vien
            WHERE UPPER(TRIM(ma_nhan_vien)) = ANY($1::TEXT[])
            ORDER BY id ASC
        `;

        const result = await pool.query(sql, [dsMa]);

        return result.rows.map((row) => ({
            id: Number(row.id),
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            active: row.active
        }));
    }

    async getDsNhanVienThuocNhaAnByIds(dsId, nhaAnId) {
        if (!Array.isArray(dsId) || dsId.length === 0) {
            return [];
        }

        const sql = `
            SELECT
                nv.id,
                nv.ma_nhan_vien,
                nv.ho_ten
            FROM dm_nhan_vien nv
            INNER JOIN ct_nha_an_nhan_vien nanv
                ON nanv.nhan_vien_id = nv.id
                AND nanv.nha_an_id = $2
                AND nanv.active = TRUE
            WHERE nv.id = ANY($1::INTEGER[])
            ORDER BY nv.id ASC
        `;

        const result = await pool.query(sql, [dsId, nhaAnId]);

        return result.rows.map((row) => ({
            id: Number(row.id),
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten
        }));
    }

    async getDsNhanVienThuocNhaAnByMa(dsMaNhanVien, nhaAnId) {
        if (!Array.isArray(dsMaNhanVien) || dsMaNhanVien.length === 0) {
            return [];
        }

        const dsMa = [...new Set(dsMaNhanVien.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))];

        if (dsMa.length === 0) {
            return [];
        }

        const sql = `
            SELECT
                nv.id,
                nv.ma_nhan_vien,
                nv.ho_ten
            FROM dm_nhan_vien nv
            INNER JOIN ct_nha_an_nhan_vien nanv
                ON nanv.nhan_vien_id = nv.id
                AND nanv.nha_an_id = $2
                AND nanv.active = TRUE
            WHERE UPPER(TRIM(nv.ma_nhan_vien)) = ANY($1::TEXT[])
            ORDER BY nv.id ASC
        `;

        const result = await pool.query(sql, [dsMa, nhaAnId]);

        return result.rows.map((row) => ({
            id: Number(row.id),
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten
        }));
    }

    async getChiTietByMa(maKho) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(TRIM(k.ma_kho)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maKho]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapKho(result.rows[0]);
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                INSERT INTO dm_kho (
                    ma_kho,
                    ten_kho,
                    nha_an_id,
                    loai_kho,
                    dia_diem,
                    dien_tich,
                    nhiet_do_toi_thieu,
                    nhiet_do_toi_da,
                    mo_ta,
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
                    $11,
                    NOW(),
                    NOW()
                )
                RETURNING id
            `;

            const values = [
                data.maKho,
                data.tenKho,
                data.nhaAnId,
                data.loaiKho,
                data.diaDiem || null,

                data.dienTich !== undefined ? data.dienTich : null,

                data.nhietDoToiThieu !== undefined ? data.nhietDoToiThieu : null,

                data.nhietDoToiDa !== undefined ? data.nhietDoToiDa : null,

                data.moTa || null,
                data.ghiChu || null,

                data.active !== undefined ? data.active : true
            ];

            const result = await client.query(sql, values);

            const khoId = result.rows[0].id;

            if (Array.isArray(data.dsNvQuanLyId) && data.dsNvQuanLyId.length > 0) {
                for (const nhanVienId of data.dsNvQuanLyId) {
                    await client.query(
                        `
                            INSERT INTO
                                ct_kho_nhan_vien_quan_ly (
                                    kho_id,
                                    nhan_vien_id,
                                    active,
                                    created_at,
                                    updated_at
                                )
                            VALUES (
                                $1,
                                $2,
                                TRUE,
                                NOW(),
                                NOW()
                            )
                        `,
                        [khoId, nhanVienId]
                    );
                }
            }

            await client.query('COMMIT');

            return await this.getChiTiet(khoId);
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

            const sql = `
                UPDATE dm_kho
                SET
                    ma_kho = $1,
                    ten_kho = $2,
                    nha_an_id = $3,
                    loai_kho = $4,
                    dia_diem = $5,
                    dien_tich = $6,
                    nhiet_do_toi_thieu = $7,
                    nhiet_do_toi_da = $8,
                    mo_ta = $9,
                    ghi_chu = $10,
                    active = $11,
                    updated_at = NOW()
                WHERE id = $12
                RETURNING id
            `;

            const values = [
                data.maKho,
                data.tenKho,
                data.nhaAnId,
                data.loaiKho,
                data.diaDiem || null,

                data.dienTich !== undefined ? data.dienTich : null,

                data.nhietDoToiThieu !== undefined ? data.nhietDoToiThieu : null,

                data.nhietDoToiDa !== undefined ? data.nhietDoToiDa : null,

                data.moTa || null,
                data.ghiChu || null,
                data.active,
                id
            ];

            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            if (data.dsNvQuanLyId !== undefined) {
                await client.query(
                    `
                        DELETE FROM
                            ct_kho_nhan_vien_quan_ly
                        WHERE kho_id = $1
                    `,
                    [id]
                );

                for (const nhanVienId of data.dsNvQuanLyId) {
                    await client.query(
                        `
                            INSERT INTO
                                ct_kho_nhan_vien_quan_ly (
                                    kho_id,
                                    nhan_vien_id,
                                    active,
                                    created_at,
                                    updated_at
                                )
                            VALUES (
                                $1,
                                $2,
                                TRUE,
                                NOW(),
                                NOW()
                            )
                        `,
                        [id, nhanVienId]
                    );
                }
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
}

module.exports = new KhoRepository();

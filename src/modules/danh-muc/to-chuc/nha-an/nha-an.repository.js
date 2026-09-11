const pool = require('../../../../config/database');

class NhaAnRepository {
    mapNhaAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maNhaAn: row.ma_nha_an,
            tenNhaAn: row.ten_nha_an,
            coSoId: row.co_so_id,
            coSo: row.co_so,
            dsNvQuanLyId: row.ds_nv_quan_ly_id || [],
            dsNvQuanLy: row.ds_nv_quan_ly || [],
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                na.id,
                na.ma_nha_an,
                na.ten_nha_an,
                na.co_so_id,

                CASE
                    WHEN cs.id IS NULL
                    THEN NULL
                    ELSE jsonb_build_object(
                        'id', cs.id,
                        'ma', cs.ma_co_so,
                        'ten', cs.ten_co_so,
                        'diaChi', cs.dia_chi,
                        'quocGiaId', cs.quoc_gia_id,
                        'quocGia',
                        CASE
                            WHEN qg.id IS NULL
                            THEN NULL
                            ELSE jsonb_build_object(
                                'id', qg.id,
                                'ma', qg.ma_quoc_gia,
                                'ten', qg.ten_quoc_gia,
                                'tenVietTat', qg.ten_viet_tat,
                                'maDienThoai', qg.ma_dien_thoai,
                                'maIso2', qg.ma_iso2,
                                'maIso3', qg.ma_iso3,
                                'active', qg.active
                            )
                        END,
                        'tinhThanhId', cs.tinh_thanh_id,
                        'tinhThanh',
                        CASE
                            WHEN tt.id IS NULL
                            THEN NULL
                            ELSE jsonb_build_object(
                                'id', tt.id,
                                'ma', tt.ma_tinh_thanh,
                                'ten', tt.ten_tinh_thanh,
                                'tenVietTat', tt.ten_viet_tat,
                                'active', tt.active
                            )
                        END,
                        'xaPhuongId', cs.xa_phuong_id,
                        'xaPhuong',
                        CASE
                            WHEN xp.id IS NULL
                            THEN NULL
                            ELSE jsonb_build_object(
                                'id', xp.id,
                                'ma', xp.ma_xa_phuong,
                                'ten', xp.ten_xa_phuong,
                                'tenVietTat', xp.ten_viet_tat,
                                'active', xp.active
                            )
                        END,
                        'active', cs.active
                    )
                END AS co_so,

                COALESCE(
                    (
                        SELECT jsonb_agg(
                            ct.nhan_vien_id
                            ORDER BY ct.nhan_vien_id
                        )
                        FROM ct_nha_an_nhan_vien ct
                        WHERE ct.nha_an_id = na.id
                            AND ct.active = TRUE
                    ),
                    '[]'::jsonb
                ) AS ds_nv_quan_ly_id,

                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', nv.id,
                                'maNhanVien', nv.ma_nhan_vien,
                                'taiKhoan', tk.ten_dang_nhap,
                                'hoTen', nv.ho_ten,
                                'active', nv.active
                            )
                            ORDER BY nv.ma_nhan_vien
                        )
                        FROM ct_nha_an_nhan_vien ct
                        INNER JOIN dm_nhan_vien nv
                            ON nv.id = ct.nhan_vien_id
                        LEFT JOIN dm_tai_khoan tk
                            ON tk.nhan_vien_id = nv.id
                            AND tk.active = TRUE
                        WHERE ct.nha_an_id = na.id
                            AND ct.active = TRUE
                    ),
                    '[]'::jsonb
                ) AS ds_nv_quan_ly,

                na.active,
                na.created_at,
                na.updated_at

            FROM dm_nha_an na

            LEFT JOIN dm_co_so cs
                ON cs.id = na.co_so_id

            LEFT JOIN dm_quoc_gia qg
                ON qg.id = cs.quoc_gia_id

            LEFT JOIN dm_tinh_thanh tt
                ON tt.id = cs.tinh_thanh_id

            LEFT JOIN dm_xa_phuong xp
                ON xp.id = cs.xa_phuong_id
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY na.ma_nha_an ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapNhaAn(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE na.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhaAn(result.rows[0]);
    }

    async existsMaNhaAn(maNhaAn, excludeId = null) {
        const values = [maNhaAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nha_an
                WHERE UPPER(TRIM(ma_nha_an)) = UPPER(TRIM($1))
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

    async existsTenNhaAn(tenNhaAn, excludeId = null) {
        const values = [tenNhaAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nha_an
                WHERE LOWER(TRIM(ten_nha_an)) = LOWER(TRIM($1))
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

    async existsCoSo(coSoId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_co_so
                WHERE id = $1
            ) AS "exists"
        `;

        const result = await pool.query(sql, [coSoId]);

        return result.rows[0].exists;
    }

    async getDsNhanVienTonTai(dsNvQuanLyId) {
        if (!Array.isArray(dsNvQuanLyId) || dsNvQuanLyId.length === 0) {
            return [];
        }

        const sql = `
            SELECT id
            FROM dm_nhan_vien
            WHERE id = ANY($1::INTEGER[])
            ORDER BY id ASC
        `;

        const result = await pool.query(sql, [dsNvQuanLyId]);

        return result.rows.map((row) => row.id);
    }

    async getCoSoByMa(maCoSo) {
        const sql = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                active
            FROM dm_co_so
            WHERE UPPER(TRIM(ma_co_so)) = UPPER(TRIM($1))
                AND active = TRUE
            LIMIT 1
        `;

        const result = await pool.query(sql, [maCoSo]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maCoSo: result.rows[0].ma_co_so,
            tenCoSo: result.rows[0].ten_co_so,
            active: result.rows[0].active
        };
    }

    async getDsNhanVienByMa(dsMaNhanVien) {
        if (!Array.isArray(dsMaNhanVien) || dsMaNhanVien.length === 0) {
            return [];
        }

        const dsMaDaChuanHoa = dsMaNhanVien.map((ma) => ma.trim().toUpperCase());

        const sql = `
            SELECT
                id,
                ma_nhan_vien
            FROM dm_nhan_vien
            WHERE UPPER(TRIM(ma_nhan_vien)) = ANY($1::TEXT[])
                AND active = TRUE
            ORDER BY id ASC
        `;

        const result = await pool.query(sql, [dsMaDaChuanHoa]);

        return result.rows.map((row) => ({
            id: row.id,
            maNhanVien: row.ma_nhan_vien
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

            WHERE id = ANY($1::integer[])
        `;

        const result = await pool.query(sql, [dsId]);

        return result.rows.map((row) => ({
            id: row.id,
            maNhanVien: row.ma_nhan_vien,
            hoTen: row.ho_ten,
            active: row.active
        }));
    }

    async getChiTietByMa(maNhaAn) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(TRIM(na.ma_nha_an)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhaAn]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhaAn(result.rows[0]);
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sqlNhaAn = `
                INSERT INTO dm_nha_an (
                    ma_nha_an,
                    ten_nha_an,
                    co_so_id,
                    active,
                    created_at,
                    updated_at
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW(),
                    NOW()
                )
                RETURNING id
            `;

            const valuesNhaAn = [
                data.maNhaAn,
                data.tenNhaAn,
                data.coSoId || null,
                data.active !== undefined ? data.active : true
            ];

            const resultNhaAn = await client.query(sqlNhaAn, valuesNhaAn);

            const nhaAnId = resultNhaAn.rows[0].id;

            await this.insertDsNvQuanLy(client, nhaAnId, data.dsNvQuanLyId);

            await client.query('COMMIT');

            return await this.getChiTiet(nhaAnId);
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

            const sqlNhaAn = `
                UPDATE dm_nha_an
                SET
                    ma_nha_an = $1,
                    ten_nha_an = $2,
                    co_so_id = $3,
                    active = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING id
            `;

            const valuesNhaAn = [data.maNhaAn, data.tenNhaAn, data.coSoId || null, data.active, id];

            const resultNhaAn = await client.query(sqlNhaAn, valuesNhaAn);

            if (resultNhaAn.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            if (data.dsNvQuanLyId !== undefined) {
                await this.replaceDsNvQuanLy(client, id, data.dsNvQuanLyId);
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

    async insertDsNvQuanLy(client, nhaAnId, dsNvQuanLyId) {
        if (!Array.isArray(dsNvQuanLyId) || dsNvQuanLyId.length === 0) {
            return;
        }

        const dsIdKhongTrung = [...new Set(dsNvQuanLyId)];

        const sql = `
            INSERT INTO ct_nha_an_nhan_vien (
                nha_an_id,
                nhan_vien_id,
                active,
                created_at,
                updated_at
            )
            SELECT
                $1,
                nhan_vien_id,
                TRUE,
                NOW(),
                NOW()
            FROM UNNEST(
                $2::INTEGER[]
            ) AS nhan_vien_id

            ON CONFLICT (
                nha_an_id,
                nhan_vien_id
            )
            DO UPDATE SET
                active = TRUE,
                updated_at = NOW()
        `;

        await client.query(sql, [nhaAnId, dsIdKhongTrung]);
    }

    async replaceDsNvQuanLy(client, nhaAnId, dsNvQuanLyId) {
        await client.query(
            `
                DELETE FROM ct_nha_an_nhan_vien
                WHERE nha_an_id = $1
            `,
            [nhaAnId]
        );

        await this.insertDsNvQuanLy(client, nhaAnId, dsNvQuanLyId);
    }
}

module.exports = new NhaAnRepository();

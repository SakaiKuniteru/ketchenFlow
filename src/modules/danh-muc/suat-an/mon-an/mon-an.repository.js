const pool = require('../../../../config/database');

class MonAnRepository {
    mapMonAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maMonAn: row.ma_mon_an,
            tenMonAn: row.ten_mon_an,
            nhomMonAnId: row.nhom_mon_an_id,
            nhomMonAn: row.nhom_mon_an_id
                ? {
                      id: row.nhom_mon_an_id,
                      ma: row.ma_nhom_mon_an,
                      ten: row.ten_nhom_mon_an,
                      moTa: row.mo_ta_nhom_mon_an
                  }
                : null,
            giaTien: row.gia_tien !== null ? Number(row.gia_tien) : null,
            giaDuKien: row.gia_du_kien !== null ? Number(row.gia_du_kien) : null,
            calories: row.calories,
            moTa: row.mo_ta,
            hinhAnh: row.hinh_anh,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                ma.id,
                ma.ma_mon_an,
                ma.ten_mon_an,
                ma.nhom_mon_an_id,
                ma.gia_tien,
                ma.gia_du_kien,
                ma.calories,
                ma.mo_ta,
                ma.hinh_anh,
                ma.active,
                ma.created_at,
                ma.updated_at,
                nma.ma_nhom_mon_an,
                nma.ten_nhom_mon_an,
                nma.mo_ta AS mo_ta_nhom_mon_an
            FROM dm_mon_an ma
            LEFT JOIN dm_nhom_mon_an nma
                ON nma.id = ma.nhom_mon_an_id
        `;
    }

    async getCongThuc(monAnId) {
        const sql = `
            SELECT
                ct.id,
                ct.mon_an_id,
                ct.thuc_pham_id,
                ct.dinh_luong,
                ct.ghi_chu,
                tp.ma_thuc_pham,
                tp.ten_thuc_pham,
                tp.don_vi_so_cap_id,
                tp.don_vi_su_dung_id,
                tp.he_so_quy_doi,
                tp.quy_cach,
                tp.gia_nhap,
                tp.ty_le_hao_hut_du_kien,
                tp.xuat_xu_id,
                tp.dieu_kien_bao_quan,
                dvsc.ma_don_vi_tinh AS ma_don_vi_so_cap,
                dvsc.ten_don_vi_tinh AS ten_don_vi_so_cap,
                dvsc.ky_hieu AS ky_hieu_don_vi_so_cap,
                dvsd.ma_don_vi_tinh AS ma_don_vi_su_dung,
                dvsd.ten_don_vi_tinh AS ten_don_vi_su_dung,
                dvsd.ky_hieu AS ky_hieu_don_vi_su_dung
            FROM ct_mon_an_thuc_pham ct
            INNER JOIN dm_thuc_pham tp
                ON tp.id = ct.thuc_pham_id
            LEFT JOIN dm_don_vi_tinh dvsc
                ON dvsc.id = tp.don_vi_so_cap_id
            LEFT JOIN dm_don_vi_tinh dvsd
                ON dvsd.id = tp.don_vi_su_dung_id
            WHERE ct.mon_an_id = $1
            AND ct.active = TRUE
            ORDER BY ct.id ASC
        `;

        const result = await pool.query(sql, [monAnId]);

        return result.rows;
    }

    async getDanhSachCongThucExport(query = {}) {
        const conditions = ['ct.active = TRUE'];

        const values = [];

        if (query.monAnId !== undefined && query.monAnId !== null && query.monAnId !== '') {
            const monAnId = Number(query.monAnId);

            if (Number.isInteger(monAnId) && monAnId > 0) {
                values.push(monAnId);

                conditions.push(`ct.mon_an_id = $${values.length}`);
            }
        }

        const sql = `
            SELECT
                ct.id,
                ct.mon_an_id,
                ma.ma_mon_an,
                ma.ten_mon_an,
                ct.thuc_pham_id,
                tp.ma_thuc_pham,
                tp.ten_thuc_pham,
                ct.dinh_luong,
                ct.ghi_chu
            FROM ct_mon_an_thuc_pham ct
            INNER JOIN dm_mon_an ma
                ON ma.id = ct.mon_an_id
            INNER JOIN dm_thuc_pham tp
                ON tp.id = ct.thuc_pham_id
            WHERE
                ${conditions.join('\nAND\n')}
            ORDER BY
                ma.ma_mon_an ASC,
                ct.id ASC
        `;

        const result = await pool.query(sql, values);

        return result.rows;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY ma.ma_mon_an ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapMonAn(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE ma.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapMonAn(result.rows[0]);
    }

    async ganDsThucPham(client, monAnId, dsThucPham) {
        if (!Array.isArray(dsThucPham) || dsThucPham.length === 0) {
            return;
        }

        for (const item of dsThucPham) {
            await client.query(
                `
                INSERT INTO ct_mon_an_thuc_pham (
                    mon_an_id,
                    thuc_pham_id,
                    dinh_luong,
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
                    TRUE,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (
                    mon_an_id,
                    thuc_pham_id
                )
                DO UPDATE SET
                    dinh_luong = EXCLUDED.dinh_luong,
                    ghi_chu = EXCLUDED.ghi_chu,
                    active = TRUE,
                    updated_at = NOW()
                `,
                [monAnId, item.thucPhamId, item.dinhLuong, item.ghiChu || null]
            );
        }
    }

    async khoaTatCaThucPham(client, monAnId) {
        await client.query(
            `
            UPDATE ct_mon_an_thuc_pham
            SET
                active = FALSE,
                updated_at = NOW()
            WHERE mon_an_id = $1
            `,
            [monAnId]
        );
    }

    async getChiTietByMa(maMonAn) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(
                TRIM(ma.ma_mon_an)
            ) = UPPER(
                TRIM($1)
            )
            LIMIT 1
        `;

        const result = await pool.query(sql, [maMonAn]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapMonAn(result.rows[0]);
    }

    async getNhomMonAnByMa(maNhomMonAn) {
        const sql = `
            SELECT
                id,
                ma_nhom_mon_an,
                ten_nhom_mon_an,
                active
            FROM dm_nhom_mon_an
            WHERE UPPER(ma_nhom_mon_an)
                = UPPER($1)
            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhomMonAn]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,
            maNhomMonAn: result.rows[0].ma_nhom_mon_an,
            tenNhomMonAn: result.rows[0].ten_nhom_mon_an,
            active: result.rows[0].active
        };
    }

    async existsNhomMonAn(nhomMonAnId) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_mon_an
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await pool.query(sql, [nhomMonAnId]);

        return result.rows[0].exists;
    }

    async existsMaMonAn(maMonAn, excludeId = null) {
        const values = [maMonAn];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_mon_an
                WHERE UPPER(TRIM(ma_mon_an))
                    = UPPER(TRIM($1))
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

    async existsTenMonAn(tenMonAn, nhomMonAnId, excludeId = null) {
        const values = [tenMonAn, nhomMonAnId];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_mon_an
                WHERE LOWER(TRIM(ten_mon_an))
                    = LOWER(TRIM($1))
                AND nhom_mon_an_id = $2
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $3
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const sql = `
                INSERT INTO dm_mon_an (
                    ma_mon_an,
                    ten_mon_an,
                    nhom_mon_an_id,
                    gia_tien,
                    gia_du_kien,
                    calories,
                    mo_ta,
                    hinh_anh,
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
                data.maMonAn,
                data.tenMonAn,
                data.nhomMonAnId,
                data.giaTien !== undefined ? data.giaTien : null,
                data.giaDuKien !== undefined ? data.giaDuKien : 0,
                data.calories !== undefined ? data.calories : null,
                data.moTa || null,
                data.hinhAnh || null,
                data.active !== undefined ? data.active : true
            ];

            const result = await client.query(sql, values);

            const monAnId = result.rows[0].id;

            await this.ganDsThucPham(client, monAnId, data.dsThucPham);

            await client.query('COMMIT');

            return await this.getChiTiet(monAnId);
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
                UPDATE dm_mon_an
                SET
                    ma_mon_an = $1,
                    ten_mon_an = $2,
                    nhom_mon_an_id = $3,
                    gia_tien = $4,
                    gia_du_kien = $5,
                    calories = $6,
                    mo_ta = $7,
                    hinh_anh = $8,
                    active = $9,
                    updated_at = NOW()
                WHERE id = $10
                RETURNING id
            `;

            const values = [
                data.maMonAn,
                data.tenMonAn,
                data.nhomMonAnId,
                data.giaTien !== undefined ? data.giaTien : null,
                data.giaDuKien !== undefined ? data.giaDuKien : 0,
                data.calories !== undefined ? data.calories : null,
                data.moTa || null,
                data.hinhAnh || null,
                data.active,
                id
            ];

            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');

                return null;
            }

            if (Array.isArray(data.dsThucPham)) {
                await this.khoaTatCaThucPham(client, id);

                await this.ganDsThucPham(client, id, data.dsThucPham);
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

    async updateGiaDuKien(id, giaDuKien) {
        const sql = `
            UPDATE dm_mon_an
            SET
                gia_du_kien = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id
        `;

        const result = await pool.query(sql, [giaDuKien, id]);

        return result.rows.length > 0;
    }

    async updateGia(id, giaTien, giaDuKien) {
        const sql = `
            UPDATE dm_mon_an
            SET
                gia_tien = $1,
                gia_du_kien = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                gia_tien,
                gia_du_kien
        `;

        const result = await pool.query(sql, [giaTien, giaDuKien, id]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id,

            giaTien: result.rows[0].gia_tien !== null ? Number(result.rows[0].gia_tien) : null,

            giaDuKien: result.rows[0].gia_du_kien !== null ? Number(result.rows[0].gia_du_kien) : null
        };
    }
}

module.exports = new MonAnRepository();

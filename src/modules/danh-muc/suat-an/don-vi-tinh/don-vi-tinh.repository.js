const pool = require('../../../../config/database');

class DonViTinhRepository {
    mapDonViTinh(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maDonViTinh: row.ma_don_vi_tinh,

            tenDonViTinh: row.ten_don_vi_tinh,

            kyHieu: row.ky_hieu,

            loaiDonVi: row.loai_don_vi,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                dvt.id,
                dvt.ma_don_vi_tinh,
                dvt.ten_don_vi_tinh,
                dvt.ky_hieu,
                dvt.loai_don_vi,

                dvt.active,
                dvt.created_at,
                dvt.updated_at

            FROM dm_don_vi_tinh dvt

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY dvt.ma_don_vi_tinh ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapDonViTinh(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE dvt.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapDonViTinh(result.rows[0]);
    }

    async getChiTietByMa(maDonViTinh) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(dvt.ma_don_vi_tinh)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maDonViTinh]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapDonViTinh(result.rows[0]);
    }
    async existsMaDonViTinh(maDonViTinh, excludeId = null) {
        const values = [maDonViTinh];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_don_vi_tinh
                WHERE UPPER(ma_don_vi_tinh)
                    = UPPER($1)
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

    async existsTenDonViTinh(tenDonViTinh, excludeId = null) {
        const values = [tenDonViTinh];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_don_vi_tinh
                WHERE LOWER(TRIM(ten_don_vi_tinh))
                    = LOWER(TRIM($1))
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

    async create(data) {
        const sql = `
            INSERT INTO dm_don_vi_tinh (

                ma_don_vi_tinh,
                ten_don_vi_tinh,
                ky_hieu,
                loai_don_vi,
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
                NOW(),
                NOW()

            )
            RETURNING id
        `;

        const values = [
            data.maDonViTinh,

            data.tenDonViTinh,

            data.kyHieu || null,

            data.loaiDonVi || null,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_don_vi_tinh
            SET

                ma_don_vi_tinh = $1,
                ten_don_vi_tinh = $2,
                ky_hieu = $3,
                loai_don_vi = $4,
                active = $5,
                updated_at = NOW()

            WHERE id = $6

            RETURNING id
        `;

        const values = [data.maDonViTinh, data.tenDonViTinh, data.kyHieu, data.loaiDonVi, data.active, id];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new DonViTinhRepository();

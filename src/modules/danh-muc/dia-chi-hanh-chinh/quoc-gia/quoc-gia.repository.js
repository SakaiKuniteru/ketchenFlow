const pool = require('../../../../config/database');

class QuocGiaRepository {
    mapQuocGia(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maQuocGia: row.ma_quoc_gia,

            tenQuocGia: row.ten_quoc_gia,

            tenTiengAnh: row.ten_tieng_anh,

            maDienThoai: row.ma_dien_thoai,

            tenVietTat: row.ten_viet_tat,

            maIso2: row.ma_iso2,

            maIso3: row.ma_iso3,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                qg.id,
                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_tieng_anh,
                qg.ma_dien_thoai,
                qg.ten_viet_tat,
                qg.ma_iso2,
                qg.ma_iso3,

                qg.active,
                qg.created_at,
                qg.updated_at

            FROM dm_quoc_gia qg

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY qg.ma_quoc_gia ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapQuocGia(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE qg.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapQuocGia(result.rows[0]);
    }

    async getChiTietByMa(maQuocGia) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(qg.ma_quoc_gia)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuocGia]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapQuocGia(result.rows[0]);
    }

    async existsMaQuocGia(maQuocGia, excludeId = null) {
        const values = [maQuocGia];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE UPPER(ma_quoc_gia)
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

    async existsTenQuocGia(tenQuocGia, excludeId = null) {
        const values = [tenQuocGia];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE LOWER(TRIM(ten_quoc_gia))
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

    async existsMaDienThoai(maDienThoai, excludeId = null) {
        const values = [maDienThoai];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE LOWER(TRIM(ma_dien_thoai))
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

    async existsMaIso2(maIso2, excludeId = null) {
        const values = [maIso2];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE LOWER(TRIM(ma_iso2))
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

    async existsMaIso3(maIso3, excludeId = null) {
        const values = [maIso3];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_quoc_gia
                WHERE LOWER(TRIM(ma_iso3))
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
            INSERT INTO dm_quoc_gia (
                ma_quoc_gia,
                ten_quoc_gia,
                ten_tieng_anh,
                ma_dien_thoai,
                ten_viet_tat,
                ma_iso2,
                ma_iso3,

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
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maQuocGia,

            data.tenQuocGia,

            data.tenTiengAnh,

            data.maDienThoai,

            data.tenVietTat,

            data.maIso2,

            data.maIso3,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_quoc_gia
            SET
                ma_quoc_gia = $1,
                ten_quoc_gia = $2,
                ten_tieng_anh = $3,
                ma_dien_thoai = $4,
                ten_viet_tat = $5,
                ma_iso2 = $6,
                ma_iso3 = $7,
                active = $8,
                updated_at = NOW()
            WHERE id = $9
            RETURNING id
        `;

        const values = [
            data.maQuocGia,

            data.tenQuocGia,

            data.tenTiengAnh,

            data.maDienThoai,

            data.tenVietTat,

            data.maIso2,

            data.maIso3,

            data.active,

            id
        ];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new QuocGiaRepository();

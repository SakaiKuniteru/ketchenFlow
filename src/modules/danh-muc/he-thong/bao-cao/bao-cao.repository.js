const pool = require('../../../../config/database');

class BaoCaoRepository {
    mapBaoCao(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            maBaoCao: row.ma_bao_cao,

            tenBaoCao: row.ten_bao_cao,

            fileMau: row.file_mau,

            loaiXuatFile: row.loai_xuat_file,

            moTa: row.mo_ta,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                bc.id,
                bc.ma_bao_cao,
                bc.ten_bao_cao,
                bc.file_mau,
                bc.loai_xuat_file,
                bc.mo_ta,

                bc.active,
                bc.created_at,
                bc.updated_at

            FROM dm_bao_cao bc

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}

            ORDER BY
                bc.ma_bao_cao ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapBaoCao(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE bc.id = $1

            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapBaoCao(result.rows[0]);
    }

    async getChiTietByMa(maBaoCao) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(bc.ma_bao_cao)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maBaoCao]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapBaoCao(result.rows[0]);
    }

    async existsMaBaoCao(maBaoCao, excludeId = null) {
        const values = [maBaoCao];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_bao_cao
                WHERE UPPER(
                    TRIM(ma_bao_cao)
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

    async existsTenBaoCao(tenBaoCao, excludeId = null) {
        const values = [tenBaoCao];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_bao_cao
                WHERE LOWER(
                    TRIM(ten_bao_cao)
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

    async create(data) {
        const sql = `
            INSERT INTO dm_bao_cao (

                ma_bao_cao,
                ten_bao_cao,
                file_mau,
                loai_xuat_file,
                mo_ta,
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
            data.maBaoCao,

            data.tenBaoCao,

            data.fileMau || null,

            data.loaiXuatFile ?? null,

            data.moTa || null,

            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_bao_cao
            SET

                ma_bao_cao = $1,
                ten_bao_cao = $2,
                file_mau = $3,
                loai_xuat_file = $4,
                mo_ta = $5,
                active = $6,
                updated_at = NOW()

            WHERE id = $7

            RETURNING id
        `;

        const values = [
            data.maBaoCao,

            data.tenBaoCao,

            data.fileMau || null,

            data.loaiXuatFile ?? null,

            data.moTa || null,

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

module.exports = new BaoCaoRepository();

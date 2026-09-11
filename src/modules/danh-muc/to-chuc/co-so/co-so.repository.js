const pool = require('../../../../config/database');
const { active } = require('../../../../constants/enums');

class CoSoRepository {
    mapCoSo(row) {
        return {
            id: row.id,
            maCoSo: row.ma_co_so,
            tenCoSo: row.ten_co_so,
            diaChi: row.dia_chi,

            logo: row.logo,
            favicon: row.favicon,
            logoDoiTac: row.logo_doi_tac,

            quocGiaId: row.quoc_gia_id,
            quocGia: row.quoc_gia_id
                ? {
                      id: row.quoc_gia_id,
                      ma: row.ma_quoc_gia,
                      ten: row.ten_quoc_gia,
                      tenVietTat: row.quoc_gia_ten_viet_tat
                  }
                : null,

            tinhThanhId: row.tinh_thanh_id,
            tinhThanh: row.tinh_thanh_id
                ? {
                      id: row.tinh_thanh_id,
                      ma: row.ma_tinh_thanh,
                      ten: row.ten_tinh_thanh,
                      tenVietTat: row.tinh_thanh_ten_viet_tat
                  }
                : null,

            xaPhuongId: row.xa_phuong_id,
            xaPhuong: row.xa_phuong_id
                ? {
                      id: row.xa_phuong_id,
                      ma: row.ma_xa_phuong,
                      ten: row.ten_xa_phuong,
                      tenVietTat: row.xa_phuong_ten_viet_tat
                  }
                : null,

            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                cs.id,
                cs.ma_co_so,
                cs.ten_co_so,
                cs.dia_chi,
                cs.logo,
                cs.favicon,
                cs.logo_doi_tac,
                cs.active,
                cs.created_at,
                cs.updated_at,
                qg.id AS quoc_gia_id,
                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_viet_tat AS quoc_gia_ten_viet_tat,
                tt.id AS tinh_thanh_id,
                tt.ma_tinh_thanh,
                tt.ten_tinh_thanh,
                tt.ten_viet_tat AS tinh_thanh_ten_viet_tat,
                xp.id AS xa_phuong_id,
                xp.ma_xa_phuong,
                xp.ten_xa_phuong,
                xp.ten_viet_tat AS xa_phuong_ten_viet_tat
            FROM dm_co_so cs
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
            ORDER BY cs.ma_co_so ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapCoSo(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE cs.id = $1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapCoSo(result.rows[0]);
    }

    async existsMaCoSo(maCoSo, excludeId = null) {
        let sql = `
            SELECT id
            FROM dm_co_so
            WHERE LOWER(ma_co_so) = LOWER($1)
        `;

        const params = [maCoSo];

        if (excludeId) {
            sql += ` AND id <> $2`;
            params.push(excludeId);
        }

        const result = await pool.query(sql, params);

        return result.rows.length > 0;
    }

    async existsTenCoSo(tenCoSo, excludeId = null) {
        let sql = `
            SELECT id
            FROM dm_co_so
            WHERE LOWER(ten_co_so) = LOWER($1)
        `;

        const params = [tenCoSo];

        if (excludeId) {
            sql += ` AND id <> $2`;
            params.push(excludeId);
        }

        const result = await pool.query(sql, params);

        return result.rows.length > 0;
    }

    async existsQuocGia(id) {
        const sql = `
            SELECT id
            FROM dm_quoc_gia
            WHERE id = $1
            AND active = true
        `;

        const result = await pool.query(sql, [id]);

        return result.rows.length > 0;
    }

    async existsTinhThanh(tinhThanhId, quocGiaId) {
        const sql = `
            SELECT id
            FROM dm_tinh_thanh
            WHERE id = $1
            AND quoc_gia_id = $2
            AND active = true
        `;

        const result = await pool.query(sql, [tinhThanhId, quocGiaId]);

        return result.rows.length > 0;
    }

    async existsXaPhuong(xaPhuongId, tinhThanhId) {
        const sql = `
            SELECT id
            FROM dm_xa_phuong
            WHERE id = $1
            AND tinh_thanh_id = $2
            AND active = true
        `;

        const result = await pool.query(sql, [xaPhuongId, tinhThanhId]);

        return result.rows.length > 0;
    }

    async getQuocGiaByMa(maQuocGia) {
        const sql = `
            SELECT
                id,
                ma_quoc_gia
            FROM dm_quoc_gia
            WHERE LOWER(ma_quoc_gia) = LOWER($1)
            AND active = true
            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuocGia]);

        return result.rows[0] || null;
    }

    async getTinhThanhByMa(maTinhThanh, quocGiaId) {
        const sql = `
            SELECT
                id,
                ma_tinh_thanh,
                quoc_gia_id
            FROM dm_tinh_thanh
            WHERE LOWER(ma_tinh_thanh) = LOWER($1)
            AND quoc_gia_id = $2
            AND active = true
            LIMIT 1
        `;

        const result = await pool.query(sql, [maTinhThanh, quocGiaId]);

        return result.rows[0] || null;
    }

    async getXaPhuongByMa(maXaPhuong, tinhThanhId) {
        const sql = `
            SELECT
                id,
                ma_xa_phuong,
                tinh_thanh_id
            FROM dm_xa_phuong
            WHERE LOWER(ma_xa_phuong) = LOWER($1)
            AND tinh_thanh_id = $2
            AND active = true
            LIMIT 1
        `;

        const result = await pool.query(sql, [maXaPhuong, tinhThanhId]);

        return result.rows[0] || null;
    }

    async getChiTietByMa(maCoSo) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(
                TRIM(cs.ma_co_so)
            ) = UPPER(
                TRIM($1)
            )
            LIMIT 1
        `;

        const result = await pool.query(sql, [maCoSo]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapCoSo(result.rows[0]);
    }

    async create(data) {
        const { maCoSo, tenCoSo, diaChi, logo, favicon, logoDoiTac, quocGiaId, tinhThanhId, xaPhuongId } = data;

        const sql = `
            INSERT INTO dm_co_so (
                ma_co_so,
                ten_co_so,
                dia_chi,
                logo,
                favicon,
                logo_doi_tac,
                quoc_gia_id,
                tinh_thanh_id,
                xa_phuong_id,
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
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            RETURNING id
        `;

        const values = [
            maCoSo,
            tenCoSo,
            diaChi || null,
            logo || null,
            favicon || null,
            logoDoiTac || null,
            quocGiaId,
            tinhThanhId,
            xaPhuongId
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const { maCoSo, tenCoSo, diaChi, logo, favicon, logoDoiTac, quocGiaId, tinhThanhId, xaPhuongId, active } = data;

        const sql = `
            UPDATE dm_co_so
            SET
                ma_co_so = $1,
                ten_co_so = $2,
                dia_chi = $3,
                logo = $4,
                favicon = $5,
                logo_doi_tac = $6,
                quoc_gia_id = $7,
                tinh_thanh_id = $8,
                xa_phuong_id = $9,
                active = $10,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING id
        `;

        const values = [
            maCoSo,
            tenCoSo,
            diaChi,
            logo,
            favicon,
            logoDoiTac,
            quocGiaId,
            tinhThanhId,
            xaPhuongId,
            active,
            id
        ];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(id);
    }
}

module.exports = new CoSoRepository();

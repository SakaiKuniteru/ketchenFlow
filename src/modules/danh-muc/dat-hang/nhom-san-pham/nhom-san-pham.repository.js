"use strict";

const pool = require("../../../../config/database");

class NhomSanPhamRepository {
    map(row) {
        if (!row) return null;
        return {
            id: row.id,
            maNhomSanPham: row.ma_nhom_san_pham,
            tenNhomSanPham: row.ten_nhom_san_pham,
            loaiSanPham: row.loai_san_pham,
            moTa: row.mo_ta,
            thuTuHienThi: row.thu_tu_hien_thi,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async getTongHop(query = {}) {
        const values = [];
        const conditions = [];
        if (query.keyword) {
            values.push(`%${String(query.keyword).trim()}%`);
            conditions.push(`(nsp.ma_nhom_san_pham ILIKE $${values.length} OR nsp.ten_nhom_san_pham ILIKE $${values.length})`);
        }
        if (query.loaiSanPham !== undefined && query.loaiSanPham !== "") {
            values.push(Number(query.loaiSanPham));
            conditions.push(`nsp.loai_san_pham = $${values.length}`);
        }
        if (query.active !== undefined && query.active !== "") {
            values.push(String(query.active) === "true");
            conditions.push(`nsp.active = $${values.length}`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const result = await pool.query(`
            SELECT nsp.*
            FROM dm_nhom_san_pham nsp
            ${where}
            ORDER BY nsp.thu_tu_hien_thi, nsp.ma_nhom_san_pham
        `, values);
        return result.rows.map(row => this.map(row));
    }

    async getChiTiet(id) {
        const result = await pool.query(
            "SELECT * FROM dm_nhom_san_pham WHERE id = $1 LIMIT 1",
            [id]
        );
        return this.map(result.rows[0]);
    }

    async getChiTietByMa(maNhomSanPham) {
        const result = await pool.query(
            "SELECT * FROM dm_nhom_san_pham WHERE LOWER(TRIM(ma_nhom_san_pham)) = LOWER(TRIM($1)) LIMIT 1",
            [maNhomSanPham]
        );
        return this.map(result.rows[0]);
    }

    async exists(field, value, excludeId = null) {
        const allowed = new Set(["ma_nhom_san_pham", "ten_nhom_san_pham"]);
        if (!allowed.has(field)) throw new Error("Trường kiểm tra không hợp lệ.");
        const values = [value];
        let exclude = "";
        if (excludeId) {
            values.push(excludeId);
            exclude = "AND id <> $2";
        }
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM dm_nhom_san_pham
                WHERE LOWER(TRIM(${field})) = LOWER(TRIM($1)) ${exclude}
            ) AS "exists"
        `, values);
        return result.rows[0].exists;
    }

    async create(data) {
        const result = await pool.query(`
            INSERT INTO dm_nhom_san_pham (
                ma_nhom_san_pham, ten_nhom_san_pham, loai_san_pham,
                mo_ta, thu_tu_hien_thi, active
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [data.maNhomSanPham, data.tenNhomSanPham, data.loaiSanPham,
            data.moTa, data.thuTuHienThi, data.active]);
        return this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const result = await pool.query(`
            UPDATE dm_nhom_san_pham SET
                ma_nhom_san_pham = $1, ten_nhom_san_pham = $2,
                loai_san_pham = $3, mo_ta = $4,
                thu_tu_hien_thi = $5, active = $6, updated_at = NOW()
            WHERE id = $7 RETURNING id
        `, [data.maNhomSanPham, data.tenNhomSanPham, data.loaiSanPham,
            data.moTa, data.thuTuHienThi, data.active, id]);
        return result.rows[0] ? this.getChiTiet(result.rows[0].id) : null;
    }
}

module.exports = new NhomSanPhamRepository();

"use strict";

const pool = require("../../../../config/database");

class DiaDiemNhanHangRepository {
    map(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maDiaDiem: row.ma_dia_diem,
            tenDiaDiem: row.ten_dia_diem,
            coSoId: row.co_so_id,
            maCoSo: row.ma_co_so,
            tenCoSo: row.ten_co_so,
            moTaDiaChi: row.mo_ta_dia_chi,
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
            conditions.push(`(dd.ma_dia_diem ILIKE $${values.length} OR dd.ten_dia_diem ILIKE $${values.length})`);
        }

        if (query.coSoId) {
            values.push(Number(query.coSoId));
            conditions.push(`dd.co_so_id = $${values.length}`);
        }

        if (
            query.active !== undefined &&
            query.active !== ""
        ) {
            values.push(String(query.active) === "true");
            conditions.push(`dd.active = $${values.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const result = await pool.query(
            `SELECT dd.*, cs.ma_co_so, cs.ten_co_so FROM dm_dia_diem_nhan_hang dd JOIN dm_co_so cs ON cs.id = dd.co_so_id ${where} ORDER BY cs.ten_co_so, dd.thu_tu_hien_thi, dd.ten_dia_diem`,
            values
        );

        return result.rows.map(row => this.map(row));
    }

    async getChiTiet(id) {
        const result = await pool.query(
            `SELECT dd.*, cs.ma_co_so, cs.ten_co_so FROM dm_dia_diem_nhan_hang dd JOIN dm_co_so cs ON cs.id = dd.co_so_id WHERE dd.id = $1 LIMIT 1`,
            [id]
        );

        return this.map(result.rows[0]);
    }

    async existsCode(
        coSoId,
        maDiaDiem,
        excludeId = null
    ) {
        const values = [coSoId, maDiaDiem];
        let exclude = "";

        if (excludeId) {
            values.push(excludeId);
            exclude = "AND id <> $3";
        }

        const result = await pool.query(
            `SELECT EXISTS (SELECT 1 FROM dm_dia_diem_nhan_hang WHERE co_so_id = $1 AND LOWER(TRIM(ma_dia_diem)) = LOWER(TRIM($2)) ${exclude}) AS "exists"`,
            values
        );

        return result.rows[0].exists;
    }

    async existsCoSo(id) {
        const r = await pool.query(
            "SELECT EXISTS (SELECT 1 FROM dm_co_so WHERE id=$1 AND active=TRUE) AS \"exists\"",
            [id]
        );

        return r.rows[0].exists;
    }

    async create(d) {
        const r = await pool.query(
            `INSERT INTO dm_dia_diem_nhan_hang (ma_dia_diem,ten_dia_diem,co_so_id,mo_ta_dia_chi,thu_tu_hien_thi,active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
            [
                d.maDiaDiem,
                d.tenDiaDiem,
                d.coSoId,
                d.moTaDiaChi,
                d.thuTuHienThi,
                d.active
            ]
        );

        return this.getChiTiet(r.rows[0].id);
    }

    async update(
        id,
        d
    ) {
        const r = await pool.query(
            `UPDATE dm_dia_diem_nhan_hang SET ma_dia_diem=$1,ten_dia_diem=$2,co_so_id=$3,mo_ta_dia_chi=$4,thu_tu_hien_thi=$5,active=$6,updated_at=NOW() WHERE id=$7 RETURNING id`,
            [
                d.maDiaDiem,
                d.tenDiaDiem,
                d.coSoId,
                d.moTaDiaChi,
                d.thuTuHienThi,
                d.active,
                id
            ]
        );

        return r.rows[0] ? this.getChiTiet(id) : null;
    }
}

module.exports = new DiaDiemNhanHangRepository();
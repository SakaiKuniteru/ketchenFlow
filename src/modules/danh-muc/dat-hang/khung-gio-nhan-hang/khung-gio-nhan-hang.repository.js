"use strict";

const pool = require("../../../../config/database");

class KhungGioNhanHangRepository {
    map(r) {
        if (!r) {
            return null;
        }

        return {
            id: r.id,
            maKhungGio: r.ma_khung_gio,
            tenKhungGio: r.ten_khung_gio,
            coSoId: r.co_so_id,
            maCoSo: r.ma_co_so,
            tenCoSo: r.ten_co_so,
            gioBatDau: r.gio_bat_dau,
            gioKetThuc: r.gio_ket_thuc,
            hanDatTruocPhut: r.han_dat_truoc_phut,
            soDonToiDa: r.so_don_toi_da,
            active: r.active,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        };
    }

    async getTongHop(q = {}) {
        const v = [];
        const c = [];

        if (q.keyword) {
            v.push(`%${String(q.keyword).trim()}%`);
            c.push(`(kg.ma_khung_gio ILIKE $${v.length} OR kg.ten_khung_gio ILIKE $${v.length})`);
        }

        if (q.coSoId) {
            v.push(Number(q.coSoId));
            c.push(`kg.co_so_id=$${v.length}`);
        }

        if (
            q.active !== undefined &&
            q.active !== ""
        ) {
            v.push(String(q.active) === "true");
            c.push(`kg.active=$${v.length}`);
        }

        const w = c.length ? `WHERE ${c.join(" AND ")}` : "";

        const r = await pool.query(
            `SELECT kg.*,cs.ma_co_so,cs.ten_co_so FROM dm_khung_gio_nhan_hang kg JOIN dm_co_so cs ON cs.id=kg.co_so_id ${w} ORDER BY cs.ten_co_so,kg.gio_bat_dau`,
            v
        );

        return r.rows.map(x => this.map(x));
    }

    async getChiTiet(id) {
        const r = await pool.query(
            `SELECT kg.*,cs.ma_co_so,cs.ten_co_so FROM dm_khung_gio_nhan_hang kg JOIN dm_co_so cs ON cs.id=kg.co_so_id WHERE kg.id=$1 LIMIT 1`,
            [id]
        );

        return this.map(r.rows[0]);
    }

    async existsCode(
        coSoId,
        code,
        excludeId = null
    ) {
        const v = [coSoId, code];
        let e = "";

        if (excludeId) {
            v.push(excludeId);
            e = "AND id<>$3";
        }

        const r = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM dm_khung_gio_nhan_hang WHERE co_so_id=$1 AND LOWER(TRIM(ma_khung_gio))=LOWER(TRIM($2)) ${e}) AS "exists"`,
            v
        );

        return r.rows[0].exists;
    }

    async existsCoSo(id) {
        const r = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM dm_co_so WHERE id=$1 AND active=TRUE) AS "exists"`,
            [id]
        );

        return r.rows[0].exists;
    }

    async create(d) {
        const r = await pool.query(
            `INSERT INTO dm_khung_gio_nhan_hang(ma_khung_gio,ten_khung_gio,co_so_id,gio_bat_dau,gio_ket_thuc,han_dat_truoc_phut,so_don_toi_da,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
            [
                d.maKhungGio,
                d.tenKhungGio,
                d.coSoId,
                d.gioBatDau,
                d.gioKetThuc,
                d.hanDatTruocPhut,
                d.soDonToiDa,
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
            `UPDATE dm_khung_gio_nhan_hang SET ma_khung_gio=$1,ten_khung_gio=$2,co_so_id=$3,gio_bat_dau=$4,gio_ket_thuc=$5,han_dat_truoc_phut=$6,so_don_toi_da=$7,active=$8,updated_at=NOW() WHERE id=$9 RETURNING id`,
            [
                d.maKhungGio,
                d.tenKhungGio,
                d.coSoId,
                d.gioBatDau,
                d.gioKetThuc,
                d.hanDatTruocPhut,
                d.soDonToiDa,
                d.active,
                id
            ]
        );

        return r.rows[0] ? this.getChiTiet(id) : null;
    }
}

module.exports = new KhungGioNhanHangRepository();
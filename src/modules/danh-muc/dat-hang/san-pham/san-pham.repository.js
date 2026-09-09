"use strict";

const pool = require("../../../../config/database");

class SanPhamRepository {
    map(r) {
        if (!r) {
            return null;
        }

        return {
            id: r.id,
            maSanPham: r.ma_san_pham,
            tenSanPham: r.ten_san_pham,
            nhomSanPhamId: r.nhom_san_pham_id,
            tenNhomSanPham: r.ten_nhom_san_pham,
            loaiSanPham: r.loai_san_pham,
            monAnId: r.mon_an_id,
            tenMonAn: r.ten_mon_an,
            donViTinhId: r.don_vi_tinh_id,
            tenDonViTinh: r.ten_don_vi_tinh,
            kyHieuDonVi: r.ky_hieu,
            giaBan: r.gia_ban,
            moTa: r.mo_ta,
            hinhAnh: r.hinh_anh,
            choPhepDat: r.cho_phep_dat,
            laSanPhamMoi: r.la_san_pham_moi,
            laSanPhamNoiBat: r.la_san_pham_noi_bat,
            soLuongToiThieu: r.so_luong_toi_thieu,
            soLuongToiDa: r.so_luong_toi_da,
            buocSoLuong: r.buoc_so_luong,
            thoiGianChuanBiPhut: r.thoi_gian_chuan_bi_phut,
            thuTuHienThi: r.thu_tu_hien_thi,
            active: r.active,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        };
    }

    base() {
        return `SELECT sp.*,nsp.ten_nhom_san_pham,nsp.loai_san_pham,ma.ten_mon_an,dvt.ten_don_vi_tinh,dvt.ky_hieu FROM dm_san_pham sp JOIN dm_nhom_san_pham nsp ON nsp.id=sp.nhom_san_pham_id LEFT JOIN dm_mon_an ma ON ma.id=sp.mon_an_id LEFT JOIN dm_don_vi_tinh dvt ON dvt.id=sp.don_vi_tinh_id`;
    }

    async getTongHop(q = {}) {
        const v = [];
        const c = [];

        if (q.keyword) {
            v.push(`%${String(q.keyword).trim()}%`);
            c.push(`(sp.ma_san_pham ILIKE $${v.length} OR sp.ten_san_pham ILIKE $${v.length})`);
        }

        for (const [k, col] of [
            ["nhomSanPhamId", "sp.nhom_san_pham_id"],
            ["loaiSanPham", "nsp.loai_san_pham"]
        ]) {
            if (q[k]) {
                v.push(Number(q[k]));
                c.push(`${col}=$${v.length}`);
            }
        }

        if (
            q.active !== undefined &&
            q.active !== ""
        ) {
            v.push(String(q.active) === "true");
            c.push(`sp.active=$${v.length}`);
        }

        const w = c.length ? `WHERE ${c.join(" AND ")}` : "";

        const r = await pool.query(
            `${this.base()} ${w} ORDER BY sp.thu_tu_hien_thi,sp.ma_san_pham`,
            v
        );

        return r.rows.map(x => this.map(x));
    }

    async getChiTiet(
        id,
        client = pool
    ) {
        const r = await client.query(
            `${this.base()} WHERE sp.id=$1 LIMIT 1`,
            [id]
        );

        const item = this.map(r.rows[0]);

        if (item) {
            const cs = await client.query(
                `SELECT csp.co_so_id AS "coSoId",cs.ma_co_so AS "maCoSo",cs.ten_co_so AS "tenCoSo",csp.gia_ban AS "giaBan",csp.so_luong_toi_da_moi_don AS "soLuongToiDaMoiDon",csp.cho_phep_dat AS "choPhepDat",csp.active FROM ct_san_pham_co_so csp JOIN dm_co_so cs ON cs.id=csp.co_so_id WHERE csp.san_pham_id=$1 ORDER BY cs.ten_co_so`,
                [id]
            );

            item.dsCoSo = cs.rows;
        }

        return item;
    }

    async getChiTietByMa(code) {
        const r = await pool.query(
            `${this.base()} WHERE LOWER(TRIM(sp.ma_san_pham))=LOWER(TRIM($1)) LIMIT 1`,
            [code]
        );
        return this.map(r.rows[0]);
    }

    async existsCode(
        code,
        id = null
    ) {
        const v = [code];
        let e = "";

        if (id) {
            v.push(id);
            e = "AND id<>$2";
        }

        const r = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM dm_san_pham WHERE LOWER(TRIM(ma_san_pham))=LOWER(TRIM($1)) ${e}) AS "exists"`,
            v
        );

        return r.rows[0].exists;
    }

    async referencesExist(d) {
        const r = await pool.query(
            `SELECT EXISTS(SELECT 1 FROM dm_nhom_san_pham WHERE id=$1 AND active=TRUE) AS nhom,($2::INTEGER IS NULL OR EXISTS(SELECT 1 FROM dm_mon_an WHERE id=$2 AND active=TRUE)) AS mon,($3::INTEGER IS NULL OR EXISTS(SELECT 1 FROM dm_don_vi_tinh WHERE id=$3 AND active=TRUE)) AS don_vi`,
            [
                d.nhomSanPhamId,
                d.monAnId,
                d.donViTinhId
            ]
        );

        return r.rows[0];
    }

    async save(
        data,
        id = null
    ) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let sid = id;

            if (id) {
                await client.query(
                    `UPDATE dm_san_pham SET ma_san_pham=$1,ten_san_pham=$2,nhom_san_pham_id=$3,mon_an_id=$4,don_vi_tinh_id=$5,gia_ban=$6,mo_ta=$7,hinh_anh=$8,cho_phep_dat=$9,la_san_pham_moi=$10,la_san_pham_noi_bat=$11,so_luong_toi_thieu=$12,so_luong_toi_da=$13,buoc_so_luong=$14,thoi_gian_chuan_bi_phut=$15,thu_tu_hien_thi=$16,active=$17,updated_at=NOW() WHERE id=$18`,
                    [
                        data.maSanPham,
                        data.tenSanPham,
                        data.nhomSanPhamId,
                        data.monAnId,
                        data.donViTinhId,
                        data.giaBan,
                        data.moTa,
                        data.hinhAnh,
                        data.choPhepDat,
                        data.laSanPhamMoi,
                        data.laSanPhamNoiBat,
                        data.soLuongToiThieu,
                        data.soLuongToiDa,
                        data.buocSoLuong,
                        data.thoiGianChuanBiPhut,
                        data.thuTuHienThi,
                        data.active,
                        id
                    ]
                );
            } else {
                const r = await client.query(
                    `INSERT INTO dm_san_pham(ma_san_pham,ten_san_pham,nhom_san_pham_id,mon_an_id,don_vi_tinh_id,gia_ban,mo_ta,hinh_anh,cho_phep_dat,la_san_pham_moi,la_san_pham_noi_bat,so_luong_toi_thieu,so_luong_toi_da,buoc_so_luong,thoi_gian_chuan_bi_phut,thu_tu_hien_thi,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
                    [
                        data.maSanPham,
                        data.tenSanPham,
                        data.nhomSanPhamId,
                        data.monAnId,
                        data.donViTinhId,
                        data.giaBan,
                        data.moTa,
                        data.hinhAnh,
                        data.choPhepDat,
                        data.laSanPhamMoi,
                        data.laSanPhamNoiBat,
                        data.soLuongToiThieu,
                        data.soLuongToiDa,
                        data.buocSoLuong,
                        data.thoiGianChuanBiPhut,
                        data.thuTuHienThi,
                        data.active
                    ]
                );

                sid = r.rows[0].id;
            }

            if (data.dsCoSo !== undefined) {
                await client.query(
                    "DELETE FROM ct_san_pham_co_so WHERE san_pham_id=$1",
                    [sid]
                );

                for (const x of data.dsCoSo) {
                    await client.query(
                        `INSERT INTO ct_san_pham_co_so(san_pham_id,co_so_id,gia_ban,so_luong_toi_da_moi_don,cho_phep_dat,active) VALUES($1,$2,$3,$4,$5,$6)`,
                        [
                            sid,
                            x.coSoId,
                            x.giaBan,
                            x.soLuongToiDaMoiDon,
                            x.choPhepDat,
                            x.active
                        ]
                    );
                }
            }

            await client.query("COMMIT");

            return this.getChiTiet(sid);
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new SanPhamRepository();

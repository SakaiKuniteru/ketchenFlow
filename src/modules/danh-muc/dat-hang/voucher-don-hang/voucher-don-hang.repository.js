"use strict";

const pool = require("../../../../config/database");

const relationMap = {
    nhomSanPhamIds: ["ct_voucher_don_hang_nhom_san_pham", "nhom_san_pham_id"],
    sanPhamIds: ["ct_voucher_don_hang_san_pham", "san_pham_id"],
    coSoIds: ["ct_voucher_don_hang_co_so", "co_so_id"],
    phongBanIds: ["ct_voucher_don_hang_phong_ban", "phong_ban_id"],
    chucVuIds: ["ct_voucher_don_hang_chuc_vu", "chuc_vu_id"],
    nhanVienIds: ["ct_voucher_don_hang_nhan_vien", "nhan_vien_id"]
};

class VoucherDonHangRepository {
    map(r) {
        if (!r) {
            return null;
        }

        return {
            id: r.id,
            maVoucher: r.ma_voucher,
            tenVoucher: r.ten_voucher,
            moTa: r.mo_ta,
            loaiGiam: r.loai_giam,
            giaTri: r.gia_tri,
            giamToiDa: r.giam_toi_da,
            giaTriDonHangToiThieu: r.gia_tri_don_hang_toi_thieu,
            soLuongPhatHanh: r.so_luong_phat_hanh,
            soLuotMoiNhanVien: r.so_luot_moi_nhan_vien,
            phamViApDung: r.pham_vi_ap_dung,
            choPhepDungChung: r.cho_phep_dung_chung,
            tuDongApDung: r.tu_dong_ap_dung,
            thoiGianBatDau: r.thoi_gian_bat_dau,
            thoiGianKetThuc: r.thoi_gian_ket_thuc,
            nguoiTaoId: r.nguoi_tao_id,
            tenNguoiTao: r.ten_nguoi_tao,
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
            c.push(`(v.ma_voucher ILIKE $${v.length} OR v.ten_voucher ILIKE $${v.length})`);
        }

        for (const [k, col] of [
            ["loaiGiam", "v.loai_giam"],
            ["phamViApDung", "v.pham_vi_ap_dung"]
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
            c.push(`v.active=$${v.length}`);
        }

        const w = c.length ? `WHERE ${c.join(" AND ")}` : "";

        const r = await pool.query(
            `SELECT v.*,nv.ho_ten AS ten_nguoi_tao FROM dm_voucher_don_hang v JOIN dm_nhan_vien nv ON nv.id=v.nguoi_tao_id ${w} ORDER BY v.created_at DESC`,
            v
        );

        return r.rows.map(x => this.map(x));
    }

    async getChiTiet(
        id,
        client = pool
    ) {
        const r = await client.query(
            `SELECT v.*,nv.ho_ten AS ten_nguoi_tao FROM dm_voucher_don_hang v JOIN dm_nhan_vien nv ON nv.id=v.nguoi_tao_id WHERE v.id=$1 LIMIT 1`,
            [id]
        );

        const item = this.map(r.rows[0]);

        if (!item) {
            return null;
        }

        for (const [key, [table, column]] of Object.entries(relationMap)) {
            const x = await client.query(
                `SELECT ${column} AS id FROM ${table} WHERE voucher_don_hang_id=$1 ORDER BY ${column}`,
                [id]
            );

            item[key] = x.rows.map(row => Number(row.id));
        }

        return item;
    }

    async getChiTietByMa(code) {
        const r = await pool.query(
            "SELECT id FROM dm_voucher_don_hang WHERE LOWER(TRIM(ma_voucher))=LOWER(TRIM($1)) LIMIT 1",
            [code]
        );
        return r.rows[0] ? this.getChiTiet(r.rows[0].id) : null;
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
            `SELECT EXISTS(SELECT 1 FROM dm_voucher_don_hang WHERE LOWER(TRIM(ma_voucher))=LOWER(TRIM($1)) ${e}) AS "exists"`,
            v
        );

        return r.rows[0].exists;
    }

    async save(
        data,
        id = null
    ) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let vid = id;

            const vals = [
                data.maVoucher,
                data.tenVoucher,
                data.moTa,
                data.loaiGiam,
                data.giaTri,
                data.giamToiDa,
                data.giaTriDonHangToiThieu,
                data.soLuongPhatHanh,
                data.soLuotMoiNhanVien,
                data.phamViApDung,
                data.choPhepDungChung,
                data.tuDongApDung,
                data.thoiGianBatDau,
                data.thoiGianKetThuc,
                data.active
            ];

            if (id) {
                await client.query(
                    `UPDATE dm_voucher_don_hang SET ma_voucher=$1,ten_voucher=$2,mo_ta=$3,loai_giam=$4,gia_tri=$5,giam_toi_da=$6,gia_tri_don_hang_toi_thieu=$7,so_luong_phat_hanh=$8,so_luot_moi_nhan_vien=$9,pham_vi_ap_dung=$10,cho_phep_dung_chung=$11,tu_dong_ap_dung=$12,thoi_gian_bat_dau=$13,thoi_gian_ket_thuc=$14,active=$15,updated_at=NOW() WHERE id=$16`,
                    [...vals, id]
                );
            } else {
                const r = await client.query(
                    `INSERT INTO dm_voucher_don_hang(ma_voucher,ten_voucher,mo_ta,loai_giam,gia_tri,giam_toi_da,gia_tri_don_hang_toi_thieu,so_luong_phat_hanh,so_luot_moi_nhan_vien,pham_vi_ap_dung,cho_phep_dung_chung,tu_dong_ap_dung,thoi_gian_bat_dau,thoi_gian_ket_thuc,active,nguoi_tao_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
                    [...vals, data.nguoiTaoId]
                );

                vid = r.rows[0].id;
            }

            for (const [key, [table, column]] of Object.entries(relationMap)) {
                if (data[key] === undefined) {
                    continue;
                }

                await client.query(
                    `DELETE FROM ${table} WHERE voucher_don_hang_id=$1`,
                    [vid]
                );

                for (const targetId of data[key]) {
                    await client.query(
                        `INSERT INTO ${table}(voucher_don_hang_id,${column}) VALUES($1,$2)`,
                        [vid, targetId]
                    );
                }
            }

            await client.query("COMMIT");

            return this.getChiTiet(vid);
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new VoucherDonHangRepository();

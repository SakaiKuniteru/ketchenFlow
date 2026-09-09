"use strict";

const pool = require("../../../../config/database");

class CatalogRepository {
    async getDanhSachSanPham(query) {
        const page = Number(query.page);
        const limit = Number(query.limit);
        const values = [query.coSoId];
        const conditions = [
            "sp.active = TRUE",
            "sp.cho_phep_dat = TRUE",
            "nsp.active = TRUE",
            "(csp.id IS NULL OR (csp.active = TRUE AND csp.cho_phep_dat = TRUE))"
        ];

        if (query.nhomSanPhamId) {
            values.push(query.nhomSanPhamId);
            conditions.push(`sp.nhom_san_pham_id = $${values.length}`);
        }

        if (query.loaiSanPham) {
            values.push(query.loaiSanPham);
            conditions.push(`nsp.loai_san_pham = $${values.length}`);
        }

        if (query.keyword) {
            values.push(`%${query.keyword}%`);
            conditions.push(`(
                sp.ma_san_pham ILIKE $${values.length}
                OR sp.ten_san_pham ILIKE $${values.length}
                OR sp.mo_ta ILIKE $${values.length}
            )`);
        }

        if (query.laSanPhamMoi !== undefined) {
            values.push(query.laSanPhamMoi);
            conditions.push(`sp.la_san_pham_moi = $${values.length}`);
        }

        const where = `WHERE ${conditions.join(" AND ")}`;
        const countResult = await pool.query(
            `
                SELECT COUNT(*)::INTEGER AS total
                FROM dm_san_pham sp
                JOIN dm_nhom_san_pham nsp
                    ON nsp.id = sp.nhom_san_pham_id
                LEFT JOIN ct_san_pham_co_so csp
                    ON csp.san_pham_id = sp.id
                    AND csp.co_so_id = $1
                ${where}
            `,
            values
        );

        values.push(limit);
        const limitIndex = values.length;
        values.push((page - 1) * limit);
        const offsetIndex = values.length;

        const result = await pool.query(
            `
                SELECT
                    sp.id,
                    sp.ma_san_pham AS "maSanPham",
                    sp.ten_san_pham AS "tenSanPham",
                    sp.nhom_san_pham_id AS "nhomSanPhamId",
                    nsp.ten_nhom_san_pham AS "tenNhomSanPham",
                    nsp.loai_san_pham AS "loaiSanPham",
                    sp.mon_an_id AS "monAnId",
                    ma.ten_mon_an AS "tenMonAn",
                    sp.don_vi_tinh_id AS "donViTinhId",
                    dvt.ten_don_vi_tinh AS "tenDonViTinh",
                    dvt.ky_hieu AS "kyHieuDonVi",
                    COALESCE(csp.gia_ban, sp.gia_ban) AS "giaBan",
                    sp.mo_ta AS "moTa",
                    sp.hinh_anh AS "hinhAnh",
                    sp.la_san_pham_moi AS "laSanPhamMoi",
                    sp.la_san_pham_noi_bat AS "laSanPhamNoiBat",
                    sp.so_luong_toi_thieu AS "soLuongToiThieu",
                    LEAST(sp.so_luong_toi_da, csp.so_luong_toi_da_moi_don) AS "soLuongToiDa",
                    sp.buoc_so_luong AS "buocSoLuong",
                    sp.thoi_gian_chuan_bi_phut AS "thoiGianChuanBiPhut"
                FROM dm_san_pham sp
                JOIN dm_nhom_san_pham nsp
                    ON nsp.id = sp.nhom_san_pham_id
                LEFT JOIN dm_mon_an ma
                    ON ma.id = sp.mon_an_id
                LEFT JOIN dm_don_vi_tinh dvt
                    ON dvt.id = sp.don_vi_tinh_id
                LEFT JOIN ct_san_pham_co_so csp
                    ON csp.san_pham_id = sp.id
                    AND csp.co_so_id = $1
                ${where}
                ORDER BY sp.thu_tu_hien_thi, sp.ten_san_pham
                LIMIT $${limitIndex}
                OFFSET $${offsetIndex}
            `,
            values
        );

        const total = countResult.rows[0].total;

        return {
            items: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSanPhamDatHang(coSoId, sanPhamIds, client = pool) {
        const result = await client.query(
            `
                SELECT
                    sp.id,
                    sp.ma_san_pham AS "maSanPham",
                    sp.ten_san_pham AS "tenSanPham",
                    sp.nhom_san_pham_id AS "nhomSanPhamId",
                    nsp.ten_nhom_san_pham AS "tenNhomSanPham",
                    nsp.loai_san_pham AS "loaiSanPham",
                    dvt.ten_don_vi_tinh AS "tenDonViTinh",
                    dvt.ky_hieu AS "kyHieuDonVi",
                    sp.hinh_anh AS "hinhAnh",
                    COALESCE(csp.gia_ban, sp.gia_ban) AS "giaBan",
                    sp.so_luong_toi_thieu AS "soLuongToiThieu",
                    LEAST(sp.so_luong_toi_da, csp.so_luong_toi_da_moi_don) AS "soLuongToiDa",
                    sp.buoc_so_luong AS "buocSoLuong"
                FROM dm_san_pham sp
                JOIN dm_nhom_san_pham nsp
                    ON nsp.id = sp.nhom_san_pham_id
                LEFT JOIN dm_don_vi_tinh dvt
                    ON dvt.id = sp.don_vi_tinh_id
                LEFT JOIN ct_san_pham_co_so csp
                    ON csp.san_pham_id = sp.id
                    AND csp.co_so_id = $1
                WHERE sp.id = ANY($2::BIGINT[])
                    AND sp.active = TRUE
                    AND sp.cho_phep_dat = TRUE
                    AND nsp.active = TRUE
                    AND (csp.id IS NULL OR (csp.active = TRUE AND csp.cho_phep_dat = TRUE))
            `,
            [coSoId, sanPhamIds]
        );

        return result.rows;
    }

    async getThongTinCheckout(coSoId, nhanVienId) {
        const [profile, locations, slots, groups] = await Promise.all([
            pool.query(
                `SELECT nv.id AS "nhanVienId", nv.ho_ten AS "hoTen", nv.so_dien_thoai AS "soDienThoai", nv.phong_ban_id AS "phongBanId", pb.ten_phong_ban AS "tenPhongBan", nv.co_so_id AS "coSoId", cs.ten_co_so AS "tenCoSo" FROM dm_nhan_vien nv LEFT JOIN dm_phong_ban pb ON pb.id = nv.phong_ban_id LEFT JOIN dm_co_so cs ON cs.id = nv.co_so_id WHERE nv.id = $1`,
                [nhanVienId]
            ),
            pool.query(
                `SELECT id, ma_dia_diem AS "maDiaDiem", ten_dia_diem AS "tenDiaDiem", mo_ta_dia_chi AS "moTaDiaChi" FROM dm_dia_diem_nhan_hang WHERE co_so_id = $1 AND active = TRUE ORDER BY thu_tu_hien_thi, ten_dia_diem`,
                [coSoId]
            ),
            pool.query(
                `SELECT id, ma_khung_gio AS "maKhungGio", ten_khung_gio AS "tenKhungGio", gio_bat_dau AS "gioBatDau", gio_ket_thuc AS "gioKetThuc", han_dat_truoc_phut AS "hanDatTruocPhut", so_don_toi_da AS "soDonToiDa" FROM dm_khung_gio_nhan_hang WHERE co_so_id = $1 AND active = TRUE ORDER BY gio_bat_dau`,
                [coSoId]
            ),
            pool.query(
                `SELECT id, ma_nhom_san_pham AS "maNhomSanPham", ten_nhom_san_pham AS "tenNhomSanPham", loai_san_pham AS "loaiSanPham" FROM dm_nhom_san_pham WHERE active = TRUE ORDER BY thu_tu_hien_thi, ten_nhom_san_pham`
            )
        ]);

        return {
            nguoiDat: profile.rows[0] || null,
            diaDiemNhanHang: locations.rows,
            khungGioNhanHang: slots.rows,
            nhomSanPham: groups.rows
        };
    }
}

module.exports = new CatalogRepository();

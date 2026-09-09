"use strict";

const pool = require("../../../../config/database");
const { TRANG_THAI_DON_HANG } = require("./don-hang.constants");

class DonHangRepository {
    async create(data, client) {
        const result = await client.query(
            `INSERT INTO nv_don_hang (ma_don_hang, nguoi_dat_id, phong_ban_id, co_so_id, dat_ho, nguoi_nhan_id, ten_nguoi_nhan, so_dien_thoai_nguoi_nhan, dia_diem_nhan_id, dia_chi_nhan_snapshot, khung_gio_nhan_id, thoi_gian_nhan_tu, thoi_gian_nhan_den, ghi_chu, tam_tinh, tong_mien_giam, phi_dich_vu, tong_thanh_toan, phuong_thuc_thanh_toan, trang_thai_thanh_toan, trang_thai) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id`,
            [data.maDonHang, data.nguoiDatId, data.phongBanId, data.coSoId, data.datHo, data.nguoiNhanId, data.tenNguoiNhan, data.soDienThoaiNguoiNhan, data.diaDiemNhanId, data.diaChiNhan, data.khungGioNhanId, data.thoiGianNhanTu, data.thoiGianNhanDen, data.ghiChu, data.tamTinh, data.tongMienGiam, data.phiDichVu, data.tongThanhToan, data.phuongThucThanhToan, data.trangThaiThanhToan, data.trangThai]
        );
        return result.rows[0].id;
    }

    async createItems(donHangId, items, client) {
        for (const item of items) {
            await client.query(
                `INSERT INTO ct_don_hang (don_hang_id, san_pham_id, ma_san_pham_snapshot, ten_san_pham_snapshot, ten_nhom_snapshot, don_vi_snapshot, hinh_anh_snapshot, so_luong, don_gia, tien_giam, thanh_tien, ghi_chu, trang_thai) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,0,$10,$11,$12)`,
                [donHangId, item.sanPhamId, item.maSanPham, item.tenSanPham, item.tenNhomSanPham, item.tenDonViTinh, item.hinhAnh, item.soLuong, item.donGia, item.thanhTien, item.ghiChu, item.trangThai]
            );
        }
    }

    createVoucher(donHangId, voucher, client) {
        return client.query(
            `INSERT INTO ct_don_hang_voucher (don_hang_id, voucher_don_hang_id, ma_voucher_snapshot, ten_voucher_snapshot, loai_giam_snapshot, gia_tri_snapshot, so_tien_du_dieu_kien, so_tien_giam) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [donHangId, voucher.id, voucher.maVoucher, voucher.tenVoucher, voucher.loaiGiam, voucher.giaTri, voucher.soTienDuDieuKien, voucher.soTienGiam]
        );
    }

    async getById(id, client = pool, lock = false) {
        const result = await client.query(
            `SELECT dh.*, nd.ho_ten AS ten_nguoi_dat, pb.ten_phong_ban, cs.ten_co_so, nx.ho_ten AS ten_nguoi_xu_ly, dd.ten_dia_diem, kg.ten_khung_gio FROM nv_don_hang dh JOIN dm_nhan_vien nd ON nd.id = dh.nguoi_dat_id LEFT JOIN dm_phong_ban pb ON pb.id = dh.phong_ban_id LEFT JOIN dm_co_so cs ON cs.id = dh.co_so_id LEFT JOIN dm_nhan_vien nx ON nx.id = dh.nguoi_xu_ly_id LEFT JOIN dm_dia_diem_nhan_hang dd ON dd.id = dh.dia_diem_nhan_id LEFT JOIN dm_khung_gio_nhan_hang kg ON kg.id = dh.khung_gio_nhan_id WHERE dh.id = $1 ${lock ? "FOR UPDATE OF dh" : ""}`,
            [id]
        );
        return result.rows[0] || null;
    }

    async getItems(id, client = pool) {
        const result = await client.query(`SELECT id, san_pham_id AS "sanPhamId", ma_san_pham_snapshot AS "maSanPham", ten_san_pham_snapshot AS "tenSanPham", ten_nhom_snapshot AS "tenNhomSanPham", don_vi_snapshot AS "donViTinh", hinh_anh_snapshot AS "hinhAnh", so_luong AS "soLuong", don_gia AS "donGia", tien_giam AS "tienGiam", thanh_tien AS "thanhTien", ghi_chu AS "ghiChu", trang_thai AS "trangThai" FROM ct_don_hang WHERE don_hang_id = $1 ORDER BY id`, [id]);
        return result.rows;
    }

    async getVouchers(id, client = pool) {
        const result = await client.query(`SELECT ma_voucher_snapshot AS "maVoucher", ten_voucher_snapshot AS "tenVoucher", loai_giam_snapshot AS "loaiGiam", gia_tri_snapshot AS "giaTri", so_tien_du_dieu_kien AS "soTienDuDieuKien", so_tien_giam AS "soTienGiam" FROM ct_don_hang_voucher WHERE don_hang_id = $1 ORDER BY thu_tu_ap_dung`, [id]);
        return result.rows;
    }

    async list(query, ownerId = null) {
        const values = [];
        const conditions = [];
        const add = (sql, value) => { values.push(value); conditions.push(sql.replace("?", `$${values.length}`)); };
        if (ownerId) add("dh.nguoi_dat_id = ?", ownerId);
        if (query.coSoId) add("dh.co_so_id = ?", query.coSoId);
        if (query.trangThai !== undefined) add("dh.trang_thai = ?", query.trangThai);
        if (query.trangThaiThanhToan !== undefined) add("dh.trang_thai_thanh_toan = ?", query.trangThaiThanhToan);
        if (query.keyword) { values.push(`%${query.keyword}%`); conditions.push(`(dh.ma_don_hang ILIKE $${values.length} OR nd.ho_ten ILIKE $${values.length} OR dh.ten_nguoi_nhan ILIKE $${values.length})`); }
        if (query.tuNgay) add("dh.created_at >= ?", query.tuNgay);
        if (query.denNgay) add("dh.created_at < (?::date + INTERVAL '1 day')", query.denNgay);
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const count = await pool.query(`SELECT COUNT(*)::INTEGER total FROM nv_don_hang dh JOIN dm_nhan_vien nd ON nd.id = dh.nguoi_dat_id ${where}`, values);
        values.push(query.limit, (query.page - 1) * query.limit);
        const result = await pool.query(`SELECT dh.id, dh.ma_don_hang AS "maDonHang", dh.created_at AS "thoiGianDat", nd.ho_ten AS "nguoiDat", dh.ten_nguoi_nhan AS "nguoiNhan", (SELECT COUNT(*) FROM ct_don_hang ct WHERE ct.don_hang_id = dh.id)::INTEGER AS "soLoai", (SELECT COALESCE(SUM(ct.so_luong),0) FROM ct_don_hang ct WHERE ct.don_hang_id = dh.id) AS "tongSoLuong", dh.tong_thanh_toan AS "tongThanhToan", dh.phuong_thuc_thanh_toan AS "phuongThucThanhToan", dh.trang_thai_thanh_toan AS "trangThaiThanhToan", dh.trang_thai AS "trangThai" FROM nv_don_hang dh JOIN dm_nhan_vien nd ON nd.id = dh.nguoi_dat_id ${where} ORDER BY dh.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
        const total = count.rows[0].total;
        return { items: result.rows, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
    }

    async getSummary(coSoId) {
        const result = await pool.query(
            `
                SELECT
                    COUNT(*) FILTER (WHERE trang_thai = $2)::INTEGER AS "choXacNhan",
                    COUNT(*) FILTER (WHERE trang_thai = $3)::INTEGER AS "dangChuanBi",
                    COUNT(*) FILTER (WHERE trang_thai IN ($4, $5))::INTEGER AS "sanSangVaDangGiao",
                    COUNT(*) FILTER (WHERE trang_thai IN ($6, $7))::INTEGER AS "hoanThanh"
                FROM nv_don_hang
                WHERE co_so_id = $1
            `,
            [
                coSoId,
                TRANG_THAI_DON_HANG.CHO_XAC_NHAN,
                TRANG_THAI_DON_HANG.DANG_CHUAN_BI,
                TRANG_THAI_DON_HANG.SAN_SANG_GIAO,
                TRANG_THAI_DON_HANG.DANG_GIAO,
                TRANG_THAI_DON_HANG.HOAN_THANH,
                TRANG_THAI_DON_HANG.DONG_DON
            ]
        );

        return result.rows[0];
    }

    updateStatus(id, currentVersion, data, client) {
        return client.query(`UPDATE nv_don_hang SET trang_thai = $2, nguoi_xu_ly_id = COALESCE($3, nguoi_xu_ly_id), thoi_gian_tiep_nhan = CASE WHEN $4 THEN NOW() ELSE thoi_gian_tiep_nhan END, nguoi_huy_id = CASE WHEN $5 THEN $3 ELSE nguoi_huy_id END, thoi_gian_huy = CASE WHEN $5 THEN NOW() ELSE thoi_gian_huy END, ly_do_huy = CASE WHEN $5 THEN $6 ELSE ly_do_huy END, version = version + 1, updated_at = NOW() WHERE id = $1 AND version = $7 RETURNING id`, [id, data.trangThai, data.nguoiThucHienId, data.tiepNhan, data.huy, data.lyDo || null, currentVersion]);
    }
}

module.exports = new DonHangRepository();

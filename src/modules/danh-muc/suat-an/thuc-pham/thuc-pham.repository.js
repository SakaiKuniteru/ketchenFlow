const pool = require('../../../../config/database');
const { loaiBaoQuan: dsLoaiBaoQuan } = require('../../../../constants/enums');

class ThucPhamRepository {
    mapThucPham(row) {
        if (!row) {
            return null;
        }

        const heSoQuyDoi = row.he_so_quy_doi !== null ? Number(row.he_so_quy_doi) : null;

        const loaiBaoQuan = dsLoaiBaoQuan.find((item) => Number(item.value) === Number(row.dieu_kien_bao_quan)) || null;

        return {
            id: row.id,
            maThucPham: row.ma_thuc_pham,
            tenThucPham: row.ten_thuc_pham,
            donViSoCapId: row.don_vi_so_cap_id,
            donViSoCap: row.don_vi_so_cap_id
                ? {
                      id: row.don_vi_so_cap_id,
                      ma: row.ma_don_vi_so_cap,
                      ten: row.ten_don_vi_so_cap,
                      kyHieu: row.ky_hieu_don_vi_so_cap,
                      loaiDonVi: row.loai_don_vi_so_cap
                  }
                : null,
            donViSuDungId: row.don_vi_su_dung_id,
            donViSuDung: row.don_vi_su_dung_id
                ? {
                      id: row.don_vi_su_dung_id,
                      ma: row.ma_don_vi_su_dung,
                      ten: row.ten_don_vi_su_dung,
                      kyHieu: row.ky_hieu_don_vi_su_dung,
                      loaiDonVi: row.loai_don_vi_su_dung
                  }
                : null,
            heSoQuyDoi: row.he_so_quy_doi !== null ? Number(row.he_so_quy_doi) : null,
            quyCach: row.quy_cach,
            giaNhap: row.gia_nhap !== null ? Number(row.gia_nhap) : null,
            tyLeHaoHutDuKien: row.ty_le_hao_hut_du_kien !== null ? Number(row.ty_le_hao_hut_du_kien) : 0,
            xuatXuId: row.xuat_xu_id,
            xuatXu: row.xuat_xu_id
                ? {
                      id: row.xuat_xu_id,
                      ma: row.ma_xuat_xu,
                      ten: row.ten_xuat_xu
                  }
                : null,
            dieuKienBaoQuan: row.dieu_kien_bao_quan !== null ? Number(row.dieu_kien_bao_quan) : null,
            tenDieuKienBaoQuan: loaiBaoQuan?.name || null,
            moTa: row.mo_ta,
            hinhAnh: row.hinh_anh,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                tp.id,
                tp.ma_thuc_pham,
                tp.ten_thuc_pham,
                tp.don_vi_so_cap_id,
                tp.don_vi_su_dung_id,
                tp.he_so_quy_doi,
                tp.quy_cach,
                tp.gia_nhap,
                tp.ty_le_hao_hut_du_kien,
                tp.xuat_xu_id,
                tp.dieu_kien_bao_quan,
                tp.mo_ta,
                tp.hinh_anh,
                tp.ghi_chu,
                tp.active,
                tp.created_at,
                tp.updated_at,
                qg.ma_quoc_gia AS ma_xuat_xu,
                qg.ten_quoc_gia AS ten_xuat_xu,
                dvsc.ma_don_vi_tinh AS ma_don_vi_so_cap,
                dvsc.ten_don_vi_tinh AS ten_don_vi_so_cap,
                dvsc.ky_hieu AS ky_hieu_don_vi_so_cap,
                dvsc.loai_don_vi AS loai_don_vi_so_cap,
                dvsd.ma_don_vi_tinh AS ma_don_vi_su_dung,
                dvsd.ten_don_vi_tinh AS ten_don_vi_su_dung,
                dvsd.ky_hieu AS ky_hieu_don_vi_su_dung,
                dvsd.loai_don_vi AS loai_don_vi_su_dung
            FROM dm_thuc_pham tp
            LEFT JOIN dm_don_vi_tinh dvsc ON dvsc.id = tp.don_vi_so_cap_id
            LEFT JOIN dm_don_vi_tinh dvsd ON dvsd.id = tp.don_vi_su_dung_id
            LEFT JOIN dm_quoc_gia qg ON qg.id = tp.xuat_xu_id
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY tp.ma_thuc_pham ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapThucPham(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE tp.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThucPham(result.rows[0]);
    }

    async getDonViTinh(id) {
        const sql = `
            SELECT
                id,
                ma_don_vi_tinh,
                ten_don_vi_tinh,
                ky_hieu,
                loai_don_vi,
                active
            FROM dm_don_vi_tinh
            WHERE id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            maDonViTinh: row.ma_don_vi_tinh,
            tenDonViTinh: row.ten_don_vi_tinh,
            kyHieu: row.ky_hieu,
            loaiDonVi: row.loai_don_vi,
            active: row.active
        };
    }

    async getDonViTinhByMa(maDonViTinh) {
        const sql = `
            SELECT
                id,
                ma_don_vi_tinh,
                ten_don_vi_tinh,
                ky_hieu,
                loai_don_vi,
                active
            FROM dm_don_vi_tinh
            WHERE UPPER(TRIM(ma_don_vi_tinh)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maDonViTinh]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            maDonViTinh: row.ma_don_vi_tinh,
            tenDonViTinh: row.ten_don_vi_tinh,
            kyHieu: row.ky_hieu,
            loaiDonVi: row.loai_don_vi,
            active: row.active
        };
    }

    async getQuocGia(id) {
        const sql = `
            SELECT
                id,
                ma_quoc_gia,
                ten_quoc_gia,
                active
            FROM dm_quoc_gia
            WHERE id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            ma: row.ma_quoc_gia,
            ten: row.ten_quoc_gia,
            active: row.active
        };
    }

    async getQuocGiaByMa(maQuocGia) {
        const sql = `
            SELECT
                id,
                ma_quoc_gia,
                ten_quoc_gia,
                active
            FROM dm_quoc_gia
            WHERE UPPER(TRIM(ma_quoc_gia)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuocGia]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            ma: row.ma_quoc_gia,
            ten: row.ten_quoc_gia,
            active: row.active
        };
    }

    async existsMaThucPham(maThucPham, excludeId = null) {
        const values = [maThucPham];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_thuc_pham
                WHERE UPPER(TRIM(ma_thuc_pham)) = UPPER(TRIM($1))
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

    async existsTenThucPham(tenThucPham, excludeId = null) {
        const values = [tenThucPham];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_thuc_pham
                WHERE LOWER(TRIM(ten_thuc_pham)) = LOWER(TRIM($1))
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

    async getChiTietByMa(maThucPham) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE UPPER(TRIM(tp.ma_thuc_pham)) = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await pool.query(sql, [maThucPham]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThucPham(result.rows[0]);
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_thuc_pham (
                ma_thuc_pham,
                ten_thuc_pham,
                don_vi_so_cap_id,
                don_vi_su_dung_id,
                he_so_quy_doi,
                quy_cach,
                gia_nhap,
                ty_le_hao_hut_du_kien,
                xuat_xu_id,
                dieu_kien_bao_quan,
                mo_ta,
                hinh_anh,
                ghi_chu,
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
                $10,
                $11,
                $12,
                $13,
                $14,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maThucPham,
            data.tenThucPham,
            data.donViSoCapId,
            data.donViSuDungId,
            data.heSoQuyDoi !== undefined ? data.heSoQuyDoi : 1,
            data.quyCach || null,
            data.giaNhap !== undefined ? data.giaNhap : null,
            data.tyLeHaoHutDuKien !== undefined ? data.tyLeHaoHutDuKien : 0,
            data.xuatXuId !== undefined ? data.xuatXuId : null,
            data.dieuKienBaoQuan !== undefined ? data.dieuKienBaoQuan : null,
            data.moTa || null,
            data.hinhAnh || null,
            data.ghiChu || null,
            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_thuc_pham
            SET
                ma_thuc_pham = $1,
                ten_thuc_pham = $2,
                don_vi_so_cap_id = $3,
                don_vi_su_dung_id = $4,
                he_so_quy_doi = $5,
                quy_cach = $6,
                gia_nhap = $7,
                ty_le_hao_hut_du_kien = $8,
                xuat_xu_id = $9,
                dieu_kien_bao_quan = $10,
                mo_ta = $11,
                hinh_anh = $12,
                ghi_chu = $13,
                active = $14,
                updated_at = NOW()
            WHERE id = $15
            RETURNING id
        `;

        const values = [
            data.maThucPham,
            data.tenThucPham,
            data.donViSoCapId,
            data.donViSuDungId,
            data.heSoQuyDoi,
            data.quyCach || null,
            data.giaNhap,
            data.tyLeHaoHutDuKien,
            data.xuatXuId !== undefined ? data.xuatXuId : null,
            data.dieuKienBaoQuan !== undefined ? data.dieuKienBaoQuan : null,
            data.moTa || null,
            data.hinhAnh || null,
            data.ghiChu || null,
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

module.exports = new ThucPhamRepository();

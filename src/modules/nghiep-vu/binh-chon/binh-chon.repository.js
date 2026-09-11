const pool = require('../../../config/database');

class BinhChonSuatAnRepository {
    mapDotBinhChon(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            thucDonNgayId: row.thuc_don_ngay_id,

            thucDonId: row.thuc_don_id,

            ngay: row.ngay,

            batDauBinhChon: row.bat_dau_binh_chon,

            hanBinhChon: row.han_binh_chon,

            choPhepThayDoi: row.cho_phep_thay_doi,

            trangThai: row.trang_thai,

            nguoiTaoId: row.nguoi_tao_id,

            nguoiGuiId: row.nguoi_gui_id,

            thoiGianGui: row.thoi_gian_gui,

            nguoiHuyId: row.nguoi_huy_id,

            thoiGianHuy: row.thoi_gian_huy,

            lyDoHuy: row.ly_do_huy,

            createdAt: row.created_at,

            updatedAt: row.updated_at,

            maThucDon: row.ma_thuc_don,

            tenThucDon: row.ten_thuc_don,

            coSoId: row.co_so_id,

            maCoSo: row.ma_co_so,

            tenCoSo: row.ten_co_so,

            nhaAnId: row.nha_an_id,

            maNhaAn: row.ma_nha_an,

            tenNhaAn: row.ten_nha_an,

            caAnId: row.ca_an_id,

            maCaAn: row.ma_ca_an,

            tenCaAn: row.ten_ca_an,

            thoiGianBatDauCa: row.thoi_gian_bat_dau_ca,

            thoiGianKetThucCa: row.thoi_gian_ket_thuc_ca,

            hanBinhChonToiDa: row.han_binh_chon_toi_da,

            nguoiTao: row.nguoi_tao_ho_ten
                ? {
                      id: row.nguoi_tao_id,

                      hoTen: row.nguoi_tao_ho_ten
                  }
                : null,

            nguoiGui: row.nguoi_gui_ho_ten
                ? {
                      id: row.nguoi_gui_id,

                      hoTen: row.nguoi_gui_ho_ten
                  }
                : null,

            nguoiHuy: row.nguoi_huy_ho_ten
                ? {
                      id: row.nguoi_huy_id,

                      hoTen: row.nguoi_huy_ho_ten
                  }
                : null,

            tongBinhChon: Number(row.tong_binh_chon || 0),

            coThamGia: Number(row.co_tham_gia || 0),

            khongThamGia: Number(row.khong_tham_gia || 0)
        };
    }

    mapBinhChon(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,

            dotBinhChonId: row.dot_binh_chon_id,

            taiKhoanId: row.tai_khoan_id,

            luaChon: row.lua_chon,

            thoiGianBinhChon: row.thoi_gian_binh_chon,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    async getTongHop(filters = {}) {
        const values = [];

        const conditions = [];

        if (filters.trangThai !== undefined) {
            values.push(filters.trangThai);

            conditions.push(`dbc.trang_thai = $${values.length}`);
        }

        if (filters.thucDonNgayId) {
            values.push(filters.thucDonNgayId);

            conditions.push(`dbc.thuc_don_ngay_id = $${values.length}`);
        }

        if (filters.thucDonId) {
            values.push(filters.thucDonId);

            conditions.push(`td.id = $${values.length}`);
        }

        if (filters.nhaAnId) {
            values.push(filters.nhaAnId);

            conditions.push(`td.nha_an_id = $${values.length}`);
        }

        if (filters.caAnId) {
            values.push(filters.caAnId);

            conditions.push(`td.ca_an_id = $${values.length}`);
        }

        if (filters.tuNgay) {
            values.push(filters.tuNgay);

            conditions.push(`tdn.ngay >= $${values.length}`);
        }

        if (filters.denNgay) {
            values.push(filters.denNgay);

            conditions.push(`tdn.ngay <= $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `

            SELECT

                dbc.id,

                dbc.thuc_don_ngay_id,

                dbc.bat_dau_binh_chon,

                dbc.han_binh_chon,

                dbc.cho_phep_thay_doi,

                dbc.trang_thai,

                dbc.nguoi_tao_id,

                dbc.nguoi_gui_id,

                dbc.thoi_gian_gui,

                dbc.nguoi_huy_id,

                dbc.thoi_gian_huy,

                dbc.ly_do_huy,

                dbc.created_at,

                dbc.updated_at,


                tdn.thuc_don_id,

                tdn.ngay,


                td.ma_thuc_don,

                td.ten_thuc_don,

                td.co_so_id,

                td.nha_an_id,

                td.ca_an_id,


                cs.ma_co_so,

                cs.ten_co_so,


                na.ma_nha_an,

                na.ten_nha_an,


                ca.ma_ca_an,

                ca.ten_ca_an,


                nv_tao.ho_ten
                    AS nguoi_tao_ho_ten,

                nv_gui.ho_ten
                    AS nguoi_gui_ho_ten,

                nv_huy.ho_ten
                    AS nguoi_huy_ho_ten,


                COUNT(
                    bc.id
                )
                    AS tong_binh_chon,

                COUNT(
                    bc.id
                ) FILTER (
                    WHERE bc.lua_chon = TRUE
                )
                    AS co_tham_gia,

                COUNT(
                    bc.id
                ) FILTER (
                    WHERE bc.lua_chon = FALSE
                )
                    AS khong_tham_gia


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   dbc.thuc_don_ngay_id


            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id


            LEFT JOIN dm_co_so cs
                ON cs.id =
                   td.co_so_id


            LEFT JOIN dm_nha_an na
                ON na.id =
                   td.nha_an_id


            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   td.ca_an_id


            LEFT JOIN dm_tai_khoan tk_tao
                ON tk_tao.id =
                   dbc.nguoi_tao_id


            LEFT JOIN dm_nhan_vien nv_tao
                ON nv_tao.id =
                   tk_tao.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_gui
                ON tk_gui.id =
                   dbc.nguoi_gui_id


            LEFT JOIN dm_nhan_vien nv_gui
                ON nv_gui.id =
                   tk_gui.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_huy
                ON tk_huy.id =
                   dbc.nguoi_huy_id


            LEFT JOIN dm_nhan_vien nv_huy
                ON nv_huy.id =
                   tk_huy.nhan_vien_id


            LEFT JOIN ct_binh_chon_suat_an bc
                ON bc.dot_binh_chon_id =
                   dbc.id


            ${whereClause}


            GROUP BY

                dbc.id,

                tdn.id,

                td.id,

                cs.id,

                na.id,

                ca.id,

                nv_tao.ho_ten,

                nv_gui.ho_ten,

                nv_huy.ho_ten


            ORDER BY
                tdn.ngay DESC,
                dbc.created_at DESC

        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapDotBinhChon(row));
    }

    async getChiTiet(id) {
        const sql = `

            SELECT

                dbc.*,


                tdn.thuc_don_id,

                tdn.ngay,


                td.ma_thuc_don,

                td.ten_thuc_don,

                td.co_so_id,

                td.nha_an_id,

                td.ca_an_id,


                cs.ma_co_so,

                cs.ten_co_so,


                na.ma_nha_an,

                na.ten_nha_an,


                ca.ma_ca_an,

                ca.ten_ca_an,

                ca.thoi_gian_bat_dau
                    AS thoi_gian_bat_dau_ca,

                ca.thoi_gian_ket_thuc
                    AS thoi_gian_ket_thuc_ca,

                (
                    (
                        tdn.ngay +
                        ca.thoi_gian_bat_dau
                    )
                    - INTERVAL '3 hours'
                    - INTERVAL '1 second'
                )
                    AS han_binh_chon_toi_da,


                nv_tao.ho_ten
                    AS nguoi_tao_ho_ten,

                nv_gui.ho_ten
                    AS nguoi_gui_ho_ten,

                nv_huy.ho_ten
                    AS nguoi_huy_ho_ten


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   dbc.thuc_don_ngay_id


            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id


            LEFT JOIN dm_co_so cs
                ON cs.id =
                   td.co_so_id


            LEFT JOIN dm_nha_an na
                ON na.id =
                   td.nha_an_id


            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   td.ca_an_id


            LEFT JOIN dm_tai_khoan tk_tao
                ON tk_tao.id =
                   dbc.nguoi_tao_id


            LEFT JOIN dm_nhan_vien nv_tao
                ON nv_tao.id =
                   tk_tao.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_gui
                ON tk_gui.id =
                   dbc.nguoi_gui_id


            LEFT JOIN dm_nhan_vien nv_gui
                ON nv_gui.id =
                   tk_gui.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_huy
                ON tk_huy.id =
                   dbc.nguoi_huy_id


            LEFT JOIN dm_nhan_vien nv_huy
                ON nv_huy.id =
                   tk_huy.nhan_vien_id


            WHERE dbc.id = $1

            LIMIT 1

        `;

        const result = await pool.query(sql, [id]);

        return this.mapDotBinhChon(result.rows[0]);
    }

    async getDanhSachMonAn(dotBinhChonId) {
        const sql = `

            SELECT

                nma.id
                    AS nhom_mon_an_id,

                nma.ma_nhom_mon_an,

                nma.ten_nhom_mon_an,

                tdnma.thu_tu_hien_thi
                    AS thu_tu_nhom,


                ma.id
                    AS mon_an_id,

                ma.ma_mon_an,

                ma.ten_mon_an,

                ma.hinh_anh,

                tdma.thu_tu_hien_thi
                    AS thu_tu_mon,

                tdma.dinh_luong,

                tdma.don_vi_tinh_id,

                dvt.ma_don_vi_tinh,

                dvt.ten_don_vi_tinh,

                dvt.ky_hieu


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_nhom_mon_an tdnma
                ON tdnma.thuc_don_ngay_id =
                   dbc.thuc_don_ngay_id

               AND tdnma.active = TRUE


            INNER JOIN dm_nhom_mon_an nma
                ON nma.id =
                   tdnma.nhom_mon_an_id


            LEFT JOIN ct_thuc_don_mon_an tdma
                ON tdma.thuc_don_nhom_mon_an_id =
                   tdnma.id

               AND tdma.active = TRUE


            LEFT JOIN dm_mon_an ma
                ON ma.id =
                   tdma.mon_an_id


            LEFT JOIN dm_don_vi_tinh dvt
                ON dvt.id =
                   tdma.don_vi_tinh_id


            WHERE dbc.id = $1


            ORDER BY

                tdnma.thu_tu_hien_thi ASC NULLS LAST,

                tdma.thu_tu_hien_thi ASC NULLS LAST,

                ma.ten_mon_an ASC

        `;

        const result = await pool.query(sql, [dotBinhChonId]);

        const nhomMap = new Map();

        result.rows.forEach((row) => {
            if (!nhomMap.has(row.nhom_mon_an_id)) {
                nhomMap.set(row.nhom_mon_an_id, {
                    id: row.nhom_mon_an_id,

                    maNhomMonAn: row.ma_nhom_mon_an,

                    tenNhomMonAn: row.ten_nhom_mon_an,

                    thuTuHienThi: row.thu_tu_nhom,

                    dsMonAn: []
                });
            }

            if (row.mon_an_id) {
                nhomMap.get(row.nhom_mon_an_id).dsMonAn.push({
                    id: row.mon_an_id,

                    maMonAn: row.ma_mon_an,

                    tenMonAn: row.ten_mon_an,

                    hinhAnh: row.hinh_anh,

                    thuTuHienThi: row.thu_tu_mon,

                    dinhLuong: row.dinh_luong,

                    donViTinhId: row.don_vi_tinh_id,

                    donViTinh: row.don_vi_tinh_id
                        ? {
                              id: row.don_vi_tinh_id,

                              maDonViTinh: row.ma_don_vi_tinh,

                              tenDonViTinh: row.ten_don_vi_tinh,

                              kyHieu: row.ky_hieu
                          }
                        : null
                });
            }
        });

        return Array.from(nhomMap.values());
    }

    async getThongKe(dotBinhChonId) {
        const sql = `

            SELECT

                COUNT(*)
                    AS tong_binh_chon,

                COUNT(*) FILTER (
                    WHERE lua_chon = TRUE
                )
                    AS co_tham_gia,

                COUNT(*) FILTER (
                    WHERE lua_chon = FALSE
                )
                    AS khong_tham_gia


            FROM ct_binh_chon_suat_an

            WHERE dot_binh_chon_id = $1

        `;

        const result = await pool.query(sql, [dotBinhChonId]);

        const row = result.rows[0];

        const tong = Number(row.tong_binh_chon || 0);

        const co = Number(row.co_tham_gia || 0);

        const khong = Number(row.khong_tham_gia || 0);

        return {
            tongBinhChon: tong,

            coThamGia: co,

            khongThamGia: khong,

            tyLeCoThamGia: tong > 0 ? Number(((co * 100) / tong).toFixed(2)) : 0,

            tyLeKhongThamGia: tong > 0 ? Number(((khong * 100) / tong).toFixed(2)) : 0
        };
    }

    async getNguoiBinhChon(dotBinhChonId, filters = {}) {
        const values = [dotBinhChonId];

        const conditions = ['bc.dot_binh_chon_id = $1'];

        if (filters.luaChon !== undefined) {
            values.push(filters.luaChon);

            conditions.push(`bc.lua_chon = $${values.length}`);
        }

        if (filters.tuKhoa) {
            values.push(`%${filters.tuKhoa}%`);

            conditions.push(
                `(
                    nv.ma_nhan_vien ILIKE $${values.length}
                    OR
                    nv.ho_ten ILIKE $${values.length}
                )`
            );
        }

        const sql = `

            SELECT

                bc.id,

                bc.dot_binh_chon_id,

                bc.tai_khoan_id,

                bc.lua_chon,

                bc.thoi_gian_binh_chon,

                tk.nhan_vien_id,

                nv.ma_nhan_vien,

                nv.ho_ten,

                nv.email,

                nv.so_dien_thoai


            FROM ct_binh_chon_suat_an bc


            INNER JOIN dm_tai_khoan tk
                ON tk.id =
                   bc.tai_khoan_id


            INNER JOIN dm_nhan_vien nv
                ON nv.id =
                   tk.nhan_vien_id


            WHERE
                ${conditions.join(' AND ')}


            ORDER BY

                bc.thoi_gian_binh_chon DESC,

                nv.ho_ten ASC

        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => ({
            id: row.id,

            dotBinhChonId: row.dot_binh_chon_id,

            taiKhoanId: row.tai_khoan_id,

            nhanVienId: row.nhan_vien_id,

            maNhanVien: row.ma_nhan_vien,

            hoTen: row.ho_ten,

            email: row.email,

            soDienThoai: row.so_dien_thoai,

            luaChon: row.lua_chon,

            thoiGianBinhChon: row.thoi_gian_binh_chon
        }));
    }

    async getHienTaiCuaToi(taiKhoanId) {
        const sql = `

            SELECT DISTINCT

                dbc.*,

                tdn.thuc_don_id,

                tdn.ngay,

                td.ma_thuc_don,

                td.ten_thuc_don,

                td.co_so_id,

                td.nha_an_id,

                td.ca_an_id,

                cs.ma_co_so,

                cs.ten_co_so,

                na.ma_nha_an,

                na.ten_nha_an,

                ca.ma_ca_an,

                ca.ten_ca_an


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   dbc.thuc_don_ngay_id


            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id

            INNER JOIN dm_tai_khoan tk
                ON tk.id = $1

            INNER JOIN dm_nhan_vien nv
                ON nv.id =
                tk.nhan_vien_id

            INNER JOIN dm_nha_an na
                ON na.id =
                td.nha_an_id

            AND na.co_so_id =
                nv.co_so_id

            LEFT JOIN dm_co_so cs
                ON cs.id =
                td.co_so_id

            LEFT JOIN dm_ca_an ca
                ON ca.id =
                td.ca_an_id

            WHERE dbc.trang_thai = 20

            AND dbc.bat_dau_binh_chon
                <= LOCALTIMESTAMP

            AND dbc.han_binh_chon
                >= LOCALTIMESTAMP

            AND tdn.active = TRUE

            AND td.active = TRUE

            AND tk.active = TRUE

            AND tk.bi_khoa = FALSE

            AND nv.active = TRUE

            AND na.active = TRUE


            ORDER BY

                dbc.han_binh_chon ASC

        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows.map((row) => this.mapDotBinhChon(row));
    }

    async getSapToiCuaToi(taiKhoanId) {
        const sql = `

            SELECT DISTINCT

                dbc.*,

                tdn.thuc_don_id,

                tdn.ngay,

                td.ma_thuc_don,

                td.ten_thuc_don,

                td.co_so_id,

                td.nha_an_id,

                td.ca_an_id,

                cs.ma_co_so,

                cs.ten_co_so,

                na.ma_nha_an,

                na.ten_nha_an,

                ca.ma_ca_an,

                ca.ten_ca_an


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   dbc.thuc_don_ngay_id


            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id

            INNER JOIN dm_tai_khoan tk
                ON tk.id = $1

            INNER JOIN dm_nhan_vien nv
                ON nv.id =
                tk.nhan_vien_id

            INNER JOIN dm_nha_an na
                ON na.id =
                td.nha_an_id

            AND na.co_so_id =
                nv.co_so_id

            LEFT JOIN dm_co_so cs
                ON cs.id =
                td.co_so_id
            
            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   td.ca_an_id


            WHERE dbc.trang_thai = 20

                AND dbc.bat_dau_binh_chon
                    > LOCALTIMESTAMP

                AND tdn.active = TRUE

                AND td.active = TRUE

                AND tk.active = TRUE
                AND tk.bi_khoa = FALSE
                AND nv.active = TRUE
                AND na.active = TRUE


            ORDER BY

                dbc.bat_dau_binh_chon ASC

        `;

        const result = await pool.query(sql, [taiKhoanId]);

        return result.rows.map((row) => this.mapDotBinhChon(row));
    }

    async getLuaChonCuaTaiKhoan(dotBinhChonId, taiKhoanId) {
        const sql = `

            SELECT *

            FROM ct_binh_chon_suat_an

            WHERE dot_binh_chon_id = $1

              AND tai_khoan_id = $2

            LIMIT 1

        `;

        const result = await pool.query(sql, [dotBinhChonId, taiKhoanId]);

        return this.mapBinhChon(result.rows[0]);
    }

    async getLichSuTong(filters = {}) {
        return await this.getLichSu(null, filters);
    }

    async getLichSuCuaToi(taiKhoanId, filters = {}) {
        const values = [taiKhoanId];

        const conditions = [
            'dbc.trang_thai = 20',
            'dbc.han_binh_chon < LOCALTIMESTAMP',
            'tdn.active = TRUE',
            'td.active = TRUE',
            'tk.active = TRUE',
            'tk.bi_khoa = FALSE',
            'nv.active = TRUE',
            'na.active = TRUE'
        ];

        if (filters.dotBinhChonId) {
            values.push(filters.dotBinhChonId);

            conditions.push(`dbc.id = $${values.length}`);
        }

        if (filters.luaChon !== undefined) {
            values.push(filters.luaChon);

            conditions.push(`bc.lua_chon = $${values.length}`);
        }

        if (filters.tuNgay) {
            values.push(filters.tuNgay);

            conditions.push(`tdn.ngay >= $${values.length}`);
        }

        if (filters.denNgay) {
            values.push(filters.denNgay);

            conditions.push(`tdn.ngay <= $${values.length}`);
        }

        const sql = `
            SELECT DISTINCT
                dbc.*,

                tdn.thuc_don_id,
                tdn.ngay,

                td.ma_thuc_don,
                td.ten_thuc_don,
                td.co_so_id,
                td.nha_an_id,
                td.ca_an_id,

                cs.ma_co_so,
                cs.ten_co_so,

                na.ma_nha_an,
                na.ten_nha_an,

                ca.ma_ca_an,
                ca.ten_ca_an,

                nv.ma_nhan_vien,
                nv.ho_ten,

                bc.lua_chon,
                bc.thoi_gian_binh_chon

            FROM nv_dot_binh_chon dbc

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                dbc.thuc_don_ngay_id

            INNER JOIN nv_thuc_don td
                ON td.id =
                tdn.thuc_don_id

            INNER JOIN dm_tai_khoan tk
                ON tk.id = $1

            INNER JOIN dm_nhan_vien nv
                ON nv.id =
                tk.nhan_vien_id

            INNER JOIN dm_nha_an na
                ON na.id =
                td.nha_an_id

            AND na.co_so_id =
                nv.co_so_id

            LEFT JOIN ct_binh_chon_suat_an bc
                ON bc.dot_binh_chon_id =
                dbc.id

            AND bc.tai_khoan_id = $1

            LEFT JOIN dm_co_so cs
                ON cs.id =
                td.co_so_id

            LEFT JOIN dm_ca_an ca
                ON ca.id =
                td.ca_an_id

            WHERE
                ${conditions.join(' AND ')}

            ORDER BY
                dbc.han_binh_chon DESC,
                tdn.ngay DESC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => {
            const dot = this.mapDotBinhChon(row);

            return {
                ...dot,

                dotBinhChonId: dot.id,

                maNhanVien: row.ma_nhan_vien,

                hoTen: row.ho_ten,

                luaChon: row.lua_chon,

                luaChonCuaToi: row.lua_chon,

                thoiGianBinhChon: row.thoi_gian_binh_chon
            };
        });
    }

    async getLichSu(taiKhoanId = null, filters = {}) {
        const values = [];

        const conditions = ['dbc.trang_thai = 20'];

        if (taiKhoanId) {
            values.push(taiKhoanId);

            conditions.push(`bc.tai_khoan_id = $${values.length}`);
        }

        if (Array.isArray(filters.taiKhoanIds) && filters.taiKhoanIds.length > 0) {
            const placeholders = filters.taiKhoanIds.map((id) => {
                values.push(id);

                return `$${values.length}`;
            });

            conditions.push(`bc.tai_khoan_id IN (${placeholders.join(', ')})`);
        }

        if (filters.dotBinhChonId) {
            values.push(filters.dotBinhChonId);

            conditions.push(`dbc.id = $${values.length}`);
        }

        if (filters.luaChon !== undefined) {
            values.push(filters.luaChon);

            conditions.push(`bc.lua_chon = $${values.length}`);
        }

        if (filters.tuNgay) {
            values.push(filters.tuNgay);

            conditions.push(`tdn.ngay >= $${values.length}`);
        }

        if (filters.denNgay) {
            values.push(filters.denNgay);

            conditions.push(`tdn.ngay <= $${values.length}`);
        }

        const sql = `
            SELECT
                bc.id,
                bc.dot_binh_chon_id,
                bc.tai_khoan_id,
                bc.lua_chon,
                bc.thoi_gian_binh_chon,

                tdn.id AS thuc_don_ngay_id,
                tdn.ngay,

                td.id AS thuc_don_id,
                td.ma_thuc_don,
                td.ten_thuc_don,
                td.nha_an_id,

                na.ten_nha_an,

                td.ca_an_id,
                ca.ten_ca_an,

                tk.nhan_vien_id,

                nv.ma_nhan_vien,
                nv.ho_ten,

                CASE
                    WHEN dbc.han_binh_chon >=
                        LOCALTIMESTAMP
                    THEN 'DANG_DIEN_RA'

                    ELSE 'DA_KET_THUC'

                END AS trang_thai_thoi_gian_value,

                CASE
                    WHEN dbc.han_binh_chon >=
                        LOCALTIMESTAMP
                    THEN 'Đang diễn ra'

                    ELSE 'Đã kết thúc'

                END AS trang_thai_thoi_gian_name

                FROM ct_binh_chon_suat_an bc

            INNER JOIN nv_dot_binh_chon dbc
                ON dbc.id =
                bc.dot_binh_chon_id

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                dbc.thuc_don_ngay_id

            INNER JOIN nv_thuc_don td
                ON td.id =
                tdn.thuc_don_id

            INNER JOIN dm_tai_khoan tk
                ON tk.id =
                bc.tai_khoan_id

            INNER JOIN dm_nhan_vien nv
                ON nv.id =
                tk.nhan_vien_id

            LEFT JOIN dm_nha_an na
                ON na.id =
                td.nha_an_id

            LEFT JOIN dm_ca_an ca
                ON ca.id =
                td.ca_an_id

            WHERE
                ${conditions.join(' AND ')}

            ORDER BY
                tdn.ngay DESC,
                bc.thoi_gian_binh_chon DESC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => ({
            id: row.id,

            dotBinhChonId: row.dot_binh_chon_id,

            taiKhoanId: row.tai_khoan_id,

            nhanVienId: row.nhan_vien_id,

            maNhanVien: row.ma_nhan_vien,

            hoTen: row.ho_ten,

            ngay: row.ngay,

            thucDonId: row.thuc_don_id,

            thucDonNgayId: row.thuc_don_ngay_id,

            maThucDon: row.ma_thuc_don,

            tenThucDon: row.ten_thuc_don,

            nhaAnId: row.nha_an_id,

            tenNhaAn: row.ten_nha_an,

            caAnId: row.ca_an_id,

            tenCaAn: row.ten_ca_an,

            trangThaiThoiGian: {
                value: row.trang_thai_thoi_gian_value,

                name: row.trang_thai_thoi_gian_name
            },

            luaChon: row.lua_chon,

            thoiGianBinhChon: row.thoi_gian_binh_chon
        }));
    }

    async getDanhSachThucDonNgayHopLe(dotBinhChonId = null) {
        const values = [];

        let excludeSql = '';

        if (dotBinhChonId) {
            values.push(dotBinhChonId);

            excludeSql = `

                AND NOT EXISTS (

                    SELECT 1

                    FROM nv_dot_binh_chon dbc

                    WHERE dbc.thuc_don_ngay_id =
                        tdn.id

                    AND dbc.trang_thai <> 30

                    AND dbc.id <> $${values.length}

                )

            `;
        } else {
            excludeSql = `

                AND NOT EXISTS (

                    SELECT 1

                    FROM nv_dot_binh_chon dbc

                    WHERE dbc.thuc_don_ngay_id =
                        tdn.id

                    AND dbc.trang_thai <> 30

                )

            `;
        }

        const result = await pool.query(
            `

                    SELECT

                        tdn.id,

                        tdn.thuc_don_id,

                        tdn.ngay,


                        td.ma_thuc_don,

                        td.ten_thuc_don,

                        td.co_so_id,

                        td.nha_an_id,

                        td.ca_an_id,


                        cs.ma_co_so,

                        cs.ten_co_so,


                        na.ma_nha_an,

                        na.ten_nha_an,

                        ca.ma_ca_an,
                        ca.ten_ca_an,

                        ca.thoi_gian_bat_dau
                            AS thoi_gian_bat_dau_ca,

                        ca.thoi_gian_ket_thuc
                            AS thoi_gian_ket_thuc_ca,

                        (
                            (
                                tdn.ngay +
                                ca.thoi_gian_bat_dau
                            )
                            - INTERVAL '3 hours'
                            - INTERVAL '1 second'
                        )
                            AS han_binh_chon_toi_da


                    FROM ct_thuc_don_ngay tdn


                    INNER JOIN nv_thuc_don td
                        ON td.id =
                        tdn.thuc_don_id


                    LEFT JOIN dm_co_so cs
                        ON cs.id =
                        td.co_so_id


                    LEFT JOIN dm_nha_an na
                        ON na.id =
                        td.nha_an_id


                    LEFT JOIN dm_ca_an ca
                        ON ca.id =
                        td.ca_an_id


                    WHERE tdn.active = TRUE

                    AND td.active = TRUE

                    AND td.trang_thai = 30

                    AND td.den_ngay >= CURRENT_DATE

                    AND tdn.ngay >= CURRENT_DATE

                    AND ca.thoi_gian_bat_dau IS NOT NULL

                    AND LOCALTIMESTAMP <=
                        (
                            (
                                tdn.ngay +
                                ca.thoi_gian_bat_dau
                            )
                            - INTERVAL '3 hours'
                            - INTERVAL '1 second'
                        )

                    ${excludeSql}


                    ORDER BY

                        tdn.ngay ASC,

                        td.ten_thuc_don ASC,

                        ca.ten_ca_an ASC

                `,
            values
        );

        return result.rows.map((row) => ({
            id: row.id,

            thucDonId: row.thuc_don_id,

            ngay: row.ngay,

            maThucDon: row.ma_thuc_don,

            tenThucDon: row.ten_thuc_don,

            coSoId: row.co_so_id,

            maCoSo: row.ma_co_so,

            tenCoSo: row.ten_co_so,

            nhaAnId: row.nha_an_id,

            maNhaAn: row.ma_nha_an,

            tenNhaAn: row.ten_nha_an,

            caAnId: row.ca_an_id,

            maCaAn: row.ma_ca_an,

            tenCaAn: row.ten_ca_an,

            thoiGianBatDauCa: row.thoi_gian_bat_dau_ca,

            thoiGianKetThucCa: row.thoi_gian_ket_thuc_ca,

            hanBinhChonToiDa: row.han_binh_chon_toi_da
        }));
    }

    async getThucDonNgayHopLe(thucDonNgayId) {
        const result = await pool.query(
            `
                    SELECT
                        tdn.id,
                        tdn.thuc_don_id,
                        tdn.ngay,

                        td.trang_thai,
                        td.tu_ngay,
                        td.den_ngay,
                        td.ca_an_id,

                        ca.thoi_gian_bat_dau,
                        ca.thoi_gian_ket_thuc,

                        (
                            (
                                tdn.ngay +
                                ca.thoi_gian_bat_dau
                            )
                            - INTERVAL '3 hours'
                            - INTERVAL '1 second'
                        )
                            AS han_binh_chon_toi_da

                    FROM ct_thuc_don_ngay tdn

                    INNER JOIN nv_thuc_don td
                        ON td.id =
                        tdn.thuc_don_id

                    INNER JOIN dm_ca_an ca
                        ON ca.id =
                        td.ca_an_id

                    WHERE tdn.id = $1

                    AND tdn.active = TRUE

                    AND td.active = TRUE

                    AND td.trang_thai = 30

                    AND td.den_ngay >= CURRENT_DATE

                    AND tdn.ngay >= CURRENT_DATE

                    AND ca.thoi_gian_bat_dau IS NOT NULL

                    AND LOCALTIMESTAMP <=
                        (
                            (
                                tdn.ngay +
                                ca.thoi_gian_bat_dau
                            )
                            - INTERVAL '3 hours'
                            - INTERVAL '1 second'
                        )

                    LIMIT 1
                `,
            [thucDonNgayId]
        );

        return result.rows[0] || null;
    }

    async getTaiKhoanNhanThongBao(dotBinhChonId) {
        const result = await pool.query(
            `
                    SELECT DISTINCT
                        tk.id

                    FROM nv_dot_binh_chon dbc

                    INNER JOIN ct_thuc_don_ngay tdn
                        ON tdn.id =
                        dbc.thuc_don_ngay_id

                    INNER JOIN nv_thuc_don td
                        ON td.id =
                        tdn.thuc_don_id

                    INNER JOIN dm_nha_an na
                        ON na.id =
                        td.nha_an_id

                    INNER JOIN dm_nhan_vien nv
                        ON nv.co_so_id =
                        na.co_so_id

                    INNER JOIN dm_tai_khoan tk
                        ON tk.nhan_vien_id =
                        nv.id

                    WHERE dbc.id = $1

                    AND na.active =
                        TRUE

                    AND nv.active =
                        TRUE

                    AND tk.active =
                        TRUE

                    AND tk.bi_khoa =
                        FALSE
                `,
            [dotBinhChonId]
        );

        return result.rows.map((row) => Number(row.id));
    }

    async existsMonAnTheoThucDonNgay(thucDonNgayId) {
        const result = await pool.query(
            `

                    SELECT 1

                    FROM ct_thuc_don_nhom_mon_an tdnma

                    INNER JOIN ct_thuc_don_mon_an tdma
                        ON tdma.thuc_don_nhom_mon_an_id =
                           tdnma.id

                       AND tdma.active = TRUE

                    INNER JOIN dm_mon_an ma
                        ON ma.id =
                           tdma.mon_an_id

                       AND ma.active = TRUE

                    WHERE tdnma.thuc_don_ngay_id = $1

                      AND tdnma.active = TRUE

                    LIMIT 1

                `,
            [thucDonNgayId]
        );

        return result.rowCount > 0;
    }

    async existsDotHieuLucTheoThucDonNgay(thucDonNgayId, excludeId = null) {
        const values = [thucDonNgayId];

        let excludeSql = '';

        if (excludeId) {
            values.push(excludeId);

            excludeSql = `AND id <> $${values.length}`;
        }

        const result = await pool.query(
            `

                    SELECT 1

                    FROM nv_dot_binh_chon

                    WHERE thuc_don_ngay_id = $1

                      AND trang_thai <> 30

                      ${excludeSql}

                    LIMIT 1

                `,
            values
        );

        return result.rowCount > 0;
    }

    async kiemTraDuocBinhChon(dotBinhChonId, taiKhoanId) {
        const result = await pool.query(
            `
                    SELECT 1

                    FROM nv_dot_binh_chon dbc

                    INNER JOIN ct_thuc_don_ngay tdn
                        ON tdn.id =
                        dbc.thuc_don_ngay_id

                    INNER JOIN nv_thuc_don td
                        ON td.id =
                        tdn.thuc_don_id

                    INNER JOIN dm_tai_khoan tk
                        ON tk.id = $2

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                        tk.nhan_vien_id

                    INNER JOIN dm_nha_an na
                        ON na.id =
                        td.nha_an_id

                    AND na.co_so_id =
                        nv.co_so_id

                    WHERE dbc.id = $1

                    AND tk.active = TRUE

                    AND tk.bi_khoa = FALSE

                    AND nv.active = TRUE

                    AND na.active = TRUE

                    LIMIT 1
                `,
            [dotBinhChonId, taiKhoanId]
        );

        return result.rowCount > 0;
    }

    async getHoTenTaiKhoan(taiKhoanId) {
        const result = await pool.query(
            `
                    SELECT
                        nv.ho_ten

                    FROM dm_tai_khoan tk

                    INNER JOIN dm_nhan_vien nv
                        ON nv.id =
                        tk.nhan_vien_id

                    WHERE tk.id = $1

                    LIMIT 1
                `,
            [taiKhoanId]
        );

        return result.rows[0]?.ho_ten || null;
    }

    async create(data) {
        const sql = `

            INSERT INTO nv_dot_binh_chon (

                thuc_don_ngay_id,

                bat_dau_binh_chon,

                han_binh_chon,

                cho_phep_thay_doi,

                trang_thai,

                nguoi_tao_id

            )

            VALUES (

                $1,
                $2,
                $3,
                $4,
                10,
                $5

            )

            RETURNING id

        `;

        const result = await pool.query(sql, [
            data.thucDonNgayId,
            data.batDauBinhChon,
            data.hanBinhChon,
            data.choPhepThayDoi,
            data.nguoiTaoId
        ]);

        return result.rows[0];
    }

    async update(id, data) {
        const sql = `

            UPDATE nv_dot_binh_chon

            SET

                thuc_don_ngay_id = $1,

                bat_dau_binh_chon = $2,

                han_binh_chon = $3,

                cho_phep_thay_doi = $4

            WHERE id = $5

            RETURNING id

        `;

        const result = await pool.query(sql, [
            data.thucDonNgayId,
            data.batDauBinhChon,
            data.hanBinhChon,
            data.choPhepThayDoi,
            id
        ]);

        return result.rows[0] || null;
    }

    async gui(id, nguoiGuiId) {
        const result = await pool.query(
            `
                    UPDATE nv_dot_binh_chon

                    SET
                        trang_thai = 20,

                        nguoi_gui_id = $1,

                        thoi_gian_gui =
                            LOCALTIMESTAMP,

                        nguoi_huy_id =
                            NULL,

                        thoi_gian_huy =
                            NULL,

                        ly_do_huy =
                            NULL,

                        updated_at =
                            LOCALTIMESTAMP

                    WHERE id = $2

                    AND trang_thai IN (
                        10,
                        30
                    )

                    RETURNING id
                `,
            [nguoiGuiId, id]
        );

        return result.rows[0] || null;
    }

    async moLai(id, hanBinhChon) {
        const result = await pool.query(
            `
                    UPDATE nv_dot_binh_chon

                    SET
                        han_binh_chon = $1,
                        updated_at = LOCALTIMESTAMP

                    WHERE id = $2

                    AND trang_thai = 20

                    AND han_binh_chon < LOCALTIMESTAMP

                    RETURNING id
                `,
            [hanBinhChon, id]
        );

        return result.rows[0] || null;
    }

    async huy(id, nguoiHuyId, lyDoHuy) {
        const result = await pool.query(
            `

                    UPDATE nv_dot_binh_chon

                    SET

                        trang_thai = 30,

                        nguoi_huy_id = $1,

                        thoi_gian_huy =
                            LOCALTIMESTAMP,

                        ly_do_huy = $2

                    WHERE id = $3

                    AND trang_thai = 20

                    RETURNING id

                `,
            [nguoiHuyId, lyDoHuy, id]
        );

        return result.rows[0] || null;
    }

    async remove(id) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            await client.query(
                `
                    DELETE FROM ct_binh_chon_suat_an
                    WHERE dot_binh_chon_id = $1
                `,
                [id]
            );

            const result = await client.query(
                `
                        DELETE FROM nv_dot_binh_chon

                        WHERE id = $1

                        AND trang_thai IN (
                            10,
                            30
                        )

                        RETURNING id
                    `,
                [id]
            );

            await client.query('COMMIT');

            return result.rows[0] || null;
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async upsertBinhChon(dotBinhChonId, taiKhoanId, luaChon) {
        const result = await pool.query(
            `

                    INSERT INTO ct_binh_chon_suat_an (

                        dot_binh_chon_id,

                        tai_khoan_id,

                        lua_chon,

                        thoi_gian_binh_chon

                    )

                    VALUES (
                        $1,
                        $2,
                        $3,
                        LOCALTIMESTAMP
                    )

                    ON CONFLICT (
                        dot_binh_chon_id,
                        tai_khoan_id
                    )

                    DO UPDATE SET

                        lua_chon =
                            EXCLUDED.lua_chon,

                        thoi_gian_binh_chon =
                            LOCALTIMESTAMP

                    RETURNING *

                `,
            [dotBinhChonId, taiKhoanId, luaChon]
        );

        return this.mapBinhChon(result.rows[0]);
    }
}

module.exports = new BinhChonSuatAnRepository();

const pool = require('../../../../config/database');

class NhanVienRepository {
    mapNhanVien(row) {
        return {
            id: row.id,
            maNhanVien: row.ma_nhan_vien,
            tenDangNhap: row.ten_dang_nhap,
            hoTen: row.ho_ten,
            ngaySinh: row.ngay_sinh,
            gioiTinh: row.gioi_tinh,
            soDienThoai: row.so_dien_thoai,
            email: row.email,
            anhDaiDien: row.anh_dai_dien,
            diaChi: row.nhan_vien_dia_chi,

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

            coSoId: row.co_so_id,
            coSo: row.co_so_id
                ? {
                      id: row.co_so_id,
                      ma: row.ma_co_so,
                      ten: row.ten_co_so,
                      diaChi: row.co_so_dia_chi
                  }
                : null,

            phongBanId: row.phong_ban_id,
            phongBan: row.phong_ban_id
                ? {
                      id: row.phong_ban_id,
                      ma: row.ma_phong_ban,
                      ten: row.ten_phong_ban
                  }
                : null,

            chucVuId: row.chuc_vu_id,
            chucVu: row.chuc_vu_id
                ? {
                      id: row.chuc_vu_id,
                      ma: row.ma_chuc_vu,
                      ten: row.ten_chuc_vu
                  }
                : null,

            ghiChu: row.ghi_chu,
            maThe: row.ma_the,
            maQr: row.ma_qr,
            maBarcode: row.ma_barcode,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT

                nv.id,
                nv.ma_nhan_vien,
                tk.ten_dang_nhap,
                nv.ho_ten,
                nv.ngay_sinh,
                nv.gioi_tinh,
                nv.so_dien_thoai,
                nv.email,
                nv.anh_dai_dien,
                nv.dia_chi
                    AS nhan_vien_dia_chi,
                nv.ghi_chu,
                nv.ma_the,
                nv.ma_qr,
                nv.ma_barcode,
                nv.active,
                nv.created_at,
                nv.updated_at,

                qg.id AS quoc_gia_id,
                qg.ma_quoc_gia,
                qg.ten_quoc_gia,
                qg.ten_viet_tat 
                    AS quoc_gia_ten_viet_tat,

                tt.id AS tinh_thanh_id,
                tt.ma_tinh_thanh,
                tt.ten_tinh_thanh,
                tt.ten_viet_tat 
                    AS tinh_thanh_ten_viet_tat,

                xp.id AS xa_phuong_id,
                xp.ma_xa_phuong,
                xp.ten_xa_phuong,
                xp.ten_viet_tat 
                    AS xa_phuong_ten_viet_tat,

                cs.id AS co_so_id,
                cs.ma_co_so,
                cs.ten_co_so,
                cs.dia_chi
                    AS co_so_dia_chi,

                pb.id AS phong_ban_id,
                pb.ma_phong_ban,
                pb.ten_phong_ban,

                cv.id AS chuc_vu_id,
                cv.ma_chuc_vu,
                cv.ten_chuc_vu

            FROM dm_nhan_vien nv

            LEFT JOIN dm_tai_khoan tk
                ON tk.nhan_vien_id = nv.id

            LEFT JOIN dm_quoc_gia qg
                ON qg.id = nv.quoc_gia_id

            LEFT JOIN dm_tinh_thanh tt
                ON tt.id = nv.tinh_thanh_id

            LEFT JOIN dm_xa_phuong xp
                ON xp.id = nv.xa_phuong_id

            LEFT JOIN dm_co_so cs
                ON cs.id = nv.co_so_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            LEFT JOIN dm_chuc_vu cv
                ON cv.id = nv.chuc_vu_id

        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY nv.ma_nhan_vien ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapNhanVien(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE nv.id = $1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhanVien(result.rows[0]);
    }

    async getChiTietByMa(maNhanVien) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE UPPER(
                TRIM(nv.ma_nhan_vien)
            ) = UPPER(
                TRIM($1)
            )

            LIMIT 1
        `;

        const result = await pool.query(sql, [maNhanVien]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapNhanVien(result.rows[0]);
    }

    async getQuocGiaByMa(maQuocGia) {
        const sql = `
            SELECT
                id,
                ma_quoc_gia
            FROM dm_quoc_gia
            WHERE LOWER(ma_quoc_gia) = LOWER($1)
            AND active = TRUE
            LIMIT 1
        `;

        const result = await pool.query(sql, [maQuocGia]);

        return result.rows[0] || null;
    }

    async getTinhThanhByMa(maTinhThanh, quocGiaId = null) {
        let sql = `
            SELECT
                id,
                ma_tinh_thanh,
                quoc_gia_id
            FROM dm_tinh_thanh
            WHERE LOWER(ma_tinh_thanh) = LOWER($1)
            AND active = TRUE
        `;

        const params = [maTinhThanh];

        if (quocGiaId) {
            sql += `
                AND quoc_gia_id = $2
            `;

            params.push(quocGiaId);
        }

        sql += ` LIMIT 1`;

        const result = await pool.query(sql, params);

        return result.rows[0] || null;
    }

    async getXaPhuongByMa(maXaPhuong, tinhThanhId = null) {
        let sql = `
            SELECT
                id,
                ma_xa_phuong,
                tinh_thanh_id
            FROM dm_xa_phuong
            WHERE LOWER(ma_xa_phuong) = LOWER($1)
            AND active = TRUE
        `;

        const params = [maXaPhuong];

        if (tinhThanhId) {
            sql += `
                AND tinh_thanh_id = $2
            `;

            params.push(tinhThanhId);
        }

        sql += ` LIMIT 1`;

        const result = await pool.query(sql, params);

        return result.rows[0] || null;
    }

    async getCoSoByMa(maCoSo) {
        const sql = `
            SELECT
                id,
                ma_co_so
            FROM dm_co_so
            WHERE LOWER(ma_co_so) = LOWER($1)
            AND active = TRUE
            LIMIT 1
        `;

        const result = await pool.query(sql, [maCoSo]);

        return result.rows[0] || null;
    }

    async getPhongBanByMa(maPhongBan, coSoId = null) {
        let sql = `
            SELECT
                id,
                ma_phong_ban,
                co_so_id
            FROM dm_phong_ban
            WHERE LOWER(ma_phong_ban) = LOWER($1)
            AND active = TRUE
        `;

        const params = [maPhongBan];

        if (coSoId) {
            sql += `
                AND co_so_id = $2
            `;

            params.push(coSoId);
        }

        sql += ` LIMIT 1`;

        const result = await pool.query(sql, params);

        return result.rows[0] || null;
    }

    async getChucVuByMa(maChucVu) {
        const sql = `
            SELECT
                id,
                ma_chuc_vu
            FROM dm_chuc_vu
            WHERE LOWER(ma_chuc_vu) = LOWER($1)
            AND active = TRUE
            LIMIT 1
        `;

        const result = await pool.query(sql, [maChucVu]);

        return result.rows[0] || null;
    }

    async existsQuocGia(id) {
        const sql = `
            SELECT id
            FROM dm_quoc_gia
            WHERE id = $1
            AND active = TRUE
        `;

        const result = await pool.query(sql, [id]);

        return result.rowCount > 0;
    }

    async existsTinhThanh(tinhThanhId, quocGiaId = null) {
        let sql = `
            SELECT id
            FROM dm_tinh_thanh
            WHERE id = $1
            AND active = TRUE
        `;

        const params = [tinhThanhId];

        if (quocGiaId) {
            sql += `
                AND quoc_gia_id = $2
            `;

            params.push(quocGiaId);
        }

        const result = await pool.query(sql, params);

        return result.rowCount > 0;
    }

    async existsXaPhuong(xaPhuongId, tinhThanhId = null) {
        let sql = `
            SELECT id
            FROM dm_xa_phuong
            WHERE id = $1
            AND active = TRUE
        `;

        const params = [xaPhuongId];

        if (tinhThanhId) {
            sql += `
                AND tinh_thanh_id = $2
            `;

            params.push(tinhThanhId);
        }

        const result = await pool.query(sql, params);

        return result.rowCount > 0;
    }

    async existsCoSo(id) {
        const sql = `
            SELECT id
            FROM dm_co_so
            WHERE id = $1
            AND active = TRUE
        `;

        const result = await pool.query(sql, [id]);

        return result.rowCount > 0;
    }

    async existsPhongBan(phongBanId) {
        const sql = `
            SELECT id
            FROM dm_phong_ban
            WHERE id = $1
            AND active = TRUE
        `;

        const result = await pool.query(sql, [phongBanId]);

        return result.rowCount > 0;
    }

    async existsChucVu(id) {
        const sql = `
            SELECT id
            FROM dm_chuc_vu
            WHERE id = $1
            AND active = TRUE
        `;

        const result = await pool.query(sql, [id]);

        return result.rowCount > 0;
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_nhan_vien (

                ma_nhan_vien,

                ho_ten,

                ngay_sinh,

                gioi_tinh,

                so_dien_thoai,

                email,

                anh_dai_dien,

                dia_chi,

                ghi_chu,

                ma_the,

                ma_qr,

                ma_barcode,

                quoc_gia_id,

                tinh_thanh_id,

                xa_phuong_id,

                phong_ban_id,

                chuc_vu_id,

                co_so_id,

                active,

                created_at,

                updated_at

            )

            VALUES (

                $1,$2,$3,$4,$5,

                $6,$7,$8,$9,$10,

                $11,$12,$13,$14,$15,

                $16,$17,$18,

                TRUE,

                NOW(),

                NOW()

            )

            RETURNING id
        `;

        const result = await pool.query(sql, [
            data.maNhanVien,
            data.hoTen,
            data.ngaySinh,
            data.gioiTinh,
            data.soDienThoai,
            data.email,
            data.anhDaiDien,
            data.diaChi,
            data.ghiChu,
            data.maThe,
            data.maQr,
            data.maBarcode,
            data.quocGiaId,
            data.tinhThanhId,
            data.xaPhuongId,
            data.phongBanId,
            data.chucVuId,
            data.coSoId
        ]);

        return result.rows[0];
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_nhan_vien
            SET
                ma_nhan_vien = $1,
                ho_ten = $2,
                ngay_sinh = $3,
                gioi_tinh = $4,
                so_dien_thoai = $5,
                email = $6,
                anh_dai_dien = $7,
                dia_chi = $8,
                ghi_chu = $9,
                ma_the = $10,
                ma_qr = $11,
                ma_barcode = $12,
                quoc_gia_id = $13,
                tinh_thanh_id = $14,
                xa_phuong_id = $15,
                phong_ban_id = $16,
                chuc_vu_id = $17,
                co_so_id = $18,
                active = $19,
                updated_at = NOW()
            WHERE id = $20
            RETURNING id
        `;

        const values = [
            data.maNhanVien,
            data.hoTen,
            data.ngaySinh,
            data.gioiTinh,
            data.soDienThoai,
            data.email,
            data.anhDaiDien,
            data.diaChi,
            data.ghiChu,
            data.maThe,
            data.maQr,
            data.maBarcode,
            data.quocGiaId,
            data.tinhThanhId,
            data.xaPhuongId,
            data.phongBanId,
            data.chucVuId,
            data.coSoId,
            data.active,
            id
        ];

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }

    async existsMaNhanVien(maNhanVien, id = 0) {
        const sql = `
            SELECT id
            FROM dm_nhan_vien
            WHERE ma_nhan_vien = $1
            AND id <> $2
        `;

        const result = await pool.query(sql, [maNhanVien, id]);

        return result.rowCount > 0;
    }

    async existsPhone(phone, id) {
        const sql = `
            SELECT id

            FROM dm_nhan_vien

            WHERE

                so_dien_thoai = $1

                AND id <> $2
        `;

        const result = await pool.query(sql, [phone, id]);

        return result.rowCount > 0;
    }

    async existsEmail(email, id) {
        const sql = `
            SELECT id

            FROM dm_nhan_vien

            WHERE

                email = $1

                AND id <> $2
        `;

        const result = await pool.query(sql, [email, id]);

        return result.rowCount > 0;
    }
}

module.exports = new NhanVienRepository();

const pool = require('../../../../config/database');

class VoucherRepository {
    mapVoucher(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maVoucher: row.ma_voucher,
            tenVoucher: row.ten_voucher,
            loaiMienGiam: row.loai_mien_giam,
            giaTri: Number(row.gia_tri),
            soLuong: row.so_luong,
            daSuDung: row.da_su_dung,
            soLuongConLai: Number(row.so_luong_con_lai),
            thoiGianBatDau: row.thoi_gian_bat_dau,
            thoiGianKetThuc: row.thoi_gian_ket_thuc,
            moTa: row.mo_ta,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                v.id,
                v.ma_voucher,
                v.ten_voucher,
                v.loai_mien_giam,
                v.gia_tri,
                v.so_luong,
                v.da_su_dung,
                GREATEST(
                    v.so_luong - v.da_su_dung,
                    0
                ) AS so_luong_con_lai,
                v.thoi_gian_bat_dau,
                v.thoi_gian_ket_thuc,
                v.mo_ta,
                v.active,
                v.created_at,
                v.updated_at
            FROM dm_voucher v
        `;
    }

    async getTongHop() {
        const sql = `
            ${this.getBaseQuery()}
            ORDER BY v.ma_voucher ASC
        `;

        const result = await pool.query(sql);

        return result.rows.map((row) => this.mapVoucher(row));
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}
            WHERE v.id = $1
            LIMIT 1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapVoucher(result.rows[0]);
    }

    async existsMaVoucher(maVoucher, excludeId = null) {
        const values = [maVoucher];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_voucher
                WHERE UPPER(ma_voucher)
                    = UPPER($1)
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

    async existsTenVoucher(tenVoucher, excludeId = null) {
        const values = [tenVoucher];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_voucher
                WHERE LOWER(TRIM(ten_voucher))
                    = LOWER(TRIM($1))
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

    async suDungVoucher(id, client = pool) {
        const sql = `
            UPDATE dm_voucher
            SET
                da_su_dung =
                    da_su_dung + 1,
                updated_at =
                    NOW()
            WHERE
                id = $1
                AND active = TRUE
                AND da_su_dung <
                    so_luong
            RETURNING
                id,
                so_luong,
                da_su_dung
        `;

        const result = await client.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async hoanVoucher(id, client = pool) {
        const sql = `
            UPDATE dm_voucher
            SET
                da_su_dung =
                    da_su_dung - 1,
                updated_at =
                    NOW()
            WHERE
                id = $1
                AND da_su_dung > 0
            RETURNING
                id,
                so_luong,
                da_su_dung
        `;

        const result = await client.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_voucher (
                ma_voucher,
                ten_voucher,
                loai_mien_giam,
                gia_tri,
                so_luong,
                da_su_dung,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                mo_ta,
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
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maVoucher,
            data.tenVoucher,
            data.loaiMienGiam,
            data.giaTri,
            data.soLuong,
            data.daSuDung,
            data.thoiGianBatDau,
            data.thoiGianKetThuc,
            data.moTa || null,
            data.active !== undefined ? data.active : true
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_voucher
            SET
                ma_voucher = $1,
                ten_voucher = $2,
                loai_mien_giam = $3,
                gia_tri = $4,
                so_luong = $5,
                da_su_dung = $6,
                thoi_gian_bat_dau = $7,
                thoi_gian_ket_thuc = $8,
                mo_ta = $9,
                active = $10,
                updated_at = NOW()
            WHERE id = $11
            RETURNING id
        `;

        const values = [
            data.maVoucher,
            data.tenVoucher,
            data.loaiMienGiam,
            data.giaTri,
            data.soLuong,
            data.daSuDung,
            data.thoiGianBatDau,
            data.thoiGianKetThuc,
            data.moTa,
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

module.exports = new VoucherRepository();

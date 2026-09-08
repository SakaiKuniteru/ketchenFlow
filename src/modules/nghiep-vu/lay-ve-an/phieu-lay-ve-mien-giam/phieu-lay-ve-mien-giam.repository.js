const pool = require("../../../../config/database");

class PhieuLayVeMienGiamRepository {
    mapMienGiam(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            phieuLayVeId: row.phieu_lay_ve_id,
            chinhSachId: row.chinh_sach_id,
            maChinhSach: row.ma_chinh_sach,
            tenChinhSach: row.ten_chinh_sach,
            voucherId: row.voucher_id,
            maVoucher: row.ma_voucher,
            tenVoucher: row.ten_voucher,
            maMienGiam: row.ma_mien_giam,
            tenMienGiam: row.ten_mien_giam,
            loaiMienGiam: row.loai_mien_giam,
            giaTri: Number(row.gia_tri),
            soTienTruocGiam: Number(row.so_tien_truoc_giam),
            soTienGiam: Number(row.so_tien_giam),
            soTienSauGiam: Number(row.so_tien_sau_giam),
            thuTuApDung: row.thu_tu_ap_dung,
            lyDoMienGiam: row.ly_do_mien_giam,
            nguoiTaoMienGiamId: row.nguoi_tao_mien_giam_id,
            nguoiApMienGiamId: row.nguoi_ap_mien_giam_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                mg.id,

                mg.phieu_lay_ve_id,

                mg.chinh_sach_id,

                cs.ma_chinh_sach,
                cs.ten_chinh_sach,

                mg.voucher_id,

                v.ma_voucher,
                v.ten_voucher,

                mg.ma_mien_giam,
                mg.ten_mien_giam,

                mg.loai_mien_giam,
                mg.gia_tri,

                mg.so_tien_truoc_giam,
                mg.so_tien_giam,
                mg.so_tien_sau_giam,

                mg.thu_tu_ap_dung,

                mg.ly_do_mien_giam,

                mg.nguoi_tao_mien_giam_id,
                mg.nguoi_ap_mien_giam_id,

                mg.created_at,
                mg.updated_at

            FROM ct_phieu_lay_ve_mien_giam mg

            LEFT JOIN dm_chinh_sach cs
                ON cs.id =
                   mg.chinh_sach_id

            LEFT JOIN dm_voucher v
                ON v.id =
                   mg.voucher_id

        `;
    }

    async getTongHop(
        query = {}
    ) {
        const conditions = [];
        const values = [];

        if (query.phieuLayVeId) {
            values.push(
                Number(query.phieuLayVeId)
            );

            conditions.push(
                `mg.phieu_lay_ve_id = $${values.length}`
            );
        }

        let sql = `
            ${this.getBaseQuery()}
        `;

        if (
            conditions.length >
            0
        ) {
            sql += `
                WHERE
                    ${conditions.join(
                        "\nAND "
                    )}
            `;
        }

        sql += `

            ORDER BY

                mg.phieu_lay_ve_id ASC,

                mg.thu_tu_ap_dung ASC,

                mg.id ASC

        `;

        const result = await pool.query(
            sql,
            values
        );

        return result.rows.map(
            row =>
                this.mapMienGiam(
                    row
                )
        );
    }

    async getChiTiet(
        id,
        db = pool
    ) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE mg.id = $1

            LIMIT 1
        `;

        const result = await db.query(
            sql,
            [
                id
            ]
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapMienGiam(
            result.rows[0]
        );
    }

    async getPhieuById(
        id,
        db = pool
    ) {
        const sql = `

            SELECT

                id,

                thuc_don_ngay_id,

                doi_tuong_lay_ve,

                nhan_vien_id,

                tien_goc,

                tong_mien_giam,

                thanh_tien,

                trang_thai,

                nguoi_tao_id

            FROM nv_phieu_lay_ve_an

            WHERE id = $1

            LIMIT 1

        `;

        const result = await db.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getTaiKhoanNhanVien(
        nhanVienId,
        db = pool
    ) {
        const sql = `

            SELECT

                tk.id AS tai_khoan_id,

                nv.chuc_vu_id

            FROM dm_nhan_vien nv

            LEFT JOIN dm_tai_khoan tk
                ON tk.nhan_vien_id =
                   nv.id

            WHERE nv.id = $1

            LIMIT 1

        `;

        const result = await db.query(
            sql,
            [
                nhanVienId
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getVaiTroTaiKhoan(
        taiKhoanId,
        db = pool
    ) {
        const sql = `

            SELECT
                vai_tro_id

            FROM dm_tai_khoan_vai_tro

            WHERE
                tai_khoan_id = $1

                AND active = TRUE

        `;

        const result = await db.query(
            sql,
            [
                taiKhoanId
            ]
        );

        return result.rows.map(
            row =>
                Number(row.vai_tro_id)
        );
    }

    async getMienGiamKhaDung(data) {
        const values = [
            data.taiKhoanId,
            data.chucVuId
        ];

        let vaiTroCondition = "FALSE";

        if (
            data.vaiTroIds.length >
            0
        ) {
            values.push(
                data.vaiTroIds
            );

            vaiTroCondition =
                `csvt.vai_tro_id = ANY($${values.length}::int[])`;
        }

        const sql = `

            SELECT DISTINCT

                cs.id AS chinh_sach_id,

                cs.ma_chinh_sach,
                cs.ten_chinh_sach,

                cs.muc_do_uu_tien,

                v.id AS voucher_id,

                v.ma_voucher,
                v.ten_voucher,

                v.loai_mien_giam,
                v.gia_tri,

                v.so_luong,
                v.da_su_dung,

                v.thoi_gian_bat_dau,
                v.thoi_gian_ket_thuc

            FROM dm_chinh_sach cs

            INNER JOIN ct_chinh_sach_voucher csv
                ON csv.chinh_sach_id =
                   cs.id

            INNER JOIN dm_voucher v
                ON v.id =
                   csv.voucher_id

            LEFT JOIN ct_chinh_sach_tai_khoan cstk
                ON cstk.chinh_sach_id =
                   cs.id

                AND cstk.active = TRUE

            LEFT JOIN ct_chinh_sach_chuc_vu cscv
                ON cscv.chinh_sach_id =
                   cs.id

                AND cscv.active = TRUE

            LEFT JOIN ct_chinh_sach_vai_tro csvt
                ON csvt.chinh_sach_id =
                   cs.id

                AND csvt.active = TRUE

            WHERE

                cs.active = TRUE

                AND v.active = TRUE

                AND (
                    v.thoi_gian_bat_dau IS NULL
                    OR v.thoi_gian_bat_dau <=
                       NOW()
                )

                AND (
                    v.thoi_gian_ket_thuc IS NULL
                    OR v.thoi_gian_ket_thuc >=
                       NOW()
                )

                AND (
                    v.so_luong <= 0
                    OR v.da_su_dung <
                       v.so_luong
                )

                AND (

                    (
                        $1::INTEGER IS NOT NULL
                        AND cstk.tai_khoan_id =
                            $1
                    )

                    OR

                    (
                        $2::INTEGER IS NOT NULL
                        AND cscv.chuc_vu_id =
                            $2
                    )

                    OR

                    (
                        ${vaiTroCondition}
                    )

                )

            ORDER BY

                cs.muc_do_uu_tien DESC,

                cs.id ASC,

                v.id ASC

        `;

        const result = await pool.query(
            sql,
            values
        );

        return result.rows.map(
            row => ({
                chinhSachId: row.chinh_sach_id,
                maChinhSach: row.ma_chinh_sach,
                tenChinhSach: row.ten_chinh_sach,
                mucDoUuTien: row.muc_do_uu_tien,
                voucherId: row.voucher_id,
                maVoucher: row.ma_voucher,
                tenVoucher: row.ten_voucher,
                loaiMienGiam: row.loai_mien_giam,
                giaTri: Number(row.gia_tri),
                soLuong: row.so_luong,
                daSuDung: row.da_su_dung,
                thoiGianBatDau: row.thoi_gian_bat_dau,
                thoiGianKetThuc: row.thoi_gian_ket_thuc
            })
        );
    }

    async getVoucherById(
        id,
        db = pool
    ) {
        const sql = `

            SELECT

                id,
                ma_voucher,
                ten_voucher,

                loai_mien_giam,
                gia_tri,

                so_luong,
                da_su_dung,

                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,

                active

            FROM dm_voucher

            WHERE id = $1

            LIMIT 1

        `;

        const result = await db.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getChinhSachById(
        id,
        db = pool
    ) {
        const sql = `

            SELECT

                id,
                ma_chinh_sach,
                ten_chinh_sach,
                muc_do_uu_tien,
                active

            FROM dm_chinh_sach

            WHERE id = $1

            LIMIT 1

        `;

        const result = await db.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }

    async existsChinhSachVoucher(
        chinhSachId,
        voucherId,
        db = pool
    ) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM ct_chinh_sach_voucher

                WHERE
                    chinh_sach_id = $1

                    AND voucher_id = $2

            ) AS "exists"

        `;

        const result = await db.query(
            sql,
            [
                chinhSachId,
                voucherId
            ]
        );

        return result.rows[0].exists;
    }

    async existsVoucherTrongPhieu(
        phieuLayVeId,
        voucherId,
        db = pool
    ) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM ct_phieu_lay_ve_mien_giam

                WHERE
                    phieu_lay_ve_id = $1

                    AND voucher_id = $2

            ) AS "exists"

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId,
                voucherId
            ]
        );

        return result.rows[0].exists;
    }

    async getThuTuTiepTheo(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            SELECT

                COALESCE(
                    MAX(
                        thu_tu_ap_dung
                    ),
                    0
                ) + 1 AS thu_tu

            FROM ct_phieu_lay_ve_mien_giam

            WHERE phieu_lay_ve_id = $1

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return Number(
            result.rows[0].thu_tu
        );
    }

    async getMienGiamThuCongTheoPhieu(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE
                mg.phieu_lay_ve_id = $1

                AND mg.voucher_id IS NULL

                AND mg.chinh_sach_id IS NULL

            ORDER BY
                mg.id ASC

            LIMIT 1
        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapMienGiam(
            result.rows[0]
        );
    }

    async create(
        data,
        db = pool
    ) {
        const sql = `

            INSERT INTO ct_phieu_lay_ve_mien_giam (

                phieu_lay_ve_id,

                chinh_sach_id,
                voucher_id,

                ma_mien_giam,
                ten_mien_giam,

                loai_mien_giam,
                gia_tri,

                so_tien_truoc_giam,
                so_tien_giam,
                so_tien_sau_giam,

                thu_tu_ap_dung,

                ly_do_mien_giam,

                nguoi_tao_mien_giam_id,
                nguoi_ap_mien_giam_id,

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
            data.phieuLayVeId,
            data.chinhSachId,
            data.voucherId,
            data.maMienGiam,
            data.tenMienGiam,
            data.loaiMienGiam,
            data.giaTri,
            data.soTienTruocGiam,
            data.soTienGiam,
            data.soTienSauGiam,
            data.thuTuApDung,
            data.lyDoMienGiam,
            data.nguoiTaoMienGiamId,
            data.nguoiApMienGiamId
        ];

        const result = await db.query(
            sql,
            values
        );

        return result.rows[0].id;
    }

    async updateThongTin(
        id,
        data,
        db = pool
    ) {
        const sql = `

            UPDATE ct_phieu_lay_ve_mien_giam

            SET

                ma_mien_giam = $2,

                ten_mien_giam = $3,

                loai_mien_giam = $4,

                gia_tri = $5,

                ly_do_mien_giam = $6,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                id,
                data.maMienGiam,
                data.tenMienGiam,
                data.loaiMienGiam,
                data.giaTri,
                data.lyDoMienGiam
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getDanhSachTheoPhieu(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            SELECT

                id,

                loai_mien_giam,
                gia_tri,

                thu_tu_ap_dung

            FROM ct_phieu_lay_ve_mien_giam

            WHERE
                phieu_lay_ve_id = $1

            ORDER BY
                thu_tu_ap_dung ASC,
                id ASC

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return result.rows;
    }

    async updateSoTienMienGiam(
        id,
        data,
        db = pool
    ) {
        const sql = `
            UPDATE ct_phieu_lay_ve_mien_giam
            SET
                so_tien_truoc_giam = $2,
                so_tien_giam = $3,
                so_tien_sau_giam = $4,
                updated_at = NOW()
            WHERE id = $1
        `;

        await db.query(
            sql,
            [
                id,
                data.soTienTruocGiam,
                data.soTienGiam,
                data.soTienSauGiam
            ]
        );
    }

    async updateTongTienPhieu(
        id,
        tongMienGiam,
        thanhTien,
        db = pool
    ) {
        const sql = `
            UPDATE nv_phieu_lay_ve_an
            SET
                tong_mien_giam = $2,
                thanh_tien = $3,
                updated_at = NOW()
            WHERE id = $1
        `;

        await db.query(
            sql,
            [
                id,
                tongMienGiam,
                thanhTien
            ]
        );
    }

    async delete(
        id,
        db = pool
    ) {
        const sql = `
            DELETE FROM ct_phieu_lay_ve_mien_giam
            WHERE id = $1
            RETURNING id
        `;

        const result = await db.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }
}

module.exports = new PhieuLayVeMienGiamRepository();
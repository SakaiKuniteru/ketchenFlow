const pool = require("../../../../config/database");

class ThanhToanVeAnRepository {
    mapThanhToan(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            phieuLayVeId: row.phieu_lay_ve_id,
            soPhieu: row.so_phieu,
            loaiGiaoDich: row.loai_giao_dich,
            phuongThuc: row.phuong_thuc,
            soTien: Number(row.so_tien),
            maGiaoDich: row.ma_giao_dich,
            maThamChieu: row.ma_tham_chieu,
            maChuanChi: row.ma_chuan_chi,
            trangThai: row.trang_thai,
            noiDungLoi: row.noi_dung_loi,
            nguoiKhoiTaoId: row.nguoi_khoi_tao_id,
            nguoiXacNhanId: row.nguoi_xac_nhan_id,
            nguoiXacNhanTenDangNhap: row.nguoi_xac_nhan_ten_dang_nhap,
            tenNguoiXacNhan: row.ten_nguoi_xac_nhan,
            soLuong: Number(
                row.so_luong ||
                0
            ),
            thanhToanGocId: row.thanh_toan_goc_id,
            phieuMoiId: row.phieu_moi_id,
            thoiGianThanhToan: row.thoi_gian_thanh_toan,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                tt.id,

                tt.phieu_lay_ve_id,

                p.so_phieu,

                tt.loai_giao_dich,

                tt.phuong_thuc,

                tt.so_tien,

                tt.ma_giao_dich,

                tt.ma_tham_chieu,

                tt.ma_chuan_chi,

                tt.trang_thai,

                tt.noi_dung_loi,

                tt.nguoi_khoi_tao_id,

                tt.nguoi_xac_nhan_id,

                tkxn.ten_dang_nhap
                    AS nguoi_xac_nhan_ten_dang_nhap,

                nvxn.ho_ten
                    AS ten_nguoi_xac_nhan,

                tt.so_luong,
                tt.thanh_toan_goc_id,
                tt.phieu_moi_id,

                tt.thoi_gian_thanh_toan,

                tt.created_at,
                tt.updated_at

            FROM nv_thanh_toan_ve_an tt

            INNER JOIN nv_phieu_lay_ve_an p
                ON p.id =
                   tt.phieu_lay_ve_id
            LEFT JOIN dm_tai_khoan tkxn
                ON tkxn.id =
                tt.nguoi_xac_nhan_id

            LEFT JOIN dm_nhan_vien nvxn
                ON nvxn.id =
                tkxn.nhan_vien_id
                
        `;
    }

    async getSoLuongDaHoanTheoThanhToan(
        thanhToanGocId,
        db = pool
    ) {
        const result = await db.query(
            `
                    SELECT
                        COALESCE(
                            SUM(so_luong),
                            0
                        )::INTEGER
                            AS so_luong_da_hoan

                    FROM nv_thanh_toan_ve_an

                    WHERE
                        thanh_toan_goc_id = $1

                        AND loai_giao_dich = 20

                        AND trang_thai = 30
                `,
            [
                thanhToanGocId
            ]
        );

        return Number(
            result.rows[0]
                ?.so_luong_da_hoan ||
            0
        );
    }

    async getTongDaHoanTheoThanhToan(
        thanhToanGocId,
        db = pool
    ) {
        const result = await db.query(
            `
                    SELECT
                        COALESCE(
                            SUM(so_tien),
                            0
                        ) AS tong_da_hoan

                    FROM nv_thanh_toan_ve_an

                    WHERE
                        thanh_toan_goc_id = $1

                        AND loai_giao_dich = 20

                        AND trang_thai = 30
                `,
            [
                thanhToanGocId
            ]
        );

        return Number(
            result.rows[0]
                ?.tong_da_hoan ||
            0
        );
    }

    async existsHoanTheoThanhToan(
        thanhToanGocId,
        db = pool
    ) {
        const result = await db.query(
            `
                    SELECT EXISTS (

                        SELECT 1

                        FROM nv_thanh_toan_ve_an

                        WHERE
                            thanh_toan_goc_id = $1

                            AND loai_giao_dich = 20

                            AND trang_thai = 30

                    ) AS "exists"
                `,
            [
                thanhToanGocId
            ]
        );

        return Boolean(
            result.rows[0]
                ?.exists
        );
    }

    async existsVeDaSuDung(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM ct_ve_an

                WHERE
                    phieu_lay_ve_id = $1

                    AND trang_thai = 20

            ) AS "exists"

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return Boolean(
            result.rows[0]
                ?.exists
        );
    }

    async resetPhieuThanhToan(
        phieuLayVeId,
        trangThai,
        db = pool
    ) {
        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                phuong_thuc_thanh_toan =
                    NULL,

                trang_thai =
                    $2,

                nguoi_thanh_toan_id =
                    NULL,

                thoi_gian_thanh_toan =
                    NULL,

                updated_at =
                    NOW()

            WHERE
                id = $1

        `;

        await db.query(
            sql,
            [
                phieuLayVeId,
                trangThai
            ]
        );
    }

    async deleteVeChuaSuDungTheoPhieu(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            DELETE FROM ct_ve_an

            WHERE
                phieu_lay_ve_id = $1

                AND trang_thai = 10

        `;

        await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );
    }

    async huySoLuongVeTheoPhieu(
        phieuLayVeId,
        soLuong,
        nguoiHuyId,
        lyDoHuy,
        db = pool
    ) {
        const sql = `

            WITH danh_sach AS (

                SELECT id

                FROM ct_ve_an

                WHERE
                    phieu_lay_ve_id = $1

                    AND trang_thai = 10

                ORDER BY
                    so_thu_tu DESC,
                    id DESC

                LIMIT $2

            )

            UPDATE ct_ve_an v

            SET

                trang_thai = 30,

                nguoi_huy_id = $3,

                thoi_gian_huy = NOW(),

                ly_do_huy = $4,

                updated_at = NOW()

            FROM danh_sach ds

            WHERE
                v.id =
                ds.id

            RETURNING
                v.id

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId,
                soLuong,
                nguoiHuyId,
                lyDoHuy
            ]
        );

        return result.rows;
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
                `tt.phieu_lay_ve_id = $${values.length}`
            );
        }

        if (query.loaiGiaoDich) {
            values.push(
                Number(query.loaiGiaoDich)
            );

            conditions.push(
                `tt.loai_giao_dich = $${values.length}`
            );
        }

        if (query.phuongThuc) {
            values.push(
                Number(query.phuongThuc)
            );

            conditions.push(
                `tt.phuong_thuc = $${values.length}`
            );
        }

        if (query.trangThai) {
            values.push(
                Number(query.trangThai)
            );

            conditions.push(
                `tt.trang_thai = $${values.length}`
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
                tt.created_at DESC,
                tt.id DESC

        `;

        const result = await pool.query(
            sql,
            values
        );

        return result.rows.map(
            row =>
                this.mapThanhToan(
                    row
                )
        );
    }

    async getDanhSachPhieu(phieuLayVeId) {
        const sql = `

            WITH selected AS (

                SELECT
                    COALESCE(
                        phieu_goc_id,
                        id
                    ) AS root_id

                FROM nv_phieu_lay_ve_an

                WHERE id = $1

            ),

            family AS (

                SELECT p.*

                FROM nv_phieu_lay_ve_an p

                CROSS JOIN selected s

                WHERE
                    (
                        p.id =
                            s.root_id
                        OR
                        p.phieu_goc_id =
                            s.root_id
                    )

                    AND p.trang_thai <>
                        50

            ),

            phieu_thu AS (

                SELECT

                    'PHIEU_THU'::TEXT
                        AS "loai",

                    p.id
                        AS "phieuLayVeId",

                    pay.id
                        AS "thanhToanId",

                    NULL::BIGINT
                        AS "thanhToanGocId",

                    NULL::BIGINT
                        AS "phieuMoiId",

                    p.so_phieu
                        AS "soPhieu",

                    p.so_luong
                        AS "soLuong",

                    p.thanh_tien
                        AS "soTien",

                    pay.phuong_thuc
                        AS "phuongThuc",

                    pay.ma_giao_dich
                        AS "maGiaoDich",

                    CASE
                        WHEN
                            pay.phuong_thuc = 30
                        THEN
                            pay.id
                        ELSE
                            NULL
                    END
                        AS "qrThanhToanId",

                    CASE
                        WHEN
                            p.trang_thai IN (
                                40,
                                60
                            )
                        THEN
                            'DA_THANH_TOAN'
                        ELSE
                            'CHUA_THANH_TOAN'
                    END
                        AS "trangThaiHienThi",

                    COALESCE(
                        p.thoi_gian_thanh_toan,
                        p.created_at
                    )
                        AS "thoiGian"

                FROM family p

                LEFT JOIN LATERAL (

                    SELECT tt.*

                    FROM nv_thanh_toan_ve_an tt

                WHERE
                    tt.phieu_lay_ve_id =
                        p.id

                    AND tt.loai_giao_dich =
                        10

                    AND (
                        (
                            p.trang_thai IN (
                                40,
                                60
                            )

                            AND tt.trang_thai =
                                30
                        )

                        OR

                        (
                            p.trang_thai NOT IN (
                                40,
                                60
                            )

                            AND tt.trang_thai IN (
                                10,
                                20
                            )
                        )
                    )

                    ORDER BY
                        tt.created_at DESC,
                        tt.id DESC

                    LIMIT 1

                ) pay
                    ON TRUE

            ),

            phieu_hoan AS (

                SELECT

                    'PHIEU_HOAN'::TEXT
                        AS "loai",

                    tt.phieu_lay_ve_id
                        AS "phieuLayVeId",

                    tt.id
                        AS "thanhToanId",

                    tt.thanh_toan_goc_id
                        AS "thanhToanGocId",

                    tt.phieu_moi_id
                        AS "phieuMoiId",

                    p.so_phieu
                        AS "soPhieu",

                    tt.so_luong
                        AS "soLuong",

                    tt.so_tien
                        AS "soTien",

                    tt.phuong_thuc
                        AS "phuongThuc",

                    tt.ma_giao_dich
                        AS "maGiaoDich",

                    CASE
                        WHEN
                            goc.phuong_thuc = 30
                        THEN
                            goc.id
                        ELSE
                            NULL
                    END
                        AS "qrThanhToanId",

                    'DA_HOAN'::TEXT
                        AS "trangThaiHienThi",

                    COALESCE(
                        tt.thoi_gian_thanh_toan,
                        tt.created_at
                    )
                        AS "thoiGian"

                FROM nv_thanh_toan_ve_an tt

                INNER JOIN family p
                    ON p.id =
                    tt.phieu_lay_ve_id

                LEFT JOIN nv_thanh_toan_ve_an goc
                    ON goc.id =
                    tt.thanh_toan_goc_id

                WHERE
                    tt.loai_giao_dich =
                        20

                    AND tt.trang_thai =
                        30

            )

            SELECT *
            FROM phieu_thu

            UNION ALL

            SELECT *
            FROM phieu_hoan

            ORDER BY
                "thoiGian" DESC,
                "thanhToanId" DESC
                    NULLS LAST

        `;

        const result = await pool.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return result.rows;
    }

    async getChiTiet(
        id,
        db = pool
    ) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tt.id = $1

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

        return this.mapThanhToan(
            result.rows[0]
        );
    }

    async getByMaGiaoDich(
        maGiaoDich,
        db = pool
    ) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE tt.ma_giao_dich = $1

            LIMIT 1
        `;

        const result = await db.query(
            sql,
            [
                maGiaoDich
            ]
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapThanhToan(
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
                so_phieu,

                phieu_goc_id,

                thuc_don_ngay_id,

                so_luong,

                thanh_tien,

                phuong_thuc_thanh_toan,

                trang_thai,

                nguoi_tao_id,

                nguoi_thanh_toan_id,
                thoi_gian_thanh_toan

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

    async existsThanhToanThanhCong(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM nv_thanh_toan_ve_an

                WHERE
                    phieu_lay_ve_id = $1

                    AND loai_giao_dich = 10

                    AND trang_thai = 30

            ) AS "exists"

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return result.rows[0].exists;
    }

    async create(
        data,
        db = pool
    ) {
        const sql = `

            INSERT INTO nv_thanh_toan_ve_an (

                phieu_lay_ve_id,

                loai_giao_dich,

                phuong_thuc,

                so_tien,

                so_luong,

                thanh_toan_goc_id,

                phieu_moi_id,

                ma_giao_dich,

                ma_tham_chieu,

                ma_chuan_chi,

                trang_thai,

                noi_dung_loi,

                nguoi_khoi_tao_id,

                nguoi_xac_nhan_id,

                thoi_gian_thanh_toan,

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
                $15,

                NOW(),
                NOW()

            )

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                data.phieuLayVeId,
                data.loaiGiaoDich,
                data.phuongThuc,
                data.soTien,
                data.soLuong,
                data.thanhToanGocId,
                data.phieuMoiId,
                data.maGiaoDich,
                data.maThamChieu,
                data.maChuanChi,
                data.trangThai,
                data.noiDungLoi,
                data.nguoiKhoiTaoId,
                data.nguoiXacNhanId,
                data.thoiGianThanhToan
            ]
        );

        return result.rows[0].id;
    }

    async syncThanhToanChoXuLy(
        id,
        data,
        db = pool
    ) {
        const sql = `

            UPDATE nv_thanh_toan_ve_an

            SET

                so_tien = $2,

                so_luong = $3,

                updated_at = NOW()

            WHERE id = $1

        `;

        await db.query(
            sql,
            [
                id,
                data.soTien,
                data.soLuong
            ]
        );
    }

    async createPhieuSauHoan(
        {
            phieuNguonId,
            soPhieu,
            soLuong,
            trangThai,
            nguoiTaoId,
            phieuGocId
        },
        db = pool
    ) {
        const result = await db.query(
            `
                    INSERT INTO nv_phieu_lay_ve_an (

                        so_phieu,

                        thuc_don_ngay_id,
                        doi_tuong_lay_ve,

                        nhan_vien_id,

                        ho_ten_nguoi_lay_ve,
                        ngay_sinh_nguoi_lay_ve,
                        gioi_tinh_nguoi_lay_ve,
                        so_dien_thoai_nguoi_lay_ve,
                        dia_chi_nguoi_lay_ve,
                        don_vi_nguoi_lay_ve,

                        khach_lau_dai,

                        so_luong,

                        don_gia,
                        tien_goc,
                        tong_mien_giam,
                        thanh_tien,

                        ghi_chu,

                        phuong_thuc_thanh_toan,

                        trang_thai,

                        nguoi_tao_id,

                        phieu_goc_id,

                        created_at,
                        updated_at

                    )

                    SELECT

                        $2,

                        p.thuc_don_ngay_id,
                        p.doi_tuong_lay_ve,

                        p.nhan_vien_id,

                        p.ho_ten_nguoi_lay_ve,
                        p.ngay_sinh_nguoi_lay_ve,
                        p.gioi_tinh_nguoi_lay_ve,
                        p.so_dien_thoai_nguoi_lay_ve,
                        p.dia_chi_nguoi_lay_ve,
                        p.don_vi_nguoi_lay_ve,

                        p.khach_lau_dai,

                        $3::INTEGER,

                        p.don_gia,

                        p.don_gia * ($3::INTEGER),

                        0,

                        p.don_gia * ($3::INTEGER),

                        p.ghi_chu,

                        NULL,

                        $4,

                        $5,

                        $6,

                        NOW(),
                        NOW()

                    FROM nv_phieu_lay_ve_an p

                    WHERE
                        p.id = $1

                    RETURNING id
                `,
            [
                phieuNguonId,
                soPhieu,
                soLuong,
                trangThai,
                nguoiTaoId,
                phieuGocId
            ]
        );

        return result.rows[0]
            ?.id ||
            null;
    }

    async updateTrangThai(
        id,
        data,
        db = pool
    ) {
        const sql = `

            UPDATE nv_thanh_toan_ve_an

            SET

                trang_thai = $2,

                ma_tham_chieu =
                    COALESCE(
                        $3,
                        ma_tham_chieu
                    ),

                ma_chuan_chi =
                    COALESCE(
                        $4,
                        ma_chuan_chi
                    ),

                noi_dung_loi = $5,

                nguoi_xac_nhan_id =
                    COALESCE(
                        $6,
                        nguoi_xac_nhan_id
                    ),

                thoi_gian_thanh_toan =
                    CASE
                        WHEN $2 = 30
                        THEN NOW()
                        ELSE thoi_gian_thanh_toan
                    END,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                id,
                data.trangThai,
                data.maThamChieu,
                data.maChuanChi,
                data.noiDungLoi,
                data.nguoiXacNhanId
            ]
        );

        return result.rows[0] ||
            null;
    }

    async updatePhieuThanhToan(
        phieuLayVeId,
        phuongThuc,
        nguoiThanhToanId,
        db = pool
    ) {
        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                phuong_thuc_thanh_toan = $2,

                trang_thai = 40,

                nguoi_thanh_toan_id = $3,

                thoi_gian_thanh_toan = NOW(),

                updated_at = NOW()

            WHERE id = $1

        `;

        await db.query(
            sql,
            [
                phieuLayVeId,
                phuongThuc,
                nguoiThanhToanId
            ]
        );
    }

    async updateTrangThaiPhieu(
        phieuLayVeId,
        trangThai,
        db = pool
    ) {
        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                trang_thai = $2,

                updated_at = NOW()

            WHERE id = $1

        `;

        await db.query(
            sql,
            [
                phieuLayVeId,
                trangThai
            ]
        );
    }

    async tangVoucherDaSuDung(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            UPDATE dm_voucher v

            SET

                da_su_dung =
                    v.da_su_dung + 1,

                updated_at = NOW()

            FROM (

                SELECT DISTINCT
                    voucher_id

                FROM ct_phieu_lay_ve_mien_giam

                WHERE
                    phieu_lay_ve_id = $1

                    AND voucher_id IS NOT NULL

            ) mg

            WHERE
                v.id =
                mg.voucher_id

        `;

        await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );
    }

    async giamVoucherDaSuDung(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            UPDATE dm_voucher v

            SET

                da_su_dung =
                    GREATEST(
                        v.da_su_dung - 1,
                        0
                    ),

                updated_at = NOW()

            FROM (

                SELECT DISTINCT
                    voucher_id

                FROM ct_phieu_lay_ve_mien_giam

                WHERE
                    phieu_lay_ve_id = $1

                    AND voucher_id IS NOT NULL

            ) mg

            WHERE
                v.id =
                mg.voucher_id

        `;

        await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );
    }

    async existsVeTheoPhieu(
        phieuLayVeId,
        db = pool
    ) {
        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM ct_ve_an

                WHERE
                    phieu_lay_ve_id = $1

            ) AS "exists"

        `;

        const result = await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

        return result.rows[0].exists;
    }

    async createVe(
        data,
        db = pool
    ) {
        const sql = `

            INSERT INTO ct_ve_an (

                phieu_lay_ve_id,

                thuc_don_ngay_id,

                so_thu_tu,

                ma_ve,

                qr_token,

                trang_thai,

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

                NOW(),
                NOW()

            )

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                data.phieuLayVeId,
                data.thucDonNgayId,
                data.soThuTu,
                data.maVe,
                data.qrToken,
                data.trangThai
            ]
        );

        return result.rows[0].id;
    }

    async huyVeTheoPhieu(
        phieuLayVeId,
        nguoiHuyId,
        lyDoHuy,
        db = pool
    ) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = 30,

                nguoi_huy_id = $2,

                thoi_gian_huy = NOW(),

                ly_do_huy = $3,

                updated_at = NOW()

            WHERE

                phieu_lay_ve_id = $1

                AND trang_thai = 10

        `;

        await db.query(
            sql,
            [
                phieuLayVeId,
                nguoiHuyId,
                lyDoHuy
            ]
        );
    }
}

module.exports = new ThanhToanVeAnRepository();
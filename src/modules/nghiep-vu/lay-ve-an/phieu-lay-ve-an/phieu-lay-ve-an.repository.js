const pool = require("../../../../config/database");

class PhieuLayVeAnRepository {
    mapPhieuLayVeAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            soPhieu: row.so_phieu,
            thucDonNgayId: row.thuc_don_ngay_id,
            ngay: row.ngay,
            thucDonId: row.thuc_don_id,
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
            thoiGianBatDau: row.thoi_gian_bat_dau,
            thoiGianKetThuc: row.thoi_gian_ket_thuc,
            doiTuongLayVe: row.doi_tuong_lay_ve,
            nhanVienId: row.nhan_vien_id,
            maNhanVien: row.ma_nhan_vien,
            tenNhanVien: row.ten_nhan_vien,
            hoTenNguoiLayVe: row.ho_ten_nguoi_lay_ve,
            ngaySinhNguoiLayVe: row.ngay_sinh_nguoi_lay_ve,
            gioiTinhNguoiLayVe: row.gioi_tinh_nguoi_lay_ve,
            soDienThoaiNguoiLayVe: row.so_dien_thoai_nguoi_lay_ve,
            diaChiNguoiLayVe: row.dia_chi_nguoi_lay_ve,
            donViNguoiLayVe: row.don_vi_nguoi_lay_ve,
            khachLauDai: row.khach_lau_dai,
            soLuong: row.so_luong,
            donGia: Number(row.don_gia),
            tienGoc: Number(row.tien_goc),
            tongMienGiam: Number(row.tong_mien_giam),
            thanhTien: Number(row.thanh_tien),
            ghiChu: row.ghi_chu,
            phuongThucThanhToan: row.phuong_thuc_thanh_toan,
            trangThai: row.trang_thai,
            nguoiTaoId: row.nguoi_tao_id,
            nguoiThanhToanId: row.nguoi_thanh_toan_id,
            nguoiThanhToanTenDangNhap: row.nguoi_thanh_toan_ten_dang_nhap,
            tenNguoiThanhToan: row.ten_nguoi_thanh_toan,
            thoiGianThanhToan: row.thoi_gian_thanh_toan,
            nguoiHuyId: row.nguoi_huy_id,
            thoiGianHuy: row.thoi_gian_huy,
            lyDoHuy: row.ly_do_huy,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                p.id,
                p.so_phieu,

                p.thuc_don_ngay_id,

                tdn.ngay,

                td.id AS thuc_don_id,
                td.ma_thuc_don,
                td.ten_thuc_don,

                td.co_so_id,
                cs.ma_co_so,
                cs.ten_co_so,

                td.nha_an_id,
                na.ma_nha_an,
                na.ten_nha_an,

                td.ca_an_id,
                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc,

                p.doi_tuong_lay_ve,

                p.nhan_vien_id,

                nv.ma_nhan_vien,
                nv.ho_ten AS ten_nhan_vien,

                p.ho_ten_nguoi_lay_ve,
                p.ngay_sinh_nguoi_lay_ve,
                p.gioi_tinh_nguoi_lay_ve,
                p.so_dien_thoai_nguoi_lay_ve,
                p.dia_chi_nguoi_lay_ve,
                p.don_vi_nguoi_lay_ve,
                p.khach_lau_dai,

                p.so_luong,

                p.don_gia,
                p.tien_goc,
                p.tong_mien_giam,
                p.thanh_tien,

                p.ghi_chu,

                p.phuong_thuc_thanh_toan,
                p.trang_thai,

                p.nguoi_tao_id,

                p.nguoi_thanh_toan_id,

                tktt.ten_dang_nhap
                    AS nguoi_thanh_toan_ten_dang_nhap,

                nvtt.ho_ten
                    AS ten_nguoi_thanh_toan,

                p.thoi_gian_thanh_toan,
                p.thoi_gian_thanh_toan,

                p.nguoi_huy_id,
                p.thoi_gian_huy,
                p.ly_do_huy,

                p.created_at,
                p.updated_at

            FROM nv_phieu_lay_ve_an p

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   p.thuc_don_ngay_id

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

            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                   p.nhan_vien_id

            LEFT JOIN dm_tai_khoan tktt
                ON tktt.id =
                p.nguoi_thanh_toan_id

            LEFT JOIN dm_nhan_vien nvtt
                ON nvtt.id =
                tktt.nhan_vien_id

        `;
    }

    async getTongHop(
        query = {}
    ) {
        const conditions = [];
        const values = [];

        const addNumberCondition = (
            rawValue,
            sqlBuilder
        ) => {
            if (
                rawValue === undefined ||
                rawValue === null ||
                rawValue === ""
            ) {
                return;
            }

            const value = Number(rawValue);

            if (!Number.isFinite(value)) {
                return;
            }

            values.push(value);

            conditions.push(
                sqlBuilder(
                    `$${values.length}`
                )
            );
        };

        const addDateTimeCondition = (
            rawValue,
            sqlBuilder
        ) => {
            if (!rawValue) {
                return;
            }

            values.push(rawValue);

            conditions.push(
                sqlBuilder(
                    `$${values.length}`
                )
            );
        };

        addNumberCondition(
            query.trangThai,
            parameter =>
                `p.trang_thai = ${parameter}`
        );

        addNumberCondition(
            query.doiTuongLayVe,
            parameter =>
                `p.doi_tuong_lay_ve = ${parameter}`
        );

        addNumberCondition(
            query.nhanVienId,
            parameter =>
                `p.nhan_vien_id = ${parameter}`
        );

        addNumberCondition(
            query.thucDonNgayId,
            parameter =>
                `p.thuc_don_ngay_id = ${parameter}`
        );

        addNumberCondition(
            query.coSoId,
            parameter =>
                `td.co_so_id = ${parameter}`
        );

        addNumberCondition(
            query.nhaAnId,
            parameter =>
                `td.nha_an_id = ${parameter}`
        );

        addNumberCondition(
            query.caAnId,
            parameter =>
                `td.ca_an_id = ${parameter}`
        );

        addNumberCondition(
            query.phuongThucThanhToan,
            parameter =>
                `p.phuong_thuc_thanh_toan = ${parameter}`
        );

        addNumberCondition(
            query.thuNganId,
            parameter =>
                `nvtt.id = ${parameter}`
        );

        addNumberCondition(
            query.trangThaiSuDung,
            parameter =>
                `
                    EXISTS (
                        SELECT 1

                        FROM ct_ve_an v_filter

                        WHERE
                            v_filter.phieu_lay_ve_id =
                                p.id

                            AND v_filter.trang_thai =
                                ${parameter}
                    )
                `
        );

        addDateTimeCondition(
            query.tuNgayTao,
            parameter =>
                `p.created_at >= ${parameter}::timestamp`
        );

        addDateTimeCondition(
            query.denNgayTao,
            parameter =>
                `p.created_at <= ${parameter}::timestamp`
        );

        addDateTimeCondition(
            query.tuNgayThanhToan,
            parameter =>
                `p.thoi_gian_thanh_toan >= ${parameter}::timestamp`
        );

        addDateTimeCondition(
            query.denNgayThanhToan,
            parameter =>
                `p.thoi_gian_thanh_toan <= ${parameter}::timestamp`
        );

        if (query.tuNgay) {
            values.push(
                query.tuNgay
            );

            conditions.push(
                `tdn.ngay >= $${values.length}::date`
            );
        }

        if (query.denNgay) {
            values.push(
                query.denNgay
            );

            conditions.push(
                `tdn.ngay <= $${values.length}::date`
            );
        }

        const discountConditions = [
            `
                mg_filter.phieu_lay_ve_id =
                    p.id
            `
        ];

        let hasDiscountFilter = false;

        if (query.tuNgayMienGiam) {
            values.push(
                query.tuNgayMienGiam
            );

            discountConditions.push(
                `
                    mg_filter.created_at >=
                        $${values.length}::timestamp
                `
            );

            hasDiscountFilter = true;
        }

        if (query.denNgayMienGiam) {
            values.push(
                query.denNgayMienGiam
            );

            discountConditions.push(
                `
                    mg_filter.created_at <=
                        $${values.length}::timestamp
                `
            );

            hasDiscountFilter = true;
        }

        if (
            query.loaiMienGiam !== undefined &&
            query.loaiMienGiam !== null &&
            query.loaiMienGiam !== ""
        ) {
            values.push(
                Number(
                    query.loaiMienGiam
                )
            );

            discountConditions.push(
                `
                    mg_filter.loai_mien_giam =
                        $${values.length}
                `
            );

            hasDiscountFilter = true;
        }

        if (query.nguoiTaoMienGiamId) {
            values.push(
                Number(
                    query.nguoiTaoMienGiamId
                )
            );

            discountConditions.push(
                `
                    tk_mg.nhan_vien_id =
                        $${values.length}
                `
            );

            hasDiscountFilter = true;
        }

        if (hasDiscountFilter) {
            conditions.push(
                `
                    EXISTS (

                        SELECT 1

                        FROM
                            ct_phieu_lay_ve_mien_giam
                                mg_filter

                        LEFT JOIN dm_tai_khoan
                            tk_mg
                            ON tk_mg.id =
                            mg_filter.nguoi_tao_mien_giam_id

                        WHERE
                            ${discountConditions.join(
                                "\nAND "
                            )}

                    )
                `
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
                p.created_at DESC,
                p.id DESC

        `;

        const result = await pool.query(
            sql,
            values
        );

        return result.rows.map(
            row =>
                this.mapPhieuLayVeAn(
                    row
                )
        );
    }

    async getChiTiet(id) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE p.id = $1

            LIMIT 1
        `;

        const result = await pool.query(
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

        return this.mapPhieuLayVeAn(
            result.rows[0]
        );
    }

    async getThucDonNgayHopLe() {
        const sql = `

            SELECT

                tdn.id,

                tdn.ngay,

                td.id AS thuc_don_id,
                td.ma_thuc_don,
                td.ten_thuc_don,

                td.co_so_id,

                cs.ma_co_so,
                cs.ten_co_so,

                td.nha_an_id,

                na.ma_nha_an,
                na.ten_nha_an,

                td.ca_an_id,

                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc

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

            WHERE
                tdn.active = TRUE

                AND td.active = TRUE

                AND tdn.ngay >=
                    CURRENT_DATE

                AND td.trang_thai = 30

            ORDER BY

                tdn.ngay ASC,

                ca.thoi_gian_bat_dau ASC,

                td.ten_thuc_don ASC

        `;

        const result = await pool.query(
            sql
        );

        return result.rows.map(
            row => ({
                id: row.id,
                ngay: row.ngay,
                thucDonId: row.thuc_don_id,
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
                thoiGianBatDau: row.thoi_gian_bat_dau,
                thoiGianKetThuc: row.thoi_gian_ket_thuc
            })
        );
    }

    async getThucDonNgayById(id) {
        const sql = `

            SELECT

                tdn.id,
                tdn.ngay,
                tdn.active,

                td.id AS thuc_don_id,
                td.co_so_id,
                td.nha_an_id,
                td.ca_an_id,
                td.trang_thai,
                td.active AS thuc_don_active

            FROM ct_thuc_don_ngay tdn

            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id

            WHERE tdn.id = $1

            LIMIT 1

        `;

        const result = await pool.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }

    async taoSoPhieuTheoQuyTac(
        nguCanh,
        db
    ) {
        const prefix = String(
            nguCanh?.prefix ||
            ""
        );

        const doRongDaySo = Number(
            nguCanh?.doRongDaySo
        );

        if (
            !prefix ||
            !Number.isInteger(doRongDaySo) ||
            doRongDaySo <= 0
        ) {
            throw new Error(
                "Cấu hình sinh mã vé ăn không hợp lệ."
            );
        }

        await db.query(
            `
                SELECT
                    pg_advisory_xact_lock(
                        hashtext(
                            $1
                        )
                    )
            `,
            [
                `MA_VE_AN:${nguCanh.khoa}`
            ]
        );

        const result = await db.query(
            `
                    SELECT
                        so_phieu

                    FROM
                        nv_phieu_lay_ve_an

                    WHERE
                        LEFT(
                            so_phieu,
                            CHAR_LENGTH(
                                $1::text
                            )
                        ) =
                        $1::text

                        AND SUBSTRING(
                            so_phieu
                            FROM
                            CHAR_LENGTH(
                                $1::text
                            ) +
                            1
                        ) ~ '^[0-9]+$'

                        AND CHAR_LENGTH(
                            SUBSTRING(
                                so_phieu
                                FROM
                                CHAR_LENGTH(
                                    $1::text
                                ) +
                                1
                            )
                        ) >=
                        $2

                    ORDER BY
                        created_at DESC,
                        id DESC

                    LIMIT 1
                `,
            [
                prefix,
                doRongDaySo
            ]
        );

        const lastCode =
            result.rows[0]
                ?.so_phieu ||
            null;

        if (!lastCode) {
            return (
                prefix +
                "1".padStart(
                    doRongDaySo,
                    "0"
                )
            );
        }

        const lastSuffix = String(
            lastCode
        ).slice(
            prefix.length
        );

        if (!/^\d+$/.test(lastSuffix)) {
            return (
                prefix +
                "1".padStart(
                    doRongDaySo,
                    "0"
                )
            );
        }

        const currentWidth = Math.max(
            doRongDaySo,
            lastSuffix.length
        );

        const currentValue = BigInt(
            lastSuffix
        );

        const maxValue =
            (
                10n **
                BigInt(
                    currentWidth
                )
            ) -
            1n;

        let nextValue;
        let nextWidth;

        if (
            currentValue >=
            maxValue
        ) {
            nextValue = 1n;
            nextWidth =
                currentWidth +
                1;
        } else {
            nextValue =
                currentValue +
                1n;
            nextWidth = currentWidth;
        }

        const suffix = nextValue
            .toString()
            .padStart(
                nextWidth,
                "0"
            );

        return (
            prefix +
            suffix
        );
    }

    async getNhanVienById(id) {
        const sql = `

            SELECT

                id,
                ma_nhan_vien,
                ho_ten,
                ngay_sinh,
                gioi_tinh,
                so_dien_thoai,
                dia_chi,
                active

            FROM dm_nhan_vien

            WHERE id = $1

            LIMIT 1

        `;

        const result = await pool.query(
            sql,
            [
                id
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getGiaVe(
        thucDonNgayId,
        doiTuongLayVe
    ) {
        const sql = `

            SELECT

                gva.id,
                gva.don_gia

            FROM ct_thuc_don_ngay tdn

            INNER JOIN nv_thuc_don td
                ON td.id =
                   tdn.thuc_don_id

            INNER JOIN dm_gia_ve_an gva
                ON gva.doi_tuong_lay_ve = $2

                AND gva.active = TRUE

                AND (
                    gva.co_so_id IS NULL
                    OR gva.co_so_id =
                       td.co_so_id
                )

                AND (
                    gva.nha_an_id IS NULL
                    OR gva.nha_an_id =
                       td.nha_an_id
                )

                AND (
                    gva.ca_an_id IS NULL
                    OR gva.ca_an_id =
                       td.ca_an_id
                )

                AND gva.tu_ngay <=
                    tdn.ngay

                AND (
                    gva.den_ngay IS NULL
                    OR gva.den_ngay >=
                       tdn.ngay
                )

            WHERE
                tdn.id = $1

                AND tdn.active = TRUE

                AND td.active = TRUE

            ORDER BY

                (
                    CASE
                        WHEN gva.co_so_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                    +
                    CASE
                        WHEN gva.nha_an_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                    +
                    CASE
                        WHEN gva.ca_an_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                ) DESC,

                gva.muc_do_uu_tien DESC,

                gva.tu_ngay DESC,

                gva.id DESC

            LIMIT 1

        `;

        const result = await pool.query(
            sql,
            [
                thucDonNgayId,
                doiTuongLayVe
            ]
        );

        return result.rows[0] ||
            null;
    }

    async create(
        data,
        nguCanhSinhMaVeAn
    ) {
        const client = await pool.connect();

        let createdId = null;

        try {
            await client.query(
                "BEGIN"
            );

            const soPhieu = await this
                .taoSoPhieuTheoQuyTac(
                    nguCanhSinhMaVeAn,
                    client
                );

            const sql = `
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
                    $16,

                    $17,

                    $18,

                    $19,

                    $20,

                    NOW(),
                    NOW()

                )

                RETURNING id
            `;

            const values = [
                soPhieu,
                data.thucDonNgayId,
                data.doiTuongLayVe,
                data.nhanVienId,
                data.hoTenNguoiLayVe,
                data.ngaySinhNguoiLayVe,
                data.gioiTinhNguoiLayVe,
                data.soDienThoaiNguoiLayVe,
                data.diaChiNguoiLayVe,
                data.donViNguoiLayVe,
                data.khachLauDai,
                data.soLuong,
                data.donGia,
                data.tienGoc,
                data.tongMienGiam,
                data.thanhTien,
                data.ghiChu,
                data.phuongThucThanhToan,
                data.trangThai,
                data.nguoiTaoId
            ];

            const result = await client.query(
                sql,
                values
            );

            createdId = result.rows[0].id;

            await client.query(
                "COMMIT"
            );
        } catch (error) {
            await client.query(
                "ROLLBACK"
            );

            throw error;
        } finally {
            client.release();
        }

        return await this.getChiTiet(
            createdId
        );
    }

    async update(
        id,
        data
    ) {
        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                thuc_don_ngay_id = $1,

                doi_tuong_lay_ve = $2,

                nhan_vien_id = $3,

                ho_ten_nguoi_lay_ve = $4,
                ngay_sinh_nguoi_lay_ve = $5,
                gioi_tinh_nguoi_lay_ve = $6,
                so_dien_thoai_nguoi_lay_ve = $7,
                dia_chi_nguoi_lay_ve = $8,
                don_vi_nguoi_lay_ve = $9,

                khach_lau_dai = $10,

                so_luong = $11,

                don_gia = $12,
                tien_goc = $13,
                tong_mien_giam = $14,
                thanh_tien = $15,

                ghi_chu = $16,

                phuong_thuc_thanh_toan = $17,

                updated_at = NOW()

            WHERE id = $18

            RETURNING id

        `;

        const values = [
            data.thucDonNgayId,
            data.doiTuongLayVe,
            data.nhanVienId,
            data.hoTenNguoiLayVe,
            data.ngaySinhNguoiLayVe,
            data.gioiTinhNguoiLayVe,
            data.soDienThoaiNguoiLayVe,
            data.diaChiNguoiLayVe,
            data.donViNguoiLayVe,
            data.khachLauDai,
            data.soLuong,
            data.donGia,
            data.tienGoc,
            data.tongMienGiam,
            data.thanhTien,
            data.ghiChu,
            data.phuongThucThanhToan,
            id
        ];

        const result = await pool.query(
            sql,
            values
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return await this.getChiTiet(
            result.rows[0].id
        );
    }

    async huy(
        id,
        nguoiHuyId,
        lyDoHuy
    ) {
        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                trang_thai = 50,

                nguoi_huy_id = $2,

                thoi_gian_huy = NOW(),

                ly_do_huy = $3,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await pool.query(
            sql,
            [
                id,
                nguoiHuyId,
                lyDoHuy
            ]
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return await this.getChiTiet(
            result.rows[0].id
        );
    }

    async getDuLieuInVe(id) {
        return await this.getChiTiet(
            id
        );
    }
}

module.exports = new PhieuLayVeAnRepository();
"use strict";

const pool = require("../../config/database");

class InBaoCaoRepository {
    async getByMa(maBaoCao) {
        const sql = `

            SELECT

                id,
                ma_bao_cao,
                ten_bao_cao,
                file_mau,
                loai_xuat_file,
                mo_ta,
                active,
                created_at,
                updated_at

            FROM dm_bao_cao

            WHERE
                LOWER(
                    TRIM(
                        ma_bao_cao
                    )
                ) =
                LOWER(
                    TRIM(
                        $1
                    )
                )

                AND active = TRUE

            LIMIT 1

        `;

        const result = await pool.query(
            sql,
            [
                maBaoCao
            ]
        );

        return result.rows[0] ||
            null;
    }

    async getNguoiIn(taiKhoanId) {
        const sql = `

            SELECT

                tk.id
                    AS tai_khoan_id,

                tk.ten_dang_nhap,

                nv.id
                    AS nhan_vien_id,

                nv.ma_nhan_vien,

                nv.ho_ten

            FROM dm_tai_khoan tk

            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                tk.nhan_vien_id

            WHERE
                tk.id = $1

            LIMIT 1

        `;

        const result = await pool.query(
            sql,
            [
                taiKhoanId
            ]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            taiKhoanId: Number(row.tai_khoan_id),

            nhanVienId:
                row.nhan_vien_id !== null
                    ? Number(row.nhan_vien_id)
                    : null,

            maNhanVien:
                row.ma_nhan_vien ||
                null,

            tenDangNhap:
                row.ten_dang_nhap ||
                null,

            hoTen:
                row.ho_ten ||
                null
        };
    }

    async getThietLapTheoMa(
        danhSachMa = []
    ) {
        const danhSach = [
            ...new Set(
                danhSachMa
                    .map(
                        item =>
                            String(
                                item ||
                                ""
                            )
                                .trim()
                                .toUpperCase()
                    )
                    .filter(Boolean)
            )
        ];

        if (danhSach.length === 0) {
            return [];
        }

        const sql = `

            SELECT DISTINCT ON (
                UPPER(
                    TRIM(
                        ma_thiet_lap
                    )
                )
            )

                UPPER(
                    TRIM(
                        ma_thiet_lap
                    )
                )
                    AS ma_thiet_lap,

                gia_tri,

                active

            FROM dm_thiet_lap

            WHERE
                UPPER(
                    TRIM(
                        ma_thiet_lap
                    )
                ) =
                ANY(
                    $1::text[]
                )

            ORDER BY

                UPPER(
                    TRIM(
                        ma_thiet_lap
                    )
                ),

                id DESC

        `;

        const result = await pool.query(
            sql,
            [
                danhSach
            ]
        );

        return result.rows.map(
            row => ({
                maThietLap: row.ma_thiet_lap,

                giaTri:
                    row.active === true &&
                    row.gia_tri !== null &&
                    row.gia_tri !== undefined
                        ? String(row.gia_tri)
                        : "",

                active:
                    row.active ===
                    true
            })
        );
    }
}

module.exports = new InBaoCaoRepository();
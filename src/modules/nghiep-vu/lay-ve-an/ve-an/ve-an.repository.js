const pool = require("../../../../config/database");

class VeAnRepository {
    mapVeAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            phieuLayVeId: row.phieu_lay_ve_id,
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
            soThuTu: row.so_thu_tu,
            maVe: row.ma_ve,
            qrToken: row.qr_token,
            trangThai: row.trang_thai,
            thoiGianSuDung: row.thoi_gian_su_dung,
            nguoiXacNhanId: row.nguoi_xac_nhan_id,
            nguoiHuyId: row.nguoi_huy_id,
            thoiGianHuy: row.thoi_gian_huy,
            lyDoHuy: row.ly_do_huy,
            doiTuongLayVe: row.doi_tuong_lay_ve,
            nhanVienId: row.nhan_vien_id,
            maNhanVien: row.ma_nhan_vien,
            tenNhanVien: row.ten_nhan_vien,
            hoTenNguoiLayVe: row.ho_ten_nguoi_lay_ve,
            soDienThoaiNguoiLayVe: row.so_dien_thoai_nguoi_lay_ve,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                v.id,

                v.phieu_lay_ve_id,

                p.so_phieu,

                v.thuc_don_ngay_id,

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

                v.so_thu_tu,

                v.ma_ve,
                v.qr_token,

                v.trang_thai,

                v.thoi_gian_su_dung,

                v.nguoi_xac_nhan_id,

                v.nguoi_huy_id,
                v.thoi_gian_huy,
                v.ly_do_huy,

                p.doi_tuong_lay_ve,

                p.nhan_vien_id,

                nv.ma_nhan_vien,
                nv.ho_ten AS ten_nhan_vien,

                p.ho_ten_nguoi_lay_ve,
                p.so_dien_thoai_nguoi_lay_ve,

                v.created_at,
                v.updated_at

            FROM ct_ve_an v

            INNER JOIN nv_phieu_lay_ve_an p
                ON p.id =
                   v.phieu_lay_ve_id

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                   v.thuc_don_ngay_id

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
                `v.phieu_lay_ve_id = $${values.length}`
            );
        }

        if (query.thucDonNgayId) {
            values.push(
                Number(query.thucDonNgayId)
            );

            conditions.push(
                `v.thuc_don_ngay_id = $${values.length}`
            );
        }

        if (
            query.trangThai !==
            undefined
        ) {
            values.push(
                Number(query.trangThai)
            );

            conditions.push(
                `v.trang_thai = $${values.length}`
            );
        }

        if (query.maVe) {
            values.push(
                String(query.maVe).trim()
            );

            conditions.push(
                `UPPER(v.ma_ve) = UPPER($${values.length})`
            );
        }

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

                tdn.ngay DESC,

                v.phieu_lay_ve_id DESC,

                v.so_thu_tu ASC

        `;

        const result = await pool.query(
            sql,
            values
        );

        return result.rows.map(
            row =>
                this.mapVeAn(
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

            WHERE v.id = $1

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

        return this.mapVeAn(
            result.rows[0]
        );
    }

    async getByQrToken(
        qrToken,
        db = pool
    ) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE v.qr_token = $1

            LIMIT 1
        `;

        const result = await db.query(
            sql,
            [
                qrToken
            ]
        );

        if (
            result.rows.length ===
            0
        ) {
            return null;
        }

        return this.mapVeAn(
            result.rows[0]
        );
    }

    async xacNhanSuDung(
        id,
        nguoiXacNhanId,
        trangThai,
        db = pool
    ) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = $2,

                thoi_gian_su_dung = NOW(),

                nguoi_xac_nhan_id = $3,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                id,
                trangThai,
                nguoiXacNhanId
            ]
        );

        return result.rows[0] ||
            null;
    }

    async huy(
        id,
        nguoiHuyId,
        lyDoHuy,
        trangThai,
        db = pool
    ) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = $2,

                nguoi_huy_id = $3,

                thoi_gian_huy = NOW(),

                ly_do_huy = $4,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                id,
                trangThai,
                nguoiHuyId,
                lyDoHuy
            ]
        );

        return result.rows[0] ||
            null;
    }

    async hetHan(
        id,
        trangThai,
        db = pool
    ) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = $2,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(
            sql,
            [
                id,
                trangThai
            ]
        );

        return result.rows[0] ||
            null;
    }
}

module.exports = new VeAnRepository();
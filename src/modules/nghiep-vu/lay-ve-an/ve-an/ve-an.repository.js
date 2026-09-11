const pool = require('../../../../config/database');

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
            trangThaiThanhToan: row.trang_thai_thanh_toan,
            thoiGianThanhToan: row.thoi_gian_thanh_toan,
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

                p.trang_thai
                    AS trang_thai_thanh_toan,

                p.thoi_gian_thanh_toan,

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

    async getTongHop(query = {}) {
        const conditions = [];

        const values = [];

        const addNumberCondition = (rawValue, builder) => {
            if (rawValue === undefined || rawValue === null || rawValue === '') {
                return;
            }

            const value = Number(rawValue);

            if (!Number.isFinite(value)) {
                return;
            }

            values.push(value);

            conditions.push(builder(`$${values.length}`));
        };

        const normalizeNumberValues = (rawValue) => {
            if (rawValue === undefined || rawValue === null || rawValue === '') {
                return [];
            }

            const rawItems = Array.isArray(rawValue) ? rawValue : String(rawValue).split(',');

            return [
                ...new Set(
                    rawItems
                        .flatMap((item) => String(item).split(','))
                        .map((item) => String(item).trim())
                        .filter((item) => item !== '')
                        .map((item) => Number(item))
                        .filter((item) => Number.isFinite(item))
                )
            ];
        };

        const addNumberListCondition = (rawValue, column) => {
            if (rawValue === undefined || rawValue === null || rawValue === '') {
                return;
            }

            const numbers = normalizeNumberValues(rawValue);

            if (!numbers.length) {
                return;
            }

            values.push(numbers);

            conditions.push(`${column} = ANY($${values.length}::int[])`);
        };

        const addDateCondition = (rawValue, builder) => {
            if (!rawValue) {
                return;
            }

            values.push(rawValue);

            conditions.push(builder(`$${values.length}`));
        };

        addNumberCondition(query.phieuLayVeId, (parameter) => `v.phieu_lay_ve_id = ${parameter}`);

        addNumberCondition(query.thucDonNgayId, (parameter) => `v.thuc_don_ngay_id = ${parameter}`);

        addNumberListCondition(query.trangThai, 'v.trang_thai');

        addNumberListCondition(query.trangThaiThanhToan, 'p.trang_thai');

        addNumberListCondition(query.coSoId, 'td.co_so_id');

        addNumberListCondition(query.nhaAnId, 'td.nha_an_id');

        addNumberListCondition(query.caAnId, 'td.ca_an_id');

        if (query.maVe) {
            values.push(String(query.maVe).trim());

            conditions.push(`UPPER(v.ma_ve) = UPPER($${values.length})`);
        }

        /*
         * Ngày sử dụng.
         */
        addDateCondition(query.tuNgay, (parameter) => `tdn.ngay >= ${parameter}::date`);

        addDateCondition(query.denNgay, (parameter) => `tdn.ngay <= ${parameter}::date`);

        /*
         * Thời gian tạo vé.
         */
        addDateCondition(query.tuNgayTao, (parameter) => `v.created_at >= ${parameter}::timestamp`);

        addDateCondition(query.denNgayTao, (parameter) => `v.created_at <= ${parameter}::timestamp`);

        /*
         * Thời gian thanh toán.
         */
        addDateCondition(query.tuNgayThanhToan, (parameter) => `p.thoi_gian_thanh_toan >= ${parameter}::timestamp`);

        addDateCondition(query.denNgayThanhToan, (parameter) => `p.thoi_gian_thanh_toan <= ${parameter}::timestamp`);

        let sql = `
            ${this.getBaseQuery()}
        `;

        if (conditions.length > 0) {
            sql += `
                WHERE
                    ${conditions.join('\nAND ')}
            `;
        }

        sql += `

            ORDER BY

                tdn.ngay DESC,

                v.phieu_lay_ve_id DESC,

                v.so_thu_tu ASC

        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapVeAn(row));
    }

    async getChiTiet(id, db = pool) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE v.id = $1

            LIMIT 1
        `;

        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapVeAn(result.rows[0]);
    }

    async getByQrToken(qrToken, db = pool) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE v.qr_token = $1

            LIMIT 1
        `;

        const result = await db.query(sql, [qrToken]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapVeAn(result.rows[0]);
    }

    async xacNhanSuDung(id, nguoiXacNhanId, trangThai, db = pool) {
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

        const result = await db.query(sql, [id, trangThai, nguoiXacNhanId]);

        return result.rows[0] || null;
    }

    async huy(id, nguoiHuyId, lyDoHuy, trangThai, db = pool) {
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

        const result = await db.query(sql, [id, trangThai, nguoiHuyId, lyDoHuy]);

        return result.rows[0] || null;
    }

    async huyXacNhan(id, trangThaiHienTai, trangThaiMoi, db = pool) {
        const sql = `

        UPDATE ct_ve_an

        SET

            trang_thai = $3,

            thoi_gian_su_dung = NULL,

            nguoi_xac_nhan_id = NULL,

            updated_at = NOW()

        WHERE id = $1
          AND trang_thai = $2

        RETURNING id

    `;

        const result = await db.query(sql, [id, trangThaiHienTai, trangThaiMoi]);

        return result.rows[0] || null;
    }

    async huyHuy(id, trangThaiHienTai, trangThaiMoi, db = pool) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = $3,

                nguoi_huy_id = NULL,

                thoi_gian_huy = NULL,

                ly_do_huy = NULL,

                updated_at = NOW()

            WHERE id = $1
            AND trang_thai = $2

            RETURNING id

        `;

        const result = await db.query(sql, [id, trangThaiHienTai, trangThaiMoi]);

        return result.rows[0] || null;
    }

    async hetHan(id, trangThai, db = pool) {
        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = $2,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;

        const result = await db.query(sql, [id, trangThai]);

        return result.rows[0] || null;
    }
}

module.exports = new VeAnRepository();

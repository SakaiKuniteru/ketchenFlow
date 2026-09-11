const pool = require('../../../../config/database');

class KhungGioNhanHangRepository {
    mapKhungGioNhanHang(row) {
        if (!row) {
            return null;
        }

        const soDonToiDa =
            row.so_don_toi_da !== null && row.so_don_toi_da !== undefined
                ? String(row.so_don_toi_da)
                      .replace(/(\.\d*?)0+$/, '$1')
                      .replace(/\.$/, '')
                : null;

        const soDonDaDat = Number(row.so_don_da_dat || 0);

        return {
            id: row.id,

            maKhungGio: row.ma_khung_gio,

            tenKhungGio: row.ten_khung_gio,

            coSoId: row.co_so_id,

            maCoSo: row.ma_co_so,

            tenCoSo: row.ten_co_so,

            gioBatDau: row.gio_bat_dau,

            gioKetThuc: row.gio_ket_thuc,

            soDonToiDa,

            soDonDaDat,

            soChoConLai: soDonToiDa === null ? null : Math.max(soDonToiDa - soDonDaDat, 0),

            thoiGianNhanTu: row.thoi_gian_nhan_tu,

            thoiGianNhanDen: row.thoi_gian_nhan_den,

            thoiGianDatMuonNhat: row.thoi_gian_dat_muon_nhat,

            conThoiGianDat: row.con_thoi_gian_dat,

            active: row.active,

            createdAt: row.created_at,

            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `

            SELECT

                kg.id,
                kg.ma_khung_gio,
                kg.ten_khung_gio,
                kg.co_so_id,
                kg.gio_bat_dau,
                kg.gio_ket_thuc,
                kg.so_don_toi_da,
                kg.active,
                kg.created_at,
                kg.updated_at,

                cs.ma_co_so,
                cs.ten_co_so

            FROM dm_khung_gio_nhan_hang kg

            JOIN dm_co_so cs
                ON cs.id =
                    kg.co_so_id

        `;
    }

    async getTongHop(query = {}) {
        const values = [];

        const conditions = [];

        if (query.keyword) {
            values.push(`%${String(query.keyword).trim()}%`);

            conditions.push(`
                (
                    kg.ma_khung_gio
                        ILIKE $${values.length}

                    OR kg.ten_khung_gio
                        ILIKE $${values.length}
                )
            `);
        }

        if (query.coSoId !== undefined && query.coSoId !== '') {
            values.push(Number(query.coSoId));

            conditions.push(`kg.co_so_id = $${values.length}`);
        }

        if (query.active !== undefined && query.active !== '') {
            values.push(String(query.active) === 'true');

            conditions.push(`kg.active = $${values.length}`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            ${this.getBaseQuery()}

            ${where}

            ORDER BY
                cs.ten_co_so ASC,
                kg.gio_bat_dau ASC,
                kg.gio_ket_thuc ASC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapKhungGioNhanHang(row));
    }

    async getChiTiet(id, client = pool) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE kg.id = $1

            LIMIT 1
        `;

        const result = await client.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapKhungGioNhanHang(result.rows[0]);
    }

    async existsCoSo(coSoId) {
        const sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_co_so
                WHERE id = $1
                    AND active = TRUE

            ) AS "exists"
        `;

        const result = await pool.query(sql, [coSoId]);

        return result.rows[0].exists;
    }

    async existsMaKhungGio(coSoId, maKhungGio, excludeId = null) {
        const values = [coSoId, maKhungGio];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_khung_gio_nhan_hang
                WHERE co_so_id = $1

                    AND UPPER(
                        TRIM(ma_khung_gio)
                    ) = UPPER(
                        TRIM($2)
                    )
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $3
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async existsTenKhungGio(coSoId, tenKhungGio, excludeId = null) {
        const values = [coSoId, tenKhungGio];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_khung_gio_nhan_hang
                WHERE co_so_id = $1

                    AND LOWER(
                        TRIM(ten_khung_gio)
                    ) = LOWER(
                        TRIM($2)
                    )
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $3
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async existsKhungGioGiaoNhau(coSoId, gioBatDau, gioKetThuc, excludeId = null) {
        const values = [coSoId, gioBatDau, gioKetThuc];

        let sql = `
            SELECT EXISTS (

                SELECT 1
                FROM dm_khung_gio_nhan_hang
                WHERE co_so_id = $1
                    AND active = TRUE

                    AND gio_bat_dau < $3::TIME
                    AND gio_ket_thuc > $2::TIME
        `;

        if (excludeId) {
            values.push(excludeId);

            sql += `
                AND id <> $4
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await pool.query(sql, values);

        return result.rows[0].exists;
    }

    async getKhungGioKhaDung(coSoId, ngayNhan, soPhutDatTruoc, dsTrangThaiLoaiTru) {
        const sql = `

            SELECT

                kg.id,
                kg.ma_khung_gio,
                kg.ten_khung_gio,
                kg.co_so_id,
                kg.gio_bat_dau,
                kg.gio_ket_thuc,
                kg.so_don_toi_da,
                kg.active,
                kg.created_at,
                kg.updated_at,

                cs.ma_co_so,
                cs.ten_co_so,

                COALESCE(
                    thong_ke.so_don_da_dat,
                    0
                ) AS so_don_da_dat,

                (
                    $2::DATE +
                    kg.gio_bat_dau
                ) AS thoi_gian_nhan_tu,

                (
                    $2::DATE +
                    kg.gio_ket_thuc
                ) AS thoi_gian_nhan_den,

                (
                    $2::DATE +
                    kg.gio_bat_dau -
                    (
                        $3 *
                        INTERVAL '1 minute'
                    )
                ) AS thoi_gian_dat_muon_nhat,

                (
                    (
                        $2::DATE +
                        kg.gio_bat_dau
                    ) >= (
                        CURRENT_TIMESTAMP +
                        (
                            $3 *
                            INTERVAL '1 minute'
                        )
                    )
                ) AS con_thoi_gian_dat

            FROM dm_khung_gio_nhan_hang kg

            JOIN dm_co_so cs
                ON cs.id =
                    kg.co_so_id

            LEFT JOIN LATERAL (

                SELECT
                    COUNT(*)::INTEGER
                        AS so_don_da_dat

                FROM nv_don_hang dh

                WHERE dh.khung_gio_nhan_id =
                    kg.id

                    AND dh.thoi_gian_nhan_tu::DATE =
                        $2::DATE

                    AND NOT (
                        dh.trang_thai =
                        ANY(
                            $4::INTEGER[]
                        )
                    )

            ) thong_ke
                ON TRUE

            WHERE kg.co_so_id = $1
                AND kg.active = TRUE

                AND (
                    $2::DATE +
                    kg.gio_bat_dau
                ) >= (
                    CURRENT_TIMESTAMP +
                    (
                        $3 *
                        INTERVAL '1 minute'
                    )
                )

                AND (
                    kg.so_don_toi_da IS NULL

                    OR COALESCE(
                        thong_ke.so_don_da_dat,
                        0
                    ) < kg.so_don_toi_da
                )

            ORDER BY
                kg.gio_bat_dau ASC,
                kg.gio_ket_thuc ASC

        `;

        const values = [coSoId, ngayNhan, soPhutDatTruoc, dsTrangThaiLoaiTru];

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapKhungGioNhanHang(row));
    }

    async getKhungGioDeDat(id, coSoId, ngayNhan, soPhutDatTruoc, dsTrangThaiLoaiTru, client = pool) {
        const sql = `

            SELECT

                kg.id,
                kg.ma_khung_gio,
                kg.ten_khung_gio,
                kg.co_so_id,
                kg.gio_bat_dau,
                kg.gio_ket_thuc,
                kg.so_don_toi_da,
                kg.active,
                kg.created_at,
                kg.updated_at,

                cs.ma_co_so,
                cs.ten_co_so,

                COALESCE(
                    thong_ke.so_don_da_dat,
                    0
                ) AS so_don_da_dat,

                (
                    $3::DATE +
                    kg.gio_bat_dau
                ) AS thoi_gian_nhan_tu,

                (
                    $3::DATE +
                    kg.gio_ket_thuc
                ) AS thoi_gian_nhan_den,

                (
                    $3::DATE +
                    kg.gio_bat_dau -
                    (
                        $4 *
                        INTERVAL '1 minute'
                    )
                ) AS thoi_gian_dat_muon_nhat,

                (
                    (
                        $3::DATE +
                        kg.gio_bat_dau
                    ) >= (
                        CURRENT_TIMESTAMP +
                        (
                            $4 *
                            INTERVAL '1 minute'
                        )
                    )
                ) AS con_thoi_gian_dat

            FROM dm_khung_gio_nhan_hang kg

            JOIN dm_co_so cs
                ON cs.id =
                    kg.co_so_id

            LEFT JOIN LATERAL (

                SELECT
                    COUNT(*)::INTEGER
                        AS so_don_da_dat

                FROM nv_don_hang dh

                WHERE dh.khung_gio_nhan_id =
                    kg.id

                    AND dh.thoi_gian_nhan_tu::DATE =
                        $3::DATE

                    AND NOT (
                        dh.trang_thai =
                        ANY(
                            $5::INTEGER[]
                        )
                    )

            ) thong_ke
                ON TRUE

            WHERE kg.id = $1
                AND kg.co_so_id = $2
                AND kg.active = TRUE

            LIMIT 1

            FOR UPDATE OF kg

        `;

        const values = [id, coSoId, ngayNhan, soPhutDatTruoc, dsTrangThaiLoaiTru];

        const result = await client.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapKhungGioNhanHang(result.rows[0]);
    }

    async create(data) {
        const sql = `
            INSERT INTO dm_khung_gio_nhan_hang (

                ma_khung_gio,
                ten_khung_gio,
                co_so_id,
                gio_bat_dau,
                gio_ket_thuc,
                so_don_toi_da,
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
                NOW(),
                NOW()

            )
            RETURNING id
        `;

        const values = [
            data.maKhungGio,
            data.tenKhungGio,
            data.coSoId,
            data.gioBatDau,
            data.gioKetThuc,
            data.soDonToiDa,
            data.active
        ];

        const result = await pool.query(sql, values);

        return await this.getChiTiet(result.rows[0].id);
    }

    async update(id, data) {
        const sql = `
            UPDATE dm_khung_gio_nhan_hang
            SET

                ma_khung_gio = $1,
                ten_khung_gio = $2,
                co_so_id = $3,
                gio_bat_dau = $4,
                gio_ket_thuc = $5,
                so_don_toi_da = $6,
                active = $7,
                updated_at = NOW()

            WHERE id = $8

            RETURNING id
        `;

        const values = [
            data.maKhungGio,
            data.tenKhungGio,
            data.coSoId,
            data.gioBatDau,
            data.gioKetThuc,
            data.soDonToiDa,
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

module.exports = new KhungGioNhanHangRepository();

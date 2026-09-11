const pool = require('../../../config/database');

class ThucDonRepository {
    mapThucDon(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            maThucDon: row.ma_thuc_don,
            tenThucDon: row.ten_thuc_don,
            loaiThucDon: row.loai_thuc_don,
            tuNgay: row.tu_ngay,
            denNgay: row.den_ngay,
            coSoId: row.co_so_id,
            coSo: row.co_so_id
                ? {
                      id: row.co_so_id,
                      maCoSo: row.ma_co_so,
                      tenCoSo: row.ten_co_so
                  }
                : null,
            nhaAnId: row.nha_an_id,
            nhaAn: row.nha_an_id
                ? {
                      id: row.nha_an_id,
                      maNhaAn: row.ma_nha_an,
                      tenNhaAn: row.ten_nha_an
                  }
                : null,
            caAnId: row.ca_an_id,
            caAn: row.ca_an_id
                ? {
                      id: row.ca_an_id,
                      maCaAn: row.ma_ca_an,
                      tenCaAn: row.ten_ca_an,
                      thoiGianBatDau: row.thoi_gian_bat_dau,
                      thoiGianKetThuc: row.thoi_gian_ket_thuc
                  }
                : null,
            trangThai: row.trang_thai,
            trangThaiTruocHuy: row.trang_thai_truoc_huy,
            trangThaiTruocKetThuc: row.trang_thai_truoc_ket_thuc,
            moTa: row.mo_ta,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    mapNgay(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            thucDonId: row.thuc_don_id,
            ngay: row.ngay,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    mapNhomMonAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            thucDonNgayId: row.thuc_don_ngay_id,
            nhomMonAnId: row.nhom_mon_an_id,
            nhomMonAn: row.nhom_mon_an_id
                ? {
                      id: row.nhom_mon_an_id,
                      maNhomMonAn: row.ma_nhom_mon_an,
                      tenNhomMonAn: row.ten_nhom_mon_an,
                      moTa: row.mo_ta_nhom_mon_an,
                      active: row.nhom_mon_an_active
                  }
                : null,
            thuTuHienThi: row.thu_tu_hien_thi,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    mapMonAn(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            thucDonNhomMonAnId: row.thuc_don_nhom_mon_an_id,
            monAnId: row.mon_an_id,
            monAn: row.mon_an_id
                ? {
                      id: row.mon_an_id,
                      maMonAn: row.ma_mon_an,
                      tenMonAn: row.ten_mon_an,
                      nhomMonAnId: row.mon_an_nhom_mon_an_id,
                      giaTien: row.gia_tien !== null ? Number(row.gia_tien) : null,
                      giaDuKien: row.gia_du_kien !== null ? Number(row.gia_du_kien) : null,
                      calories: row.calories,
                      moTa: row.mo_ta_mon_an,
                      hinhAnh: row.hinh_anh,
                      active: row.mon_an_active
                  }
                : null,
            thuTuHienThi: row.thu_tu_hien_thi,
            dinhLuong: row.dinh_luong !== null ? Number(row.dinh_luong) : null,
            donViTinhId: row.don_vi_tinh_id,
            donViTinh: row.don_vi_tinh_id
                ? {
                      id: row.don_vi_tinh_id,
                      maDonViTinh: row.ma_don_vi_tinh,
                      tenDonViTinh: row.ten_don_vi_tinh,
                      kyHieu: row.ky_hieu,
                      loaiDonVi: row.loai_don_vi,
                      active: row.don_vi_tinh_active
                  }
                : null,
            ghiChu: row.ghi_chu,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                td.id,
                td.ma_thuc_don,
                td.ten_thuc_don,
                td.loai_thuc_don,
                (
                    TO_CHAR(
                        td.tu_ngay,
                        'YYYY-MM-DD"T"HH24:MI:SS'
                    ) ||
                    '+07:00'
                ) AS tu_ngay,

                (
                    TO_CHAR(
                        td.den_ngay,
                        'YYYY-MM-DD"T"HH24:MI:SS'
                    ) ||
                    '+07:00'
                ) AS den_ngay,
                td.co_so_id,
                td.nha_an_id,
                td.ca_an_id,
                td.trang_thai,
                td.trang_thai_truoc_huy,
                td.trang_thai_truoc_ket_thuc,
                td.mo_ta,
                td.active,
                td.created_at,
                td.updated_at,
                cs.ma_co_so,
                cs.ten_co_so,
                na.ma_nha_an,
                na.ten_nha_an,
                ca.ma_ca_an,
                ca.ten_ca_an,
                ca.thoi_gian_bat_dau,
                ca.thoi_gian_ket_thuc
            FROM nv_thuc_don td
            LEFT JOIN dm_co_so cs
                ON cs.id = td.co_so_id
            LEFT JOIN dm_nha_an na
                ON na.id = td.nha_an_id
            LEFT JOIN dm_ca_an ca
                ON ca.id = td.ca_an_id
        `;
    }

    async getTongHop(query = {}) {
        const conditions = [];
        const values = [];

        const addValue = (value) => {
            values.push(value);

            return `$${values.length}`;
        };

        const keyword = String(query.keyword || '').trim();

        if (keyword) {
            const param = addValue(`%${keyword}%`);

            conditions.push(
                `
                    (
                        LOWER(
                            td.ma_thuc_don
                        )
                        LIKE LOWER(
                            ${param}
                        )
                        OR
                        LOWER(
                            td.ten_thuc_don
                        )
                        LIKE LOWER(
                            ${param}
                        )
                    )
                `
            );
        }

        if (query.loaiThucDon) {
            const valuesFilter = String(query.loaiThucDon).split(',').map(Number).filter(Number.isInteger);

            if (valuesFilter.length) {
                const param = addValue(valuesFilter);

                conditions.push(
                    `
                        td.loai_thuc_don =
                        ANY(
                            ${param}::smallint[]
                        )
                    `
                );
            }
        }

        if (query.coSoId) {
            const valuesFilter = String(query.coSoId).split(',').map(Number).filter(Number.isInteger);

            if (valuesFilter.length) {
                const param = addValue(valuesFilter);

                conditions.push(
                    `
                        td.co_so_id =
                        ANY(
                            ${param}::integer[]
                        )
                    `
                );
            }
        }

        if (query.nhaAnId) {
            const valuesFilter = String(query.nhaAnId).split(',').map(Number).filter(Number.isInteger);

            if (valuesFilter.length) {
                const param = addValue(valuesFilter);

                conditions.push(
                    `
                        td.nha_an_id =
                        ANY(
                            ${param}::integer[]
                        )
                    `
                );
            }
        }

        if (query.caAnId) {
            const valuesFilter = String(query.caAnId).split(',').map(Number).filter(Number.isInteger);

            if (valuesFilter.length) {
                const param = addValue(valuesFilter);

                conditions.push(
                    `
                        td.ca_an_id =
                        ANY(
                            ${param}::integer[]
                        )
                    `
                );
            }
        }

        if (query.trangThai) {
            const valuesFilter = String(query.trangThai).split(',').map(Number).filter(Number.isInteger);

            if (valuesFilter.length) {
                const param = addValue(valuesFilter);

                conditions.push(
                    `
                        td.trang_thai =
                        ANY(
                            ${param}::smallint[]
                        )
                    `
                );
            }
        }

        const whereClause = conditions.length
            ? `
                    WHERE
                        ${conditions.join('\nAND\n')}
                `
            : '';

        const sql = `
            ${this.getBaseQuery()}

            ${whereClause}

            ORDER BY
                td.tu_ngay DESC,
                td.ma_thuc_don ASC
        `;

        const result = await pool.query(sql, values);

        return result.rows.map((row) => this.mapThucDon(row));
    }

    async getThongTinChung(id, client = pool) {
        const sql = `
            ${this.getBaseQuery()}

            WHERE td.id = $1

            LIMIT 1
        `;

        const result = await client.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapThucDon(result.rows[0]);
    }

    async getDsNgay(thucDonId, client = pool) {
        const sql = `
            SELECT
                id,
                thuc_don_id,
                (
                    TO_CHAR(
                        ngay,
                        'YYYY-MM-DD'
                    ) ||
                    'T00:00:00+07:00'
                ) AS ngay,
                ghi_chu,
                active,
                created_at,
                updated_at
            FROM ct_thuc_don_ngay
            WHERE thuc_don_id = $1
            ORDER BY ngay ASC
        `;

        const result = await client.query(sql, [thucDonId]);

        return result.rows.map((row) => this.mapNgay(row));
    }

    async getDsNhomMonAn(thucDonId, client = pool) {
        const sql = `
            SELECT
                tdnma.id,
                tdnma.thuc_don_ngay_id,
                tdnma.nhom_mon_an_id,
                tdnma.thu_tu_hien_thi,
                tdnma.ghi_chu,
                tdnma.active,
                tdnma.created_at,
                tdnma.updated_at,
                nma.ma_nhom_mon_an,
                nma.ten_nhom_mon_an,
                nma.mo_ta
                    AS mo_ta_nhom_mon_an,
                nma.active
                    AS nhom_mon_an_active
            FROM ct_thuc_don_nhom_mon_an tdnma
            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                    tdnma.thuc_don_ngay_id
            LEFT JOIN dm_nhom_mon_an nma
                ON nma.id =
                    tdnma.nhom_mon_an_id
            WHERE tdn.thuc_don_id = $1
            ORDER BY
                tdn.ngay ASC,
                COALESCE(
                    tdnma.thu_tu_hien_thi,
                    999999
                ) ASC,
                nma.ma_nhom_mon_an ASC
        `;

        const result = await client.query(sql, [thucDonId]);

        return result.rows.map((row) => this.mapNhomMonAn(row));
    }

    async getDsMonAn(thucDonId, client = pool) {
        const sql = `
            SELECT
                tdma.id,
                tdma.thuc_don_nhom_mon_an_id,
                tdma.mon_an_id,
                tdma.thu_tu_hien_thi,
                tdma.dinh_luong,
                tdma.don_vi_tinh_id,
                tdma.ghi_chu,
                tdma.active,
                tdma.created_at,
                tdma.updated_at,
                ma.ma_mon_an,
                ma.ten_mon_an,
                ma.nhom_mon_an_id
                    AS mon_an_nhom_mon_an_id,
                ma.gia_tien,
                ma.gia_du_kien,
                ma.calories,
                ma.mo_ta
                    AS mo_ta_mon_an,
                ma.hinh_anh,
                ma.active
                    AS mon_an_active,
                dvt.ma_don_vi_tinh,
                dvt.ten_don_vi_tinh,
                dvt.ky_hieu,
                dvt.loai_don_vi,
                dvt.active
                    AS don_vi_tinh_active
            FROM ct_thuc_don_mon_an tdma
            INNER JOIN
                ct_thuc_don_nhom_mon_an tdnma
                ON tdnma.id =
                    tdma.thuc_don_nhom_mon_an_id
            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id =
                    tdnma.thuc_don_ngay_id
            LEFT JOIN dm_mon_an ma
                ON ma.id =
                    tdma.mon_an_id
            LEFT JOIN dm_don_vi_tinh dvt
                ON dvt.id =
                    tdma.don_vi_tinh_id
            WHERE tdn.thuc_don_id = $1
            ORDER BY
                tdn.ngay ASC,
                COALESCE(
                    tdnma.thu_tu_hien_thi,
                    999999
                ) ASC,
                COALESCE(
                    tdma.thu_tu_hien_thi,
                    999999
                ) ASC,
                ma.ma_mon_an ASC
        `;

        const result = await client.query(sql, [thucDonId]);

        return result.rows.map((row) => this.mapMonAn(row));
    }

    async getChiTiet(id, client = pool) {
        const thucDon = await this.getThongTinChung(id, client);

        if (!thucDon) {
            return null;
        }

        const [dsNgay, dsNhomMonAn, dsMonAn] = await Promise.all([
            this.getDsNgay(id, client),
            this.getDsNhomMonAn(id, client),
            this.getDsMonAn(id, client)
        ]);

        const mapMonTheoNhom = new Map();

        for (const monAn of dsMonAn) {
            const key = Number(monAn.thucDonNhomMonAnId);

            if (!mapMonTheoNhom.has(key)) {
                mapMonTheoNhom.set(key, []);
            }

            mapMonTheoNhom.get(key).push(monAn);
        }

        const mapNhomTheoNgay = new Map();

        for (const nhom of dsNhomMonAn) {
            const key = Number(nhom.thucDonNgayId);

            if (!mapNhomTheoNgay.has(key)) {
                mapNhomTheoNgay.set(key, []);
            }

            const dsMon = mapMonTheoNhom.get(Number(nhom.id)) || [];

            mapNhomTheoNgay.get(key).push({
                ...nhom,
                dsMonAnId: dsMon.map((item) => item.monAnId),
                dsMonAn: dsMon
            });
        }

        const danhSachNgay = dsNgay.map((ngay) => {
            const dsNhom = mapNhomTheoNgay.get(Number(ngay.id)) || [];

            return {
                ...ngay,
                dsNhomMonAnId: dsNhom.map((item) => item.nhomMonAnId),
                dsNhomMonAn: dsNhom
            };
        });

        return {
            ...thucDon,
            dsNgay: danhSachNgay
        };
    }

    async getChiTietByMa(maThucDon, client = pool) {
        const sql = `
            SELECT id
            FROM nv_thuc_don
            WHERE UPPER(TRIM(ma_thuc_don))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maThucDon]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id, client);
    }

    async existsMaThucDon(maThucDon, excludeId = null, client = pool) {
        const values = [maThucDon];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM nv_thuc_don
                WHERE UPPER(
                    TRIM(
                        ma_thuc_don
                    )
                ) = UPPER(
                    TRIM(
                        $1
                    )
                )
        `;

        if (excludeId !== null && excludeId !== undefined) {
            values.push(excludeId);

            sql += `
                AND id <> $2
            `;
        }

        sql += `
            ) AS "exists"
        `;

        const result = await client.query(sql, values);

        return result.rows[0].exists;
    }

    async existsCoSo(coSoId, client = pool) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_co_so
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await client.query(sql, [coSoId]);

        return result.rows[0].exists;
    }

    async existsNhaAn(nhaAnId, coSoId, client = pool) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nha_an
                WHERE id = $1
                AND co_so_id = $2
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await client.query(sql, [nhaAnId, coSoId]);

        return result.rows[0].exists;
    }

    async existsCaAn(caAnId, client = pool) {
        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_ca_an
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await client.query(sql, [caAnId]);

        return result.rows[0].exists;
    }

    async getNhomMonAnById(nhomMonAnId, client = pool) {
        const sql = `
            SELECT
                id,
                ma_nhom_mon_an,
                ten_nhom_mon_an,
                mo_ta,
                active
            FROM dm_nhom_mon_an
            WHERE id = $1
            LIMIT 1
        `;

        const result = await client.query(sql, [nhomMonAnId]);

        return result.rows[0] || null;
    }

    async getMonAnById(monAnId, client = pool) {
        const sql = `
            SELECT
                id,
                ma_mon_an,
                ten_mon_an,
                nhom_mon_an_id,
                active
            FROM dm_mon_an
            WHERE id = $1
            LIMIT 1
        `;

        const result = await client.query(sql, [monAnId]);

        return result.rows[0] || null;
    }

    async existsDonViTinh(donViTinhId, client = pool) {
        if (donViTinhId === null || donViTinhId === undefined) {
            return true;
        }

        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_don_vi_tinh
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result = await client.query(sql, [donViTinhId]);

        return result.rows[0].exists;
    }

    async getCoSoByMa(maCoSo, client = pool) {
        const sql = `
            SELECT
                id,
                ma_co_so,
                ten_co_so,
                active
            FROM dm_co_so
            WHERE UPPER(TRIM(ma_co_so))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maCoSo]);

        return result.rows[0] || null;
    }

    async getNhaAnByMa(maNhaAn, coSoId, client = pool) {
        const sql = `
            SELECT
                id,
                ma_nha_an,
                ten_nha_an,
                co_so_id,
                active
            FROM dm_nha_an
            WHERE UPPER(TRIM(ma_nha_an))
                = UPPER(TRIM($1))
            AND co_so_id = $2
            LIMIT 1
        `;

        const result = await client.query(sql, [maNhaAn, coSoId]);

        return result.rows[0] || null;
    }

    async getCaAnByMa(maCaAn, client = pool) {
        const sql = `
            SELECT
                id,
                ma_ca_an,
                ten_ca_an,
                active
            FROM dm_ca_an
            WHERE UPPER(TRIM(ma_ca_an))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maCaAn]);

        return result.rows[0] || null;
    }

    async getNhomMonAnByMa(maNhomMonAn, client = pool) {
        const sql = `
            SELECT
                id,
                ma_nhom_mon_an,
                ten_nhom_mon_an,
                mo_ta,
                active
            FROM dm_nhom_mon_an
            WHERE UPPER(TRIM(ma_nhom_mon_an))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maNhomMonAn]);

        return result.rows[0] || null;
    }

    async getMonAnByMa(maMonAn, client = pool) {
        const sql = `
            SELECT
                id,
                ma_mon_an,
                ten_mon_an,
                nhom_mon_an_id,
                active
            FROM dm_mon_an
            WHERE UPPER(TRIM(ma_mon_an))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maMonAn]);

        return result.rows[0] || null;
    }

    async getDonViTinhByMa(maDonViTinh, client = pool) {
        const sql = `
            SELECT
                id,
                ma_don_vi_tinh,
                ten_don_vi_tinh,
                active
            FROM dm_don_vi_tinh
            WHERE UPPER(TRIM(ma_don_vi_tinh))
                = UPPER(TRIM($1))
            LIMIT 1
        `;

        const result = await client.query(sql, [maDonViTinh]);

        return result.rows[0] || null;
    }

    async createThucDon(client, data) {
        const sql = `
            INSERT INTO nv_thuc_don (
                ma_thuc_don,
                ten_thuc_don,
                loai_thuc_don,
                tu_ngay,
                den_ngay,
                co_so_id,
                nha_an_id,
                ca_an_id,
                trang_thai,
                mo_ta,
                active,
                created_at,
                updated_at
            )
            VALUES (
                $1,
                $2,
                $3,
                (
                    $4::timestamptz
                    AT TIME ZONE
                    'Asia/Ho_Chi_Minh'
                ),

                (
                    $5::timestamptz
                    AT TIME ZONE
                    'Asia/Ho_Chi_Minh'
                ),
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [
            data.maThucDon,
            data.tenThucDon,
            data.loaiThucDon,
            data.tuNgay,
            data.denNgay,
            data.coSoId,
            data.nhaAnId,
            data.caAnId ?? null,
            data.trangThai !== undefined ? data.trangThai : 10,
            data.moTa || null,
            data.active !== undefined ? data.active : true
        ];

        const result = await client.query(sql, values);

        return result.rows[0].id;
    }

    async createNgay(client, thucDonId, data) {
        const sql = `
            INSERT INTO ct_thuc_don_ngay (
                thuc_don_id,
                ngay,
                ghi_chu,
                active,
                created_at,
                updated_at
            )
            VALUES (
                $1,
                (
                    (
                        $2::timestamptz
                        AT TIME ZONE
                        'Asia/Ho_Chi_Minh'
                    )::date
                ),
                $3,
                $4,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const result = await client.query(sql, [
            thucDonId,
            data.ngay,
            data.ghiChu || null,
            data.active !== undefined ? data.active : true
        ]);

        return result.rows[0].id;
    }

    async createNhomMonAn(client, thucDonNgayId, data) {
        const sql = `
            INSERT INTO ct_thuc_don_nhom_mon_an (
                thuc_don_ngay_id,
                nhom_mon_an_id,
                thu_tu_hien_thi,
                ghi_chu,
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
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const result = await client.query(sql, [
            thucDonNgayId,
            data.nhomMonAnId,
            data.thuTuHienThi ?? null,
            data.ghiChu || null,
            data.active !== undefined ? data.active : true
        ]);

        return result.rows[0].id;
    }

    async createMonAn(client, thucDonNhomMonAnId, data) {
        const sql = `
            INSERT INTO ct_thuc_don_mon_an (
                thuc_don_nhom_mon_an_id,
                mon_an_id,
                thu_tu_hien_thi,
                dinh_luong,
                don_vi_tinh_id,
                ghi_chu,
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

        const result = await client.query(sql, [
            thucDonNhomMonAnId,
            data.monAnId,
            data.thuTuHienThi ?? null,
            data.dinhLuong ?? null,
            data.donViTinhId ?? null,
            data.ghiChu || null,
            data.active !== undefined ? data.active : true
        ]);

        return result.rows[0].id;
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const thucDonId = await this.createThucDon(client, data);

            for (const ngay of data.dsNgay || []) {
                const thucDonNgayId = await this.createNgay(client, thucDonId, ngay);

                for (const nhom of ngay.dsNhomMonAn || []) {
                    const thucDonNhomMonAnId = await this.createNhomMonAn(client, thucDonNgayId, nhom);

                    for (const mon of nhom.dsMonAn || []) {
                        await this.createMonAn(client, thucDonNhomMonAnId, mon);
                    }
                }
            }

            await client.query('COMMIT');

            return await this.getChiTiet(thucDonId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async updateThucDon(client, id, data) {
        const sql = `
            UPDATE nv_thuc_don
            SET
                ma_thuc_don = $1,
                ten_thuc_don = $2,
                loai_thuc_don = $3,
                tu_ngay = (
                    $4::timestamptz
                    AT TIME ZONE
                    'Asia/Ho_Chi_Minh'
                ),

                den_ngay = (
                    $5::timestamptz
                    AT TIME ZONE
                    'Asia/Ho_Chi_Minh'
                ),
                co_so_id = $6,
                nha_an_id = $7,
                ca_an_id = $8,
                trang_thai = $9,
                mo_ta = $10,
                active = $11,
                updated_at = NOW()
            WHERE id = $12
            RETURNING id
        `;

        const result = await client.query(sql, [
            data.maThucDon,
            data.tenThucDon,
            data.loaiThucDon,
            data.tuNgay,
            data.denNgay,
            data.coSoId,
            data.nhaAnId,
            data.caAnId ?? null,
            data.trangThai,
            data.moTa || null,
            data.active,
            id
        ]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].id;
    }

    async deleteChiTiet(client, thucDonId) {
        await client.query(
            `
                DELETE FROM ct_thuc_don_ngay
                WHERE thuc_don_id = $1
            `,
            [thucDonId]
        );
    }

    async update(id, data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const thucDonId = await this.updateThucDon(client, id, data);

            if (!thucDonId) {
                await client.query('ROLLBACK');

                return null;
            }

            if (data.dsNgay !== undefined) {
                await this.deleteChiTiet(client, id);

                for (const ngay of data.dsNgay || []) {
                    const thucDonNgayId = await this.createNgay(client, id, ngay);

                    for (const nhom of ngay.dsNhomMonAn || []) {
                        const thucDonNhomMonAnId = await this.createNhomMonAn(client, thucDonNgayId, nhom);

                        for (const mon of nhom.dsMonAn || []) {
                            await this.createMonAn(client, thucDonNhomMonAnId, mon);
                        }
                    }
                }
            }

            await client.query('COMMIT');

            return await this.getChiTiet(id);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async xoa(id) {
        const sql = `
            DELETE FROM nv_thuc_don
            WHERE id = $1
            RETURNING id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            id: result.rows[0].id
        };
    }

    async duyet(id) {
        const sql = `
            UPDATE nv_thuc_don
            SET
                trang_thai = 30,
                updated_at = NOW()
            WHERE id = $1
            AND trang_thai IN (10, 20, 40)
            RETURNING id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }

    async existsBinhChonHieuLucTheoThucDon(thucDonId) {
        const result = await pool.query(
            `
                    SELECT 1

                    FROM ct_thuc_don_ngay tdn

                    INNER JOIN nv_dot_binh_chon dbc
                        ON dbc.thuc_don_ngay_id =
                        tdn.id

                    WHERE tdn.thuc_don_id = $1

                    AND dbc.trang_thai <> 30

                    LIMIT 1
                `,
            [thucDonId]
        );

        return result.rowCount > 0;
    }

    async huyDuyet(id) {
        const sql = `
            UPDATE nv_thuc_don td

            SET
                trang_thai = 40,
                updated_at = NOW()

            WHERE td.id = $1

            AND td.trang_thai = 30

            AND NOT EXISTS (

                SELECT 1

                FROM ct_thuc_don_ngay tdn

                INNER JOIN nv_dot_binh_chon dbc
                    ON dbc.thuc_don_ngay_id =
                        tdn.id

                WHERE tdn.thuc_don_id =
                        td.id

                    AND dbc.trang_thai <> 30

            )

            RETURNING td.id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }

    async huy(id) {
        const sql = `
            UPDATE nv_thuc_don
            SET
                trang_thai_truoc_huy = trang_thai,
                trang_thai = 50,
                updated_at = NOW()
            WHERE id = $1
            AND trang_thai IN (10, 20, 30, 40)
            RETURNING id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }

    async hoanHuy(id) {
        const sql = `
            UPDATE nv_thuc_don
            SET
                trang_thai = CASE
                    WHEN trang_thai_truoc_huy = 10 THEN 20
                    WHEN trang_thai_truoc_huy = 20 THEN 20
                    WHEN trang_thai_truoc_huy = 30 THEN 30
                    WHEN trang_thai_truoc_huy = 40 THEN 40
                    ELSE NULL
                END,
                trang_thai_truoc_huy = NULL,
                updated_at = NOW()
            WHERE id = $1
            AND trang_thai = 50
            AND trang_thai_truoc_huy IN (10, 20, 30, 40)
            RETURNING id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }

    async dongBoTrangThaiKetThuc(id = null) {
        const values = [];

        let dieuKienId = '';

        if (id !== null && id !== undefined) {
            values.push(id);

            dieuKienId = `
                AND id = $1
            `;
        }

        const sql = `
            UPDATE nv_thuc_don
            SET
                trang_thai_truoc_ket_thuc = trang_thai,
                trang_thai = 60,
                updated_at = NOW()
                WHERE den_ngay < (
                    CURRENT_TIMESTAMP
                    AT TIME ZONE
                    'Asia/Ho_Chi_Minh'
                )
            AND trang_thai IN (10, 20, 30, 40)
            ${dieuKienId}
        `;

        await pool.query(sql, values);
    }

    async khoiPhucTrangThaiKetThuc(id) {
        const sql = `
            UPDATE nv_thuc_don
            SET
                trang_thai = trang_thai_truoc_ket_thuc,
                trang_thai_truoc_ket_thuc = NULL,
                updated_at = NOW()
            WHERE id = $1
            AND trang_thai = 60
            AND den_ngay >= (
                CURRENT_TIMESTAMP
                AT TIME ZONE
                'Asia/Ho_Chi_Minh'
            )
            AND trang_thai_truoc_ket_thuc IN (10, 20, 30, 40)
            RETURNING id
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(result.rows[0].id);
    }
}

module.exports = new ThucDonRepository();

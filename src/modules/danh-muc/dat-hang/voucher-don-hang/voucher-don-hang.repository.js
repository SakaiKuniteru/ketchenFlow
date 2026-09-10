"use strict";

const pool = require("../../../../config/database");

const relationMap = {
    nhomSanPhamIds: {
        detailKey: "dsNhomSanPham",
        relationTable:
            "ct_voucher_don_hang_nhom_san_pham",
        foreignKey:
            "nhom_san_pham_id",
        masterTable:
            "dm_nhom_san_pham",
        codeColumn:
            "ma_nhom_san_pham",
        nameColumn:
            "ten_nhom_san_pham",
        dataType:
            "BIGINT"
    },

    sanPhamIds: {
        detailKey: "dsSanPham",
        relationTable:
            "ct_voucher_don_hang_san_pham",
        foreignKey:
            "san_pham_id",
        masterTable:
            "dm_san_pham",
        codeColumn:
            "ma_san_pham",
        nameColumn:
            "ten_san_pham",
        dataType:
            "BIGINT"
    },

    coSoIds: {
        detailKey: "dsCoSo",
        relationTable:
            "ct_voucher_don_hang_co_so",
        foreignKey:
            "co_so_id",
        masterTable:
            "dm_co_so",
        codeColumn:
            "ma_co_so",
        nameColumn:
            "ten_co_so",
        dataType:
            "INTEGER"
    },

    nhaAnIds: {
        detailKey: "dsNhaAn",
        relationTable:
            "ct_voucher_don_hang_nha_an",
        foreignKey:
            "nha_an_id",
        masterTable:
            "dm_nha_an",
        codeColumn:
            "ma_nha_an",
        nameColumn:
            "ten_nha_an",
        dataType:
            "INTEGER"
    },

    phongBanIds: {
        detailKey: "dsPhongBan",
        relationTable:
            "ct_voucher_don_hang_phong_ban",
        foreignKey:
            "phong_ban_id",
        masterTable:
            "dm_phong_ban",
        codeColumn:
            "ma_phong_ban",
        nameColumn:
            "ten_phong_ban",
        dataType:
            "INTEGER"
    },

    chucVuIds: {
        detailKey: "dsChucVu",
        relationTable:
            "ct_voucher_don_hang_chuc_vu",
        foreignKey:
            "chuc_vu_id",
        masterTable:
            "dm_chuc_vu",
        codeColumn:
            "ma_chuc_vu",
        nameColumn:
            "ten_chuc_vu",
        dataType:
            "INTEGER"
    },

    nhanVienIds: {
        detailKey: "dsNhanVien",
        relationTable:
            "ct_voucher_don_hang_nhan_vien",
        foreignKey:
            "nhan_vien_id",
        masterTable:
            "dm_nhan_vien",
        codeColumn:
            "ma_nhan_vien",
        nameColumn:
            "ho_ten",
        dataType:
            "INTEGER"
    }
};

function toNumberOrNull(value) {
    return value === null ||
        value === undefined
        ? null
        : Number(value);
}

function toDecimalString(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const [whole, fraction = ""] = String(value).split(".");
    const decimals = fraction.replace(/0+$/, "");

    return whole + (decimals ? "." + decimals : "");
}

class VoucherDonHangRepository {

    mapVoucher(row) {
        if (!row) {
            return null;
        }

        return {
            id: Number(row.id),
            maVoucher: row.ma_voucher,
            tenVoucher: row.ten_voucher,
            moTa: row.mo_ta,
            loaiGiam: Number(row.loai_giam),
            giaTri:
                toDecimalString(row.gia_tri),

            giamToiDa:
                toDecimalString(row.giam_toi_da),

            giaTriDonHangToiThieu:
                toDecimalString(row.gia_tri_don_hang_toi_thieu),
            soLuongPhatHanh:
                toNumberOrNull(
                    row.so_luong_phat_hanh
                ),
            soLuotMoiNhanVien:
                toNumberOrNull(
                    row.so_luot_moi_nhan_vien
                ),
            phamViApDung:
                Number(row.pham_vi_ap_dung),
            choPhepDungChung:
                row.cho_phep_dung_chung,
            tuDongApDung:
                row.tu_dong_ap_dung,
            thoiGianBatDau:
                row.thoi_gian_bat_dau,
            thoiGianKetThuc:
                row.thoi_gian_ket_thuc,
            nguoiTaoId:
                Number(row.nguoi_tao_id),
            tenNguoiTao:
                row.ten_nguoi_tao,
            active:
                row.active,
            createdAt:
                row.created_at,
            updatedAt:
                row.updated_at
        };
    }

    getBaseQuery() {
        return `
            SELECT
                voucher.id,
                voucher.ma_voucher,
                voucher.ten_voucher,
                voucher.mo_ta,
                voucher.loai_giam,
                voucher.gia_tri,
                voucher.giam_toi_da,
                voucher.gia_tri_don_hang_toi_thieu,
                voucher.so_luong_phat_hanh,
                voucher.so_luot_moi_nhan_vien,
                voucher.pham_vi_ap_dung,
                voucher.cho_phep_dung_chung,
                voucher.tu_dong_ap_dung,
                voucher.thoi_gian_bat_dau,
                voucher.thoi_gian_ket_thuc,
                voucher.nguoi_tao_id,
                nhan_vien.ho_ten AS ten_nguoi_tao,
                voucher.active,
                voucher.created_at,
                voucher.updated_at
            FROM dm_voucher_don_hang voucher
            JOIN dm_nhan_vien nhan_vien
                ON nhan_vien.id =
                    voucher.nguoi_tao_id
        `;
    }

    async getTongHop(query = {}) {
        const conditions = [];
        const values = [];

        if (query.keyword) {
            values.push(
                `%${String(query.keyword).trim()}%`
            );

            conditions.push(`
                (
                    voucher.ma_voucher
                        ILIKE $${values.length}
                    OR voucher.ten_voucher
                        ILIKE $${values.length}
                )
            `);
        }

        if (query.loaiGiam !== undefined) {
            values.push(
                Number(query.loaiGiam)
            );

            conditions.push(`
                voucher.loai_giam =
                    $${values.length}
            `);
        }

        if (
            query.phamViApDung !==
            undefined
        ) {
            values.push(
                Number(query.phamViApDung)
            );

            conditions.push(`
                voucher.pham_vi_ap_dung =
                    $${values.length}
            `);
        }

        if (
            query.active !== undefined &&
            query.active !== ""
        ) {
            values.push(
                String(query.active) ===
                    "true"
            );

            conditions.push(`
                voucher.active =
                    $${values.length}
            `);
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        const sql = `
            ${this.getBaseQuery()}

            ${whereClause}

            ORDER BY
                voucher.created_at DESC,
                voucher.id DESC
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows.map(
            row => this.mapVoucher(row)
        );
    }

    async getChiTiet(
        id,
        client = pool
    ) {
        const result =
            await client.query(
                `
                    ${this.getBaseQuery()}

                    WHERE voucher.id = $1

                    LIMIT 1
                `,
                [id]
            );

        const voucher =
            this.mapVoucher(
                result.rows[0]
            );

        if (!voucher) {
            return null;
        }

        const relations =
            await Promise.all(
                Object.entries(
                    relationMap
                ).map(
                    async ([
                        key,
                        config
                    ]) => {
                        const relationResult =
                            await client.query(
                                `
                                    SELECT
                                        master.id,
                                        master.${config.codeColumn}
                                            AS ma,
                                        master.${config.nameColumn}
                                            AS ten,
                                        master.active
                                    FROM ${config.relationTable}
                                        relation
                                    JOIN ${config.masterTable}
                                        master
                                        ON master.id =
                                            relation.${config.foreignKey}
                                    WHERE
                                        relation.voucher_don_hang_id = $1
                                    ORDER BY
                                        master.${config.nameColumn}
                                `,
                                [id]
                            );

                        return {
                            key,
                            detailKey:
                                config.detailKey,
                            data:
                                relationResult.rows
                        };
                    }
                )
            );

        for (const relation of relations) {
            voucher[relation.key] =
                relation.data.map(
                    item => Number(item.id)
                );

            voucher[relation.detailKey] =
                relation.data.map(
                    item => ({
                        id: Number(item.id),
                        ma: item.ma,
                        ten: item.ten,
                        active: item.active
                    })
                );
        }

        return voucher;
    }

    async getChiTietByMa(
        maVoucher
    ) {
        const result =
            await pool.query(
                `
                    SELECT id
                    FROM dm_voucher_don_hang
                    WHERE UPPER(TRIM(ma_voucher)) =
                        UPPER(TRIM($1))
                    LIMIT 1
                `,
                [maVoucher]
            );

        if (result.rows.length === 0) {
            return null;
        }

        return this.getChiTiet(
            result.rows[0].id
        );
    }

    async existsMaVoucher(
        maVoucher,
        excludeId = null
    ) {
        const values = [maVoucher];

        let excludeCondition = "";

        if (excludeId) {
            values.push(excludeId);

            excludeCondition = `
                AND id <> $2
            `;
        }

        const result =
            await pool.query(
                `
                    SELECT EXISTS (
                        SELECT 1
                        FROM dm_voucher_don_hang
                        WHERE UPPER(TRIM(ma_voucher)) =
                            UPPER(TRIM($1))
                        ${excludeCondition}
                    ) AS "exists"
                `,
                values
            );

        return result.rows[0].exists;
    }

    async existsTenVoucher(
        tenVoucher,
        excludeId = null
    ) {
        const values = [tenVoucher];

        let excludeCondition = "";

        if (excludeId) {
            values.push(excludeId);

            excludeCondition = `
                AND id <> $2
            `;
        }

        const result =
            await pool.query(
                `
                    SELECT EXISTS (
                        SELECT 1
                        FROM dm_voucher_don_hang
                        WHERE LOWER(TRIM(ten_voucher)) =
                            LOWER(TRIM($1))
                        ${excludeCondition}
                    ) AS "exists"
                `,
                values
            );

        return result.rows[0].exists;
    }

    async getInvalidRelationIds(data) {
        const invalidRelations = [];

        for (
            const [key, config] of
            Object.entries(relationMap)
        ) {
            const ids = data[key] || [];

            if (ids.length === 0) {
                continue;
            }

            const result =
                await pool.query(
                    `
                        SELECT input.id
                        FROM UNNEST(
                            $1::${config.dataType}[]
                        ) AS input(id)
                        LEFT JOIN ${config.masterTable}
                            master
                            ON master.id = input.id
                            AND master.active = TRUE
                        WHERE master.id IS NULL
                    `,
                    [ids]
                );

            if (result.rows.length > 0) {
                invalidRelations.push({
                    key,
                    ids: result.rows.map(
                        item => Number(item.id)
                    )
                });
            }
        }

        return invalidRelations;
    }

    async saveRelations(
        client,
        voucherId,
        data
    ) {
        for (
            const [key, config] of
            Object.entries(relationMap)
        ) {
            await client.query(
                `
                    DELETE FROM ${config.relationTable}
                    WHERE voucher_don_hang_id = $1
                `,
                [voucherId]
            );

            const ids = data[key] || [];

            if (ids.length === 0) {
                continue;
            }

            await client.query(
                `
                    INSERT INTO ${config.relationTable} (
                        voucher_don_hang_id,
                        ${config.foreignKey}
                    )
                    SELECT
                        $1,
                        relation_id
                    FROM UNNEST(
                        $2::${config.dataType}[]
                    ) AS relation_id
                `,
                [
                    voucherId,
                    ids
                ]
            );
        }
    }

    async create(data) {
        return this.save(data);
    }

    async update(
        id,
        data
    ) {
        return this.save(
            data,
            id
        );
    }

    async save(
        data,
        id = null
    ) {
        const client =
            await pool.connect();

        try {
            await client.query("BEGIN");

            let voucherId = id;

            const values = [
                data.maVoucher,
                data.tenVoucher,
                data.moTa,
                data.loaiGiam,
                data.giaTri,
                data.giamToiDa,
                data.giaTriDonHangToiThieu,
                data.soLuongPhatHanh,
                data.soLuotMoiNhanVien,
                data.phamViApDung,
                data.choPhepDungChung,
                data.tuDongApDung,
                data.thoiGianBatDau,
                data.thoiGianKetThuc,
                data.active
            ];

            if (id) {
                await client.query(
                    `
                        UPDATE dm_voucher_don_hang
                        SET
                            ma_voucher = $1,
                            ten_voucher = $2,
                            mo_ta = $3,
                            loai_giam = $4,
                            gia_tri = $5,
                            giam_toi_da = $6,
                            gia_tri_don_hang_toi_thieu = $7,
                            so_luong_phat_hanh = $8,
                            so_luot_moi_nhan_vien = $9,
                            pham_vi_ap_dung = $10,
                            cho_phep_dung_chung = $11,
                            tu_dong_ap_dung = $12,
                            thoi_gian_bat_dau = $13,
                            thoi_gian_ket_thuc = $14,
                            active = $15,
                            updated_at = NOW()
                        WHERE id = $16
                    `,
                    [
                        ...values,
                        id
                    ]
                );
            } else {
                const result =
                    await client.query(
                        `
                            INSERT INTO dm_voucher_don_hang (
                                ma_voucher,
                                ten_voucher,
                                mo_ta,
                                loai_giam,
                                gia_tri,
                                giam_toi_da,
                                gia_tri_don_hang_toi_thieu,
                                so_luong_phat_hanh,
                                so_luot_moi_nhan_vien,
                                pham_vi_ap_dung,
                                cho_phep_dung_chung,
                                tu_dong_ap_dung,
                                thoi_gian_bat_dau,
                                thoi_gian_ket_thuc,
                                active,
                                nguoi_tao_id
                            )
                            VALUES (
                                $1, $2, $3, $4,
                                $5, $6, $7, $8,
                                $9, $10, $11, $12,
                                $13, $14, $15, $16
                            )
                            RETURNING id
                        `,
                        [
                            ...values,
                            data.nguoiTaoId
                        ]
                    );

                voucherId =
                    result.rows[0].id;
            }

            await this.saveRelations(
                client,
                voucherId,
                data
            );

            await client.query("COMMIT");

            return this.getChiTiet(
                voucherId
            );
        } catch (error) {
            await client.query("ROLLBACK");

            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports =
    new VoucherDonHangRepository();

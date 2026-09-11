'use strict';

const ApiError = require('../../../../../utils/api-error');
const pool = require('../../../../../config/database');
const { readExcel } = require('../../../../../helpers/excel/excel-reader');
const { toNumber } = require('../../../../../helpers/excel/excel-value');
const { createResultFile } = require('../../../../../helpers/excel/excel-result');
const { isTemplateValue } = require('../../../../../helpers/excel/excel-template');
const monAnService = require('../mon-an.service');
const { MA_BAO_CAO, HEADER_ROW, DATA_START_ROW } = require('../export/mon-an-cong-thuc.export');

function isEmpty(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function normalizeCode(value) {
    if (isEmpty(value)) {
        return undefined;
    }

    return String(value).trim().toUpperCase();
}

function parsePositiveInteger(value, fieldName) {
    if (isEmpty(value)) {
        return undefined;
    }

    const number = toNumber(value);

    if (number === null || !Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${fieldName} phải là số nguyên lớn hơn 0.`);
    }

    return number;
}

function parsePositiveNumber(value, fieldName) {
    if (isEmpty(value)) {
        return undefined;
    }

    const number = toNumber(value);

    if (number === null || !Number.isFinite(number) || number <= 0) {
        throw new ApiError(400, `${fieldName} phải là số lớn hơn 0.`);
    }

    return number;
}

function validateHeaders(headerMap) {
    const hasIdKey = headerMap.has('id/k');
    const hasMonAnKey = headerMap.has('monAnId/k') || headerMap.has('maMonAn/k');
    const hasThucPhamKey = headerMap.has('thucPhamId/k') || headerMap.has('maThucPham/k');

    if (!hasIdKey && !(hasMonAnKey && hasThucPhamKey)) {
        throw new ApiError(400, 'File import phải có id/k hoặc đầy đủ khóa xác định món ăn và thực phẩm.');
    }

    if (!headerMap.has('dinhLuong') && !headerMap.has('ghiChu') && !hasThucPhamKey) {
        throw new ApiError(400, 'File import không có trường dữ liệu có thể cập nhật.');
    }
}

function dongLaTemplate(row, getValue, headerMap) {
    for (const field of headerMap.keys()) {
        if (isTemplateValue(getValue(row, field))) {
            return true;
        }
    }

    return false;
}

function readItem(row, rowNumber, getValue, headerMap) {
    return {
        rowNumbers: [rowNumber],
        id: headerMap.has('id/k') ? getValue(row, 'id/k') : undefined,
        monAnId: headerMap.has('monAnId/k') ? getValue(row, 'monAnId/k') : undefined,
        maMonAn: headerMap.has('maMonAn/k') ? getValue(row, 'maMonAn/k') : undefined,
        thucPhamId: headerMap.has('thucPhamId/k') ? getValue(row, 'thucPhamId/k') : undefined,
        maThucPham: headerMap.has('maThucPham/k') ? getValue(row, 'maThucPham/k') : undefined,
        dinhLuong: headerMap.has('dinhLuong') ? getValue(row, 'dinhLuong') : undefined,
        ghiChu: headerMap.has('ghiChu') ? getValue(row, 'ghiChu') : undefined
    };
}

async function getMonAnById(db, id) {
    const result = await db.query(
        `
            SELECT
                id,
                ma_mon_an,
                ten_mon_an,
                active
            FROM dm_mon_an
            WHERE id = $1
            LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function getMonAnByMa(db, maMonAn) {
    const result = await db.query(
        `
            SELECT
                id,
                ma_mon_an,
                ten_mon_an,
                active
            FROM dm_mon_an
            WHERE UPPER(
                TRIM(
                    ma_mon_an
                )
            ) =
            UPPER(
                TRIM(
                    $1
                )
            )
            LIMIT 1
        `,
        [maMonAn]
    );

    return result.rows[0] || null;
}

async function getGiaMonAn(db, monAnId) {
    const result = await db.query(
        `
            SELECT
                id,
                gia_tien,
                gia_du_kien
            FROM dm_mon_an
            WHERE id = $1
            LIMIT 1
        `,
        [monAnId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, `Không tìm thấy món ăn ID ${monAnId}.`);
    }

    return {
        id: Number(result.rows[0].id),
        giaTien: result.rows[0].gia_tien !== null ? Number(result.rows[0].gia_tien) : null,
        giaDuKien: result.rows[0].gia_du_kien !== null ? Number(result.rows[0].gia_du_kien) : 0
    };
}

function formatTien(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return '0';
    }

    const hasDecimal = !Number.isInteger(number);

    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: hasDecimal ? 2 : 0,
        maximumFractionDigits: 5
    }).format(number);
}

async function getThucPhamById(db, id) {
    const result = await db.query(
        `
            SELECT
                id,
                ma_thuc_pham,
                ten_thuc_pham,
                active
            FROM dm_thuc_pham
            WHERE id = $1
            LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function getThucPhamByMa(db, maThucPham) {
    const result = await db.query(
        `
            SELECT
                id,
                ma_thuc_pham,
                ten_thuc_pham,
                active
            FROM dm_thuc_pham
            WHERE UPPER(
                TRIM(
                    ma_thuc_pham
                )
            ) =
            UPPER(
                TRIM(
                    $1
                )
            )
            LIMIT 1
        `,
        [maThucPham]
    );

    return result.rows[0] || null;
}

async function getChiTietById(db, id) {
    const result = await db.query(
        `
            SELECT
                id,
                mon_an_id,
                thuc_pham_id,
                dinh_luong,
                ghi_chu,
                active
            FROM ct_mon_an_thuc_pham
            WHERE id = $1
            LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function getChiTietByMonAnThucPham(db, monAnId, thucPhamId) {
    const result = await db.query(
        `
            SELECT
                id,
                mon_an_id,
                thuc_pham_id,
                dinh_luong,
                ghi_chu,
                active
            FROM ct_mon_an_thuc_pham
            WHERE mon_an_id = $1
            AND thuc_pham_id = $2
            LIMIT 1
        `,
        [monAnId, thucPhamId]
    );

    return result.rows[0] || null;
}

async function resolveMonAn(db, item, required = false) {
    const monAnId = parsePositiveInteger(item.monAnId, 'ID món ăn');

    const maMonAn = normalizeCode(item.maMonAn);

    if (monAnId === undefined && maMonAn === undefined) {
        if (required) {
            throw new ApiError(400, 'Phải cung cấp monAnId/k hoặc maMonAn/k.');
        }

        return null;
    }

    let theoId = null;
    let theoMa = null;

    if (monAnId !== undefined) {
        theoId = await getMonAnById(db, monAnId);

        if (!theoId) {
            throw new ApiError(404, `Không tìm thấy món ăn có ID ${monAnId}.`);
        }
    }

    if (maMonAn !== undefined) {
        theoMa = await getMonAnByMa(db, maMonAn);

        if (!theoMa) {
            throw new ApiError(404, `Không tìm thấy món ăn có mã "${maMonAn}".`);
        }
    }

    if (theoId && theoMa && Number(theoId.id) !== Number(theoMa.id)) {
        throw new ApiError(400, `ID món ăn ${monAnId} và mã món ăn "${maMonAn}" không cùng một món ăn.`);
    }

    return theoId || theoMa;
}

async function resolveThucPham(db, item, required = false) {
    const thucPhamId = parsePositiveInteger(item.thucPhamId, 'ID thực phẩm');

    const maThucPham = normalizeCode(item.maThucPham);

    if (thucPhamId === undefined && maThucPham === undefined) {
        if (required) {
            throw new ApiError(400, 'Phải cung cấp thucPhamId/k hoặc maThucPham/k.');
        }

        return null;
    }

    let theoId = null;
    let theoMa = null;

    if (thucPhamId !== undefined) {
        theoId = await getThucPhamById(db, thucPhamId);

        if (!theoId) {
            throw new ApiError(404, `Không tìm thấy thực phẩm có ID ${thucPhamId}.`);
        }
    }

    if (maThucPham !== undefined) {
        theoMa = await getThucPhamByMa(db, maThucPham);

        if (!theoMa) {
            throw new ApiError(404, `Không tìm thấy thực phẩm có mã "${maThucPham}".`);
        }
    }

    if (theoId && theoMa && Number(theoId.id) !== Number(theoMa.id)) {
        throw new ApiError(400, `ID thực phẩm ${thucPhamId} và mã thực phẩm "${maThucPham}" không cùng một thực phẩm.`);
    }

    const thucPham = theoId || theoMa;

    if (thucPham.active === false) {
        throw new ApiError(400, `Thực phẩm "${thucPham.ten_thuc_pham}" đã bị khóa.`);
    }

    return thucPham;
}

async function validateKhongTrungCap(db, monAnId, thucPhamId, excludeId = null) {
    const values = [monAnId, thucPhamId];

    let sql = `
        SELECT
            id
        FROM ct_mon_an_thuc_pham
        WHERE mon_an_id = $1
        AND thuc_pham_id = $2
    `;

    if (excludeId !== null) {
        values.push(excludeId);

        sql += `
            AND id <> $3
        `;
    }

    sql += `
        LIMIT 1
    `;

    const result = await db.query(sql, values);

    if (result.rows.length > 0) {
        throw new ApiError(409, 'Thực phẩm đã tồn tại trong công thức của món ăn.');
    }
}

async function updateById(db, chiTiet, item, thucPham) {
    const dinhLuong = parsePositiveNumber(item.dinhLuong, 'Định lượng');

    const hasGhiChu = !isEmpty(item.ghiChu);

    const thucPhamIdMoi = thucPham ? Number(thucPham.id) : Number(chiTiet.thuc_pham_id);

    if (Number(thucPhamIdMoi) !== Number(chiTiet.thuc_pham_id)) {
        await validateKhongTrungCap(db, chiTiet.mon_an_id, thucPhamIdMoi, chiTiet.id);
    }

    const result = await db.query(
        `
            UPDATE ct_mon_an_thuc_pham
            SET
                thuc_pham_id = $1,

                dinh_luong =
                    CASE
                        WHEN $2::boolean
                        THEN $3
                        ELSE dinh_luong
                    END,

                ghi_chu =
                    CASE
                        WHEN $4::boolean
                        THEN $5
                        ELSE ghi_chu
                    END,

                active = TRUE,

                updated_at = NOW()

            WHERE id = $6

            RETURNING
                id,
                mon_an_id,
                thuc_pham_id,
                dinh_luong,
                ghi_chu,
                active
        `,
        [
            thucPhamIdMoi,
            dinhLuong !== undefined,
            dinhLuong ?? null,
            hasGhiChu,
            hasGhiChu ? String(item.ghiChu).trim() : null,
            chiTiet.id
        ]
    );

    return result.rows[0];
}

async function upsertByPair(db, monAn, thucPham, item) {
    const existing = await getChiTietByMonAnThucPham(db, monAn.id, thucPham.id);

    const dinhLuong = parsePositiveNumber(item.dinhLuong, 'Định lượng');

    const hasGhiChu = !isEmpty(item.ghiChu);

    if (existing) {
        if (dinhLuong === undefined && !hasGhiChu) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await db.query(
            `
                UPDATE ct_mon_an_thuc_pham
                SET
                    dinh_luong =
                        CASE
                            WHEN $1::boolean
                            THEN $2
                            ELSE dinh_luong
                        END,

                    ghi_chu =
                        CASE
                            WHEN $3::boolean
                            THEN $4
                            ELSE ghi_chu
                        END,

                    active = TRUE,

                    updated_at = NOW()

                WHERE id = $5

                RETURNING
                    id,
                    mon_an_id,
                    thuc_pham_id,
                    dinh_luong,
                    ghi_chu,
                    active
            `,
            [
                dinhLuong !== undefined,
                dinhLuong ?? null,
                hasGhiChu,
                hasGhiChu ? String(item.ghiChu).trim() : null,
                existing.id
            ]
        );

        return {
            action: 'CAP_NHAT',
            record: result.rows[0]
        };
    }

    if (dinhLuong === undefined) {
        throw new ApiError(400, 'Thêm mới công thức phải có định lượng.');
    }

    const result = await db.query(
        `
            INSERT INTO ct_mon_an_thuc_pham (
                mon_an_id,
                thuc_pham_id,
                dinh_luong,
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
                TRUE,
                NOW(),
                NOW()
            )

            RETURNING
                id,
                mon_an_id,
                thuc_pham_id,
                dinh_luong,
                ghi_chu,
                active
        `,
        [monAn.id, thucPham.id, dinhLuong, hasGhiChu ? String(item.ghiChu).trim() : null]
    );

    return {
        action: 'THEM_MOI',
        record: result.rows[0]
    };
}

async function processItem(db, item) {
    const id = parsePositiveInteger(item.id, 'ID công thức');

    if (id !== undefined) {
        const chiTiet = await getChiTietById(db, id);

        if (!chiTiet) {
            throw new ApiError(404, `Không tìm thấy công thức món ăn có ID ${id}.`);
        }

        const monAn = await resolveMonAn(db, item, false);

        if (monAn && Number(monAn.id) !== Number(chiTiet.mon_an_id)) {
            throw new ApiError(400, `ID công thức ${id} không thuộc món ăn "${monAn.ma_mon_an}".`);
        }

        const thucPham = await resolveThucPham(db, item, false);

        const coDuLieuCapNhat = Boolean(thucPham) || !isEmpty(item.dinhLuong) || !isEmpty(item.ghiChu);

        if (!coDuLieuCapNhat) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await updateById(db, chiTiet, item, thucPham);

        return {
            rowNumbers: item.rowNumbers,
            id: result.id,
            monAnId: result.mon_an_id,
            thucPhamId: result.thuc_pham_id,
            hanhDong: 'CAP_NHAT',
            message: `Cập nhật công thức thành công - ID ${result.id}`
        };
    }

    const monAn = await resolveMonAn(db, item, true);

    const thucPham = await resolveThucPham(db, item, true);

    const result = await upsertByPair(db, monAn, thucPham, item);

    return {
        rowNumbers: item.rowNumbers,
        id: result.record.id,
        monAnId: result.record.mon_an_id,
        thucPhamId: result.record.thuc_pham_id,
        hanhDong: result.action,
        message: `${
            result.action === 'THEM_MOI' ? 'Thêm mới' : 'Cập nhật'
        } công thức thành công - ID ${result.record.id}`
    };
}

async function validateGiaMonAnSauImport(db, monAnId) {
    const monAn = await getGiaMonAn(db, monAnId);

    if (monAn.giaTien === null) {
        return;
    }

    if (monAn.giaDuKien <= monAn.giaTien) {
        return;
    }

    throw new ApiError(
        400,
        `Giá món ăn hiện tại là ${formatTien(
            monAn.giaTien
        )} VNĐ, giá dự kiến sau khi cập nhật công thức là ${formatTien(
            monAn.giaDuKien
        )} VNĐ. Giá món ăn phải lớn hơn hoặc bằng giá dự kiến.`
    );
}

async function importCongThucMonAn(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    validateHeaders(headerMap);

    const items = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        if (!hasData(row)) {
            continue;
        }

        if (dongLaTemplate(row, getValue, headerMap)) {
            continue;
        }

        items.push(readItem(row, rowNumber, getValue, headerMap));
    }

    const successes = [];
    const errors = [];

    if (items.length === 0) {
        errors.push({
            rowNumbers: [DATA_START_ROW],
            message: 'File import không có dữ liệu.'
        });
    }

    for (const item of items) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await processItem(client, item);

            const monAnId = Number(result.monAnId);

            await monAnService.capNhatGiaDuKien(monAnId, client);

            await validateGiaMonAnSauImport(client, monAnId);

            await client.query('COMMIT');

            successes.push(result);
        } catch (error) {
            await client.query('ROLLBACK');

            errors.push({
                rowNumbers: item.rowNumbers,
                message: error.message || 'Dữ liệu không hợp lệ.'
            });
        } finally {
            client.release();
        }
    }

    return createResultFile(workbook, worksheet, {
        fileName: `${MA_BAO_CAO}.xlsx`,
        headerRowNumber: HEADER_ROW,
        successes,
        errors
    });
}

module.exports = {
    importCongThucMonAn
};

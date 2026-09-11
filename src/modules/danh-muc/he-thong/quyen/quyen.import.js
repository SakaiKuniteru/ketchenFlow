'use strict';

const ApiError = require('../../../../utils/api-error');

const quyenRepository = require('./quyen.repository');
const quyenService = require('./quyen.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_quyen';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maQuyen/k',
        codeField: 'maQuyen'
    });
}

function dongLaTemplate(row, getValue, headerMap) {
    const values = [];

    for (const field of headerMap.keys()) {
        const value = getValue(row, field);

        if (value !== undefined && value !== null && value !== '') {
            values.push(value);
        }
    }

    if (values.length === 0) {
        return false;
    }

    return values.every((value) => isTemplateValue(value));
}

function toArray(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value;
    }

    let text = String(value).trim();

    if (!text) {
        return undefined;
    }

    if (text.startsWith('[') && text.endsWith(']')) {
        try {
            const result = JSON.parse(text);

            if (Array.isArray(result)) {
                return result;
            }
        } catch (error) {
            text = text.slice(1, -1).trim();
        }
    }

    if (!text) {
        return undefined;
    }

    return text
        .split(',')
        .map((item) =>
            String(item)
                .trim()
                .replace(/^["']|["']$/g, '')
        )
        .filter(Boolean);
}

function getImportValue(row, getValue, headerMap, key) {
    if (headerMap.has(key)) {
        return getValue(row, key);
    }

    const arrayKey = `${key}[]`;

    if (headerMap.has(arrayKey)) {
        return getValue(row, arrayKey);
    }

    return undefined;
}

function toIdArray(value) {
    const values = toArray(value);

    if (values === undefined) {
        return undefined;
    }

    return values.map((item) => toNumber(item));
}

function toTextArray(value) {
    const values = toArray(value);

    if (values === undefined) {
        return undefined;
    }

    return values.map((item) => String(item).trim());
}

async function docDuLieuImport(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    const cauHinh = validateHeaders(headerMap);

    const fieldMa = cauHinh.hasCodeKey ? cauHinh.codeKey : cauHinh.codeField;

    const danhSach = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        if (!hasData(row)) {
            continue;
        }

        if (dongLaTemplate(row, getValue, headerMap)) {
            continue;
        }

        const idRaw = cauHinh.hasIdKey ? getValue(row, cauHinh.idKey) : undefined;

        const maQuyen = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maQuyen
        };

        const tenQuyen = getValue(row, 'tenQuyen');

        const moTa = getValue(row, 'moTa');

        const dsNhomTinhNangIdRaw = getImportValue(row, getValue, headerMap, 'dsNhomTinhNangId');

        const dsMaNhomTinhNangRaw = getImportValue(row, getValue, headerMap, 'dsMaNhomTinhNang');

        const activeRaw = getValue(row, 'active');

        if (maQuyen !== undefined) {
            item.maQuyen = maQuyen;
        }

        if (tenQuyen !== undefined) {
            item.tenQuyen = tenQuyen;
        }

        if (moTa !== undefined) {
            item.moTa = moTa;
        }

        if (dsNhomTinhNangIdRaw !== undefined) {
            item.dsNhomTinhNangId = toIdArray(dsNhomTinhNangIdRaw);
        }

        if (dsMaNhomTinhNangRaw !== undefined) {
            item.dsMaNhomTinhNang = toTextArray(dsMaNhomTinhNangRaw)?.map((ma) => String(ma).trim().toUpperCase());
        }

        if (activeRaw !== undefined) {
            try {
                item.active = toBoolean(activeRaw);
            } catch (error) {
                item.active = activeRaw;
            }
        }

        danhSach.push(item);
    }

    return {
        workbook,
        worksheet,
        danhSach
    };
}

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID quyền phải là số nguyên lớn hơn 0.');
    }

    if (item.dsNhomTinhNangId !== undefined && !Array.isArray(item.dsNhomTinhNangId)) {
        throw new ApiError(400, 'Danh sách ID nhóm tính năng không hợp lệ.');
    }

    if (
        item.dsNhomTinhNangId !== undefined &&
        item.dsNhomTinhNangId.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0)
    ) {
        throw new ApiError(400, 'Danh sách ID nhóm tính năng chỉ được chứa số nguyên lớn hơn 0.');
    }

    if (item.dsMaNhomTinhNang !== undefined && !Array.isArray(item.dsMaNhomTinhNang)) {
        throw new ApiError(400, 'Danh sách mã nhóm tính năng không hợp lệ.');
    }

    if (item.dsMaNhomTinhNang !== undefined && item.dsMaNhomTinhNang.some((ma) => !String(ma || '').trim())) {
        throw new ApiError(400, 'Danh sách mã nhóm tính năng không được chứa mã rỗng.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới quyền phải có mã quyền.');
    }

    if (!item.tenQuyen) {
        throw new ApiError(400, 'Thêm mới quyền phải có tên quyền.');
    }
}

async function resolveNhomTinhNang(item) {
    const hasIds = item.dsNhomTinhNangId !== undefined;

    const hasMas = item.dsMaNhomTinhNang !== undefined;

    if (!hasIds && !hasMas) {
        return undefined;
    }

    let dsTheoId = null;
    let dsTheoMa = null;

    if (hasIds) {
        if (item.dsNhomTinhNangId.length === 0) {
            dsTheoId = [];
        } else {
            dsTheoId = await quyenRepository.getDsNhomTinhNangByIds(item.dsNhomTinhNangId);

            if (dsTheoId.length !== item.dsNhomTinhNangId.length) {
                throw new ApiError(400, 'Có ID nhóm tính năng không tồn tại.');
            }

            const inactive = dsTheoId.find((item) => !item.active);

            if (inactive) {
                throw new ApiError(400, `Nhóm tính năng "${inactive.maNhomTinhNang}" đã bị khóa.`);
            }
        }
    }

    if (hasMas) {
        if (item.dsMaNhomTinhNang.length === 0) {
            dsTheoMa = [];
        } else {
            dsTheoMa = await quyenRepository.getDsNhomTinhNangByMas(item.dsMaNhomTinhNang);

            if (dsTheoMa.length !== item.dsMaNhomTinhNang.length) {
                throw new ApiError(400, 'Có mã nhóm tính năng không tồn tại.');
            }

            const inactive = dsTheoMa.find((item) => !item.active);

            if (inactive) {
                throw new ApiError(400, `Nhóm tính năng "${inactive.maNhomTinhNang}" đã bị khóa.`);
            }
        }
    }

    if (hasIds && hasMas) {
        const ids1 = dsTheoId.map((item) => Number(item.id)).sort((a, b) => a - b);

        const ids2 = dsTheoMa.map((item) => Number(item.id)).sort((a, b) => a - b);

        if (JSON.stringify(ids1) !== JSON.stringify(ids2)) {
            throw new ApiError(400, 'Danh sách ID và mã nhóm tính năng không khớp nhau.');
        }

        return ids1;
    }

    if (hasIds) {
        return dsTheoId.map((item) => Number(item.id));
    }

    return dsTheoMa.map((item) => Number(item.id));
}

async function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maQuyen !== undefined) {
        data.maQuyen = item.maQuyen;
    }

    if (item.tenQuyen !== undefined) {
        data.tenQuyen = item.tenQuyen;
    }

    if (item.moTa !== undefined) {
        data.moTa = item.moTa;
    }

    if (item.active !== undefined) {
        data.active = item.active;
    }

    const dsNhomTinhNangId = await resolveNhomTinhNang(item);

    if (dsNhomTinhNangId !== undefined) {
        data.dsNhomTinhNangId = dsNhomTinhNangId;
    }

    return data;
}

async function timQuyenImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => quyenRepository.getChiTiet(id),

        getByCode: (maQuyen) => quyenRepository.getChiTietByMa(maQuyen),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maQuyen,

        entityName: 'quyền'
    });
}

async function xuLyImport(file) {
    const { workbook, worksheet, danhSach } = await docDuLieuImport(file);

    if (danhSach.length === 0) {
        throw new ApiError(400, 'File import không có dữ liệu.');
    }

    const successes = [];
    const errors = [];

    for (const item of danhSach) {
        try {
            validateDongImport(item);

            const xuLy = await timQuyenImport(item);

            const data = await taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maQuyen)
                ) {
                    data.maQuyen = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await quyenService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maQuyen: result.maQuyen,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maQuyen = item.code;

            const result = await quyenService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maQuyen: result.maQuyen,
                hanhDong: 'THEM_MOI',
                message: `Thêm mới thành công - ID ${result.id}`
            });
        } catch (error) {
            errors.push({
                rowNumbers: item.rowNumbers,
                message: error.message || 'Dữ liệu không hợp lệ.'
            });
        }
    }

    return await createResultFile(workbook, worksheet, {
        fileName: `${MA_BAO_CAO}.xlsx`,
        headerRowNumber: HEADER_ROW,
        successes,
        errors
    });
}

async function importData(req, res, next) {
    try {
        const result = await xuLyImport(req.file);

        return sendExcel(res, result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    importData,
    xuLyImport,
    docDuLieuImport,
    timQuyenImport,
    taoDuLieuNghiepVu
};

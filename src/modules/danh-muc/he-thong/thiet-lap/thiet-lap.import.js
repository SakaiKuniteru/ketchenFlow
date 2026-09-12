'use strict';

const ApiError = require('../../../../utils/api-error');

const thietLapRepository = require('./thiet-lap.repository');
const thietLapService = require('./thiet-lap.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_thiet_lap';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maThietLap/k',
        codeField: 'maThietLap'
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

        const maThietLapRaw = getValue(row, fieldMa);

        const maThietLap =
            maThietLapRaw !== undefined && maThietLapRaw !== null
                ? String(maThietLapRaw).trim().toUpperCase()
                : undefined;

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maThietLap
        };

        const tenThietLapRaw = getValue(row, 'tenThietLap');

        const tenThietLap =
            tenThietLapRaw !== undefined && tenThietLapRaw !== null ? String(tenThietLapRaw).trim() : undefined;

        const giaTri = getValue(row, 'giaTri');

        const tuNgay = getValue(row, 'tuNgay');

        const denNgay = getValue(row, 'denNgay');

        const moTaRaw = getValue(row, 'moTa');

        const moTa = moTaRaw !== undefined && moTaRaw !== null ? String(moTaRaw).trim() : undefined;

        const coSoIdRaw = getImportValue(row, getValue, headerMap, 'coSoId');

        const maCoSoRaw = getImportValue(row, getValue, headerMap, 'maCoSo');

        const maCoSo =
            maCoSoRaw !== undefined && maCoSoRaw !== null ? String(maCoSoRaw).trim().toUpperCase() : undefined;

        const dsNhomTinhNangIdRaw = getImportValue(row, getValue, headerMap, 'dsNhomTinhNangId');

        const dsMaNhomTinhNangRaw = getImportValue(row, getValue, headerMap, 'dsMaNhomTinhNang');

        const activeRaw = getValue(row, 'active');

        if (maThietLap !== undefined) item.maThietLap = maThietLap;

        if (tenThietLap !== undefined) item.tenThietLap = tenThietLap;

        if (giaTri !== undefined) item.giaTri = giaTri;

        if (tuNgay !== undefined) item.tuNgay = tuNgay;

        if (denNgay !== undefined) item.denNgay = denNgay;

        if (moTa !== undefined) item.moTa = moTa;

        if (coSoIdRaw !== undefined) item.coSoId = toNumber(coSoIdRaw);

        if (maCoSo !== undefined) item.maCoSo = maCoSo;

        if (dsNhomTinhNangIdRaw !== undefined) item.dsNhomTinhNangId = toIdArray(dsNhomTinhNangIdRaw);

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

function validateId(value, ten) {
    if (value !== undefined && (value === null || !Number.isInteger(Number(value)) || Number(value) <= 0)) {
        throw new ApiError(400, `${ten} phải là số nguyên lớn hơn 0.`);
    }
}

function validateDsId(values, ten) {
    if (values === undefined) {
        return;
    }

    if (!Array.isArray(values)) {
        throw new ApiError(400, `${ten} không hợp lệ.`);
    }

    for (const value of values) {
        validateId(value, ten);
    }
}

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID thiết lập phải là số nguyên lớn hơn 0.');
    }

    validateId(item.coSoId, 'ID cơ sở');

    validateDsId(item.dsNhomTinhNangId, 'ID nhóm tính năng');

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới thiết lập phải có mã thiết lập.');
    }

    if (!item.tenThietLap) {
        throw new ApiError(400, 'Thêm mới thiết lập phải có tên thiết lập.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maThietLap !== undefined) data.maThietLap = item.maThietLap;

    if (item.tenThietLap !== undefined) data.tenThietLap = item.tenThietLap;

    if (
        item.giaTri !== undefined ||
        item.tuNgay !== undefined ||
        item.denNgay !== undefined
    ) {
        data.dsGiaTri = [
            {
                giaTri:
                    item.giaTri !== undefined
                        ? item.giaTri
                        : null,

                tuNgay:
                    item.tuNgay,

                denNgay:
                    item.denNgay,

                active:
                    item.active !== undefined
                        ? item.active
                        : true
            }
        ];
    }

    if (item.moTa !== undefined) data.moTa = item.moTa;

    if (item.coSoId !== undefined) data.coSoId = item.coSoId;

    if (item.maCoSo !== undefined) data.maCoSo = item.maCoSo;

    if (item.dsNhomTinhNangId !== undefined) data.dsNhomTinhNangId = item.dsNhomTinhNangId;

    if (item.dsMaNhomTinhNang !== undefined) data.dsMaNhomTinhNang = item.dsMaNhomTinhNang;

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timThietLapImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => thietLapRepository.getChiTiet(id),

        getByCode: (maThietLap) => thietLapRepository.getChiTietByMa(maThietLap),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maThietLap,

        entityName: 'thiết lập'
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

            const xuLy = await timThietLapImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maThietLap)
                ) {
                    data.maThietLap = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await thietLapService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maThietLap: result.maThietLap,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maThietLap = item.code;

            const result = await thietLapService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maThietLap: result.maThietLap,
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
    timThietLapImport,
    taoDuLieuNghiepVu
};

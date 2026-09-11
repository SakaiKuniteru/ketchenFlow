'use strict';

const ApiError = require('../../../../utils/api-error');

const nhomMonAnRepository = require('./nhom-mon-an.repository');
const nhomMonAnService = require('./nhom-mon-an.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_nhom_mon_an';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maNhomMonAn/k',
        codeField: 'maNhomMonAn'
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

        const maNhomMonAn = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maNhomMonAn
        };

        const tenNhomMonAn = getValue(row, 'tenNhomMonAn');

        const moTa = getValue(row, 'moTa');

        const activeRaw = getValue(row, 'active');

        if (maNhomMonAn !== undefined) item.maNhomMonAn = maNhomMonAn;

        if (tenNhomMonAn !== undefined) item.tenNhomMonAn = tenNhomMonAn;

        if (moTa !== undefined) item.moTa = moTa;

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
        throw new ApiError(400, 'ID nhóm món ăn phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới nhóm món ăn phải có mã nhóm món ăn.');
    }

    if (!item.tenNhomMonAn) {
        throw new ApiError(400, 'Thêm mới nhóm món ăn phải có tên nhóm món ăn.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maNhomMonAn !== undefined) data.maNhomMonAn = item.maNhomMonAn;

    if (item.tenNhomMonAn !== undefined) data.tenNhomMonAn = item.tenNhomMonAn;

    if (item.moTa !== undefined) data.moTa = item.moTa;

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timNhomMonAnImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => nhomMonAnRepository.getChiTiet(id),

        getByCode: (maNhomMonAn) => nhomMonAnRepository.getChiTietByMa(maNhomMonAn),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maNhomMonAn,

        entityName: 'nhóm món ăn'
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

            const xuLy = await timNhomMonAnImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maNhomMonAn)
                ) {
                    data.maNhomMonAn = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await nhomMonAnService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maNhomMonAn: result.maNhomMonAn,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maNhomMonAn = item.code;

            const result = await nhomMonAnService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maNhomMonAn: result.maNhomMonAn,
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
    timNhomMonAnImport,
    taoDuLieuNghiepVu
};

'use strict';

const ApiError = require('../../../../utils/api-error');

const quocGiaRepository = require('./quoc-gia.repository');
const quocGiaService = require('./quoc-gia.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_quoc_gia';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maQuocGia/k',
        codeField: 'maQuocGia'
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

        const maQuocGia = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maQuocGia
        };

        const tenQuocGia = getValue(row, 'tenQuocGia');
        const tenTiengAnh = getValue(row, 'tenTiengAnh');
        const maDienThoai = getValue(row, 'maDienThoai');
        const tenVietTat = getValue(row, 'tenVietTat');
        const maIso2 = getValue(row, 'maIso2');
        const maIso3 = getValue(row, 'maIso3');
        const activeRaw = getValue(row, 'active');

        if (maQuocGia !== undefined) item.maQuocGia = toText(maQuocGia);

        if (tenQuocGia !== undefined) item.tenQuocGia = toText(tenQuocGia);

        if (tenTiengAnh !== undefined) item.tenTiengAnh = toText(tenTiengAnh);

        if (maDienThoai !== undefined) item.maDienThoai = toText(maDienThoai);

        if (tenVietTat !== undefined) item.tenVietTat = toText(tenVietTat);

        if (maIso2 !== undefined) item.maIso2 = toText(maIso2);

        if (maIso3 !== undefined) item.maIso3 = toText(maIso3);

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

function toText(value) {
    if (value === undefined || value === null || value === '') {
        return value;
    }

    return String(value).trim();
}

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID quốc gia phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới quốc gia phải có mã quốc gia.');
    }

    if (!item.tenQuocGia) {
        throw new ApiError(400, 'Thêm mới quốc gia phải có tên quốc gia.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maQuocGia !== undefined) data.maQuocGia = item.maQuocGia;

    if (item.tenQuocGia !== undefined) data.tenQuocGia = item.tenQuocGia;

    if (item.tenTiengAnh !== undefined) data.tenTiengAnh = item.tenTiengAnh;

    if (item.maDienThoai !== undefined) data.maDienThoai = item.maDienThoai;

    if (item.tenVietTat !== undefined) data.tenVietTat = item.tenVietTat;

    if (item.maIso2 !== undefined) data.maIso2 = item.maIso2;

    if (item.maIso3 !== undefined) data.maIso3 = item.maIso3;

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timQuocGiaImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => quocGiaRepository.getChiTiet(id),

        getByCode: (maQuocGia) => quocGiaRepository.getChiTietByMa(maQuocGia),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maQuocGia,

        entityName: 'quốc gia'
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

            const xuLy = await timQuocGiaImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maQuocGia)
                ) {
                    data.maQuocGia = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await quocGiaService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maQuocGia: result.maQuocGia,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maQuocGia = item.code;

            const result = await quocGiaService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maQuocGia: result.maQuocGia,
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
    timQuocGiaImport,
    taoDuLieuNghiepVu
};

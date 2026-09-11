'use strict';

const ApiError = require('../../../../utils/api-error');

const chucVuRepository = require('./chuc-vu.repository');

const chucVuService = require('./chuc-vu.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_chuc_vu';

const HEADER_ROW = 3;

const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maChucVu/k',
        codeField: 'maChucVu'
    });
}

function dongLaTemplate(row, getValue, headerMap) {
    for (const field of headerMap.keys()) {
        if (isTemplateValue(getValue(row, field))) {
            return true;
        }
    }

    return false;
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

        const maChucVu = getValue(row, fieldMa);

        const tenChucVu = getValue(row, 'tenChucVu');

        const moTa = getValue(row, 'moTa');

        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maChucVu
        };

        if (tenChucVu !== undefined) {
            item.tenChucVu = tenChucVu;
        }

        if (moTa !== undefined) {
            item.moTa = moTa;
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
        throw new ApiError(400, 'ID chức vụ phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới chức vụ phải có mã chức vụ.');
    }

    if (!item.tenChucVu) {
        throw new ApiError(400, 'Thêm mới chức vụ phải có tên chức vụ.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenChucVu !== undefined) {
        data.tenChucVu = item.tenChucVu;
    }

    if (item.moTa !== undefined) {
        data.moTa = item.moTa;
    }

    if (item.active !== undefined) {
        data.active = item.active;
    }

    return data;
}

async function timChucVuImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => chucVuRepository.getChiTiet(id),

        getByCode: (ma) => chucVuRepository.getChiTietByMa(ma),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maChucVu,

        entityName: 'chức vụ'
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

            const xuLy = await timChucVuImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maChucVu)
                ) {
                    data.maChucVu = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await chucVuService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maChucVu: result.maChucVu,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maChucVu = item.code;

            const result = await chucVuService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maChucVu: result.maChucVu,
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
    timChucVuImport,
    taoDuLieuNghiepVu
};

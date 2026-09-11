'use strict';

const ApiError = require('../../../../utils/api-error');

const xaPhuongRepository = require('./xa-phuong.repository');
const xaPhuongService = require('./xa-phuong.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const MA_BAO_CAO = 'dm_xa_phuong';

const HEADER_ROW = 3;

const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maXaPhuong/k',
        codeField: 'maXaPhuong'
    });
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

        const idRaw = cauHinh.hasIdKey ? getValue(row, cauHinh.idKey) : undefined;

        const maXaPhuong = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maXaPhuong
        };

        const tenXaPhuong = getValue(row, 'tenXaPhuong');

        const tenVietTat = getValue(row, 'tenVietTat');

        const tinhThanhIdRaw = getValue(row, 'tinhThanhId');

        const maTinhThanh = getValue(row, 'maTinhThanh');

        const activeRaw = getValue(row, 'active');

        if (maXaPhuong !== undefined) item.maXaPhuong = maXaPhuong;

        if (tenXaPhuong !== undefined) item.tenXaPhuong = tenXaPhuong;

        if (tenVietTat !== undefined) item.tenVietTat = tenVietTat;

        if (tinhThanhIdRaw !== undefined) item.tinhThanhId = toNumber(tinhThanhIdRaw);

        if (maTinhThanh !== undefined) item.maTinhThanh = maTinhThanh;

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
        throw new ApiError(400, 'ID xã phường phải là số nguyên lớn hơn 0.');
    }

    if (
        item.tinhThanhId !== undefined &&
        (item.tinhThanhId === null || !Number.isInteger(Number(item.tinhThanhId)) || Number(item.tinhThanhId) <= 0)
    ) {
        throw new ApiError(400, 'ID tỉnh thành phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới xã phường phải có mã xã phường.');
    }

    if (!item.tenXaPhuong) {
        throw new ApiError(400, 'Thêm mới xã phường phải có tên xã phường.');
    }

    if (item.tinhThanhId === undefined && !item.maTinhThanh) {
        throw new ApiError(400, 'Thêm mới xã phường phải có tỉnh thành.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maXaPhuong !== undefined) data.maXaPhuong = item.maXaPhuong;

    if (item.tenXaPhuong !== undefined) data.tenXaPhuong = item.tenXaPhuong;

    if (item.tenVietTat !== undefined) data.tenVietTat = item.tenVietTat;

    if (item.tinhThanhId !== undefined) data.tinhThanhId = item.tinhThanhId;

    if (item.maTinhThanh !== undefined) data.maTinhThanh = item.maTinhThanh;

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timXaPhuongImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => xaPhuongRepository.getChiTiet(id),

        getByCode: (maXaPhuong) => xaPhuongRepository.getChiTietByMa(maXaPhuong),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maXaPhuong,

        entityName: 'xã phường'
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

            const xuLy = await timXaPhuongImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maXaPhuong)
                ) {
                    data.maXaPhuong = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await xaPhuongService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maXaPhuong: result.maXaPhuong,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maXaPhuong = item.code;

            const result = await xaPhuongService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maXaPhuong: result.maXaPhuong,
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
    timXaPhuongImport,
    taoDuLieuNghiepVu
};

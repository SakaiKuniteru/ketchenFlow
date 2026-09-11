'use strict';

const ApiError = require('../../../../utils/api-error');

const tinhThanhRepository = require('./tinh-thanh.repository');
const tinhThanhService = require('./tinh-thanh.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const MA_BAO_CAO = 'dm_tinh_thanh';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maTinhThanh/k',
        codeField: 'maTinhThanh'
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

        const maTinhThanh = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maTinhThanh
        };

        const tenTinhThanh = getValue(row, 'tenTinhThanh');

        const tenVietTat = getValue(row, 'tenVietTat');

        const quocGiaIdRaw = getValue(row, 'quocGiaId');

        const maQuocGia = getValue(row, 'maQuocGia');

        const activeRaw = getValue(row, 'active');

        if (maTinhThanh !== undefined) item.maTinhThanh = maTinhThanh;

        if (tenTinhThanh !== undefined) item.tenTinhThanh = tenTinhThanh;

        if (tenVietTat !== undefined) item.tenVietTat = tenVietTat;

        if (quocGiaIdRaw !== undefined) item.quocGiaId = toNumber(quocGiaIdRaw);

        if (maQuocGia !== undefined) item.maQuocGia = maQuocGia;

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

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID tỉnh thành phải là số nguyên lớn hơn 0.');
    }

    validateId(item.quocGiaId, 'ID quốc gia');

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới tỉnh thành phải có mã tỉnh thành.');
    }

    if (!item.tenTinhThanh) {
        throw new ApiError(400, 'Thêm mới tỉnh thành phải có tên tỉnh thành.');
    }

    if (item.quocGiaId === undefined && !item.maQuocGia) {
        throw new ApiError(400, 'Thêm mới tỉnh thành phải có quốc gia.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maTinhThanh !== undefined) data.maTinhThanh = item.maTinhThanh;

    if (item.tenTinhThanh !== undefined) data.tenTinhThanh = item.tenTinhThanh;

    if (item.tenVietTat !== undefined) data.tenVietTat = item.tenVietTat;

    if (item.quocGiaId !== undefined) data.quocGiaId = item.quocGiaId;

    if (item.maQuocGia !== undefined) data.maQuocGia = item.maQuocGia;

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timTinhThanhImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => tinhThanhRepository.getChiTiet(id),

        getByCode: (maTinhThanh) => tinhThanhRepository.getChiTietByMa(maTinhThanh),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maTinhThanh,

        entityName: 'tỉnh thành'
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

            const xuLy = await timTinhThanhImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maTinhThanh)
                ) {
                    data.maTinhThanh = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await tinhThanhService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maTinhThanh: result.maTinhThanh,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maTinhThanh = item.code;

            const result = await tinhThanhService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maTinhThanh: result.maTinhThanh,
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
    timTinhThanhImport,
    taoDuLieuNghiepVu
};

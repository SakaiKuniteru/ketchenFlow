'use strict';

const ApiError = require('../../../../utils/api-error');
const coSoRepository = require('./co-so.repository');
const coSoService = require('./co-so.service');
const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_co_so';
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maCoSo/k',
        codeField: 'maCoSo'
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

        const maCoSo = getValue(row, fieldMa);

        const tenCoSo = getValue(row, 'tenCoSo');

        const moTa = getValue(row, 'moTa');

        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maCoSo
        };

        if (tenCoSo !== undefined) {
            item.tenCoSo = tenCoSo;
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
        throw new ApiError(400, 'ID cơ sở phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới cơ sở phải có mã cơ sở.');
    }

    if (!item.tenCoSo) {
        throw new ApiError(400, 'Thêm mới cơ sở phải có tên cơ sở.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenCoSo !== undefined) data.tenCoSo = item.tenCoSo;

    if (item.diaChi !== undefined) data.diaChi = item.diaChi;

    if (item.active !== undefined) data.active = item.active;

    if (item.quocGiaId !== undefined) data.quocGiaId = item.quocGiaId;

    if (item.maQuocGia !== undefined) data.maQuocGia = item.maQuocGia;

    if (item.tinhThanhId !== undefined) data.tinhThanhId = item.tinhThanhId;

    if (item.maTinhThanh !== undefined) data.maTinhThanh = item.maTinhThanh;

    if (item.xaPhuongId !== undefined) data.xaPhuongId = item.xaPhuongId;

    if (item.maXaPhuong !== undefined) data.maXaPhuong = item.maXaPhuong;

    return data;
}

async function timCoSoImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => coSoRepository.getChiTiet(id),

        getByCode: (ma) => coSoRepository.getChiTietByMa(ma),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maCoSo,

        entityName: 'cơ sở'
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

            const xuLy = await timCoSoImport(item);
            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maCoSo)
                ) {
                    data.maCoSo = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await coSoService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maCoSo: result.maCoSo,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maCoSo = item.code;

            const result = await coSoService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maCoSo: result.maCoSo,
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
    timCoSoImport,
    taoDuLieuNghiepVu
};

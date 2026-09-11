'use strict';

const ApiError = require('../../../../utils/api-error');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile } = require('../../../../helpers/excel/excel-result');

const donViTinhRepository = require('./don-vi-tinh.repository');

const donViTinhService = require('./don-vi-tinh.service');

const { MA_BAO_CAO, HEADER_ROW, DATA_START_ROW } = require('./don-vi-tinh.export');

function parsePositiveInteger(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }

    const number = toNumber(value);

    if (number === null || !Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${fieldName} phải là số nguyên lớn hơn 0.`);
    }

    return number;
}

function parseNumber(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }

    const number = toNumber(value);

    if (number === null) {
        throw new ApiError(400, `${fieldName} phải là số.`);
    }

    return number;
}

function parseBoolean(value) {
    if (value === undefined) {
        return undefined;
    }

    try {
        return toBoolean(value);
    } catch (error) {
        throw new ApiError(400, 'Trạng thái không hợp lệ.');
    }
}

function readItem(row, rowNumber, getValue, keyConfig) {
    const codeField = keyConfig.hasCodeKey ? 'maDonViTinh/k' : 'maDonViTinh';

    return {
        rowNumbers: [rowNumber],

        idIsKey: keyConfig.hasIdKey,

        codeIsKey: keyConfig.hasCodeKey,

        id: keyConfig.hasIdKey ? getValue(row, 'id/k') : undefined,

        code: getValue(row, codeField),

        maDonViTinh: getValue(row, codeField),

        tenDonViTinh: getValue(row, 'tenDonViTinh'),

        kyHieu: getValue(row, 'kyHieu'),

        loaiDonVi: getValue(row, 'loaiDonVi'),

        active: getValue(row, 'active')
    };
}

function createBusinessData(item) {
    const data = {};

    if (item.tenDonViTinh !== undefined) {
        data.tenDonViTinh = item.tenDonViTinh;
    }

    if (item.kyHieu !== undefined) {
        data.kyHieu = item.kyHieu;
    }

    const loaiDonVi = parseNumber(item.loaiDonVi, 'Loại đơn vị');

    if (loaiDonVi !== undefined) {
        if (!Number.isInteger(loaiDonVi)) {
            throw new ApiError(400, 'Loại đơn vị phải là số nguyên.');
        }

        data.loaiDonVi = loaiDonVi;
    }

    const active = parseBoolean(item.active);

    if (active !== undefined) {
        data.active = active;
    }

    return data;
}

async function processItem(item) {
    if (item.id !== undefined) {
        item.id = parsePositiveInteger(item.id, 'ID đơn vị tính');
    }

    const strategy = await resolveImportStrategy(item, {
        getById: (id) => donViTinhRepository.getChiTiet(id),

        getByCode: (code) => donViTinhRepository.getChiTietByMa(code),

        getRecordCode: (record) => record.maDonViTinh,

        entityName: 'đơn vị tính'
    });

    const data = createBusinessData(item);

    if (strategy.action === 'UPDATE') {
        if (
            strategy.allowCodeChange &&
            item.maDonViTinh !== undefined &&
            shouldChangeCode(item.maDonViTinh, strategy.record.maDonViTinh)
        ) {
            data.maDonViTinh = item.maDonViTinh;
        }

        if (Object.keys(data).length === 0) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await donViTinhService.update(strategy.record.id, data);

        return {
            rowNumbers: item.rowNumbers,

            id: result.id,

            maDonViTinh: result.maDonViTinh,

            hanhDong: 'CAP_NHAT',

            message: `Cập nhật thành công - ID ${result.id}`
        };
    }

    if (!item.maDonViTinh) {
        throw new ApiError(400, 'Thêm mới đơn vị tính phải có mã đơn vị tính.');
    }

    data.maDonViTinh = item.maDonViTinh;

    const result = await donViTinhService.create(data);

    return {
        rowNumbers: item.rowNumbers,

        id: result.id,

        maDonViTinh: result.maDonViTinh,

        hanhDong: 'THEM_MOI',

        message: `Thêm mới thành công - ID ${result.id}`
    };
}

async function importDonViTinh(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    const keyConfig = validateKeyHeaders(headerMap, {
        idKey: 'id/k',

        codeKey: 'maDonViTinh/k',

        codeField: 'maDonViTinh'
    });

    const items = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        if (!hasData(row)) {
            continue;
        }

        items.push(readItem(row, rowNumber, getValue, keyConfig));
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
        try {
            const result = await processItem(item);

            successes.push(result);
        } catch (error) {
            errors.push({
                rowNumbers: item.rowNumbers,

                message: error.message || 'Dữ liệu không hợp lệ.'
            });
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
    importDonViTinh
};

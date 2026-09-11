'use strict';

const ApiError = require('../../../../utils/api-error');
const { readExcel } = require('../../../../helpers/excel/excel-reader');
const { toBoolean } = require('../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');
const { createResultFile } = require('../../../../helpers/excel/excel-result');
const caAnRepository = require('./ca-an.repository');
const caAnService = require('./ca-an.service');
const { MA_BAO_CAO, HEADER_ROW, DATA_START_ROW } = require('./ca-an.export');

function normalizeTime(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === '') {
        return null;
    }

    if (value instanceof Date) {
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');
        const seconds = String(value.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    const text = String(value).trim();

    const match = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (!match) {
        throw new ApiError(400, `${fieldName} không đúng định dạng HH:mm hoặc HH:mm:ss.`);
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = match[3] !== undefined ? Number(match[3]) : 0;

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        throw new ApiError(400, `${fieldName} không hợp lệ.`);
    }

    return [String(hour).padStart(2, '0'), String(minute).padStart(2, '0'), String(second).padStart(2, '0')].join(':');
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
    const codeField = keyConfig.hasCodeKey ? 'maCaAn/k' : 'maCaAn';

    return {
        rowNumbers: [rowNumber],
        idIsKey: keyConfig.hasIdKey,
        codeIsKey: keyConfig.hasCodeKey,
        id: keyConfig.hasIdKey ? getValue(row, 'id/k') : undefined,
        code: getValue(row, codeField),
        maCaAn: getValue(row, codeField),
        tenCaAn: getValue(row, 'tenCaAn'),
        thoiGianBatDau: getValue(row, 'thoiGianBatDau'),
        thoiGianKetThuc: getValue(row, 'thoiGianKetThuc'),
        active: getValue(row, 'active')
    };
}

function createBusinessData(item) {
    const data = {};

    if (item.tenCaAn !== undefined) {
        data.tenCaAn = item.tenCaAn;
    }

    const thoiGianBatDau = normalizeTime(item.thoiGianBatDau, 'Thời gian bắt đầu');

    if (thoiGianBatDau !== undefined) {
        data.thoiGianBatDau = thoiGianBatDau;
    }

    const thoiGianKetThuc = normalizeTime(item.thoiGianKetThuc, 'Thời gian kết thúc');

    if (thoiGianKetThuc !== undefined) {
        data.thoiGianKetThuc = thoiGianKetThuc;
    }

    const active = parseBoolean(item.active);

    if (active !== undefined) {
        data.active = active;
    }

    return data;
}

function validateTimeRange(data, currentRecord = null) {
    const start = data.thoiGianBatDau !== undefined ? data.thoiGianBatDau : currentRecord?.thoiGianBatDau;

    const end = data.thoiGianKetThuc !== undefined ? data.thoiGianKetThuc : currentRecord?.thoiGianKetThuc;

    if (!start || !end) {
        return;
    }

    if (start >= end) {
        throw new ApiError(400, 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.');
    }
}

async function processItem(item) {
    if (item.id !== undefined) {
        const id = Number(item.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ApiError(400, 'ID ca ăn phải là số nguyên lớn hơn 0.');
        }

        item.id = id;
    }

    const strategy = await resolveImportStrategy(item, {
        getById: (id) => caAnRepository.getChiTiet(id),
        getByCode: (code) => caAnRepository.getChiTietByMa(code),
        getRecordCode: (record) => record.maCaAn,
        entityName: 'ca ăn'
    });

    const data = createBusinessData(item);

    if (strategy.action === 'UPDATE') {
        if (
            strategy.allowCodeChange &&
            item.maCaAn !== undefined &&
            shouldChangeCode(item.maCaAn, strategy.record.maCaAn)
        ) {
            data.maCaAn = item.maCaAn;
        }

        validateTimeRange(data, strategy.record);

        if (Object.keys(data).length === 0) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await caAnService.update(strategy.record.id, data);

        return {
            rowNumbers: item.rowNumbers,
            id: result.id,
            maCaAn: result.maCaAn,
            hanhDong: 'CAP_NHAT',
            message: `Cập nhật thành công - ID ${result.id}`
        };
    }

    if (!item.maCaAn) {
        throw new ApiError(400, 'Thêm mới ca ăn phải có mã ca ăn.');
    }

    data.maCaAn = item.maCaAn;

    validateTimeRange(data);

    const result = await caAnService.create(data);

    return {
        rowNumbers: item.rowNumbers,
        id: result.id,
        maCaAn: result.maCaAn,
        hanhDong: 'THEM_MOI',
        message: `Thêm mới thành công - ID ${result.id}`
    };
}

async function importCaAn(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    const keyConfig = validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maCaAn/k',
        codeField: 'maCaAn'
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
    importCaAn
};

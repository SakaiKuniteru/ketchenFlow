'use strict';

const ApiError = require('../../utils/api-error');

const { getCellValue } = require('./excel-value');

function normalizeKey(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value).trim();
}

function createHeaderMap(worksheet, headerRowNumber = 1) {
    const headerMap = new Map();

    const headerRow = worksheet.getRow(headerRowNumber);

    headerRow.eachCell((cell, columnNumber) => {
        const key = normalizeKey(getCellValue(cell.value));

        if (!key) {
            return;
        }

        if (headerMap.has(key)) {
            throw new ApiError(400, `Field "${key}" bị trùng trong file Excel.`);
        }

        headerMap.set(key, columnNumber);
    });

    return headerMap;
}

function getColumn(headerMap, key) {
    return headerMap.get(key);
}

function hasField(headerMap, key) {
    return headerMap.has(key);
}

function getFieldValue(row, headerMap, key) {
    const columnNumber = getColumn(headerMap, key);

    if (!columnNumber) {
        return undefined;
    }

    const value = getCellValue(row.getCell(columnNumber).value);

    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return undefined;
    }

    return value;
}

function getAvailableFields(headerMap) {
    return new Set(headerMap.keys());
}

function rowHasData(row, headerMap) {
    for (const key of headerMap.keys()) {
        const value = getFieldValue(row, headerMap, key);

        if (value !== undefined) {
            return true;
        }
    }

    return false;
}

function getExportHeaderMap(worksheet, headerRowNumber = 1) {
    return createHeaderMap(worksheet, headerRowNumber);
}

module.exports = {
    normalizeKey,

    createHeaderMap,

    getExportHeaderMap,

    getColumn,

    hasField,

    getFieldValue,

    getAvailableFields,

    rowHasData
};

'use strict';

const ExcelJS = require('exceljs');

const ApiError = require('../../utils/api-error');

const { createHeaderMap, getFieldValue, rowHasData } = require('./header-mapper');

async function readExcel(file, options = {}) {
    const { headerRowNumber = 1 } = options;

    if (!file || !file.buffer) {
        throw new ApiError(400, 'Vui lòng chọn file Excel để import.');
    }

    const workbook = new ExcelJS.Workbook();

    try {
        await workbook.xlsx.load(file.buffer);
    } catch (error) {
        throw new ApiError(400, 'Không thể đọc file Excel.');
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
        throw new ApiError(400, 'File Excel không có sheet dữ liệu.');
    }

    const headerMap = createHeaderMap(worksheet, headerRowNumber);

    if (headerMap.size === 0) {
        throw new ApiError(400, 'File Excel không có field dữ liệu.');
    }

    function getValue(row, field) {
        return getFieldValue(row, headerMap, field);
    }

    function hasData(row) {
        return rowHasData(row, headerMap);
    }

    return {
        workbook,

        worksheet,

        headerMap,

        getValue,

        hasData
    };
}

module.exports = {
    readExcel
};

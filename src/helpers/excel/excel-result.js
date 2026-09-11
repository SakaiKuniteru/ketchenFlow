'use strict';

async function createResultFile(workbook, worksheet, options = {}) {
    const { fileName, headerRowNumber = 1, successes = [], errors = [] } = options;

    const resultColumn = worksheet.columnCount + 1;

    const errorColumn = worksheet.columnCount + 2;

    worksheet.getRow(headerRowNumber).getCell(resultColumn).value = 'ketQua';

    worksheet.getRow(headerRowNumber).getCell(errorColumn).value = 'baoLoi';

    for (const success of successes) {
        for (const rowNumber of success.rowNumbers || []) {
            worksheet.getRow(rowNumber).getCell(resultColumn).value = success.message || 'Thành công';
        }
    }

    for (const error of errors) {
        for (const rowNumber of error.rowNumbers || []) {
            worksheet.getRow(rowNumber).getCell(errorColumn).value = error.message || 'Dữ liệu không hợp lệ.';
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
        fileName,

        buffer,

        data: {
            tongSo: successes.length + errors.length,

            thanhCong: successes.length,

            thatBai: errors.length,

            danhSach: successes
        }
    };
}

function sendExcel(res, result, statusCode = 200) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

    res.setHeader('X-Import-Total', String(result.data?.tongSo ?? 0));

    res.setHeader('X-Import-Success', String(result.data?.thanhCong ?? 0));

    res.setHeader('X-Import-Failed', String(result.data?.thatBai ?? 0));

    return res.status(statusCode).send(result.buffer);
}

module.exports = {
    createResultFile,

    sendExcel
};

async function createErrorFile(workbook, worksheet, errors, fileName, options = {}) {
    const { headerRowNumber = 1, successes = [] } = options;

    const resultColumn = worksheet.columnCount + 1;

    const errorColumn = worksheet.columnCount + 2;

    worksheet.getRow(headerRowNumber).getCell(resultColumn).value = 'ketQua';

    worksheet.getRow(headerRowNumber).getCell(errorColumn).value = 'baoLoi';

    for (const success of successes) {
        for (const rowNumber of success.rowNumbers) {
            worksheet.getRow(rowNumber).getCell(resultColumn).value = success.message || 'Thành công.';
        }
    }

    for (const error of errors) {
        for (const rowNumber of error.rowNumbers) {
            worksheet.getRow(rowNumber).getCell(errorColumn).value = error.message;
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
        coLoi: errors.length > 0,

        fileName,

        buffer
    };
}

module.exports = {
    createErrorFile
};

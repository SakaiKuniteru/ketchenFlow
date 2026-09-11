'use strict';

const fs = require('fs');

const path = require('path');

const ExcelJS = require('exceljs');

const pool = require('../../config/database');

const ApiError = require('../../utils/api-error');

const { getExportHeaderMap } = require('./header-mapper');

async function getReportTemplate(maBaoCao) {
    const sql = `
        SELECT

            id,
            ma_bao_cao,
            ten_bao_cao,
            file_mau,
            loai_xuat_file,
            active

        FROM dm_bao_cao

        WHERE LOWER(
            TRIM(ma_bao_cao)
        ) = LOWER(
            TRIM($1)
        )

        LIMIT 1
    `;

    const result = await pool.query(sql, [maBaoCao]);

    if (result.rows.length === 0) {
        throw new ApiError(404, `Không tìm thấy cấu hình báo cáo "${maBaoCao}".`);
    }

    const row = result.rows[0];

    if (!row.active) {
        throw new ApiError(400, `Báo cáo "${maBaoCao}" đã bị khóa.`);
    }

    if (!row.file_mau) {
        throw new ApiError(404, `Báo cáo "${maBaoCao}" chưa có file mẫu.`);
    }

    const fileMau = String(row.file_mau).trim().replace(/^\/+/, '');

    const filePath = fileMau.startsWith('uploads/')
        ? path.join(process.cwd(), 'src/public', fileMau)
        : path.join(process.cwd(), fileMau);

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, `Không tìm thấy file mẫu của báo cáo "${maBaoCao}".`);
    }

    return {
        baoCao: {
            id: row.id,

            maBaoCao: row.ma_bao_cao,

            tenBaoCao: row.ten_bao_cao,

            fileMau: row.file_mau,

            loaiXuatFile: row.loai_xuat_file
        },

        filePath
    };
}

function copyCellStyle(sourceCell, targetCell) {
    if (sourceCell.style) {
        targetCell.style = JSON.parse(JSON.stringify(sourceCell.style));
    }

    if (sourceCell.numFmt) {
        targetCell.numFmt = sourceCell.numFmt;
    }

    targetCell.alignment = sourceCell.alignment
        ? {
              ...sourceCell.alignment
          }
        : undefined;

    targetCell.border = sourceCell.border ? JSON.parse(JSON.stringify(sourceCell.border)) : undefined;

    targetCell.fill = sourceCell.fill ? JSON.parse(JSON.stringify(sourceCell.fill)) : undefined;

    targetCell.font = sourceCell.font
        ? {
              ...sourceCell.font
          }
        : undefined;
}

function copyRowStyle(worksheet, sourceRowNumber, targetRowNumber) {
    const sourceRow = worksheet.getRow(sourceRowNumber);

    const targetRow = worksheet.getRow(targetRowNumber);

    targetRow.height = sourceRow.height;

    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber++) {
        copyCellStyle(sourceRow.getCell(columnNumber), targetRow.getCell(columnNumber));
    }
}

function getDataKey(key) {
    if (typeof key !== 'string') {
        return key;
    }

    if (key.endsWith('/k')) {
        return key.slice(0, -2);
    }

    return key;
}

function writeRowByKey(row, headerMap, data) {
    for (const [excelKey, columnNumber] of headerMap) {
        const dataKey = getDataKey(excelKey);

        if (!Object.prototype.hasOwnProperty.call(data, dataKey)) {
            continue;
        }

        row.getCell(columnNumber).value = data[dataKey] ?? null;
    }
}

async function createExportFile(options) {
    const { maBaoCao, headerRowNumber = 1, templateRowNumber, dataStartRowNumber, data = [] } = options;

    const { filePath } = await getReportTemplate(maBaoCao);

    const workbook = new ExcelJS.Workbook();

    try {
        await workbook.xlsx.readFile(filePath);
    } catch (error) {
        throw new ApiError(400, `Không thể đọc file mẫu "${maBaoCao}".`);
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
        throw new ApiError(400, `File mẫu "${maBaoCao}" không có sheet dữ liệu.`);
    }

    const headerMap = getExportHeaderMap(worksheet, headerRowNumber);

    for (let index = 0; index < data.length; index++) {
        const rowNumber = dataStartRowNumber + index;

        if (templateRowNumber && rowNumber !== templateRowNumber) {
            copyRowStyle(worksheet, templateRowNumber, rowNumber);
        }

        const row = worksheet.getRow(rowNumber);

        writeRowByKey(row, headerMap, data[index]);

        row.commit();
    }

    const firstEmptyRow = dataStartRowNumber + data.length;

    const lastExistingRow = worksheet.rowCount;

    for (let rowNumber = firstEmptyRow; rowNumber <= lastExistingRow; rowNumber++) {
        if (rowNumber === templateRowNumber && data.length === 0) {
            continue;
        }

        const row = worksheet.getRow(rowNumber);

        for (const columnNumber of headerMap.values()) {
            row.getCell(columnNumber).value = null;
        }
    }

    if (data.length === 0) {
        const row = worksheet.getRow(dataStartRowNumber);

        for (const columnNumber of headerMap.values()) {
            row.getCell(columnNumber).value = null;
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
        fileName: `${maBaoCao}.xlsx`,

        buffer
    };
}

module.exports = {
    getReportTemplate,

    copyRowStyle,

    writeRowByKey,

    createExportFile
};

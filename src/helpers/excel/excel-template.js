function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function isTemplateValue(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const normalized = value.trim();

    return normalized.startsWith('[[') && normalized.endsWith(']]');
}

function cloneValue(value) {
    if (value === undefined || value === null) {
        return value;
    }

    if (typeof value !== 'object') {
        return value;
    }

    return JSON.parse(JSON.stringify(value));
}

function copyRowStyle(worksheet, sourceRowNumber, targetRowNumber) {
    const sourceRow = worksheet.getRow(sourceRowNumber);

    const targetRow = worksheet.getRow(targetRowNumber);

    targetRow.height = sourceRow.height;

    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber++) {
        const sourceCell = sourceRow.getCell(columnNumber);

        const targetCell = targetRow.getCell(columnNumber);

        if (sourceCell.style) {
            targetCell.style = cloneValue(sourceCell.style);
        }

        if (sourceCell.numFmt) {
            targetCell.numFmt = sourceCell.numFmt;
        }

        if (sourceCell.alignment) {
            targetCell.alignment = cloneValue(sourceCell.alignment);
        }

        if (sourceCell.border) {
            targetCell.border = cloneValue(sourceCell.border);
        }

        if (sourceCell.fill) {
            targetCell.fill = cloneValue(sourceCell.fill);
        }

        if (sourceCell.font) {
            targetCell.font = cloneValue(sourceCell.font);
        }

        if (sourceCell.dataValidation) {
            targetCell.dataValidation = cloneValue(sourceCell.dataValidation);
        }
    }
}

function getExportHeaderMap(worksheet, headerRowNumber) {
    const headerMap = new Map();

    const headerRow = worksheet.getRow(headerRowNumber);

    headerRow.eachCell(
        {
            includeEmpty: false
        },
        (cell, columnNumber) => {
            if (cell.value === undefined || cell.value === null) {
                return;
            }

            const key = String(cell.value).trim();

            if (!key) {
                return;
            }

            const field = key.endsWith('/k') ? key.slice(0, -2) : key;

            headerMap.set(field, columnNumber);
        }
    );

    return headerMap;
}

function ghiDongExport(row, headerMap, data) {
    for (const [field, columnNumber] of headerMap) {
        if (!Object.prototype.hasOwnProperty.call(data, field)) {
            continue;
        }

        const value = data[field];

        if (value === undefined || value === null || value === '') {
            continue;
        }

        row.getCell(columnNumber).value = value;
    }
}

function getOptionalValue(row, getValue, fieldsCoTrongFile, field) {
    if (!fieldsCoTrongFile.has(field)) {
        return undefined;
    }

    const value = getValue(row, field);

    if (isBlank(value)) {
        return undefined;
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value;
}

function rowHasData(row, getValue, fieldsCoTrongFile) {
    const values = [...fieldsCoTrongFile].map((field) => getValue(row, field));

    if (values.some((value) => isTemplateValue(value))) {
        return false;
    }

    return values.some((value) => !isBlank(value));
}

module.exports = {
    isBlank,

    isTemplateValue,

    cloneValue,

    copyRowStyle,

    getExportHeaderMap,

    ghiDongExport,

    getOptionalValue,

    rowHasData
};

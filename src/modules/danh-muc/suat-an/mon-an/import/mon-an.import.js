'use strict';

const ApiError = require('../../../../../utils/api-error');
const { readExcel } = require('../../../../../helpers/excel/excel-reader');
const { toNumber, toBoolean } = require('../../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../../helpers/excel/import-strategy');
const { createResultFile } = require('../../../../../helpers/excel/excel-result');
const monAnRepository = require('../mon-an.repository');
const monAnService = require('../mon-an.service');
const { MA_BAO_CAO, HEADER_ROW, DATA_START_ROW } = require('../export/mon-an.export');

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

async function resolveNhomMonAn(item) {
    const rawId = item.nhomMonAnId;
    const rawCode = item.maNhomMonAn;

    if (rawId === undefined && rawCode === undefined) {
        return undefined;
    }

    let nhomMonAnId = undefined;
    let nhomTheoMa = null;

    if (rawId !== undefined) {
        nhomMonAnId = parsePositiveInteger(rawId, 'ID nhóm món ăn');

        const exists = await monAnRepository.existsNhomMonAn(nhomMonAnId);

        if (!exists) {
            throw new ApiError(404, `Không tìm thấy nhóm món ăn đang hoạt động có ID ${nhomMonAnId}.`);
        }
    }

    if (rawCode !== undefined) {
        nhomTheoMa = await monAnRepository.getNhomMonAnByMa(rawCode);

        if (!nhomTheoMa) {
            throw new ApiError(404, `Không tìm thấy nhóm món ăn có mã "${rawCode}".`);
        }

        if (nhomTheoMa.active === false) {
            throw new ApiError(400, `Nhóm món ăn "${nhomTheoMa.tenNhomMonAn}" đã bị khóa.`);
        }
    }

    if (nhomMonAnId !== undefined && nhomTheoMa && Number(nhomMonAnId) !== Number(nhomTheoMa.id)) {
        throw new ApiError(400, `ID nhóm món ăn ${nhomMonAnId} và mã "${rawCode}" không cùng một nhóm món ăn.`);
    }

    if (nhomMonAnId !== undefined) {
        return nhomMonAnId;
    }

    return nhomTheoMa.id;
}

function readItem(row, rowNumber, getValue, keyConfig) {
    const codeField = keyConfig.hasCodeKey ? 'maMonAn/k' : 'maMonAn';

    return {
        rowNumbers: [rowNumber],
        idIsKey: keyConfig.hasIdKey,
        codeIsKey: keyConfig.hasCodeKey,
        id: keyConfig.hasIdKey ? getValue(row, 'id/k') : undefined,
        code: getValue(row, codeField),
        maMonAn: getValue(row, codeField),
        tenMonAn: getValue(row, 'tenMonAn'),
        nhomMonAnId: getValue(row, 'nhomMonAnId'),
        maNhomMonAn: getValue(row, 'maNhomMonAn'),
        giaTien: getValue(row, 'giaTien'),
        calories: getValue(row, 'calories'),
        moTa: getValue(row, 'moTa'),
        active: getValue(row, 'active')
    };
}

async function createBusinessData(item) {
    const data = {};

    if (item.tenMonAn !== undefined) {
        data.tenMonAn = item.tenMonAn;
    }

    const nhomMonAnId = await resolveNhomMonAn(item);

    if (nhomMonAnId !== undefined) {
        data.nhomMonAnId = nhomMonAnId;
    }

    const giaTien = parseNumber(item.giaTien, 'Giá tiền');

    if (giaTien !== undefined) {
        if (giaTien < 0) {
            throw new ApiError(400, 'Giá tiền không được nhỏ hơn 0.');
        }

        data.giaTien = giaTien;
    }

    const calories = parseNumber(item.calories, 'Calories');

    if (calories !== undefined) {
        if (calories < 0) {
            throw new ApiError(400, 'Calories không được nhỏ hơn 0.');
        }

        data.calories = calories;
    }

    if (item.moTa !== undefined) {
        data.moTa = item.moTa;
    }

    const active = parseBoolean(item.active);

    if (active !== undefined) {
        data.active = active;
    }

    return data;
}

async function processItem(item) {
    if (item.id !== undefined) {
        item.id = parsePositiveInteger(item.id, 'ID món ăn');
    }

    const strategy = await resolveImportStrategy(item, {
        getById: (id) => monAnRepository.getChiTiet(id),

        getByCode: (code) => monAnRepository.getChiTietByMa(code),

        getRecordCode: (record) => record.maMonAn,

        entityName: 'món ăn'
    });

    const data = await createBusinessData(item);

    if (strategy.action === 'UPDATE') {
        if (
            strategy.allowCodeChange &&
            item.maMonAn !== undefined &&
            shouldChangeCode(item.maMonAn, strategy.record.maMonAn)
        ) {
            data.maMonAn = item.maMonAn;
        }

        if (Object.keys(data).length === 0) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await monAnService.update(strategy.record.id, data);

        return {
            rowNumbers: item.rowNumbers,
            id: result.id,
            maMonAn: result.maMonAn,
            hanhDong: 'CAP_NHAT',
            message: `Cập nhật thành công - ID ${result.id}`
        };
    }

    if (!item.maMonAn) {
        throw new ApiError(400, 'Thêm mới món ăn phải có mã món ăn.');
    }

    data.maMonAn = item.maMonAn;

    const result = await monAnService.create(data);

    return {
        rowNumbers: item.rowNumbers,
        id: result.id,
        maMonAn: result.maMonAn,
        hanhDong: 'THEM_MOI',
        message: `Thêm mới thành công - ID ${result.id}`
    };
}

async function importMonAn(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    const keyConfig = validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maMonAn/k',
        codeField: 'maMonAn'
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
    importMonAn
};

'use strict';

const ApiError = require('../../../../utils/api-error');
const nhaAnRepository = require('./nha-an.repository');
const nhaAnService = require('./nha-an.service');
const { readExcel } = require('../../../../helpers/excel/excel-reader');
const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');
const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');
const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_nha_an';
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maNhaAn/k',
        codeField: 'maNhaAn'
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

function parseDanhSach(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value;
    }

    const text = String(value).trim();

    if (!text) {
        return [];
    }

    if (text.startsWith('[') && text.endsWith(']')) {
        try {
            const parsed = JSON.parse(text);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {}
    }

    return text
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
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

        const maNhaAn = getValue(row, fieldMa);
        const tenNhaAn = getValue(row, 'tenNhaAn');
        const maCoSo = getValue(row, 'maCoSo');
        const dsMaNvQuanLy = getValue(row, 'dsMaNvQuanLy');
        const dsNvQuanLyId = getValue(row, 'dsNvQuanLyId');
        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maNhaAn
        };

        if (tenNhaAn !== undefined) {
            item.tenNhaAn = tenNhaAn;
        }

        if (maCoSo !== undefined) {
            item.maCoSo = maCoSo;
        }

        if (dsMaNvQuanLy !== undefined) {
            item.dsMaNvQuanLy = parseDanhSach(dsMaNvQuanLy)
                .map((value) => String(value).trim().toUpperCase())
                .filter(Boolean);
        }

        if (dsNvQuanLyId !== undefined) {
            item.dsNvQuanLyId = parseDanhSach(dsNvQuanLyId).map((value) => Number(value));
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
        throw new ApiError(400, 'ID nhà ăn phải là số nguyên lớn hơn 0.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }

    if (item.dsNvQuanLyId !== undefined) {
        const idKhongHopLe = item.dsNvQuanLyId.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0);

        if (idKhongHopLe) {
            throw new ApiError(400, 'Danh sách ID nhân viên quản lý không hợp lệ.');
        }
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới nhà ăn phải có mã nhà ăn.');
    }

    if (!item.tenNhaAn) {
        throw new ApiError(400, 'Thêm mới nhà ăn phải có tên nhà ăn.');
    }
}

async function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenNhaAn !== undefined) {
        data.tenNhaAn = item.tenNhaAn;
    }

    if (item.active !== undefined) {
        data.active = item.active;
    }

    if (item.maCoSo !== undefined) {
        const coSo = await nhaAnRepository.getCoSoByMa(item.maCoSo);

        if (!coSo) {
            throw new ApiError(400, `Không tìm thấy cơ sở "${item.maCoSo}".`);
        }

        data.coSoId = coSo.id;
    }

    if (item.dsNvQuanLyId !== undefined) {
        const dsNhanVien = await nhaAnRepository.getDsNhanVienByIds(item.dsNvQuanLyId);

        if (dsNhanVien.length !== item.dsNvQuanLyId.length) {
            throw new ApiError(400, 'Danh sách ID nhân viên quản lý không hợp lệ.');
        }

        data.dsNvQuanLyId = dsNhanVien.map((item) => item.id);
    }

    if (item.dsMaNvQuanLy !== undefined) {
        const dsNhanVien = await nhaAnRepository.getDsNhanVienByMa(item.dsMaNvQuanLy);

        if (dsNhanVien.length !== item.dsMaNvQuanLy.length) {
            throw new ApiError(400, 'Danh sách mã nhân viên quản lý không hợp lệ.');
        }

        const dsIdTheoMa = dsNhanVien.map((item) => Number(item.id));

        if (item.dsNvQuanLyId !== undefined) {
            const dsIdTruyen = [...item.dsNvQuanLyId].sort((a, b) => a - b);

            const dsIdTheoMaSapXep = [...dsIdTheoMa].sort((a, b) => a - b);

            if (JSON.stringify(dsIdTruyen) !== JSON.stringify(dsIdTheoMaSapXep)) {
                throw new ApiError(400, 'Danh sách ID và mã nhân viên quản lý không khớp.');
            }
        }

        data.dsNvQuanLyId = dsIdTheoMa;
    }

    return data;
}

async function timNhaAnImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => nhaAnRepository.getChiTiet(id),

        getByCode: (ma) => nhaAnRepository.getChiTietByMa(ma),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maNhaAn,

        entityName: 'nhà ăn'
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

            const xuLy = await timNhaAnImport(item);

            const data = await taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maNhaAn)
                ) {
                    data.maNhaAn = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await nhaAnService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maNhaAn: result.maNhaAn,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maNhaAn = item.code;

            const result = await nhaAnService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maNhaAn: result.maNhaAn,
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
    timNhaAnImport,
    taoDuLieuNghiepVu
};

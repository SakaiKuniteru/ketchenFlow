'use strict';

const ApiError = require('../../../../utils/api-error');

const vaiTroRepository = require('./vai-tro.repository');

const vaiTroService = require('./vai-tro.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_vai_tro';

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maVaiTro/k',
        codeField: 'maVaiTro'
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

function toArray(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value;
    }

    let text = String(value).trim();

    if (!text) {
        return [];
    }

    if (text.startsWith('[') && text.endsWith(']')) {
        try {
            const result = JSON.parse(text);

            if (Array.isArray(result)) {
                return result;
            }
        } catch (error) {
            text = text.slice(1, -1).trim();
        }
    }

    if (!text) {
        return [];
    }

    return text
        .split(',')
        .map((item) =>
            String(item)
                .trim()
                .replace(/^["']|["']$/g, '')
        )
        .filter(Boolean);
}

function toIdArray(value) {
    const values = toArray(value);

    if (values === undefined) {
        return undefined;
    }

    return values.map((item) => toNumber(item));
}

function toTextArray(value) {
    const values = toArray(value);

    if (values === undefined) {
        return undefined;
    }

    return values.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
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

        const maVaiTro = getValue(row, fieldMa);

        const tenVaiTro = getValue(row, 'tenVaiTro');

        const moTa = getValue(row, 'moTa');

        const dsQuyenIdRaw = getValue(row, 'dsQuyenId');

        const dsMaQuyenRaw = getValue(row, 'dsMaQuyen');

        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maVaiTro
        };

        if (maVaiTro !== undefined) item.maVaiTro = maVaiTro;

        if (tenVaiTro !== undefined) item.tenVaiTro = tenVaiTro;

        if (moTa !== undefined) item.moTa = moTa;

        if (dsQuyenIdRaw !== undefined) {
            item.dsQuyenId = toIdArray(dsQuyenIdRaw);
        }

        if (dsMaQuyenRaw !== undefined) {
            item.dsMaQuyen = toTextArray(dsMaQuyenRaw);
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
        throw new ApiError(400, 'ID vai trò phải là số nguyên lớn hơn 0.');
    }

    if (item.dsQuyenId !== undefined && !Array.isArray(item.dsQuyenId)) {
        throw new ApiError(400, 'Danh sách ID quyền không hợp lệ.');
    }

    if (item.dsQuyenId !== undefined) {
        for (const id of item.dsQuyenId) {
            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                throw new ApiError(400, 'Danh sách ID quyền chỉ được chứa số nguyên lớn hơn 0.');
            }
        }
    }

    if (item.dsMaQuyen !== undefined && !Array.isArray(item.dsMaQuyen)) {
        throw new ApiError(400, 'Danh sách mã quyền không hợp lệ.');
    }

    if (item.dsMaQuyen !== undefined) {
        for (const ma of item.dsMaQuyen) {
            if (typeof ma !== 'string' || !ma.trim()) {
                throw new ApiError(400, 'Danh sách mã quyền chứa mã không hợp lệ.');
            }
        }
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới vai trò phải có mã vai trò.');
    }

    if (!item.tenVaiTro) {
        throw new ApiError(400, 'Thêm mới vai trò phải có tên vai trò.');
    }
}

async function xuLyDanhSachQuyen(item) {
    const coId = Array.isArray(item.dsQuyenId) && item.dsQuyenId.length > 0;

    const coMa = Array.isArray(item.dsMaQuyen) && item.dsMaQuyen.length > 0;

    const coNhapId = item.dsQuyenId !== undefined;

    const coNhapMa = item.dsMaQuyen !== undefined;

    if (!coId && !coMa) {
        if (coNhapId || coNhapMa) {
            return [];
        }

        return undefined;
    }

    let quyenTheoId = null;
    let quyenTheoMa = null;

    if (coId) {
        const ids = [...new Set(item.dsQuyenId.map((id) => Number(id)))];

        quyenTheoId = await vaiTroRepository.getDsQuyenByIds(ids);

        if (quyenTheoId.length !== ids.length) {
            throw new ApiError(400, 'Có ID quyền không tồn tại.');
        }

        const quyenKhoa = quyenTheoId.find((item) => item.active !== true);

        if (quyenKhoa) {
            throw new ApiError(400, `Quyền ${quyenKhoa.maQuyen} đang bị khóa.`);
        }
    }

    if (coMa) {
        const mas = [...new Set(item.dsMaQuyen.map((ma) => ma.trim().toUpperCase()))];

        quyenTheoMa = await vaiTroRepository.getDsQuyenByMas(mas);

        if (quyenTheoMa.length !== mas.length) {
            const maTimDuoc = new Set(quyenTheoMa.map((item) => item.maQuyen.trim().toUpperCase()));

            const maKhongTonTai = mas.filter((ma) => !maTimDuoc.has(ma));

            throw new ApiError(400, `Mã quyền không tồn tại: ${maKhongTonTai.join(', ')}.`);
        }

        const quyenKhoa = quyenTheoMa.find((item) => item.active !== true);

        if (quyenKhoa) {
            throw new ApiError(400, `Quyền ${quyenKhoa.maQuyen} đang bị khóa.`);
        }
    }

    if (coId && coMa) {
        const idsTheoId = quyenTheoId.map((item) => Number(item.id)).sort((a, b) => a - b);

        const idsTheoMa = quyenTheoMa.map((item) => Number(item.id)).sort((a, b) => a - b);

        if (idsTheoId.length !== idsTheoMa.length || idsTheoId.some((id, index) => id !== idsTheoMa[index])) {
            throw new ApiError(400, 'Danh sách ID quyền và danh sách mã quyền không khớp.');
        }

        return idsTheoId;
    }

    if (coId) {
        return quyenTheoId.map((item) => Number(item.id));
    }

    return quyenTheoMa.map((item) => Number(item.id));
}
async function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maVaiTro !== undefined) data.maVaiTro = item.maVaiTro;

    if (item.tenVaiTro !== undefined) data.tenVaiTro = item.tenVaiTro;

    if (item.moTa !== undefined) data.moTa = item.moTa;

    if (item.dsQuyenId !== undefined || item.dsMaQuyen !== undefined) {
        data.dsQuyenId = await xuLyDanhSachQuyen(item);
    }

    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timVaiTroImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => vaiTroRepository.getChiTiet(id),

        getByCode: (maVaiTro) => vaiTroRepository.getChiTietByMa(maVaiTro),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maVaiTro,

        entityName: 'vai trò'
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

            const xuLy = await timVaiTroImport(item);

            const data = await taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maVaiTro)
                ) {
                    data.maVaiTro = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await vaiTroService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maVaiTro: result.maVaiTro,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maVaiTro = item.code;

            const result = await vaiTroService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maVaiTro: result.maVaiTro,
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
    timVaiTroImport,
    taoDuLieuNghiepVu
};

'use strict';

const ApiError = require('../../../../utils/api-error');
const taiKhoanRepository = require('./tai-khoan.repository');
const taiKhoanService = require('./tai-khoan.service');
const { readExcel } = require('../../../../helpers/excel/excel-reader');
const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');
const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');
const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_tai_khoan';
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'tenDangNhap/k',
        codeField: 'tenDangNhap'
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

        const tenDangNhap = getValue(row, fieldMa);

        const maNhanVien = getValue(row, 'maNhanVien');

        const hoTen = getValue(row, 'hoTen');

        const maCoSo = getValue(row, 'maCoSo');

        const maPhongBan = getValue(row, 'maPhongBan');

        const maChucVu = getValue(row, 'maChucVu');

        const dsVaiTroIdRaw = getValue(row, 'dsVaiTroId');

        const dsMaVaiTroRaw = getValue(row, 'dsMaVaiTro');

        const khoaDen = getValue(row, 'khoaDen');

        const biKhoaRaw = getValue(row, 'biKhoa');

        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: tenDangNhap
        };

        if (tenDangNhap !== undefined) {
            item.tenDangNhap = tenDangNhap;
        }

        if (maNhanVien !== undefined) item.maNhanVien = maNhanVien;
        if (hoTen !== undefined) item.hoTen = hoTen;
        if (maCoSo !== undefined) item.maCoSo = maCoSo;
        if (maPhongBan !== undefined) item.maPhongBan = maPhongBan;
        if (maChucVu !== undefined) item.maChucVu = maChucVu;

        if (dsVaiTroIdRaw !== undefined) {
            item.dsVaiTroId = tachDanhSachId(dsVaiTroIdRaw);
        }

        if (dsMaVaiTroRaw !== undefined) {
            item.dsMaVaiTro = tachDanhSachMa(dsMaVaiTroRaw);
        }

        if (khoaDen !== undefined) item.khoaDen = khoaDen;

        if (biKhoaRaw !== undefined) {
            try {
                item.biKhoa = toBoolean(biKhoaRaw);
            } catch (error) {
                item.biKhoa = biKhoaRaw;
            }
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

function tachDanhSachId(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (Array.isArray(value)) {
        const ketQua = value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0);

        return ketQua.length > 0 ? [...new Set(ketQua)] : undefined;
    }

    const text = String(value).trim();

    if (!text) {
        return undefined;
    }

    let danhSach = [];

    if (text.startsWith('[') && text.endsWith(']')) {
        try {
            danhSach = JSON.parse(text);
        } catch (error) {
            throw new ApiError(400, 'Danh sách ID vai trò không đúng định dạng.');
        }

        if (!Array.isArray(danhSach)) {
            throw new ApiError(400, 'Danh sách ID vai trò không đúng định dạng.');
        }
    } else {
        danhSach = text
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    const ketQua = danhSach.map((item) => Number(item));

    const khongHopLe = ketQua.some((item) => !Number.isInteger(item) || item <= 0);

    if (khongHopLe) {
        throw new ApiError(400, 'Danh sách ID vai trò chỉ được chứa số nguyên lớn hơn 0.');
    }

    return ketQua.length > 0 ? [...new Set(ketQua)] : undefined;
}

function tachDanhSachMa(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (Array.isArray(value)) {
        const ketQua = value.map((item) => String(item).trim().toUpperCase()).filter(Boolean);

        return ketQua.length > 0 ? [...new Set(ketQua)] : undefined;
    }

    const text = String(value).trim();

    if (!text) {
        return undefined;
    }

    let danhSach = [];

    if (text.startsWith('[') && text.endsWith(']')) {
        try {
            danhSach = JSON.parse(text);
        } catch (error) {
            throw new ApiError(400, 'Danh sách mã vai trò không đúng định dạng.');
        }

        if (!Array.isArray(danhSach)) {
            throw new ApiError(400, 'Danh sách mã vai trò không đúng định dạng.');
        }
    } else {
        danhSach = text.split(',');
    }

    const ketQua = danhSach.map((item) => String(item).trim().toUpperCase()).filter(Boolean);

    return ketQua.length > 0 ? [...new Set(ketQua)] : undefined;
}

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID tài khoản phải là số nguyên lớn hơn 0.');
    }

    if (item.khoaDen !== undefined && Number.isNaN(Date.parse(item.khoaDen))) {
        throw new ApiError(400, 'Khóa đến không đúng định dạng ngày.');
    }

    if (item.biKhoa !== undefined && typeof item.biKhoa !== 'boolean') {
        throw new ApiError(400, 'Trạng thái khóa không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }

    if (item.dsVaiTroId !== undefined) {
        if (!Array.isArray(item.dsVaiTroId)) {
            throw new ApiError(400, 'Danh sách ID vai trò không hợp lệ.');
        }

        for (const id of item.dsVaiTroId) {
            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                throw new ApiError(400, 'Danh sách ID vai trò chỉ được chứa số nguyên lớn hơn 0.');
            }
        }
    }

    if (item.dsMaVaiTro !== undefined) {
        if (!Array.isArray(item.dsMaVaiTro)) {
            throw new ApiError(400, 'Danh sách mã vai trò không hợp lệ.');
        }

        for (const ma of item.dsMaVaiTro) {
            if (typeof ma !== 'string' || !ma.trim()) {
                throw new ApiError(400, 'Danh sách mã vai trò chứa mã không hợp lệ.');
            }
        }
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới tài khoản phải có mã tài khoản.');
    }

    if (!item.maNhanVien) {
        throw new ApiError(400, 'Thêm mới tài khoản phải có mã nhân viên.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenDangNhap !== undefined) data.tenDangNhap = item.tenDangNhap;
    if (item.maNhanVien !== undefined) data.maNhanVien = item.maNhanVien;
    if (item.hoTen !== undefined) data.hoTen = item.hoTen;
    if (item.maCoSo !== undefined) data.maCoSo = item.maCoSo;
    if (item.maPhongBan !== undefined) data.maPhongBan = item.maPhongBan;
    if (item.maChucVu !== undefined) data.maChucVu = item.maChucVu;
    if (item.dsVaiTroId !== undefined) data.dsVaiTroId = item.dsVaiTroId;
    if (item.dsMaVaiTro !== undefined) data.dsMaVaiTro = item.dsMaVaiTro;
    if (item.biKhoa !== undefined) data.biKhoa = item.biKhoa;
    if (item.khoaDen !== undefined) data.khoaDen = item.khoaDen;
    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timTaiKhoanImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => taiKhoanRepository.getChiTiet(id),

        getByCode: (tenDangNhap) => taiKhoanRepository.getChiTietByTenDangNhap(tenDangNhap),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.tenDangNhap,

        entityName: 'tài khoản'
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

            const xuLy = await timTaiKhoanImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.tenDangNhap)
                ) {
                    data.tenDangNhap = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await taiKhoanService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    tenDangNhap: result.tenDangNhap,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.tenDangNhap = item.code;

            const result = await taiKhoanService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                tenDangNhap: result.tenDangNhap,
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
    timTaiKhoanImport,
    taoDuLieuNghiepVu
};

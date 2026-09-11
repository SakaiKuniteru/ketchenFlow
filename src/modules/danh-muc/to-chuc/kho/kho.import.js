'use strict';

const ApiError = require('../../../../utils/api-error');
const khoRepository = require('./kho.repository');
const khoService = require('./kho.service');

const { readExcel } = require('../../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_kho';
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maKho/k',
        codeField: 'maKho'
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

function parseDanhSachGiaTri(value) {
    if (value === undefined || value === null) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    let text = String(value).trim();

    if (!text) {
        return [];
    }

    if (text.startsWith('[') && text.endsWith(']')) {
        text = text.substring(1, text.length - 1).trim();
    }

    if (!text) {
        return [];
    }

    return text
        .split(',')
        .map((item) => {
            let value = String(item).trim();

            value = value.replace(/^["']|["']$/g, '');

            return value.trim();
        })
        .filter(Boolean);
}

function parseDanhSachId(value) {
    const danhSach = parseDanhSachGiaTri(value);

    if (danhSach.length === 0) {
        return [];
    }

    return danhSach.map((value) => {
        const id = toNumber(value);

        if (id === null || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            throw new ApiError(400, `ID nhân viên "${value}" không hợp lệ.`);
        }

        return Number(id);
    });
}

function parseDanhSachMa(value) {
    return parseDanhSachGiaTri(value)
        .map((value) => String(value).trim())
        .filter(Boolean);
}

function loaiBoTrung(danhSach) {
    return [...new Set(danhSach)];
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

        const maKho = getValue(row, fieldMa);
        const tenKho = getValue(row, 'tenKho');
        const nhaAnId = getValue(row, 'nhaAnId');
        const maNhaAn = getValue(row, 'maNhaAn');
        const loaiKho = getValue(row, 'loaiKho');
        const diaDiem = getValue(row, 'diaDiem');
        const dienTich = getValue(row, 'dienTich');
        const nhietDoToiThieu = getValue(row, 'nhietDoToiThieu');
        const nhietDoToiDa = getValue(row, 'nhietDoToiDa');
        const moTa = getValue(row, 'moTa');
        const ghiChu = getValue(row, 'ghiChu');
        const activeRaw = getValue(row, 'active');
        const dsNvQuanLyIdRaw = getValue(row, 'dsNvQuanLyId');
        const dsNvQuanLyMaRaw = getValue(row, 'dsNvQuanLyMa');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maKho
        };

        if (tenKho !== undefined) {
            item.tenKho = tenKho;
        }

        if (nhaAnId !== undefined) {
            item.nhaAnId = toNumber(nhaAnId);
        }

        if (maNhaAn !== undefined) {
            item.maNhaAn = maNhaAn;
        }

        if (loaiKho !== undefined) {
            item.loaiKho = toNumber(loaiKho);
        }

        if (diaDiem !== undefined) {
            item.diaDiem = diaDiem;
        }

        if (dienTich !== undefined) {
            item.dienTich = Number(dienTich);
        }

        if (nhietDoToiThieu !== undefined) {
            item.nhietDoToiThieu = Number(nhietDoToiThieu);
        }

        if (nhietDoToiDa !== undefined) {
            item.nhietDoToiDa = Number(nhietDoToiDa);
        }

        if (moTa !== undefined) {
            item.moTa = moTa;
        }

        if (ghiChu !== undefined) {
            item.ghiChu = ghiChu;
        }

        if (activeRaw !== undefined) {
            try {
                item.active = toBoolean(activeRaw);
            } catch (error) {
                item.active = activeRaw;
            }
        }

        if (dsNvQuanLyIdRaw !== undefined) {
            item.dsNvQuanLyId = loaiBoTrung(parseDanhSachId(dsNvQuanLyIdRaw));
        }

        if (dsNvQuanLyMaRaw !== undefined) {
            item.dsNvQuanLyMa = loaiBoTrung(parseDanhSachMa(dsNvQuanLyMaRaw));
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
        throw new ApiError(400, 'ID Kho phải là số nguyên lớn hơn 0.');
    }

    if (item.dienTich !== undefined && (Number.isNaN(Number(item.dienTich)) || Number(item.dienTich) < 0)) {
        throw new ApiError(400, 'Diện tích phải là số lớn hơn hoặc bằng 0.');
    }

    if (item.nhietDoToiThieu !== undefined && Number.isNaN(Number(item.nhietDoToiThieu))) {
        throw new ApiError(400, 'Nhiệt độ tối thiểu không hợp lệ.');
    }

    if (item.nhietDoToiDa !== undefined && Number.isNaN(Number(item.nhietDoToiDa))) {
        throw new ApiError(400, 'Nhiệt độ tối đa không hợp lệ.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }

    if (item.dsNvQuanLyId !== undefined && item.dsNvQuanLyMa !== undefined) {
        throw new ApiError(
            400,
            'Chỉ được nhập danh sách nhân viên quản lý theo ID hoặc mã nhân viên, không nhập đồng thời cả hai.'
        );
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới kho phải có mã kho.');
    }

    if (!item.tenKho) {
        throw new ApiError(400, 'Thêm mới kho phải có tên kho.');
    }

    if (item.nhaAnId === undefined && item.maNhaAn === undefined) {
        throw new ApiError(400, 'Thêm mới kho phải có nhà ăn.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenKho !== undefined) {
        data.tenKho = item.tenKho;
    }

    if (item.nhaAnId !== undefined) {
        data.nhaAnId = item.nhaAnId;
    }

    if (item.maNhaAn !== undefined) {
        data.maNhaAn = item.maNhaAn;
    }

    if (item.loaiKho !== undefined) {
        data.loaiKho = item.loaiKho;
    }

    if (item.diaDiem !== undefined) {
        data.diaDiem = item.diaDiem;
    }

    if (item.dienTich !== undefined) {
        data.dienTich = item.dienTich;
    }

    if (item.nhietDoToiThieu !== undefined) {
        data.nhietDoToiThieu = item.nhietDoToiThieu;
    }

    if (item.nhietDoToiDa !== undefined) {
        data.nhietDoToiDa = item.nhietDoToiDa;
    }

    if (item.moTa !== undefined) {
        data.moTa = item.moTa;
    }

    if (item.ghiChu !== undefined) {
        data.ghiChu = item.ghiChu;
    }

    if (item.active !== undefined) {
        data.active = item.active;
    }

    return data;
}

async function timKhoImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => khoRepository.getChiTiet(id),
        getByCode: (ma) => khoRepository.getChiTietByMa(ma),
        getRecordId: (record) => record.id,
        getRecordCode: (record) => record.maKho,
        entityName: 'kho'
    });
}

async function layNhaAnId(item, xuLy) {
    if (xuLy && xuLy.record && xuLy.record.nhaAnId) {
        return xuLy.record.nhaAnId;
    }

    if (item.nhaAnId !== undefined) {
        return item.nhaAnId;
    }

    if (item.maNhaAn !== undefined) {
        const nhaAn = await khoRepository.getNhaAnByMa(item.maNhaAn);

        if (!nhaAn) {
            throw new ApiError(400, `Không tìm thấy nhà ăn có mã "${item.maNhaAn}".`);
        }

        if (!nhaAn.active) {
            throw new ApiError(400, `Nhà ăn "${item.maNhaAn}" đang bị khóa.`);
        }

        return nhaAn.id;
    }

    throw new ApiError(400, 'Không xác định được nhà ăn của kho.');
}

async function layDanhSachNhanVienQuanLy(item, xuLy) {
    if (item.dsNvQuanLyId === undefined && item.dsNvQuanLyMa === undefined) {
        return undefined;
    }

    const nhaAnId = await layNhaAnId(item, xuLy);

    if (item.dsNvQuanLyId !== undefined && item.dsNvQuanLyMa !== undefined) {
        throw new ApiError(
            400,
            'Chỉ được nhập danh sách nhân viên quản lý theo ID hoặc mã nhân viên, không nhập đồng thời cả hai.'
        );
    }

    if (item.dsNvQuanLyId !== undefined) {
        const dsId = item.dsNvQuanLyId;

        const dsNhanVien = await khoRepository.getDsNhanVienByIds(dsId);

        const mapId = new Map(dsNhanVien.map((nhanVien) => [Number(nhanVien.id), nhanVien]));

        const dsIdKhongTonTai = dsId.filter((id) => !mapId.has(Number(id)));

        if (dsIdKhongTonTai.length > 0) {
            throw new ApiError(400, `Nhân viên có ID [${dsIdKhongTonTai.join(', ')}] không tồn tại.`);
        }

        const dsNhanVienKhongHoatDong = dsNhanVien.filter((nhanVien) => nhanVien.active !== true);

        if (dsNhanVienKhongHoatDong.length > 0) {
            throw new ApiError(
                400,
                `Nhân viên có ID [${dsNhanVienKhongHoatDong.map((nhanVien) => nhanVien.id).join(', ')}] không hoạt động.`
            );
        }

        const dsNhanVienThuocNhaAn = await khoRepository.getDsNhanVienThuocNhaAnByIds(dsId, nhaAnId);

        const tapIdThuocNhaAn = new Set(dsNhanVienThuocNhaAn.map((nhanVien) => Number(nhanVien.id)));

        const dsIdKhongThuocNhaAn = dsId.filter((id) => !tapIdThuocNhaAn.has(Number(id)));

        if (dsIdKhongThuocNhaAn.length > 0) {
            throw new ApiError(400, `Nhân viên có ID [${dsIdKhongThuocNhaAn.join(', ')}] không thuộc nhà ăn của kho.`);
        }

        return [...new Set(dsId.map(Number))];
    }

    if (item.dsNvQuanLyMa !== undefined) {
        const dsMa = item.dsNvQuanLyMa;

        const dsNhanVien = await khoRepository.getDsNhanVienByMa(dsMa);

        const mapMa = new Map(
            dsNhanVien.map((nhanVien) => [String(nhanVien.maNhanVien).trim().toUpperCase(), nhanVien])
        );

        const dsMaKhongTonTai = dsMa.filter((ma) => !mapMa.has(String(ma).trim().toUpperCase()));

        if (dsMaKhongTonTai.length > 0) {
            throw new ApiError(400, `Nhân viên có mã [${dsMaKhongTonTai.join(', ')}] không tồn tại.`);
        }

        const dsNhanVienKhongHoatDong = dsNhanVien.filter((nhanVien) => nhanVien.active !== true);

        if (dsNhanVienKhongHoatDong.length > 0) {
            throw new ApiError(
                400,
                `Nhân viên có mã [${dsNhanVienKhongHoatDong.map((nhanVien) => nhanVien.maNhanVien).join(', ')}] không hoạt động.`
            );
        }

        const dsNhanVienThuocNhaAn = await khoRepository.getDsNhanVienThuocNhaAnByMa(dsMa, nhaAnId);

        const tapMaThuocNhaAn = new Set(
            dsNhanVienThuocNhaAn.map((nhanVien) => String(nhanVien.maNhanVien).trim().toUpperCase())
        );

        const dsMaKhongThuocNhaAn = dsMa.filter((ma) => !tapMaThuocNhaAn.has(String(ma).trim().toUpperCase()));

        if (dsMaKhongThuocNhaAn.length > 0) {
            throw new ApiError(400, `Nhân viên có mã [${dsMaKhongThuocNhaAn.join(', ')}] không thuộc nhà ăn của kho.`);
        }

        return dsMa.map((ma) => Number(mapMa.get(String(ma).trim().toUpperCase()).id));
    }

    return undefined;
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

            const xuLy = await timKhoImport(item);
            const data = taoDuLieuNghiepVu(item);

            const dsNvQuanLyId = await layDanhSachNhanVienQuanLy(item, xuLy);

            if (dsNvQuanLyId !== undefined) {
                data.dsNvQuanLyId = dsNvQuanLyId;
            }

            if (xuLy.action === 'UPDATE') {
                if (xuLy.allowCodeChange && item.code !== undefined && shouldChangeCode(item.code, xuLy.record.maKho)) {
                    data.maKho = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await khoService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maKho: result.maKho,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maKho = item.code;

            const result = await khoService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maKho: result.maKho,
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
    timKhoImport,
    taoDuLieuNghiepVu,
    parseDanhSachGiaTri,
    parseDanhSachId,
    parseDanhSachMa,
    layDanhSachNhanVienQuanLy
};

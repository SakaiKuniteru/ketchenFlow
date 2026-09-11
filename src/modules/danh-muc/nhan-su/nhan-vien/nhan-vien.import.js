'use strict';

const ApiError = require('../../../../utils/api-error');
const nhanVienRepository = require('./nhan-vien.repository');
const nhanVienService = require('./nhan-vien.service');
const { readExcel } = require('../../../../helpers/excel/excel-reader');
const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');
const { createResultFile, sendExcel } = require('../../../../helpers/excel/excel-result');
const { isTemplateValue } = require('../../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'dm_nhan_vien';
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maNhanVien/k',
        codeField: 'maNhanVien'
    });
}

function dongLaTemplate(row, getValue, headerMap) {
    const values = [];

    for (const field of headerMap.keys()) {
        const value = getValue(row, field);

        if (value !== undefined && value !== null && value !== '') {
            values.push(value);
        }
    }

    if (values.length === 0) {
        return false;
    }

    return values.every((value) => isTemplateValue(value));
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

        const idRaw = cauHinh.hasIdKey ? getValue(row, cauHinh.idKey) : undefined;

        const maNhanVien = getValue(row, fieldMa);

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maNhanVien
        };

        const hoTen = getValue(row, 'hoTen');
        const ngaySinh = getValue(row, 'ngaySinh');
        const gioiTinh = getValue(row, 'gioiTinh');
        const soDienThoai = getValue(row, 'soDienThoai');
        const email = getValue(row, 'email');
        const diaChi = getValue(row, 'diaChi');

        const quocGiaIdRaw = getValue(row, 'quocGiaId');
        const maQuocGia = getValue(row, 'maQuocGia');

        const tinhThanhIdRaw = getValue(row, 'tinhThanhId');
        const maTinhThanh = getValue(row, 'maTinhThanh');

        const xaPhuongIdRaw = getValue(row, 'xaPhuongId');
        const maXaPhuong = getValue(row, 'maXaPhuong');

        const coSoIdRaw = getValue(row, 'coSoId');
        const maCoSo = getValue(row, 'maCoSo');

        const phongBanIdRaw = getValue(row, 'phongBanId');
        const maPhongBan = getValue(row, 'maPhongBan');

        const chucVuIdRaw = getValue(row, 'chucVuId');
        const maChucVu = getValue(row, 'maChucVu');

        const ghiChu = getValue(row, 'ghiChu');
        const maThe = getValue(row, 'maThe');
        const maQr = getValue(row, 'maQr');
        const maBarcode = getValue(row, 'maBarcode');
        const activeRaw = getValue(row, 'active');

        if (maNhanVien !== undefined) item.maNhanVien = maNhanVien;
        if (hoTen !== undefined) item.hoTen = hoTen;
        if (ngaySinh !== undefined) item.ngaySinh = ngaySinh;
        if (gioiTinh !== undefined) item.gioiTinh = gioiTinh;
        if (soDienThoai !== undefined) item.soDienThoai = soDienThoai;
        if (email !== undefined) item.email = email;
        if (diaChi !== undefined) item.diaChi = diaChi;

        if (quocGiaIdRaw !== undefined) item.quocGiaId = toNumber(quocGiaIdRaw);
        if (maQuocGia !== undefined) item.maQuocGia = maQuocGia;

        if (tinhThanhIdRaw !== undefined) item.tinhThanhId = toNumber(tinhThanhIdRaw);
        if (maTinhThanh !== undefined) item.maTinhThanh = maTinhThanh;

        if (xaPhuongIdRaw !== undefined) item.xaPhuongId = toNumber(xaPhuongIdRaw);
        if (maXaPhuong !== undefined) item.maXaPhuong = maXaPhuong;

        if (coSoIdRaw !== undefined) item.coSoId = toNumber(coSoIdRaw);
        if (maCoSo !== undefined) item.maCoSo = maCoSo;

        if (phongBanIdRaw !== undefined) item.phongBanId = toNumber(phongBanIdRaw);
        if (maPhongBan !== undefined) item.maPhongBan = maPhongBan;

        if (chucVuIdRaw !== undefined) item.chucVuId = toNumber(chucVuIdRaw);
        if (maChucVu !== undefined) item.maChucVu = maChucVu;

        if (ghiChu !== undefined) item.ghiChu = ghiChu;
        if (maThe !== undefined) item.maThe = toText(maThe);
        if (maQr !== undefined) item.maQr = toText(maQr);
        if (maBarcode !== undefined) item.maBarcode = toText(maBarcode);

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

function validateId(value, ten) {
    if (value !== undefined && (value === null || !Number.isInteger(Number(value)) || Number(value) <= 0)) {
        throw new ApiError(400, `${ten} phải là số nguyên lớn hơn 0.`);
    }
}

function toText(value) {
    if (value === undefined || value === null || value === '') {
        return value;
    }

    return String(value).trim();
}

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID nhân viên phải là số nguyên lớn hơn 0.');
    }

    validateId(item.quocGiaId, 'ID quốc gia');

    validateId(item.tinhThanhId, 'ID tỉnh thành');

    validateId(item.xaPhuongId, 'ID xã phường');

    validateId(item.coSoId, 'ID cơ sở');

    validateId(item.phongBanId, 'ID phòng ban');

    validateId(item.chucVuId, 'ID chức vụ');

    if (
        item.ngaySinh !== undefined &&
        item.ngaySinh !== null &&
        item.ngaySinh !== '' &&
        Number.isNaN(Date.parse(item.ngaySinh))
    ) {
        throw new ApiError(400, 'Ngày sinh không đúng định dạng ngày.');
    }

    if (item.active !== undefined && typeof item.active !== 'boolean') {
        throw new ApiError(400, 'Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.');
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới nhân viên phải có mã nhân viên.');
    }

    if (!item.hoTen) {
        throw new ApiError(400, 'Thêm mới nhân viên phải có họ tên.');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.maNhanVien !== undefined) data.maNhanVien = item.maNhanVien;
    if (item.hoTen !== undefined) data.hoTen = item.hoTen;
    if (item.ngaySinh !== undefined) data.ngaySinh = item.ngaySinh;
    if (item.gioiTinh !== undefined) data.gioiTinh = item.gioiTinh;
    if (item.soDienThoai !== undefined) data.soDienThoai = item.soDienThoai;
    if (item.email !== undefined) data.email = item.email;
    if (item.diaChi !== undefined) data.diaChi = item.diaChi;

    if (item.quocGiaId !== undefined) data.quocGiaId = item.quocGiaId;
    if (item.maQuocGia !== undefined) data.maQuocGia = item.maQuocGia;

    if (item.tinhThanhId !== undefined) data.tinhThanhId = item.tinhThanhId;
    if (item.maTinhThanh !== undefined) data.maTinhThanh = item.maTinhThanh;

    if (item.xaPhuongId !== undefined) data.xaPhuongId = item.xaPhuongId;
    if (item.maXaPhuong !== undefined) data.maXaPhuong = item.maXaPhuong;

    if (item.coSoId !== undefined) data.coSoId = item.coSoId;
    if (item.maCoSo !== undefined) data.maCoSo = item.maCoSo;

    if (item.phongBanId !== undefined) data.phongBanId = item.phongBanId;
    if (item.maPhongBan !== undefined) data.maPhongBan = item.maPhongBan;

    if (item.chucVuId !== undefined) data.chucVuId = item.chucVuId;
    if (item.maChucVu !== undefined) data.maChucVu = item.maChucVu;

    if (item.ghiChu !== undefined) data.ghiChu = item.ghiChu;
    if (item.maThe !== undefined) data.maThe = item.maThe;
    if (item.maQr !== undefined) data.maQr = item.maQr;
    if (item.maBarcode !== undefined) data.maBarcode = item.maBarcode;
    if (item.active !== undefined) data.active = item.active;

    return data;
}

async function timNhanVienImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => nhanVienRepository.getChiTiet(id),

        getByCode: (maNhanVien) => nhanVienRepository.getChiTietByMa(maNhanVien),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maNhanVien,

        entityName: 'nhân viên'
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

            const xuLy = await timNhanVienImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maNhanVien)
                ) {
                    data.maNhanVien = item.code;
                }

                if (Object.keys(data).length === 0) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await nhanVienService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maNhanVien: result.maNhanVien,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maNhanVien = item.code;

            const result = await nhanVienService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maNhanVien: result.maNhanVien,
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
    timNhanVienImport,
    taoDuLieuNghiepVu
};

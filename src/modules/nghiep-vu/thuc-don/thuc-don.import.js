'use strict';

const ApiError = require('../../../utils/api-error');

const thucDonRepository = require('./thuc-don.repository');

const thucDonService = require('./thuc-don.service');

const { readExcel } = require('../../../helpers/excel/excel-reader');

const { toNumber, toBoolean } = require('../../../helpers/excel/excel-value');

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../helpers/excel/import-strategy');

const { createResultFile, sendExcel } = require('../../../helpers/excel/excel-result');

const { isTemplateValue } = require('../../../helpers/excel/excel-template');

const MA_BAO_CAO = 'thuc_don';

const HEADER_ROW = 3;

const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maThucDon/k',
        codeField: 'maThucDon'
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

        const maThucDon = getValue(row, fieldMa);

        const tenThucDon = getValue(row, 'tenThucDon');

        const loaiThucDon = getValue(row, 'loaiThucDon');

        const tuNgay = getValue(row, 'tuNgay');

        const denNgay = getValue(row, 'denNgay');

        const maCoSo = getValue(row, 'maCoSo');

        const maNhaAn = getValue(row, 'maNhaAn');

        const maCaAn = getValue(row, 'maCaAn');

        const trangThai = getValue(row, 'trangThai');

        const ngay = getValue(row, 'ngay');
        const ghiChuNgay = getValue(row, 'ghiChuNgay');
        const activeNgay = getValue(row, 'activeNgay');

        const maNhomMonAn = getValue(row, 'maNhomMonAn');
        const thuTuNhom = getValue(row, 'thuTuNhom');
        const ghiChuNhom = getValue(row, 'ghiChuNhom');
        const activeNhom = getValue(row, 'activeNhom');

        const maMonAn = getValue(row, 'maMonAn');
        const thuTuMon = getValue(row, 'thuTuMon');
        const dinhLuong = getValue(row, 'dinhLuong');
        const maDonViTinh = getValue(row, 'maDonViTinh');
        const ghiChuMon = getValue(row, 'ghiChuMon');
        const activeMon = getValue(row, 'activeMon');

        const moTa = getValue(row, 'moTa');

        const activeRaw = getValue(row, 'active');

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maThucDon
        };

        if (tenThucDon !== undefined) {
            item.tenThucDon = tenThucDon;
        }

        if (loaiThucDon !== undefined) {
            item.loaiThucDon = toNumber(loaiThucDon);
        }

        if (tuNgay !== undefined) {
            item.tuNgay = tuNgay;
        }

        if (denNgay !== undefined) {
            item.denNgay = denNgay;
        }

        if (maCoSo !== undefined) {
            item.maCoSo = maCoSo;
        }

        if (maNhaAn !== undefined) {
            item.maNhaAn = maNhaAn;
        }

        if (maCaAn !== undefined) {
            item.maCaAn = maCaAn;
        }

        if (trangThai !== undefined) {
            item.trangThai = toNumber(trangThai);
        }

        if (moTa !== undefined) {
            item.moTa = moTa;
        }

        if (ngay !== undefined) {
            item.ngay = ngay;
        }

        if (ghiChuNgay !== undefined) {
            item.ghiChuNgay = ghiChuNgay;
        }

        if (activeNgay !== undefined) {
            try {
                item.activeNgay = toBoolean(activeNgay);
            } catch {
                item.activeNgay = activeNgay;
            }
        }

        if (maNhomMonAn !== undefined) {
            item.maNhomMonAn = maNhomMonAn;
        }

        if (thuTuNhom !== undefined) {
            item.thuTuNhom = thuTuNhom !== undefined ? toNumber(thuTuNhom) : undefined;
        }

        if (ghiChuNgay !== undefined) {
            item.ghiChuNgay = ghiChuNgay;
        }

        if (activeNhom !== undefined) {
            try {
                item.activeNhom = toBoolean(activeNhom);
            } catch {
                item.activeNhom = activeNhom;
            }
        }

        if (maMonAn !== undefined) {
            item.maMonAn = maMonAn;
        }

        if (thuTuMon !== undefined) {
            item.thuTuMon = thuTuMon !== undefined ? toNumber(thuTuMon) : undefined;
        }

        if (dinhLuong !== undefined) {
            item.dinhLuong = dinhLuong !== undefined ? Number(dinhLuong) : undefined;
        }

        if (maDonViTinh !== undefined) {
            item.maDonViTinh = maDonViTinh;
        }

        if (ghiChuMon !== undefined) {
            item.ghiChuMon = ghiChuMon;
        }

        if (activeMon !== undefined) {
            try {
                item.activeMon = toBoolean(activeMon);
            } catch {
                item.activeMon = activeMon;
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

function validateDongImport(item) {
    if (item.idRaw !== undefined && (item.id === null || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0)) {
        throw new ApiError(400, 'ID thực đơn phải là số nguyên lớn hơn 0.');
    }

    if (item.loaiThucDon !== undefined && !Number.isInteger(item.loaiThucDon)) {
        throw new ApiError(400, 'Loại thực đơn không hợp lệ.');
    }

    if (item.trangThai !== undefined && !Number.isInteger(item.trangThai)) {
        throw new ApiError(400, 'Trạng thái không hợp lệ.');
    }

    if (item.thuTuNhom !== undefined && !Number.isInteger(item.thuTuNhom)) {
        throw new ApiError(400, 'Thứ tự nhóm món ăn không hợp lệ.');
    }

    if (item.thuTuMon !== undefined && !Number.isInteger(item.thuTuMon)) {
        throw new ApiError(400, 'Thứ tự món ăn không hợp lệ.');
    }

    if (item.dinhLuong !== undefined && Number.isNaN(Number(item.dinhLuong))) {
        throw new ApiError(400, 'Định lượng không hợp lệ.');
    }

    const booleanFields = ['active', 'activeNgay', 'activeNhom', 'activeMon'];

    for (const field of booleanFields) {
        if (item[field] !== undefined && typeof item[field] !== 'boolean') {
            throw new ApiError(400, `${field} không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE.`);
        }
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(400, 'Thêm mới thực đơn phải có mã thực đơn.');
    }

    if (!item.tenThucDon) {
        throw new ApiError(400, 'Thêm mới thực đơn phải có tên thực đơn.');
    }

    if (item.loaiThucDon === undefined) {
        throw new ApiError(400, 'Thiếu thông tin loaiThucDon');
    }

    if (!item.tuNgay) {
        throw new ApiError(400, 'Thiếu thông tin tuNgay');
    }

    if (!item.denNgay) {
        throw new ApiError(400, 'Thiếu thông tin denNgay');
    }

    if (!item.maCoSo) {
        throw new ApiError(400, 'Thiếu thông tin maCoSo');
    }

    if (!item.maCaAn) {
        throw new ApiError(400, 'Thiếu thông tin maCaAn');
    }

    if (!item.ngay) {
        throw new ApiError(400, 'Thiếu thông tin ngay');
    }

    if (!item.maNhomMonAn) {
        throw new ApiError(400, 'Thiếu thông tin maNhomMonAn');
    }

    if (!item.maMonAn) {
        throw new ApiError(400, 'Thiếu thông tin maMonAn');
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenThucDon !== undefined) data.tenThucDon = item.tenThucDon;

    if (item.loaiThucDon !== undefined) data.loaiThucDon = item.loaiThucDon;

    if (item.tuNgay !== undefined) data.tuNgay = item.tuNgay;

    if (item.denNgay !== undefined) data.denNgay = item.denNgay;

    if (item.maCoSo !== undefined) data.maCoSo = item.maCoSo;

    if (item.maNhaAn !== undefined) data.maNhaAn = item.maNhaAn;

    if (item.maCaAn !== undefined) data.maCaAn = item.maCaAn;

    if (item.trangThai !== undefined) data.trangThai = item.trangThai;

    if (item.moTa !== undefined) data.moTa = item.moTa;

    if (item.active !== undefined) data.active = item.active;

    data.dsNgay = [];

    if (item.ngay !== undefined) {
        data.dsNgay.push({
            ngay: item.ngay,

            ghiChu: item.ghiChuNgay,

            active: item.activeNgay,

            dsNhomMonAn: [
                {
                    maNhomMonAn: item.maNhomMonAn,

                    thuTuHienThi: item.thuTuNhom,

                    ghiChu: item.ghiChuNhom,

                    active: item.activeNhom,

                    dsMonAn: [
                        {
                            maMonAn: item.maMonAn,

                            thuTuHienThi: item.thuTuMon,

                            dinhLuong: item.dinhLuong,

                            maDonViTinh: item.maDonViTinh,

                            ghiChu: item.ghiChuMon,

                            active: item.activeMon
                        }
                    ]
                }
            ]
        });
    }

    return data;
}

async function timThucDonImport(item) {
    return await resolveImportStrategy(item, {
        getById: (id) => thucDonRepository.getChiTiet(id),

        getByCode: (ma) => thucDonRepository.getChiTietByMa(ma),

        getRecordId: (record) => record.id,

        getRecordCode: (record) => record.maThucDon,

        entityName: 'thực đơn'
    });
}

async function xuLyImport(file) {
    const { workbook, worksheet, danhSach } = await docDuLieuImport(file);

    if (!danhSach.length) {
        throw new ApiError(400, 'File import không có dữ liệu.');
    }

    const mapThucDon = new Map();

    for (const item of danhSach) {
        const key = item.id !== undefined ? `ID_${item.id}` : `MA_${item.code}`;

        if (!mapThucDon.has(key)) {
            const data = taoDuLieuNghiepVu(item);

            mapThucDon.set(key, {
                ...item,
                rowNumbers: [...item.rowNumbers],
                data
            });

            continue;
        }

        const current = mapThucDon.get(key);

        current.rowNumbers.push(...item.rowNumbers);

        if (item.ngay !== undefined || item.maNhomMonAn !== undefined || item.maMonAn !== undefined) {
            const ngayMoi = taoDuLieuNghiepVu(item).dsNgay[0];

            let ngay = current.data.dsNgay.find((x) => String(x.ngay) === String(ngayMoi.ngay));

            if (!ngay) {
                current.data.dsNgay.push(ngayMoi);

                continue;
            }

            const nhomMoi = ngayMoi.dsNhomMonAn[0];

            let nhom = ngay.dsNhomMonAn.find((x) => x.maNhomMonAn === nhomMoi.maNhomMonAn);

            if (!nhom) {
                ngay.dsNhomMonAn.push(nhomMoi);

                continue;
            }

            const monMoi = nhomMoi.dsMonAn[0];

            const daTonTai = nhom.dsMonAn.some((x) => x.maMonAn === monMoi.maMonAn);

            if (!daTonTai) {
                nhom.dsMonAn.push(monMoi);
            }
        }
    }

    const successes = [];
    const errors = [];

    for (const item of mapThucDon.values()) {
        try {
            validateDongImport(item);

            const xuLy = await timThucDonImport(item);

            const data = item.data;

            if (xuLy.action === 'UPDATE') {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(item.code, xuLy.record.maThucDon)
                ) {
                    data.maThucDon = item.code;
                }

                if (!Object.keys(data).length) {
                    throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
                }

                const result = await thucDonService.update(xuLy.record.id, data);

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maThucDon: result.maThucDon,
                    hanhDong: 'CAP_NHAT',
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maThucDon = item.code;

            const result = await thucDonService.create(data);

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maThucDon: result.maThucDon,
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
    timThucDonImport,
    taoDuLieuNghiepVu
};

'use strict';

const ApiError = require('../../../../utils/api-error');
const { readExcel } = require('../../../../helpers/excel/excel-reader');
const { toNumber, toBoolean } = require('../../../../helpers/excel/excel-value');
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require('../../../../helpers/excel/import-strategy');
const { createResultFile } = require('../../../../helpers/excel/excel-result');
const thucPhamRepository = require('./thuc-pham.repository');
const thucPhamService = require('./thuc-pham.service');
const { loaiBaoQuan: dsLoaiBaoQuan } = require('../../../../constants/enums');
const { MA_BAO_CAO, HEADER_ROW, DATA_START_ROW } = require('./thuc-pham.export');

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
    if (value === undefined || value === null || String(value).trim() === '') {
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

async function resolveDonViTinh(item, options) {
    const { idField, codeField, label } = options;
    const rawId = item[idField];
    const rawCode = item[codeField];
    const hasId = rawId !== undefined && rawId !== null && String(rawId).trim() !== '';
    const hasCode = rawCode !== undefined && rawCode !== null && String(rawCode).trim() !== '';

    if (!hasId && !hasCode) {
        return undefined;
    }

    let byId = null;
    let byCode = null;

    if (hasId) {
        const id = parsePositiveInteger(rawId, `ID ${label}`);

        byId = await thucPhamRepository.getDonViTinh(id);

        if (!byId) {
            throw new ApiError(404, `Không tìm thấy ${label} có ID ${id}.`);
        }
    }

    if (hasCode) {
        const ma = String(rawCode).trim().toUpperCase();

        byCode = await thucPhamRepository.getDonViTinhByMa(ma);

        if (!byCode) {
            throw new ApiError(404, `Không tìm thấy ${label} có mã "${ma}".`);
        }
    }

    if (byId && byCode && Number(byId.id) !== Number(byCode.id)) {
        throw new ApiError(400, `ID và mã ${label} không cùng một bản ghi.`);
    }

    const donVi = byId || byCode;

    if (donVi.active === false) {
        throw new ApiError(400, `${label} "${donVi.tenDonViTinh}" đã bị khóa.`);
    }

    return donVi.id;
}

async function resolveXuatXu(item) {
    const rawId = item.xuatXuId;
    const rawCode = item.maXuatXu;

    if (rawId === undefined && rawCode === undefined) {
        return undefined;
    }

    let byId = null;
    let byCode = null;

    if (rawId !== undefined && rawId !== null && rawId !== '') {
        const id = parsePositiveInteger(rawId, 'ID quốc gia xuất xứ');

        byId = await thucPhamRepository.getQuocGia(id);

        if (!byId) {
            throw new ApiError(404, `Không tìm thấy quốc gia xuất xứ có ID ${id}.`);
        }
    }

    if (rawCode !== undefined && rawCode !== null && String(rawCode).trim()) {
        const ma = String(rawCode).trim().toUpperCase();

        byCode = await thucPhamRepository.getQuocGiaByMa(ma);

        if (!byCode) {
            throw new ApiError(404, `Không tìm thấy quốc gia xuất xứ có mã "${ma}".`);
        }
    }

    if (byId && byCode && Number(byId.id) !== Number(byCode.id)) {
        throw new ApiError(400, 'ID và mã quốc gia xuất xứ không cùng một bản ghi.');
    }

    const quocGia = byId || byCode;

    if (!quocGia) {
        return null;
    }

    if (quocGia.active === false) {
        throw new ApiError(400, `Quốc gia "${quocGia.ten}" đã bị khóa.`);
    }

    return Number(quocGia.id);
}

function resolveDieuKienBaoQuan(value) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || String(value).trim() === '') {
        return null;
    }

    const raw = String(value).trim();
    const number = Number(raw);

    if (Number.isInteger(number)) {
        const theoGiaTri = dsLoaiBaoQuan.find((item) => Number(item.value) === number);

        if (theoGiaTri) {
            return Number(theoGiaTri.value);
        }
    }

    const theoTen = dsLoaiBaoQuan.find((item) => String(item.name).trim().toLowerCase() === raw.toLowerCase());

    if (theoTen) {
        return Number(theoTen.value);
    }

    throw new ApiError(400, `Điều kiện bảo quản "${raw}" không hợp lệ.`);
}

function readItem(row, rowNumber, getValue, keyConfig) {
    const codeField = keyConfig.hasCodeKey ? 'maThucPham/k' : 'maThucPham';

    return {
        rowNumbers: [rowNumber],
        idIsKey: keyConfig.hasIdKey,
        codeIsKey: keyConfig.hasCodeKey,
        id: keyConfig.hasIdKey ? getValue(row, 'id/k') : undefined,
        code: getValue(row, codeField),
        maThucPham: getValue(row, codeField),
        tenThucPham: getValue(row, 'tenThucPham'),
        donViSoCapId: getValue(row, 'donViSoCapId'),
        maDonViSoCap: getValue(row, 'maDonViSoCap'),
        donViSuDungId: getValue(row, 'donViSuDungId'),
        maDonViSuDung: getValue(row, 'maDonViSuDung'),
        heSoQuyDoi: getValue(row, 'heSoQuyDoi'),
        quyCach: getValue(row, 'quyCach'),
        giaNhap: getValue(row, 'giaNhap'),
        tyLeHaoHutDuKien: getValue(row, 'tyLeHaoHutDuKien'),
        xuatXuId: getValue(row, 'xuatXuId'),
        maXuatXu: getValue(row, 'maXuatXu'),
        dieuKienBaoQuan: getValue(row, 'dieuKienBaoQuan'),
        tenDieuKienBaoQuan: getValue(row, 'tenDieuKienBaoQuan'),
        moTa: getValue(row, 'moTa'),
        ghiChu: getValue(row, 'ghiChu'),
        active: getValue(row, 'active')
    };
}

async function createBusinessData(item) {
    const data = {};

    if (item.tenThucPham !== undefined) {
        data.tenThucPham = item.tenThucPham;
    }

    const donViSoCapId = await resolveDonViTinh(item, {
        idField: 'donViSoCapId',
        codeField: 'maDonViSoCap',
        label: 'đơn vị sơ cấp'
    });

    if (donViSoCapId !== undefined) {
        data.donViSoCapId = donViSoCapId;
    }

    const donViSuDungId = await resolveDonViTinh(item, {
        idField: 'donViSuDungId',
        codeField: 'maDonViSuDung',
        label: 'đơn vị sử dụng'
    });

    if (donViSuDungId !== undefined) {
        data.donViSuDungId = donViSuDungId;
    }

    const heSoQuyDoi = parseNumber(item.heSoQuyDoi, 'Hệ số quy đổi');

    if (heSoQuyDoi !== undefined) {
        if (heSoQuyDoi <= 0) {
            throw new ApiError(400, 'Hệ số quy đổi phải lớn hơn 0.');
        }

        data.heSoQuyDoi = heSoQuyDoi;
    }

    if (item.quyCach !== undefined) {
        data.quyCach = item.quyCach === null || String(item.quyCach).trim() === '' ? null : String(item.quyCach).trim();
    }

    const giaNhap = parseNumber(item.giaNhap, 'Giá nhập');

    if (giaNhap !== undefined) {
        if (giaNhap < 0) {
            throw new ApiError(400, 'Giá nhập không được nhỏ hơn 0.');
        }

        data.giaNhap = giaNhap;
    }

    const haoHut = parseNumber(item.tyLeHaoHutDuKien, 'Tỷ lệ hao hụt dự kiến');

    if (haoHut !== undefined) {
        if (haoHut < 0 || haoHut > 100) {
            throw new ApiError(400, 'Tỷ lệ hao hụt dự kiến phải nằm trong khoảng từ 0 đến 100.');
        }

        data.tyLeHaoHutDuKien = haoHut;
    }

    const xuatXuId = await resolveXuatXu(item);

    if (xuatXuId !== undefined) {
        data.xuatXuId = xuatXuId;
    }

    const rawDieuKienBaoQuan = item.dieuKienBaoQuan !== undefined ? item.dieuKienBaoQuan : item.tenDieuKienBaoQuan;

    const dieuKienBaoQuan = resolveDieuKienBaoQuan(rawDieuKienBaoQuan);

    if (dieuKienBaoQuan !== undefined) {
        data.dieuKienBaoQuan = dieuKienBaoQuan;
    }

    if (item.moTa !== undefined) {
        data.moTa = item.moTa === null || String(item.moTa).trim() === '' ? null : String(item.moTa).trim();
    }

    if (item.ghiChu !== undefined) {
        data.ghiChu = item.ghiChu === null || String(item.ghiChu).trim() === '' ? null : String(item.ghiChu).trim();
    }

    const active = parseBoolean(item.active);

    if (active !== undefined) {
        data.active = active;
    }

    return data;
}

async function processItem(item) {
    if (item.id !== undefined) {
        item.id = parsePositiveInteger(item.id, 'ID thực phẩm');
    }

    const strategy = await resolveImportStrategy(item, {
        getById: (id) => thucPhamRepository.getChiTiet(id),
        getByCode: (code) => thucPhamRepository.getChiTietByMa(code),
        getRecordCode: (record) => record.maThucPham,
        entityName: 'thực phẩm'
    });

    const data = await createBusinessData(item);

    if (strategy.action === 'UPDATE') {
        if (
            strategy.allowCodeChange &&
            item.maThucPham !== undefined &&
            shouldChangeCode(item.maThucPham, strategy.record.maThucPham)
        ) {
            data.maThucPham = item.maThucPham;
        }

        if (Object.keys(data).length === 0) {
            throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');
        }

        const result = await thucPhamService.update(strategy.record.id, data);

        return {
            rowNumbers: item.rowNumbers,
            id: result.id,
            maThucPham: result.maThucPham,
            hanhDong: 'CAP_NHAT',
            message: `Cập nhật thành công - ID ${result.id}`
        };
    }

    if (!item.maThucPham) {
        throw new ApiError(400, 'Thêm mới thực phẩm phải có mã thực phẩm.');
    }

    data.maThucPham = item.maThucPham;

    const result = await thucPhamService.create(data);

    return {
        rowNumbers: item.rowNumbers,
        id: result.id,
        maThucPham: result.maThucPham,
        hanhDong: 'THEM_MOI',
        message: `Thêm mới thành công - ID ${result.id}`
    };
}

async function importThucPham(file) {
    const { workbook, worksheet, headerMap, getValue, hasData } = await readExcel(file, {
        headerRowNumber: HEADER_ROW
    });

    const keyConfig = validateKeyHeaders(headerMap, {
        idKey: 'id/k',
        codeKey: 'maThucPham/k',
        codeField: 'maThucPham'
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
    importThucPham
};

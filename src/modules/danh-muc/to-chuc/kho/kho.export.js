'use strict';

const khoRepository = require('./kho.repository');
const { createExportFile } = require('../../../../helpers/excel/excel-export');
const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_kho';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDanhSachId(danhSach = []) {
    return danhSach.map((item) => item.id).join(',');
}

function taoDanhSachMa(danhSach = []) {
    return danhSach
        .map((item) => item.maNhanVien)
        .filter(Boolean)
        .join(',');
}

function taoDanhSachTen(danhSach = []) {
    return danhSach.map((item) => `"${item.hoTen || ''}"`).join('; ');
}

function taoDanhSachChucVu(danhSach = []) {
    return danhSach.map((item) => `"${item.chucVu?.ten || ''}"`).join('; ');
}

function taoDanhSachPhongBan(danhSach = []) {
    return danhSach.map((item) => `"${item.phongBan?.ten || ''}"`).join('; ');
}

function taoDongExport(item, danhSachNhanVien = []) {
    return {
        id: item.id,
        maKho: item.maKho,
        tenKho: item.tenKho,
        nhaAnId: item.nhaAnId,
        maNhaAn: item.nhaAn?.ma,
        tenNhaAn: item.nhaAn?.ten,
        dsNvQuanLyId: taoDanhSachId(danhSachNhanVien),
        dsNvQuanLyMa: taoDanhSachMa(danhSachNhanVien),
        dsNvQuanLyTen: taoDanhSachTen(danhSachNhanVien),
        dsNvQuanLyChucVu: taoDanhSachChucVu(danhSachNhanVien),
        dsNvQuanLyPhongBan: taoDanhSachPhongBan(danhSachNhanVien),
        loaiKho: item.loaiKho,
        diaDiem: item.diaDiem,
        dienTich: item.dienTich,
        nhietDoToiThieu: item.nhietDoToiThieu,
        nhietDoToiDa: item.nhietDoToiDa,
        moTa: item.moTa,
        ghiChu: item.ghiChu,
        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await khoRepository.getTongHop(query);
    const data = await Promise.all(
        danhSach.map(async (item) => {
            const danhSachNhanVien = await khoRepository.getDsNvQuanLy(item.id);
            return taoDongExport(item, danhSachNhanVien);
        })
    );

    return await createExportFile({
        maBaoCao: MA_BAO_CAO,
        headerRowNumber: HEADER_ROW,
        templateRowNumber: TEMPLATE_ROW,
        dataStartRowNumber: DATA_START_ROW,
        data
    });
}

async function exportData(req, res, next) {
    try {
        const result = await xuLyExport(req.query);
        return sendExcel(res, result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    exportData,
    xuLyExport,
    taoDongExport,
    taoDanhSachId,
    taoDanhSachMa,
    taoDanhSachTen,
    taoDanhSachChucVu,
    taoDanhSachPhongBan
};

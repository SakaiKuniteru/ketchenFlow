'use strict';

const { createExportFile } = require('../../../../helpers/excel/excel-export');
const thucPhamRepository = require('./thuc-pham.repository');

const MA_BAO_CAO = 'dm_thuc_pham';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function mapExportItem(item) {
    return {
        id: item.id,
        maThucPham: item.maThucPham,
        tenThucPham: item.tenThucPham,
        donViSoCapId: item.donViSoCapId,
        maDonViSoCap: item.donViSoCap?.ma || null,
        tenDonViSoCap: item.donViSoCap?.ten || null,
        kyHieuDonViSoCap: item.donViSoCap?.kyHieu || null,
        loaiDonViSoCap: item.donViSoCap?.loaiDonVi ?? null,
        donViSuDungId: item.donViSuDungId,
        maDonViSuDung: item.donViSuDung?.ma || null,
        tenDonViSuDung: item.donViSuDung?.ten || null,
        kyHieuDonViSuDung: item.donViSuDung?.kyHieu || null,
        loaiDonViSuDung: item.donViSuDung?.loaiDonVi ?? null,
        heSoQuyDoi: item.heSoQuyDoi,
        quyCach: item.quyCach,
        giaNhap: item.giaNhap,
        tyLeHaoHutDuKien: item.tyLeHaoHutDuKien,
        xuatXuId: item.xuatXuId,
        maXuatXu: item.xuatXu?.ma || null,
        tenXuatXu: item.xuatXu?.ten || null,
        dieuKienBaoQuan: item.dieuKienBaoQuan,
        tenDieuKienBaoQuan: item.tenDieuKienBaoQuan,
        moTa: item.moTa,
        hinhAnh: item.hinhAnh,
        ghiChu: item.ghiChu,
        active: item.active,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };
}

async function exportThucPham(query = {}) {
    const danhSach = await thucPhamRepository.getTongHop(query);

    return createExportFile({
        maBaoCao: MA_BAO_CAO,
        headerRowNumber: HEADER_ROW,
        templateRowNumber: TEMPLATE_ROW,
        dataStartRowNumber: DATA_START_ROW,
        data: danhSach.map(mapExportItem)
    });
}

module.exports = {
    MA_BAO_CAO,
    HEADER_ROW,
    TEMPLATE_ROW,
    DATA_START_ROW,
    exportThucPham,
    mapExportItem
};

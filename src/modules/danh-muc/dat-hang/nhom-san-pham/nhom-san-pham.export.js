'use strict';

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const nhomSanPhamRepository = require('./nhom-san-pham.repository');

const MA_BAO_CAO = 'dm_nhom_san_pham';

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

function mapExportItem(item) {
    return {
        id: item.id,

        maNhomSanPham: item.maNhomSanPham,

        tenNhomSanPham: item.tenNhomSanPham,

        loaiSanPham: item.loaiSanPham,

        moTa: item.moTa,

        thuTuHienThi: item.thuTuHienThi,

        active: item.active
    };
}

async function exportNhomSanPham(query = {}) {
    const danhSach = await nhomSanPhamRepository.getTongHop(query);

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

    exportNhomSanPham
};

'use strict';

const monAnRepository = require('../mon-an.repository');
const { createExportFile } = require('../../../../../helpers/excel/excel-export');

const MA_BAO_CAO = 'thanh_phan_mon_an';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function mapExportItem(row) {
    return {
        id: row.id,
        monAnId: row.mon_an_id,
        maMonAn: row.ma_mon_an,
        tenMonAn: row.ten_mon_an,
        thucPhamId: row.thuc_pham_id,
        maThucPham: row.ma_thuc_pham,
        tenThucPham: row.ten_thuc_pham,
        dinhLuong: row.dinh_luong !== null ? Number(row.dinh_luong) : null,
        active: row.active
    };
}

async function exportCongThucMonAn(query = {}) {
    const danhSach = await monAnRepository.getDanhSachCongThucExport(query);

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
    exportCongThucMonAn
};

'use strict';

const { createExportFile } = require('../../../../../helpers/excel/excel-export');
const monAnRepository = require('../mon-an.repository');

const MA_BAO_CAO = 'dm_mon_an';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function mapExportItem(item) {
    return {
        id: item.id,
        maMonAn: item.maMonAn,
        tenMonAn: item.tenMonAn,
        nhomMonAnId: item.nhomMonAnId,
        maNhomMonAn: item.nhomMonAn?.ma,
        tenNhomMonAn: item.nhomMonAn?.ten,
        giaTien: item.giaTien,
        giaDuKien: item.giaDuKien,
        calories: item.calories,
        moTa: item.moTa,
        active: item.active
    };
}

async function exportMonAn(query = {}) {
    const danhSach = await monAnRepository.getTongHop(query);

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
    exportMonAn
};

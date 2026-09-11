'use strict';

const { createExportFile } = require('../../../../helpers/excel/excel-export');
const caAnRepository = require('./ca-an.repository');

const MA_BAO_CAO = 'dm_ca_an';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function mapExportItem(item) {
    return {
        id: item.id,
        maCaAn: item.maCaAn,
        tenCaAn: item.tenCaAn,
        thoiGianBatDau: item.thoiGianBatDau,
        thoiGianKetThuc: item.thoiGianKetThuc,
        active: item.active
    };
}

async function exportCaAn(query = {}) {
    const danhSach = await caAnRepository.getTongHop(query);

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
    exportCaAn
};

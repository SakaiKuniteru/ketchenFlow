'use strict';

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const donViTinhRepository = require('./don-vi-tinh.repository');

const MA_BAO_CAO = 'dm_don_vi_tinh';

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

function mapExportItem(item) {
    return {
        id: item.id,

        maDonViTinh: item.maDonViTinh,

        tenDonViTinh: item.tenDonViTinh,

        kyHieu: item.kyHieu,

        loaiDonVi: item.loaiDonVi,

        active: item.active
    };
}

async function exportDonViTinh(query = {}) {
    const danhSach = await donViTinhRepository.getTongHop(query);

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

    exportDonViTinh
};

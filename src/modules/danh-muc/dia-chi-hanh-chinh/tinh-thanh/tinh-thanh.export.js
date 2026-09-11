'use strict';

const tinhThanhRepository = require('./tinh-thanh.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_tinh_thanh';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,
        maTinhThanh: item.maTinhThanh,
        tenTinhThanh: item.tenTinhThanh,
        tenVietTat: item.tenVietTat,

        quocGiaId: item.quocGiaId,
        maQuocGia: item.maQuocGia || item.quocGia?.maQuocGia || item.quocGia?.ma || '',

        tenQuocGia: item.tenQuocGia || item.quocGia?.tenQuocGia || item.quocGia?.ten || '',

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await tinhThanhRepository.getTongHop(query);

    const data = danhSach.map((item) => taoDongExport(item));

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
    taoDongExport
};

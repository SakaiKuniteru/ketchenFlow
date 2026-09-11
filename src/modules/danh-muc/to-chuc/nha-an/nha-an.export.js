'use strict';

const nhaAnRepository = require('./nha-an.repository');
const { createExportFile } = require('../../../../helpers/excel/excel-export');
const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_nha_an';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,
        maNhaAn: item.maNhaAn,
        tenNhaAn: item.tenNhaAn,

        coSoId: item.coSo?.id,
        maCoSo: item.coSo?.ma,
        tenCoSo: item.coSo?.ten,

        dsNvQuanLyId: Array.isArray(item.dsNvQuanLyId) ? item.dsNvQuanLyId.join(',') : '',

        dsMaNvQuanLy: Array.isArray(item.dsNvQuanLy)
            ? item.dsNvQuanLy
                  .map((nv) => nv.maNhanVien)
                  .filter(Boolean)
                  .join(',')
            : '',

        dsTenNvQuanLy: Array.isArray(item.dsNvQuanLy)
            ? item.dsNvQuanLy
                  .map((nv) => `"${String(nv.hoTen || '').trim()}"`)
                  .filter((ten) => ten !== '""')
                  .join('; ')
            : '',

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await nhaAnRepository.getTongHop(query);

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

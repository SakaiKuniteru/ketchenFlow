'use strict';

const quocGiaRepository = require('./quoc-gia.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_quoc_gia';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,
        maQuocGia: item.maQuocGia,
        tenQuocGia: item.tenQuocGia,
        tenTiengAnh: item.tenTiengAnh,
        maDienThoai: item.maDienThoai,
        tenVietTat: item.tenVietTat,
        maIso2: item.maIso2,
        maIso3: item.maIso3,
        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await quocGiaRepository.getTongHop(query);

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

'use strict';

const xaPhuongRepository = require('./xa-phuong.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_xa_phuong';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,

        maXaPhuong: item.maXaPhuong,

        tenXaPhuong: item.tenXaPhuong,

        tenVietTat: item.tenVietTat,

        tinhThanhId: item.tinhThanhId,

        maTinhThanh: item.maTinhThanh || item.tinhThanh?.maTinhThanh || item.tinhThanh?.ma || '',

        tenTinhThanh: item.tenTinhThanh || item.tinhThanh?.tenTinhThanh || item.tinhThanh?.ten || '',

        quocGiaId: item.quocGiaId ?? item.tinhThanh?.quocGiaId ?? item.tinhThanh?.quocGia?.id ?? null,

        maQuocGia: item.maQuocGia || item.tinhThanh?.quocGia?.maQuocGia || item.tinhThanh?.quocGia?.ma || '',

        tenQuocGia: item.tenQuocGia || item.tinhThanh?.quocGia?.tenQuocGia || item.tinhThanh?.quocGia?.ten || '',

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await xaPhuongRepository.getTongHop(query);

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

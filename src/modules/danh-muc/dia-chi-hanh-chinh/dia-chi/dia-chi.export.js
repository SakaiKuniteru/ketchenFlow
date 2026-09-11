'use strict';

const diaChiRepository = require('./dia-chi.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_dia_chi';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,
        maDiaChi: item.maDiaChi,
        tenDiaChi: item.tenDiaChi,

        quocGiaId: item.quocGiaId,
        maQuocGia: item.quocGia?.ma,
        tenQuocGia: item.quocGia?.ten,
        tenTiengAnh: item.quocGia?.tenTiengAnh,
        quocGiaTenVietTat: item.quocGia?.tenVietTat,
        maDienThoai: item.quocGia?.maDienThoai,
        maIso2: item.quocGia?.maIso2,
        maIso3: item.quocGia?.maIso3,
        quocGiaActive: item.quocGia?.active,

        tinhThanhId: item.tinhThanhId,
        maTinhThanh: item.tinhThanh?.ma,
        tenTinhThanh: item.tinhThanh?.ten,
        tinhThanhTenVietTat: item.tinhThanh?.tenVietTat,
        tinhThanhActive: item.tinhThanh?.active,

        xaPhuongId: item.xaPhuongId,
        maXaPhuong: item.xaPhuong?.ma,
        tenXaPhuong: item.xaPhuong?.ten,
        xaPhuongTenVietTat: item.xaPhuong?.tenVietTat,
        xaPhuongActive: item.xaPhuong?.active,

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await diaChiRepository.getTongHop(query);

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

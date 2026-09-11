'use strict';

const thietLapRepository = require('./thiet-lap.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_thiet_lap';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function chuanHoaDanhSach(value) {
    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const text = value.trim();

        if (!text) {
            return [];
        }

        if (text.startsWith('[') && text.endsWith(']')) {
            try {
                const parsed = JSON.parse(text);

                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        return text
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function noiDanhSach(value) {
    return chuanHoaDanhSach(value)
        .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
        .map((item) => String(item).trim())
        .join(', ');
}

function taoDongExport(item) {
    return {
        id: item.id,

        maThietLap: item.maThietLap,

        tenThietLap: item.tenThietLap,

        giaTri: item.giaTri,

        moTa: item.moTa,

        dsCoSoId: noiDanhSach(item.dsCoSoId),

        dsMaCoSo: noiDanhSach(item.dsMaCoSo),

        dsTenCoSo: Array.isArray(item.dsCoSo)
            ? item.dsCoSo
                  .map((item) => item?.tenCoSo)
                  .filter(Boolean)
                  .join(',')
            : '',

        dsNhomTinhNangId: noiDanhSach(item.dsNhomTinhNangId),

        dsMaNhomTinhNang: noiDanhSach(item.dsMaNhomTinhNang),

        dsTenNhomTinhNang: Array.isArray(item.dsNhomTinhNang)
            ? item.dsNhomTinhNang
                  .map((item) => item?.tenNhomTinhNang)
                  .filter(Boolean)
                  .join(', ')
            : '',

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await thietLapRepository.getTongHop(query);

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

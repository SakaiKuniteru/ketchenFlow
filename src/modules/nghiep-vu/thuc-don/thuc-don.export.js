'use strict';

const thucDonRepository = require('./thuc-don.repository');

const { createExportFile } = require('../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'thuc_don';

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

function taoDongExport(thucDon, ngay, nhom, mon) {
    return {
        id: thucDon.id,

        maThucDon: thucDon.maThucDon,
        tenThucDon: thucDon.tenThucDon,
        loaiThucDon: thucDon.loaiThucDon,
        tuNgay: thucDon.tuNgay,
        denNgay: thucDon.denNgay,

        coSoId: thucDon.coSoId,
        maCoSo: thucDon.coSo?.maCoSo,

        nhaAnId: thucDon.nhaAnId,
        maNhaAn: thucDon.nhaAn?.maNhaAn,

        caAnId: thucDon.caAnId,
        maCaAn: thucDon.caAn?.maCaAn,

        trangThai: thucDon.trangThai,
        moTa: thucDon.moTa,
        active: thucDon.active,

        thucDonNgayId: ngay?.id,
        ngay: ngay?.ngay,
        ghiChuNgay: ngay?.ghiChu,
        activeNgay: ngay?.active,

        thucDonNhomMonAnId: nhom?.id,
        nhomMonAnId: nhom?.nhomMonAnId,
        maNhomMonAn: nhom?.nhomMonAn?.maNhomMonAn,
        thuTuNhom: nhom?.thuTuHienThi,
        ghiChuNhom: nhom?.ghiChu,
        activeNhom: nhom?.active,

        thucDonMonAnId: mon?.id,
        monAnId: mon?.monAnId,
        maMonAn: mon?.monAn?.maMonAn,
        thuTuMon: mon?.thuTuHienThi,
        dinhLuong: mon?.dinhLuong,
        donViTinhId: mon?.donViTinhId,
        maDonViTinh: mon?.donViTinh?.maDonViTinh,
        ghiChuMon: mon?.ghiChu,
        activeMon: mon?.active
    };
}
async function xuLyExport(query = {}) {
    const danhSach = await thucDonRepository.getTongHop(query);

    const data = [];

    for (const item of danhSach) {
        const chiTiet = await thucDonRepository.getChiTiet(item.id);

        if (!chiTiet.dsNgay || chiTiet.dsNgay.length === 0) {
            data.push(taoDongExport(chiTiet, null, null, null));

            continue;
        }

        for (const ngay of chiTiet.dsNgay) {
            if (!ngay.dsNhomMonAn || ngay.dsNhomMonAn.length === 0) {
                data.push(taoDongExport(chiTiet, ngay, null, null));

                continue;
            }

            for (const nhom of ngay.dsNhomMonAn) {
                if (!nhom.dsMonAn || nhom.dsMonAn.length === 0) {
                    data.push(taoDongExport(chiTiet, ngay, nhom, null));

                    continue;
                }

                for (const mon of nhom.dsMonAn) {
                    data.push(taoDongExport(chiTiet, ngay, nhom, mon));
                }
            }
        }
    }

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

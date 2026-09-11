'use strict';

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const voucherDonHangRepository = require('./voucher-don-hang.repository');

const MA_BAO_CAO = 'dm_voucher_don_hang';

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function joinIds(value) {
    return Array.isArray(value) ? value.join(',') : '';
}

function mapExportItem(item) {
    return {
        id: item.id,
        maVoucher: item.maVoucher,
        tenVoucher: item.tenVoucher,
        moTa: item.moTa,
        loaiGiam: item.loaiGiam,
        giaTri: item.giaTri,
        giamToiDa: item.giamToiDa,
        giaTriDonHangToiThieu: item.giaTriDonHangToiThieu,
        soLuongPhatHanh: item.soLuongPhatHanh,
        soLuotMoiNhanVien: item.soLuotMoiNhanVien,
        phamViApDung: item.phamViApDung,
        choPhepDungChung: item.choPhepDungChung,
        tuDongApDung: item.tuDongApDung,
        thoiGianBatDau: item.thoiGianBatDau,
        thoiGianKetThuc: item.thoiGianKetThuc,
        nhomSanPhamIds: joinIds(item.nhomSanPhamIds),
        sanPhamIds: joinIds(item.sanPhamIds),
        coSoIds: joinIds(item.coSoIds),
        nhaAnIds: joinIds(item.nhaAnIds),
        phongBanIds: joinIds(item.phongBanIds),
        chucVuIds: joinIds(item.chucVuIds),
        nhanVienIds: joinIds(item.nhanVienIds),
        active: item.active
    };
}

async function exportVoucherDonHang(query = {}) {
    const danhSach = await voucherDonHangRepository.getTongHop(query);

    const danhSachChiTiet = await Promise.all(danhSach.map((item) => voucherDonHangRepository.getChiTiet(item.id)));

    return createExportFile({
        maBaoCao: MA_BAO_CAO,

        headerRowNumber: HEADER_ROW,

        templateRowNumber: TEMPLATE_ROW,

        dataStartRowNumber: DATA_START_ROW,

        data: danhSachChiTiet.map(mapExportItem)
    });
}

module.exports = {
    MA_BAO_CAO,
    HEADER_ROW,
    TEMPLATE_ROW,
    DATA_START_ROW,
    exportVoucherDonHang
};

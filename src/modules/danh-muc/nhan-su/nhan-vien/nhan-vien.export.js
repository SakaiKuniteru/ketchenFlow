'use strict';

const nhanVienRepository = require('./nhan-vien.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_nhan_vien';
const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,

        maNhanVien: item.maNhanVien,

        tenDangNhap: item.tenDangNhap || item.taiKhoan?.tenDangNhap || '',

        hoTen: item.hoTen,

        ngaySinh: item.ngaySinh,

        gioiTinh: item.gioiTinh,

        soDienThoai: item.soDienThoai,

        email: item.email,

        diaChi: item.diaChi,

        quocGiaId: item.quocGiaId,

        maQuocGia: item.maQuocGia || item.quocGia?.ma || item.quocGia?.maQuocGia || '',

        tenQuocGia: item.tenQuocGia || item.quocGia?.ten || item.quocGia?.tenQuocGia || '',

        tinhThanhId: item.tinhThanhId,

        maTinhThanh: item.maTinhThanh || item.tinhThanh?.ma || item.tinhThanh?.maTinhThanh || '',

        tenTinhThanh: item.tenTinhThanh || item.tinhThanh?.ten || item.tinhThanh?.tenTinhThanh || '',

        xaPhuongId: item.xaPhuongId,

        maXaPhuong: item.maXaPhuong || item.xaPhuong?.ma || item.xaPhuong?.maXaPhuong || '',

        tenXaPhuong: item.tenXaPhuong || item.xaPhuong?.ten || item.xaPhuong?.tenXaPhuong || '',

        coSoId: item.coSoId,

        maCoSo: item.maCoSo || item.coSo?.ma || item.coSo?.maCoSo || '',

        tenCoSo: item.tenCoSo || item.coSo?.ten || item.coSo?.tenCoSo || '',

        phongBanId: item.phongBanId,

        maPhongBan: item.maPhongBan || item.phongBan?.ma || item.phongBan?.maPhongBan || '',

        tenPhongBan: item.tenPhongBan || item.phongBan?.ten || item.phongBan?.tenPhongBan || '',

        chucVuId: item.chucVuId,

        maChucVu: item.maChucVu || item.chucVu?.ma || item.chucVu?.maChucVu || '',

        tenChucVu: item.tenChucVu || item.chucVu?.ten || item.chucVu?.tenChucVu || '',

        ghiChu: item.ghiChu,

        maThe: item.maThe,

        maQr: item.maQr,

        maBarcode: item.maBarcode,

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await nhanVienRepository.getTongHop(query);

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

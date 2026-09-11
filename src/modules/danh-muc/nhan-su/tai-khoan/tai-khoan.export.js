'use strict';

const taiKhoanRepository = require('./tai-khoan.repository');

const { createExportFile } = require('../../../../helpers/excel/excel-export');

const { sendExcel } = require('../../../../helpers/excel/excel-response');

const MA_BAO_CAO = 'dm_tai_khoan';

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

function taoDongExport(item) {
    return {
        id: item.id,

        tenDangNhap: item.tenDangNhap,

        nhanVienId: item.nhanVienId,

        maNhanVien: item.nhanVien?.maNhanVien,

        hoTen: item.nhanVien?.hoTen,

        maCoSo: item.nhanVien?.coSo?.maCoSo,

        tenCoSo: item.nhanVien?.coSo?.tenCoSo,

        maPhongBan: item.nhanVien?.phongBan?.maPhongBan,

        tenPhongBan: item.nhanVien?.phongBan?.tenPhongBan,

        maChucVu: item.nhanVien?.chucVu?.maChucVu,

        tenChucVu: item.nhanVien?.chucVu?.tenChucVu,

        dsVaiTroId: Array.isArray(item.dsVaiTroId) ? item.dsVaiTroId.join(',') : '',

        dsMaVaiTro: Array.isArray(item.dsMaVaiTro) ? item.dsMaVaiTro.join(',') : '',

        dsTenVaiTro: Array.isArray(item.dsVaiTro)
            ? item.dsVaiTro
                  .map((vaiTro) => vaiTro.tenVaiTro)
                  .filter(Boolean)
                  .join(',')
            : '',

        dsQuyenId: Array.isArray(item.dsQuyenId) ? item.dsQuyenId.join(',') : '',

        dsMaQuyen: Array.isArray(item.dsMaQuyen) ? item.dsMaQuyen.join(',') : '',

        dsTenQuyen: Array.isArray(item.dsQuyen)
            ? item.dsQuyen
                  .map((quyen) => quyen.tenQuyen)
                  .filter(Boolean)
                  .join(',')
            : '',

        soLanDangNhap: item.soLanDangNhap,

        soLanDangNhapSai: item.soLanDangNhapSai,

        biKhoa: item.biKhoa,

        khoaDen: item.khoaDen,

        lanDangNhapCuoi: item.lanDangNhapCuoi,

        doiMatKhauLanCuoi: item.doiMatKhauLanCuoi,

        doiMatKhauLanDau: item.doiMatKhauLanDau,

        active: item.active
    };
}

async function xuLyExport(query = {}) {
    const danhSach = await taiKhoanRepository.getTongHop(query);

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

'use strict';

const ExcelJS = require('exceljs');
const enums = require('../../../../constants/enums');
const { enumName } = require('../don-hang/don-hang.mapper');

async function createWorkbook(rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Đơn hàng');

    sheet.columns = [
        { header: 'Mã đơn', key: 'maDonHang', width: 22 },
        { header: 'Thời gian đặt', key: 'thoiGianDat', width: 22 },
        { header: 'Người đặt', key: 'nguoiDat', width: 25 },
        { header: 'Người nhận', key: 'nguoiNhan', width: 25 },
        { header: 'Phòng ban', key: 'phongBan', width: 25 },
        { header: 'Tạm tính', key: 'tamTinh', width: 16 },
        { header: 'Miễn giảm', key: 'tongMienGiam', width: 16 },
        { header: 'Phí dịch vụ', key: 'phiDichVu', width: 16 },
        { header: 'Tổng thanh toán', key: 'tongThanhToan', width: 18 },
        { header: 'Phương thức', key: 'tenPhuongThuc', width: 22 },
        { header: 'Thanh toán', key: 'tenTrangThaiThanhToan', width: 20 },
        { header: 'Trạng thái đơn', key: 'tenTrangThai', width: 20 }
    ];

    rows.forEach((row) =>
        sheet.addRow({
            ...row,
            tenPhuongThuc: enumName(enums.phuongThucThanhToanDonHang, row.phuongThucThanhToan),
            tenTrangThaiThanhToan: enumName(enums.trangThaiThanhToanDonHang, row.trangThaiThanhToan),
            tenTrangThai: enumName(enums.trangThaiDonHang, row.trangThai)
        })
    );

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1677FF' }
    };
    ['F', 'G', 'H', 'I'].forEach((column) => {
        sheet.getColumn(column).numFmt = '#,##0 [$₫-vi-VN]';
    });

    return workbook;
}

module.exports = { createWorkbook };

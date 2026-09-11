'use strict';

const enums = require('../../../../constants/enums');

const enumName = (items, value) => items.find((item) => Number(item.value) === Number(value))?.name || null;

function mapOrder(row) {
    return {
        id: row.id,
        maDonHang: row.ma_don_hang,
        nguoiDat: { id: row.nguoi_dat_id, hoTen: row.ten_nguoi_dat },
        phongBan: { id: row.phong_ban_id, tenPhongBan: row.ten_phong_ban },
        coSo: { id: row.co_so_id, tenCoSo: row.ten_co_so },
        datHo: row.dat_ho,
        nguoiNhan: {
            id: row.nguoi_nhan_id,
            hoTen: row.ten_nguoi_nhan,
            soDienThoai: row.so_dien_thoai_nguoi_nhan
        },
        diaDiemNhan: {
            id: row.dia_diem_nhan_id,
            tenDiaDiem: row.ten_dia_diem,
            diaChi: row.dia_chi_nhan_snapshot
        },
        khungGioNhan: {
            id: row.khung_gio_nhan_id,
            tenKhungGio: row.ten_khung_gio,
            tu: row.thoi_gian_nhan_tu,
            den: row.thoi_gian_nhan_den
        },
        ghiChu: row.ghi_chu,
        tien: {
            tamTinh: Number(row.tam_tinh),
            tongMienGiam: Number(row.tong_mien_giam),
            phiDichVu: Number(row.phi_dich_vu),
            tongThanhToan: Number(row.tong_thanh_toan)
        },
        phuongThucThanhToan: row.phuong_thuc_thanh_toan,
        tenPhuongThucThanhToan: enumName(enums.phuongThucThanhToanDonHang, row.phuong_thuc_thanh_toan),
        trangThaiThanhToan: row.trang_thai_thanh_toan,
        tenTrangThaiThanhToan: enumName(enums.trangThaiThanhToanDonHang, row.trang_thai_thanh_toan),
        trangThai: row.trang_thai,
        tenTrangThai: enumName(enums.trangThaiDonHang, row.trang_thai),
        nguoiXuLy: row.nguoi_xu_ly_id ? { id: row.nguoi_xu_ly_id, hoTen: row.ten_nguoi_xu_ly } : null,
        lyDoHuy: row.ly_do_huy,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

module.exports = { enumName, mapOrder };

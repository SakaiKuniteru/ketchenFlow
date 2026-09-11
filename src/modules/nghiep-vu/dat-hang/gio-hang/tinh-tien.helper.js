'use strict';

function roundMoney(value) {
    return Math.round(Number(value || 0));
}

function tinhTongTien(items, voucher = null, phiDichVu = 0) {
    const tamTinh = roundMoney(items.reduce((total, item) => total + Number(item.donGia) * Number(item.soLuong), 0));
    const tongMienGiam = Math.min(tamTinh, roundMoney(voucher?.soTienGiam || 0));
    const serviceFee = Math.max(0, roundMoney(phiDichVu));

    return {
        tamTinh,
        tongMienGiam,
        phiDichVu: serviceFee,
        tongThanhToan: tamTinh - tongMienGiam + serviceFee
    };
}

module.exports = {
    roundMoney,
    tinhTongTien
};

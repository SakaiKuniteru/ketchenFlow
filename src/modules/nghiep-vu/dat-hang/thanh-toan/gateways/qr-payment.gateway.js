"use strict";

const QRCode = require("qrcode");
const crypto = require("crypto");
const PaymentGateway = require("./payment.gateway");

class QrPaymentGateway extends PaymentGateway {
    async create(order) {
        const maGiaoDich = `QR-${crypto.randomUUID()}`;
        const payload = JSON.stringify({ maGiaoDich, maDonHang: order.ma_don_hang, soTien: Number(order.tong_thanh_toan) });
        return { maGiaoDich, qrPayload: await QRCode.toDataURL(payload), qrHetHanLuc: new Date(Date.now() + 15 * 60 * 1000), choXuLy: true };
    }
}

module.exports = new QrPaymentGateway();

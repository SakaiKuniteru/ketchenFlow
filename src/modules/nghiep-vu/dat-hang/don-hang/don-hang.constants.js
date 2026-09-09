"use strict";

const enums = require("../../../../constants/enums");

function getEnumValue(items, name) {
    const item = items.find(option => option.name === name);

    if (!item) {
        throw new Error(`Không tìm thấy enum "${name}".`);
    }

    return item.value;
}

const TRANG_THAI_DON_HANG = Object.freeze({
    TU_CHOI: getEnumValue(enums.trangThaiDonHang, "Đã từ chối"),
    DA_HUY: getEnumValue(enums.trangThaiDonHang, "Đã huỷ"),
    NHAP: getEnumValue(enums.trangThaiDonHang, "Đơn nháp"),
    CHO_XAC_NHAN: getEnumValue(enums.trangThaiDonHang, "Chờ xác nhận"),
    DANG_CHUAN_BI: getEnumValue(enums.trangThaiDonHang, "Đang chuẩn bị"),
    SAN_SANG_GIAO: getEnumValue(enums.trangThaiDonHang, "Sẵn sàng giao"),
    DANG_GIAO: getEnumValue(enums.trangThaiDonHang, "Đang giao"),
    HOAN_THANH: getEnumValue(enums.trangThaiDonHang, "Hoàn thành"),
    DONG_DON: getEnumValue(enums.trangThaiDonHang, "Đã đóng đơn")
});

const TRANG_THAI_CHI_TIET = Object.freeze({
    DA_HUY: getEnumValue(enums.trangThaiChiTietDonHang, "Đã huỷ"),
    CHO_XU_LY: getEnumValue(enums.trangThaiChiTietDonHang, "Chờ xử lý"),
    DANG_CHUAN_BI: getEnumValue(enums.trangThaiChiTietDonHang, "Đang chuẩn bị"),
    HOAN_THANH: getEnumValue(enums.trangThaiChiTietDonHang, "Hoàn thành")
});

const PHUONG_THUC_THANH_TOAN = Object.freeze({
    NOI_BO: getEnumValue(enums.phuongThucThanhToanDonHang, "Thanh toán nội bộ"),
    TIEN_MAT: getEnumValue(enums.phuongThucThanhToanDonHang, "Tiền mặt khi nhận"),
    CHUYEN_KHOAN: getEnumValue(enums.phuongThucThanhToanDonHang, "Chuyển khoản"),
    QR: getEnumValue(enums.phuongThucThanhToanDonHang, "QR Code")
});

const TRANG_THAI_THANH_TOAN = Object.freeze({
    CHUA_THANH_TOAN: getEnumValue(enums.trangThaiThanhToanDonHang, "Chưa thanh toán"),
    CHO_THANH_TOAN: getEnumValue(enums.trangThaiThanhToanDonHang, "Chờ thanh toán"),
    DA_THANH_TOAN: getEnumValue(enums.trangThaiThanhToanDonHang, "Đã thanh toán"),
    THAT_BAI: getEnumValue(enums.trangThaiThanhToanDonHang, "Thanh toán thất bại"),
    DA_HOAN_TIEN: getEnumValue(enums.trangThaiThanhToanDonHang, "Đã hoàn tiền")
});

const CHUYEN_TRANG_THAI = Object.freeze({
    [TRANG_THAI_DON_HANG.NHAP]: [TRANG_THAI_DON_HANG.CHO_XAC_NHAN, TRANG_THAI_DON_HANG.DA_HUY],
    [TRANG_THAI_DON_HANG.CHO_XAC_NHAN]: [TRANG_THAI_DON_HANG.DANG_CHUAN_BI, TRANG_THAI_DON_HANG.TU_CHOI, TRANG_THAI_DON_HANG.DA_HUY],
    [TRANG_THAI_DON_HANG.DANG_CHUAN_BI]: [TRANG_THAI_DON_HANG.SAN_SANG_GIAO, TRANG_THAI_DON_HANG.DA_HUY],
    [TRANG_THAI_DON_HANG.SAN_SANG_GIAO]: [TRANG_THAI_DON_HANG.DANG_GIAO, TRANG_THAI_DON_HANG.HOAN_THANH],
    [TRANG_THAI_DON_HANG.DANG_GIAO]: [TRANG_THAI_DON_HANG.HOAN_THANH],
    [TRANG_THAI_DON_HANG.HOAN_THANH]: [TRANG_THAI_DON_HANG.DONG_DON]
});

module.exports = {
    getEnumValue,
    TRANG_THAI_DON_HANG,
    TRANG_THAI_CHI_TIET,
    PHUONG_THUC_THANH_TOAN,
    TRANG_THAI_THANH_TOAN,
    CHUYEN_TRANG_THAI
};

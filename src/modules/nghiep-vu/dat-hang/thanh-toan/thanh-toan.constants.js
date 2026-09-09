"use strict";

const enums = require("../../../../constants/enums");
const { getEnumValue } = require("../don-hang/don-hang.constants");

module.exports = Object.freeze({
    LOAI_GIAO_DICH: {
        THANH_TOAN: getEnumValue(enums.loaiGiaoDichDonHang, "Thanh toán"),
        HOAN_TIEN: getEnumValue(enums.loaiGiaoDichDonHang, "Hoàn tiền")
    },
    TRANG_THAI_GIAO_DICH: {
        KHOI_TAO: getEnumValue(enums.trangThaiGiaoDichDonHang, "Khởi tạo"),
        CHO_XU_LY: getEnumValue(enums.trangThaiGiaoDichDonHang, "Chờ xử lý"),
        THANH_CONG: getEnumValue(enums.trangThaiGiaoDichDonHang, "Thành công"),
        THAT_BAI: getEnumValue(enums.trangThaiGiaoDichDonHang, "Thất bại"),
        DA_HUY: getEnumValue(enums.trangThaiGiaoDichDonHang, "Đã huỷ")
    }
});

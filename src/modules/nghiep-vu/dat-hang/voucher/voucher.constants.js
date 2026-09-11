'use strict';

const enums = require('../../../../constants/enums');
const { getEnumValue } = require('../don-hang/don-hang.constants');

module.exports = Object.freeze({
    LOAI_GIAM: {
        PHAN_TRAM: getEnumValue(enums.loaiGiamVoucherDonHang, 'Phần trăm'),
        SO_TIEN: getEnumValue(enums.loaiGiamVoucherDonHang, 'Số tiền cố định'),
        MIEN_PHI_DICH_VU: getEnumValue(enums.loaiGiamVoucherDonHang, 'Miễn phí dịch vụ')
    },
    PHAM_VI: {
        TOAN_DON: getEnumValue(enums.phamViApDungVoucherDonHang, 'Toàn bộ đơn hàng'),
        NHOM_SAN_PHAM: getEnumValue(enums.phamViApDungVoucherDonHang, 'Nhóm sản phẩm'),
        SAN_PHAM: getEnumValue(enums.phamViApDungVoucherDonHang, 'Sản phẩm cụ thể')
    },
    TRANG_THAI_SU_DUNG: {
        GIU_CHO: getEnumValue(enums.trangThaiSuDungVoucherDonHang, 'Giữ chỗ'),
        DA_SU_DUNG: getEnumValue(enums.trangThaiSuDungVoucherDonHang, 'Đã sử dụng'),
        DA_HOAN: getEnumValue(enums.trangThaiSuDungVoucherDonHang, 'Đã hoàn lượt')
    },
    LOAI_SAN_PHAM: {
        DICH_VU_KHAC: getEnumValue(enums.loaiSanPham, 'Dịch vụ khác')
    }
});

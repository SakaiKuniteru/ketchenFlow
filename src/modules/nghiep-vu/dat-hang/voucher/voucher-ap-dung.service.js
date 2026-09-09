"use strict";

const pool = require("../../../../config/database");
const ruleService = require("./voucher-rule.service");

class VoucherApDungService {
    async apply(maVoucher, context, items, client = pool, lock = false) {
        if (!maVoucher) {
            return null;
        }

        const voucher = await ruleService.getVoucher(maVoucher.trim(), context.nhanVienId, client, lock);
        ruleService.validate(voucher, context);
        const discount = ruleService.calculate(voucher, items);

        if (!discount.soTienDuDieuKien) {
            throw new (require("../../../../utils/api-error"))(400, "Giỏ hàng không có sản phẩm phù hợp với voucher.");
        }

        return {
            id: voucher.id,
            maVoucher: voucher.ma_voucher,
            tenVoucher: voucher.ten_voucher,
            loaiGiam: voucher.loai_giam,
            giaTri: Number(voucher.gia_tri),
            ...discount
        };
    }
}

module.exports = new VoucherApDungService();

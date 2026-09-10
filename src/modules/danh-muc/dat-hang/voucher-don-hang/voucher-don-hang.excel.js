"use strict";

const {
    sendExcel
} = require(
    "../../../../helpers/excel/excel-result"
);

const {
    exportVoucherDonHang
} = require("./voucher-don-hang.export");

const {
    importVoucherDonHang
} = require("./voucher-don-hang.import");

class VoucherDonHangExcel {

    exportData =
        async (
            req,
            res,
            next
        ) => {
            try {
                const result =
                    await exportVoucherDonHang(
                        req.query
                    );

                return sendExcel(
                    res,
                    result
                );
            } catch (error) {
                next(error);
            }
        };

    importData =
        async (
            req,
            res,
            next
        ) => {
            try {
                const result =
                    await importVoucherDonHang(
                        req.file,
                        req.user
                    );

                return sendExcel(
                    res,
                    result
                );
            } catch (error) {
                next(error);
            }
        };
}

module.exports =
    new VoucherDonHangExcel();
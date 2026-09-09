"use strict";

const {
    sendExcel
} = require(
    "../../../../helpers/excel/excel-result"
);

const {
    exportNhomSanPham
} = require(
    "./nhom-san-pham.export"
);

const {
    importNhomSanPham
} = require(
    "./nhom-san-pham.import"
);


class NhomSanPhamExcel {

    exportData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const result =
                    await exportNhomSanPham(
                        req.query
                    );

                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(
                    error
                );

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
                    await importNhomSanPham(
                        req.file
                    );

                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(
                    error
                );

            }

        };

}


module.exports =
    new NhomSanPhamExcel();
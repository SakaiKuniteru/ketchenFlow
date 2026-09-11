'use strict';

const { sendExcel } = require('../../../../helpers/excel/excel-result');
const { exportThucPham } = require('./thuc-pham.export');
const { importThucPham } = require('./thuc-pham.import');

class ThucPhamExcel {
    exportData = async (req, res, next) => {
        try {
            const result = await exportThucPham(req.query);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    importData = async (req, res, next) => {
        try {
            const result = await importThucPham(req.file);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new ThucPhamExcel();

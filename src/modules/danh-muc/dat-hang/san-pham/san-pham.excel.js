'use strict';
const { sendExcel } = require('../../../../helpers/excel/excel-result');
const { exportSanPham } = require('./san-pham.export');
const { importSanPham } = require('./san-pham.import');

class SanPhamExcel {
    exportData = async (req, res, next) => {
        try {
            const result = await exportSanPham(req.query);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
    importData = async (req, res, next) => {
        try {
            const result = await importSanPham(req.file);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new SanPhamExcel();

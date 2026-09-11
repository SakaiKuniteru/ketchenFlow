'use strict';

const { sendExcel } = require('../../../../helpers/excel/excel-result');
const { exportMonAn } = require('./export/mon-an.export');
const { importMonAn } = require('./import/mon-an.import');
const { exportCongThucMonAn } = require('./export/mon-an-cong-thuc.export');
const { importCongThucMonAn } = require('./import/mon-an-cong-thuc.import');

class MonAnExcel {
    exportData = async (req, res, next) => {
        try {
            const result = await exportMonAn(req.query);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    exportCongThuc = async (req, res, next) => {
        try {
            const result = await exportCongThucMonAn(req.query);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    importData = async (req, res, next) => {
        try {
            const result = await importMonAn(req.file);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    importCongThuc = async (req, res, next) => {
        try {
            const result = await importCongThucMonAn(req.file);
            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new MonAnExcel();

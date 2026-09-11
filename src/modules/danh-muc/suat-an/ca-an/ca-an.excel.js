'use strict';

const { sendExcel } = require('../../../../helpers/excel/excel-result');
const { exportCaAn } = require('./ca-an.export');
const { importCaAn } = require('./ca-an.import');

class CaAnExcel {
    exportData = async (req, res, next) => {
        try {
            const result = await exportCaAn(req.query);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    importData = async (req, res, next) => {
        try {
            const result = await importCaAn(req.file);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new CaAnExcel();

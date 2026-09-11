'use strict';

const { sendExcel } = require('../../../../helpers/excel/excel-result');

const { exportDonViTinh } = require('./don-vi-tinh.export');

const { importDonViTinh } = require('./don-vi-tinh.import');

class DonViTinhExcel {
    exportData = async (req, res, next) => {
        try {
            const result = await exportDonViTinh(req.query);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };

    importData = async (req, res, next) => {
        try {
            const result = await importDonViTinh(req.file);

            return sendExcel(res, result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new DonViTinhExcel();

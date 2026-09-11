'use strict';

const tinhThanhExport = require('./tinh-thanh.export');

const tinhThanhImport = require('./tinh-thanh.import');

module.exports = {
    exportData: tinhThanhExport.exportData,
    importData: tinhThanhImport.importData
};

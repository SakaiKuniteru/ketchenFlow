'use strict';

const xaPhuongExport = require('./xa-phuong.export');

const xaPhuongImport = require('./xa-phuong.import');

module.exports = {
    exportData: xaPhuongExport.exportData,
    importData: xaPhuongImport.importData
};

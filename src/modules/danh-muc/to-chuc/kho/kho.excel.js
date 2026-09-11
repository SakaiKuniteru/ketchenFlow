'use strict';

const khoExport = require('./kho.export');

const khoImport = require('./kho.import');

module.exports = {
    exportData: khoExport.exportData,
    importData: khoImport.importData
};

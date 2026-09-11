'use strict';

const nhaAnExport = require('./nha-an.export');

const nhaAnImport = require('./nha-an.import');

module.exports = {
    exportData: nhaAnExport.exportData,
    importData: nhaAnImport.importData
};

'use strict';

const chucVuExport = require('./chuc-vu.export');

const chucVuImport = require('./chuc-vu.import');

module.exports = {
    exportData: chucVuExport.exportData,
    importData: chucVuImport.importData
};

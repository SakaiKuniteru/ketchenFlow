'use strict';

const quyenExport = require('./quyen.export');

const quyenImport = require('./quyen.import');

module.exports = {
    exportData: quyenExport.exportData,
    importData: quyenImport.importData
};

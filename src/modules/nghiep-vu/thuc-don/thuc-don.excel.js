'use strict';

const thucDonExport = require('./thuc-don.export');

const thucDonImport = require('./thuc-don.import');

module.exports = {
    exportData: thucDonExport.exportData,
    importData: thucDonImport.importData
};

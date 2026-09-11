'use strict';

const coSoExport = require('./co-so.export');

const coSoImport = require('./co-so.import');

module.exports = {
    exportData: coSoExport.exportData,
    importData: coSoImport.importData
};

'use strict';

const vaiTroExport = require('./vai-tro.export');

const vaiTroImport = require('./vai-tro.import');

module.exports = {
    exportData: vaiTroExport.exportData,
    importData: vaiTroImport.importData
};

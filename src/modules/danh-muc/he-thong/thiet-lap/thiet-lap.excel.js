'use strict';

const thietLapExport = require('./thiet-lap.export');

const thietLapImport = require('./thiet-lap.import');

module.exports = {
    exportData: thietLapExport.exportData,
    importData: thietLapImport.importData
};

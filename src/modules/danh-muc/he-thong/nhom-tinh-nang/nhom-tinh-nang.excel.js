'use strict';

const nhomTinhNangExport = require('./nhom-tinh-nang.export');

const nhomTinhNangImport = require('./nhom-tinh-nang.import');

module.exports = {
    exportData: nhomTinhNangExport.exportData,
    importData: nhomTinhNangImport.importData
};

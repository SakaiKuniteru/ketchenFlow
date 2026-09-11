'use strict';

const phongBanExport = require('./phong-ban.export');

const phongBanImport = require('./phong-ban.import');

module.exports = {
    exportData: phongBanExport.exportData,
    importData: phongBanImport.importData
};

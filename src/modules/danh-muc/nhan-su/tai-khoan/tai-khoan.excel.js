'use strict';

const taiKhoanExport = require('./tai-khoan.export');

const taiKhoanImport = require('./tai-khoan.import');

module.exports = {
    exportData: taiKhoanExport.exportData,
    importData: taiKhoanImport.importData
};

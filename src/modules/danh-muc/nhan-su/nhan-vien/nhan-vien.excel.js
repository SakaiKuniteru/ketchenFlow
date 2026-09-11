'use strict';

const nhanVienExport = require('./nhan-vien.export');

const nhanVienImport = require('./nhan-vien.import');

module.exports = {
    exportData: nhanVienExport.exportData,
    importData: nhanVienImport.importData
};

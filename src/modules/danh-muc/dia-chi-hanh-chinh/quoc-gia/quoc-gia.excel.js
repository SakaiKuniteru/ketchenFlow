'use strict';

const quocGiaExport = require('./quoc-gia.export');

const quocGiaImport = require('./quoc-gia.import');

module.exports = {
    exportData: quocGiaExport.exportData,
    importData: quocGiaImport.importData
};

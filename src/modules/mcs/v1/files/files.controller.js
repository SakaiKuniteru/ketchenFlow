'use strict';

const path = require('path');
const filesService = require('./files.service');

class FilesController {
    async getFile(req, res, next) {
        try {
            const filePath = req.params[0];

            const absolutePath = await filesService.getFile(filePath);

            const extension = path.extname(absolutePath).toLowerCase();

            if (extension === '.pdf') {
                res.type('application/pdf');
            } else if (extension === '.json') {
                res.type('application/json');
            } else if (extension === '.docx') {
                res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            }

            res.setHeader('Cache-Control', 'no-store');

            return res.sendFile(absolutePath);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FilesController();

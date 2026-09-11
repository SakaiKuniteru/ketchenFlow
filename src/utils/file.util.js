const fs = require('fs');

const path = require('path');

function getPhysicalFilePath(relativePath) {
    if (!relativePath) {
        return null;
    }

    const normalizedPath = String(relativePath).replace(/^\/+/, '');

    if (normalizedPath.startsWith('uploads/')) {
        return path.join(process.cwd(), 'src/public', normalizedPath);
    }

    return path.join(process.cwd(), normalizedPath);
}

async function deleteFile(relativePath) {
    if (!relativePath) {
        return false;
    }

    const physicalPath = getPhysicalFilePath(relativePath);

    if (!physicalPath) {
        return false;
    }

    try {
        await fs.promises.unlink(physicalPath);

        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }

        throw error;
    }
}

async function deleteFiles(filePaths = []) {
    for (const filePath of filePaths) {
        if (!filePath) {
            continue;
        }

        await deleteFile(filePath);
    }
}

module.exports = {
    getPhysicalFilePath,

    deleteFile,

    deleteFiles
};

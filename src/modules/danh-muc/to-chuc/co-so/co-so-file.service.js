const fs = require('fs');
const path = require('path');

class CoSoFileService {
    getRootDirectory() {
        return path.join(process.cwd(), 'src/public/uploads/danh-muc/co-so');
    }

    normalizeMaCoSo(maCoSo) {
        return String(maCoSo)
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    getLoaiConfig(fieldName) {
        switch (fieldName) {
            case 'logo':
                return {
                    folder: 'logo',
                    baseName: 'logo'
                };

            case 'favicon':
                return {
                    folder: 'favicon',
                    baseName: 'favicon'
                };

            case 'logoDoiTac':
                return {
                    folder: 'logo-doi-tac',
                    baseName: 'logo-doi-tac'
                };

            default:
                throw new Error(`Loại ảnh cơ sở không hợp lệ: ${fieldName}`);
        }
    }

    getCoSoDirectory(maCoSo) {
        return path.join(this.getRootDirectory(), this.normalizeMaCoSo(maCoSo));
    }

    getImageDirectory(maCoSo, fieldName) {
        const config = this.getLoaiConfig(fieldName);

        return path.join(this.getCoSoDirectory(maCoSo), config.folder);
    }

    ensureImageDirectory(maCoSo, fieldName) {
        const directory = this.getImageDirectory(maCoSo, fieldName);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            });
        }

        return directory;
    }

    getDanhSachFile(maCoSo, fieldName) {
        const directory = this.ensureImageDirectory(maCoSo, fieldName);

        const config = this.getLoaiConfig(fieldName);

        const escapedBaseName = config.baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(`^${escapedBaseName}-(\\d+)\\.(jpg|jpeg|png|webp|ico)$`, 'i');

        return fs
            .readdirSync(directory)
            .map((fileName) => {
                const match = fileName.match(regex);

                if (!match) {
                    return null;
                }

                return {
                    fileName,
                    version: Number(match[1]),
                    fullPath: path.join(directory, fileName)
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.version - b.version);
    }

    getNextVersion(maCoSo, fieldName) {
        const danhSach = this.getDanhSachFile(maCoSo, fieldName);

        if (danhSach.length === 0) {
            return 1;
        }

        return danhSach[danhSach.length - 1].version + 1;
    }

    async saveFile(maCoSo, fieldName, file) {
        if (!file) {
            return null;
        }

        const directory = this.ensureImageDirectory(maCoSo, fieldName);

        const config = this.getLoaiConfig(fieldName);

        const version = this.getNextVersion(maCoSo, fieldName);

        const extension = path.extname(file.originalname).toLowerCase();

        const fileName = `${config.baseName}-${version}${extension}`;

        const destination = path.join(directory, fileName);

        await fs.promises.rename(file.path, destination);

        const maCoSoFolder = this.normalizeMaCoSo(maCoSo);

        return {
            fieldName,
            version,
            fileName,
            fullPath: destination,
            relativePath: path.posix.join('uploads', 'danh-muc', 'co-so', maCoSoFolder, config.folder, fileName)
        };
    }

    async cleanupOldFiles(maCoSo, fieldName, maxFiles = 3) {
        const danhSach = this.getDanhSachFile(maCoSo, fieldName);

        if (danhSach.length <= maxFiles) {
            return;
        }

        const soLuongCanXoa = danhSach.length - maxFiles;

        const danhSachCanXoa = danhSach.slice(0, soLuongCanXoa);

        for (const file of danhSachCanXoa) {
            try {
                await fs.promises.unlink(file.fullPath);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }
        }
    }

    async deletePhysicalFile(fullPath) {
        if (!fullPath) {
            return;
        }

        try {
            await fs.promises.unlink(fullPath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async deleteTempFiles(files) {
        if (!files) {
            return;
        }

        for (const danhSachFile of Object.values(files)) {
            if (!Array.isArray(danhSachFile)) {
                continue;
            }

            for (const file of danhSachFile) {
                if (file?.path) {
                    await this.deletePhysicalFile(file.path);
                }
            }
        }
    }

    async renameCoSoDirectory(maCoSoCu, maCoSoMoi) {
        const maCu = this.normalizeMaCoSo(maCoSoCu);
        const maMoi = this.normalizeMaCoSo(maCoSoMoi);

        if (maCu === maMoi) {
            return;
        }

        const oldDirectory = path.join(this.getRootDirectory(), maCu);

        const newDirectory = path.join(this.getRootDirectory(), maMoi);

        if (!fs.existsSync(oldDirectory)) {
            return;
        }

        if (fs.existsSync(newDirectory)) {
            throw new Error(`Thư mục ảnh của cơ sở "${maMoi}" đã tồn tại.`);
        }

        await fs.promises.rename(oldDirectory, newDirectory);
    }

    replaceMaCoSoInPath(filePath, maCoSoCu, maCoSoMoi) {
        if (!filePath) {
            return filePath;
        }

        const maCu = this.normalizeMaCoSo(maCoSoCu);
        const maMoi = this.normalizeMaCoSo(maCoSoMoi);

        return String(filePath).replace(`/co-so/${maCu}/`, `/co-so/${maMoi}/`);
    }
}

module.exports = new CoSoFileService();

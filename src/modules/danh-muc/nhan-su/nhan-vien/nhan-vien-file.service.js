const fs = require('fs');

const path = require('path');

class NhanVienFileService {
    getRootDirectory() {
        return path.join(process.cwd(), 'src/public/uploads/danh-muc/nhan-vien');
    }

    normalizeText(value) {
        return String(value || '')
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();
    }

    normalizeMaNhanVien(maNhanVien) {
        return String(maNhanVien)
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toUpperCase();
    }

    getNhanVienDirectory(maNhanVien) {
        return path.join(this.getRootDirectory(), this.normalizeMaNhanVien(maNhanVien));
    }

    ensureDirectory(maNhanVien) {
        const directory = this.getNhanVienDirectory(maNhanVien);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            });
        }

        return directory;
    }

    getDanhSachAnh(maNhanVien) {
        const directory = this.ensureDirectory(maNhanVien);

        return fs
            .readdirSync(directory)
            .map((fileName) => {
                const fullPath = path.join(directory, fileName);

                const stat = fs.statSync(fullPath);

                const match = fileName.match(/-(\d)\.(jpg|jpeg|png|webp)$/i);

                if (!match) {
                    return null;
                }

                return {
                    fileName,

                    version: Number(match[1]),

                    fullPath,

                    modifiedTime: stat.mtimeMs
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.modifiedTime - b.modifiedTime);
    }

    getNextVersion(maNhanVien) {
        const danhSach = this.getDanhSachAnh(maNhanVien);

        if (danhSach.length === 0) {
            return 1;
        }

        const fileMoiNhat = danhSach[danhSach.length - 1];

        return fileMoiNhat.version >= 9 ? 1 : fileMoiNhat.version + 1;
    }

    async saveFile(maNhanVien, hoTen, file) {
        if (!file) {
            return null;
        }

        const directory = this.ensureDirectory(maNhanVien);

        const version = this.getNextVersion(maNhanVien);

        const extension = path.extname(file.originalname).toLowerCase();

        const hoTenFile = this.normalizeText(hoTen) || 'nhanvien';

        const maNhanVienFile = this.normalizeText(maNhanVien) || 'nv';

        const fileName = `${hoTenFile}-${maNhanVienFile}-${version}${extension}`;

        const destination = path.join(directory, fileName);

        /*
         * Trường hợp quay vòng 9 → 1,
         * nếu file suffix 1 cũ còn tồn tại thì xóa trước.
         */
        if (fs.existsSync(destination)) {
            await fs.promises.unlink(destination);
        }

        await fs.promises.rename(file.path, destination);

        return {
            version,

            fileName,

            fullPath: destination,

            relativePath: path.posix.join(
                'uploads',
                'danh-muc',
                'nhan-vien',
                this.normalizeMaNhanVien(maNhanVien),
                fileName
            )
        };
    }

    async cleanupOldFiles(maNhanVien, maxFiles = 3) {
        const danhSach = this.getDanhSachAnh(maNhanVien);

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

    async deleteTempFile(file) {
        if (!file?.path) {
            return;
        }

        await this.deletePhysicalFile(file.path);
    }

    async renameNhanVienDirectory(maNhanVienCu, maNhanVienMoi) {
        const maCu = this.normalizeMaNhanVien(maNhanVienCu);

        const maMoi = this.normalizeMaNhanVien(maNhanVienMoi);

        if (maCu === maMoi) {
            return;
        }

        const oldDirectory = path.join(this.getRootDirectory(), maCu);

        const newDirectory = path.join(this.getRootDirectory(), maMoi);

        if (!fs.existsSync(oldDirectory)) {
            return;
        }

        if (fs.existsSync(newDirectory)) {
            throw new Error(`Thư mục ảnh nhân viên "${maMoi}" đã tồn tại.`);
        }

        await fs.promises.rename(oldDirectory, newDirectory);
    }

    replaceMaNhanVienInPath(filePath, maNhanVienCu, maNhanVienMoi) {
        if (!filePath) {
            return filePath;
        }

        const maCu = this.normalizeMaNhanVien(maNhanVienCu);

        const maMoi = this.normalizeMaNhanVien(maNhanVienMoi);

        return String(filePath).replace(`/nhan-vien/${maCu}/`, `/nhan-vien/${maMoi}/`);
    }
}

module.exports = new NhanVienFileService();

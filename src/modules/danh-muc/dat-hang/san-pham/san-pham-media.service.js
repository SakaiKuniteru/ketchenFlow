const fs = require("fs/promises");
const path = require("path");
const pool = require("../../../../config/database");
const ApiError = require("../../../../utils/api-error");
const repository = require("./san-pham.repository");
const ROOT = path.join(process.cwd(), "src/public/uploads/danh-muc/san-pham");


function safeCode(value) {
    const code = String(value ?? "").trim();
    if (!code || code === "." || code === ".." || /[/\\\0]/.test(code)) {
        throw new ApiError(400, "Mã sản phẩm không hợp lệ để tạo thư mục ảnh.");
    }
    return code;
}


function slug(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "san-pham";
}
async function exists(directory) {
    try {
        await fs.access(directory);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw error;
    }
}
async function listImages(directory) {
    const entries = await fs.readdir(directory, {
        withFileTypes: true
    });
    return entries.filter(entry => entry.isFile()).map(entry => {
        const match = entry.name.match(/-(\d+)\.(jpg|jpeg|png|webp)$/i);
        return match ? {
            name: entry.name,
            version: Number(match[1])
        } : null;
    }).filter(Boolean).sort((a, b) => a.version - b.version);
}


function imageExtension(file) {
    const buffer = file.buffer;
    if (file.mimetype === "image/jpeg" && buffer?.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[
        2] === 0xff) {
        return "jpg";
    }
    if (file.mimetype === "image/png" && buffer?.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78,
            71, 13, 10, 26, 10
        ]))) {
        return "png";
    }
    if (file.mimetype === "image/webp" && buffer?.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer
        .toString("ascii", 8, 12) === "WEBP") {
        return "webp";
    }
    throw new ApiError(400, "Nội dung file ảnh không hợp lệ.");
}
async function save(data, file, id = null) {
    const client = await pool.connect();
    let locked = false;
    let committed = false;
    let newFile = null;
    let moved = null;
    try {
        // Giữ khóa đến sau khi dọn ảnh, tránh hai lần lưu đụng nhau.
        await client.query("SELECT pg_advisory_lock(hashtext($1))",
            ["dm-san-pham-images"]);
        locked = true;
        await client.query("BEGIN");
        const previous = id === null ? null : await repository.getChiTiet(id, client);
        if (id !== null && !previous) {
            throw new ApiError(404, "Sản phẩm không tồn tại.");
        }
        const code = safeCode(data.maSanPham);
        const directory = path.join(ROOT, code);
        await fs.mkdir(ROOT, {
            recursive: true
        });
        if (previous && previous.maSanPham !== data.maSanPham) {
            const oldCode = safeCode(previous.maSanPham);
            const oldDirectory = path.join(ROOT, oldCode);
            if (await exists(oldDirectory)) {
                if (await exists(directory)) {
                    throw new ApiError(409, "Thư mục ảnh của mã sản phẩm mới đã tồn tại.");
                }
                await fs.rename(oldDirectory, directory);
                moved = {
                    oldDirectory,
                    directory
                };
            }
            if (data.hinhAnh) {
                const oldPart = `/san-pham/${encodeURIComponent(oldCode)}/`;
                const newPart = `/san-pham/${encodeURIComponent(code)}/`;
                data.hinhAnh = String(data.hinhAnh).replace(oldPart, newPart);
            }
        }
        await fs.mkdir(directory, {
            recursive: true
        });
        if (file) {
            const extension = imageExtension(file);
            const images = await listImages(directory);
            const version = (images.at(-1)?.version ?? 0) + 1;
            const fileName = `${slug(data.tenSanPham)}-${slug(code)}-${version}.${extension}`;
            const destination = path.join(directory, fileName);
            // Không ghi đè file đã có.
            const handle = await fs.open(destination, "wx");
            newFile = destination;
            try {
                await handle.writeFile(file.buffer);
            } finally {
                await handle.close();
            }
            data.hinhAnh = `uploads/danh-muc/san-pham/` + `${encodeURIComponent(code)}/${fileName}`;
        }
        const result = id === null ? await repository.create(data, client) : await repository.update(id, data,
            client);
        if (!result) {
            throw new ApiError(404, "Sản phẩm không tồn tại.");
        }
        await client.query("COMMIT");
        committed = true;
        // Chỉ xóa ảnh cũ sau khi DB đã lưu ảnh mới thành công.
        try {
            const images = await listImages(directory);
            for (const image of images.slice(0, -3)) {
                await fs.unlink(path.join(directory, image.name));
            }
        } catch (error) {
            console.error("Không thể dọn ảnh sản phẩm cũ:", error);
        }
        return result;
    } catch (error) {
        if (!committed) {
            await client.query("ROLLBACK").catch(console.error);
            if (newFile) {
                await fs.unlink(newFile).catch(console.error);
            }
            if (moved) {
                await fs.rename(moved.directory, moved.oldDirectory).catch(console.error);
            }
        }
        throw error;
    } finally {
        if (locked) {
            try {
                await client.query("SELECT pg_advisory_unlock(hashtext($1))",
                    ["dm-san-pham-images"]);
            } catch (error) {
                client.release(error);
                throw error;
            }
        }
        client.release();
    }
}

module.exports = {
    save
};

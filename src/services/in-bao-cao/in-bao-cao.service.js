"use strict";
const fsSync =
    require(
        "fs"
    );
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { randomUUID } = require("crypto");
const { execFile } = require("child_process");
const { promisify } = require("util");

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const ApiError = require("../../utils/api-error");

const inBaoCaoRepository = require("./in-bao-cao.repository");

const {
    STORAGE_ROOT
} = require("../../config/storage");


const execFileAsync =
    promisify(
        execFile
    );


class InBaoCaoService {

    getStorageRoot() {
        return STORAGE_ROOT;
    }


    chuanHoaMaBaoCao(
        value
    ) {
        const maBaoCao =
            String(
                value || ""
            )
                .trim()
                .toLowerCase();

        if (!maBaoCao) {
            throw new ApiError(
                400,
                "Mã báo cáo không được để trống."
            );
        }

        return maBaoCao;
    }


    async getBaoCao(
        maBaoCao
    ) {
        const ma =
            this.chuanHoaMaBaoCao(
                maBaoCao
            );

        const baoCao =
            await inBaoCaoRepository
                .getByMa(
                    ma
                );

        if (!baoCao) {
            throw new ApiError(
                404,
                `Không tìm thấy báo cáo "${ma}".`
            );
        }

        if (
            !String(
                baoCao.file_mau || ""
            ).trim()
        ) {
            throw new ApiError(
                400,
                `Báo cáo "${ma}" chưa được cấu hình file mẫu.`
            );
        }

        return baoCao;
    }


    chuanHoaDuongDanFileMau(
        value
    ) {
        const filePath =
            String(
                value || ""
            )
                .replaceAll(
                    "\\",
                    "/"
                )
                .replace(
                    /^\/+/,
                    ""
                )
                .trim();

        if (!filePath) {
            throw new ApiError(
                400,
                "Đường dẫn file mẫu báo cáo không hợp lệ."
            );
        }

        if (
            filePath.includes("\0") ||
            filePath
                .split("/")
                .includes("..")
        ) {
            throw new ApiError(
                400,
                "Đường dẫn file mẫu báo cáo không hợp lệ."
            );
        }

        return filePath;
    }

    async resolveFileMau(
        fileMau
    ) {
        const normalized =
            this.chuanHoaDuongDanFileMau(
                fileMau
            );


        const storageRoot =
            this.getStorageRoot();


        const absolutePath =
            path.resolve(
                storageRoot,
                normalized
            );


        const rootPrefix =
            storageRoot.endsWith(
                path.sep
            )
                ? storageRoot
                : storageRoot +
                path.sep;


        if (
            !absolutePath.startsWith(
                rootPrefix
            )
        ) {
            throw new ApiError(
                403,
                "Đường dẫn file mẫu báo cáo không hợp lệ."
            );
        }


        try {

            const stat =
                await fs.stat(
                    absolutePath
                );


            if (
                !stat.isFile()
            ) {
                throw new ApiError(
                    404,
                    `Không tìm thấy file mẫu báo cáo "${normalized}".`
                );
            }


            return absolutePath;

        } catch (
            error
        ) {

            if (
                error instanceof
                ApiError
            ) {
                throw error;
            }


            if (
                error?.code ===
                "ENOENT"
            ) {

                console.error(
                    "Không tìm thấy file mẫu báo cáo.",
                    {
                        fileMau:
                            normalized,

                        storageRoot,

                        absolutePath
                    }
                );


                throw new ApiError(
                    404,
                    `Không tìm thấy file mẫu báo cáo "${normalized}".`
                );

            }


            throw error;

        }
    }

    flattenObject(
        value,
        prefix = "",
        result = {}
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            if (prefix) {
                result[prefix] = "";
            }

            return result;
        }

        if (
            Array.isArray(
                value
            )
        ) {
            if (prefix) {
                result[prefix] =
                    value;
            }

            return result;
        }

        if (
            typeof value ===
                "object" &&
            !(value instanceof Date)
        ) {
            Object.entries(
                value
            ).forEach(([
                key,
                child
            ]) => {
                const childPrefix =
                    prefix
                        ? `${prefix}.${key}`
                        : key;

                this.flattenObject(
                    child,
                    childPrefix,
                    result
                );
            });

            return result;
        }

        if (prefix) {
            result[prefix] =
                value;
        }

        return result;
    }


    async renderDocx(
        fileMau,
        data
    ) {
        let templateBuffer;

        try {
            templateBuffer =
                await fs.readFile(
                    fileMau
                );
        } catch (error) {
            throw new ApiError(
                500,
                "Không thể đọc file mẫu báo cáo."
            );
        }

        try {
            const zip =
                new PizZip(
                    templateBuffer
                );

            const doc =
                new Docxtemplater(
                    zip,
                    {
                        paragraphLoop:
                            true,

                        linebreaks:
                            true,

                        delimiters: {
                            start:
                                "[[",

                            end:
                                "]]"
                        },

                        nullGetter() {
                            return "";
                        }
                    }
                );

            const templateData =
                this.flattenObject({
                    data
                });

            doc.render(
                templateData
            );

            return doc
                .getZip()
                .generate({
                    type:
                        "nodebuffer",

                    compression:
                        "DEFLATE"
                });
        } catch (error) {
            console.error(
                "Lỗi render báo cáo:",
                error
            );

            throw new ApiError(
                500,
                "Không thể kết xuất dữ liệu vào file mẫu báo cáo."
            );
        }
    }

    getLibreOfficeBinary() {

        const configured =
            String(
                process.env
                    .LIBREOFFICE_BIN ||
                ""
            ).trim();


        if (
            configured
        ) {

            if (
                path.isAbsolute(
                    configured
                ) &&
                !fsSync.existsSync(
                    configured
                )
            ) {

                throw new ApiError(
                    500,
                    `Không tìm thấy LibreOffice tại "${configured}".`
                );

            }


            return configured;

        }


        let candidates =
            [];


        if (
            process.platform ===
            "darwin"
        ) {

            candidates = [

                "/Applications/LibreOffice.app/Contents/MacOS/soffice",

                "/opt/homebrew/bin/soffice",

                "/usr/local/bin/soffice"

            ];

        } else if (
            process.platform ===
            "win32"
        ) {

            candidates = [

                "C:\\Program Files\\LibreOffice\\program\\soffice.exe",

                "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"

            ];

        } else {

            candidates = [

                "/usr/bin/soffice",

                "/usr/bin/libreoffice",

                "/usr/local/bin/soffice",

                "/usr/local/bin/libreoffice"

            ];

        }


        const found =
            candidates.find(
                candidate =>
                    fsSync.existsSync(
                        candidate
                    )
            );


        if (
            found
        ) {

            return found;

        }


        throw new ApiError(
            500,
            [
                "Không tìm thấy LibreOffice để chuyển báo cáo sang PDF.",
                "Các đường dẫn đã kiểm tra:",
                ...candidates
            ].join(
                "\n"
            )
        );

    }

    sanitizeFileName(
        value
    ) {
        const text =
            String(
                value || "bao-cao"
            )
                .trim()
                .replace(
                    /[^a-zA-Z0-9._-]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );

        return (
            text ||
            "bao-cao"
        );
    }


    async convertDocxToPdf(
        docxBuffer,
        fileName
    ) {
        const tempDirectory =
            path.join(
                os.tmpdir(),
                `mcs-report-${randomUUID()}`
            );

        const baseName =
            this.sanitizeFileName(
                fileName
            );

        const docxPath =
            path.join(
                tempDirectory,
                `${baseName}.docx`
            );

        const pdfPath =
            path.join(
                tempDirectory,
                `${baseName}.pdf`
            );

        await fs.mkdir(
            tempDirectory,
            {
                recursive:
                    true
            }
        );

        try {
            await fs.writeFile(
                docxPath,
                docxBuffer
            );

            const binary =
                this.getLibreOfficeBinary();

            await execFileAsync(
                binary,
                [
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    tempDirectory,
                    docxPath
                ],
                {
                    timeout:
                        30000,

                    maxBuffer:
                        10 * 1024 * 1024
                }
            );

            try {
                return await fs.readFile(
                    pdfPath
                );
            } catch (error) {
                throw new ApiError(
                    500,
                    "LibreOffice không tạo được file PDF báo cáo."
                );
            }
        } catch (error) {
            if (
                error instanceof
                ApiError
            ) {
                throw error;
            }

            if (
                error?.code ===
                "ENOENT"
            ) {
                throw new ApiError(
                    500,
                    "Không tìm thấy LibreOffice để chuyển báo cáo sang PDF."
                );
            }

            console.error(
                "Lỗi chuyển DOCX sang PDF:",
                error
            );

            throw new ApiError(
                500,
                "Không thể chuyển báo cáo sang PDF."
            );
        } finally {
            await fs.rm(
                tempDirectory,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            ).catch(
                () => {}
            );
        }
    }


    async taoBaoCao({
        maBaoCao,
        id,
        soPhieu,
        data
    }) {
        if (
            id === undefined ||
            id === null
        ) {
            throw new ApiError(
                400,
                "ID dữ liệu báo cáo không hợp lệ."
            );
        }

        const baoCao =
            await this.getBaoCao(
                maBaoCao
            );

        const fileMau =
            await this.resolveFileMau(
                baoCao.file_mau
            );

        const extension =
            path.extname(
                fileMau
            )
                .toLowerCase();

        if (
            extension !==
            ".docx"
        ) {
            throw new ApiError(
                400,
                "File mẫu báo cáo hiện tại phải là định dạng DOCX."
            );
        }

        const docxBuffer =
            await this.renderDocx(
                fileMau,
                data
            );

        const baseName =
            this.sanitizeFileName(
                [
                    baoCao.ma_bao_cao,
                    soPhieu || id
                ].join("-")
            );

        const pdfBuffer =
            await this.convertDocxToPdf(
                docxBuffer,
                baseName
            );

        return {
            buffer:
                pdfBuffer,

            fileName:
                `${baseName}.pdf`,

            contentType:
                "application/pdf",

            baoCaoId:
                Number(
                    baoCao.id
                ),

            maBaoCao:
                baoCao.ma_bao_cao,

            tenBaoCao:
                baoCao.ten_bao_cao
        };
    }

}


module.exports =
    new InBaoCaoService();
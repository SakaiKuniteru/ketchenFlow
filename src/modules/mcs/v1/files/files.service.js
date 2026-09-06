"use strict";

const fs =
    require(
        "fs/promises"
    );

const path =
    require(
        "path"
    );

const ApiError =
    require(
        "../../../../utils/api-error"
    );

const {
    STORAGE_ROOT
} =
    require(
        "../../../../config/storage"
    );

class FilesService {

    getStorageRoot() {
        return STORAGE_ROOT;
    }


    normalizeFilePath(
        value
    ) {

        const filePath =
            String(
                value ||
                ""
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


        if (
            !filePath
        ) {

            throw new ApiError(
                400,
                "Đường dẫn file không hợp lệ."
            );

        }


        if (
            filePath.includes(
                "\0"
            ) ||
            filePath
                .split(
                    "/"
                )
                .includes(
                    ".."
                )
        ) {

            throw new ApiError(
                400,
                "Đường dẫn file không hợp lệ."
            );

        }


        return filePath;

    }


    resolveFile(
        filePath
    ) {

        const normalized =
            this.normalizeFilePath(
                filePath
            );


        /*
         * API này trước mắt chỉ cho
         * đọc dữ liệu báo cáo.
         */
        if (
            !normalized.startsWith(
                "dl-bao-cao/"
            )
        ) {

            throw new ApiError(
                403,
                "Không được phép truy cập file này."
            );

        }


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
                "Đường dẫn file không hợp lệ."
            );

        }


        return absolutePath;

    }


    async getFile(
        filePath
    ) {

        const absolutePath =
            this.resolveFile(
                filePath
            );


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
                    "File không tồn tại."
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

                throw new ApiError(
                    404,
                    "File không tồn tại."
                );

            }


            throw error;

        }

    }

}


module.exports =
    new FilesService();
"use strict";

const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const os = require("os");
const net = require("net");
const {
    spawn,
    execFile
} = require("child_process");
const {
    promisify
} = require("util");
const {
    randomUUID
} = require("crypto");
const {
    pathToFileURL
} = require("url");
const ApiError = require("../../utils/api-error");

const execFileAsync = promisify(execFile);

class InBaoCaoLibreOffice {
    constructor() {
        this.host = "127.0.0.1";
        this.port = Number(
            process.env.LIBREOFFICE_PORT ||
            2002
        );
        this.profileDirectory = path.join(
            os.tmpdir(),
            "kitchenflow-libreoffice-profile"
        );
        this.process = null;
        this.startPromise = null;
        this.queue = Promise.resolve();
    }

    getBinary() {
        const configured = String(
            process.env.LIBREOFFICE_BIN ||
            ""
        )
            .trim();

        if (configured) {
            if (
                path.isAbsolute(configured) &&
                !fsSync.existsSync(configured)
            ) {
                throw new ApiError(
                    500,
                    `Không tìm thấy LibreOffice tại "${configured}".`
                );
            }

            return configured;
        }

        let candidates = [];

        if (process.platform === "darwin") {
            candidates = [
                "/Applications/LibreOffice.app/Contents/MacOS/soffice",
                "/opt/homebrew/bin/soffice",
                "/usr/local/bin/soffice"
            ];
        } else if (process.platform === "win32") {
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

        const found = candidates.find(
            candidate =>
                fsSync.existsSync(candidate)
        );

        if (found) {
            return found;
        }

        throw new ApiError(
            500,
            "Không tìm thấy LibreOffice."
        );
    }

    async isReady() {
        return new Promise(
            resolve => {
                const socket = net.createConnection({
                    host: this.host,
                    port: this.port
                });

                let settled = false;

                const finish = value => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    socket.destroy();
                    resolve(value);
                };

                socket.setTimeout(200);

                socket.once(
                    "connect",
                    () =>
                        finish(
                            true
                        )
                );

                socket.once(
                    "timeout",
                    () =>
                        finish(
                            false
                        )
                );

                socket.once(
                    "error",
                    () =>
                        finish(
                            false
                        )
                );
            }
        );
    }

    async waitUntilReady() {
        for (
            let index = 0;
            index < 100;
            index++
        ) {
            if (await this.isReady()) {
                return;
            }

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );
        }

        throw new ApiError(
            500,
            "LibreOffice không khởi động được."
        );
    }

    async startInternal() {
        if (await this.isReady()) {
            return;
        }

        await fs.mkdir(
            this.profileDirectory,
            {
                recursive: true
            }
        );

        const binary = this.getBinary();

        const profileUrl = pathToFileURL(
            this.profileDirectory
        )
            .href;

        const processInstance = spawn(
            binary,
            [
                `-env:UserInstallation=${profileUrl}`,
                "--headless",
                "--nologo",
                "--nodefault",
                "--nofirststartwizard",
                "--norestore",
                `--accept=socket,host=${this.host},port=${this.port};urp;StarOffice.ComponentContext`
            ],
            {
                stdio: "ignore"
            }
        );

        this.process = processInstance;

        processInstance.once(
            "exit",
            () => {
                if (
                    this.process ===
                    processInstance
                ) {
                    this.process = null;
                }
            }
        );

        await this.waitUntilReady();
    }

    async start() {
        if (await this.isReady()) {
            return;
        }

        if (this.startPromise) {
            return this.startPromise;
        }

        this.startPromise = this.startInternal()
            .finally(
                () => {
                    this.startPromise = null;
                }
            );

        return this.startPromise;
    }

    sanitizeFileName(value) {
        const text = String(
            value ||
            "bao-cao"
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

        return text ||
            "bao-cao";
    }

    async waitForFile(filePath) {
        for (
            let index = 0;
            index < 200;
            index++
        ) {
            try {
                const stat = await fs.stat(
                    filePath
                );

                if (
                    stat.isFile() &&
                    stat.size > 0
                ) {
                    return;
                }
            } catch {
            }

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        25
                    )
            );
        }

        throw new ApiError(
            500,
            "LibreOffice không tạo được file kết quả."
        );
    }

    async convertInternal({
        buffer,
        inputExtension,
        outputExtension,
        fileName
    }) {
        const inputExt = String(
            inputExtension ||
            ""
        )
            .toLowerCase();

        const outputExt = String(
            outputExtension ||
            ""
        )
            .toLowerCase();

        if (
            inputExt ===
            outputExt
        ) {
            return buffer;
        }

        await this.start();

        const tempDirectory = path.join(
            os.tmpdir(),
            `mcs-report-${randomUUID()}`
        );

        await fs.mkdir(
            tempDirectory,
            {
                recursive: true
            }
        );

        const baseName = this.sanitizeFileName(
            fileName
        );

        const inputPath = path.join(
            tempDirectory,
            `${baseName}${inputExt}`
        );

        const outputPath = path.join(
            tempDirectory,
            `${baseName}${outputExt}`
        );

        try {
            await fs.writeFile(
                inputPath,
                buffer
            );

            const binary = this.getBinary();
            await execFileAsync(
                binary,
                [
                    `-env:UserInstallation=${pathToFileURL(
                        this.profileDirectory
                    ).href}`,
                    "--headless",
                    "--convert-to",
                    outputExt.slice(
                        1
                    ),
                    "--outdir",
                    tempDirectory,
                    inputPath
                ],
                {
                    timeout: 30000,
                    maxBuffer:
                        10 *
                        1024 *
                        1024
                }
            );

            await this.waitForFile(
                outputPath
            );

            return await fs.readFile(
                outputPath
            );
        } finally {
            await fs.rm(
                tempDirectory,
                {
                    recursive: true,
                    force: true
                }
            )
                .catch(
                    () => {}
                );
        }
    }

    async convert(options) {
        const task = this.queue.then(
            () =>
                this.convertInternal(
                    options
                ),
            () =>
                this.convertInternal(
                    options
                )
        );

        this.queue = task.catch(
            () => {}
        );

        return task;
    }
}

module.exports = new InBaoCaoLibreOffice();
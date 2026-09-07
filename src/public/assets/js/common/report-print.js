"use strict";

window.MCS = window.MCS || {};

window.MCS.reportPrint = (() => {
    function buildFileUrl(filePath) {
        const normalized = String(
            filePath ||
            ""
        )
            .split("/")
            .filter(Boolean)
            .map(encodeURIComponent)
            .join("/");

        if (!normalized) {
            throw new Error(
                "Không xác định được đường dẫn file báo cáo."
            );
        }

        return (
            "/api/mcs/v1/files/" +
            normalized
        );
    }

    async function getReport(endpoint) {
        if (
            !window.MCS
                ?.api
                ?.request
        ) {
            throw new Error(
                "MCS API chưa được khởi tạo."
            );
        }

        const response =
            await window.MCS
                .api
                .request(
                    endpoint,
                    {
                        method: "GET"
                    }
                );

        const report = response?.data;

        if (!report) {
            throw new Error(
                "API in không trả về thông tin báo cáo."
            );
        }

        if (!report.fileDuLieu) {
            throw new Error(
                "Báo cáo không có file dữ liệu."
            );
        }

        if (
            !report.file
                ?.pdf
        ) {
            throw new Error(
                "Báo cáo không có file PDF."
            );
        }

        return report;
    }

    async function getPdf(pdfPath) {
        if (
            !window.MCS
                ?.api
                ?.requestFile
        ) {
            throw new Error(
                "Chức năng tải file chưa được khởi tạo."
            );
        }

        const file =
            await window.MCS
                .api
                .requestFile(
                    buildFileUrl(pdfPath),
                    {
                        method: "GET"
                    }
                );

        if (!file?.blob) {
            throw new Error(
                "Không tải được file PDF báo cáo."
            );
        }

        if (
            !String(
                file.contentType ||
                ""
            ).includes(
                "application/pdf"
            )
        ) {
            throw new Error(
                "File báo cáo không phải PDF."
            );
        }

        return file;
    }

    async function printBlob(blob) {
        return await new Promise(
            (
                resolve,
                reject
            ) => {
                let objectUrl = null;
                let frame = null;
                let cleanupTimer = null;

                const cleanup = () => {
                    if (cleanupTimer) {
                        clearTimeout(cleanupTimer);
                        cleanupTimer = null;
                    }

                    if (frame) {
                        frame.remove();
                        frame = null;
                    }

                    if (objectUrl) {
                        URL.revokeObjectURL(
                            objectUrl
                        );
                        objectUrl = null;
                    }
                };

                try {
                    objectUrl =
                        URL.createObjectURL(
                            blob
                        );

                    frame =
                        document.createElement(
                            "iframe"
                        );

                    frame.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    Object.assign(
                        frame.style,
                        {
                            position: "fixed",
                            width: "1px",
                            height: "1px",
                            right: "0",
                            bottom: "0",
                            border: "0",
                            opacity: "0",
                            pointerEvents: "none"
                        }
                    );

                    frame.onload = () => {
                        window.setTimeout(
                            () => {
                                try {
                                    const printWindow =
                                        frame
                                            ?.contentWindow;

                                    if (!printWindow) {
                                        throw new Error(
                                            "Không mở được file PDF để in."
                                        );
                                    }

                                    printWindow.onafterprint = () => {
                                        cleanup();
                                        resolve();
                                    };

                                    printWindow.focus();
                                    printWindow.print();

                                    cleanupTimer =
                                        window.setTimeout(
                                            () => {
                                                cleanup();
                                                resolve();
                                            },
                                            60000
                                        );
                                } catch (error) {
                                    cleanup();
                                    reject(error);
                                }
                            },
                            700
                        );
                    };

                    frame.onerror = () => {
                        cleanup();

                        reject(
                            new Error(
                                "Không thể tải PDF vào vùng in."
                            )
                        );
                    };

                    frame.src = objectUrl;

                    document.body.appendChild(
                        frame
                    );
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            }
        );
    }

    async function print(endpoint) {
        const report =
            await getReport(
                endpoint
            );

        const pdf =
            await getPdf(
                report.file.pdf
            );

        await printBlob(
            pdf.blob
        );

        return report;
    }

    return {
        buildFileUrl,
        getReport,
        getPdf,
        printBlob,
        print
    };
})();
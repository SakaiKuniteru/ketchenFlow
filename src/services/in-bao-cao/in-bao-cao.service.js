"use strict";

const fsSync = require("fs");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { randomUUID } = require("crypto");
const PizZip = require("pizzip");
const ApiError = require("../../utils/api-error");
const inBaoCaoRepository = require("./in-bao-cao.repository");
const { STORAGE_ROOT } = require("../../config/storage");
const { formatValue: applyFormatRule } = require("./in-bao-cao.format-rules");
const libreOffice = require("./in-bao-cao.libreoffice");

class InBaoCaoService {
    getStorageRoot() {
        return STORAGE_ROOT;
    }

    getDateTimeParts(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const date = value instanceof Date
            ? value
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const parts = new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        ).formatToParts(date);

        return Object.fromEntries(
            parts.map(item => [
                item.type,
                item.value
            ])
        );
    }

    normalizeDateTime(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const text = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return (
                text +
                "T00:00:00+07:00"
            );
        }

        const parts = this.getDateTimeParts(value);

        if (!parts) {
            return text;
        }

        return (
            `${parts.year}-` +
            `${parts.month}-` +
            `${parts.day}T` +
            `${parts.hour}:` +
            `${parts.minute}:` +
            `${parts.second}+07:00`
        );
    }

    normalizeDate(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const text = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return (
                text +
                "T00:00:00+07:00"
            );
        }

        const parts = this.getDateTimeParts(value);

        if (!parts) {
            return text;
        }

        return (
            `${parts.year}-` +
            `${parts.month}-` +
            `${parts.day}T00:00:00+07:00`
        );
    }

    normalizeTime(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const text = String(value).trim();

        const match = text.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );

        if (!match) {
            return text;
        }

        const hour = String(match[1]).padStart(
            2,
            "0"
        );

        const minute = match[2];
        const second = match[3] || "00";

        return (
            `${hour}:` +
            `${minute}:` +
            `${second}+07:00`
        );
    }

    normalizeReportData(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (value instanceof Date) {
            return this.normalizeDateTime(value);
        }

        if (Array.isArray(value)) {
            return value.map(
                item => this.normalizeReportData(item)
            );
        }

        if (typeof value === "object") {
            return Object.fromEntries(
                Object.entries(value)
                    .map(([
                        key,
                        child
                    ]) => [
                        key,
                        this.normalizeReportData(child)
                    ])
            );
        }

        return value;
    }

    chuanHoaMaBaoCao(value) {
        const maBaoCao = String(
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

    isTemplateSpace(value) {
        return (
            value !== undefined &&
            /[\s\u200B\u200C\u200D\uFEFF]/u.test(value)
        );
    }

    skipTemplateSpace(
        text,
        index
    ) {
        let position = index;

        while (
            position < text.length &&
            this.isTemplateSpace(text[position])
        ) {
            position++;
        }

        return position;
    }

    getTemplateErrorContext(
        source,
        index
    ) {
        return source
            .slice(
                Math.max(
                    0,
                    index - 30
                ),
                Math.min(
                    source.length,
                    index + 150
                )
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }

    parseTemplateExpressions(
        source,
        data
    ) {
        const text = String(
            source ||
            ""
        );

        const expressions = [];
        let cursor = 0;

        while (
            cursor <
            text.length
        ) {
            const start = text.indexOf(
                "[[",
                cursor
            );

            if (start < 0) {
                break;
            }

            let position =
                start +
                2;

            position = this.skipTemplateSpace(
                text,
                position
            );

            /*
            * ===============================
            * KEY
            * ===============================
            */
            const keyMatch = text
                .slice(position)
                .match(
                    /^([A-Za-z_][A-Za-z0-9_.]*)/u
                );

            if (!keyMatch) {
                throw new ApiError(
                    400,
                    `Không xác định được key báo cáo gần "${this.getTemplateErrorContext(
                        text,
                        start
                    )}".`
                );
            }

            const key = keyMatch[1];

            position += key.length;

            position = this.skipTemplateSpace(
                text,
                position
            );

            /*
            * Sau key bắt buộc phải có
            * dấu "]" thứ nhất.
            *
            * [[key]:format(...)]
            *       ^
            *
            * [[key]]
            *       ^
            */
            if (
                text[position] !==
                "]"
            ) {
                throw new ApiError(
                    400,
                    `Thiếu dấu "]" sau key "${key}".`
                );
            }

            position++;

            position = this.skipTemplateSpace(
                text,
                position
            );

            /*
            * ===============================
            * FORMAT / IF
            * ===============================
            *
            * Cú pháp chuẩn:
            *
            * [[key]:format(...)]
            * [[key]:if(...)]
            */
            if (
                text[position] ===
                ":"
            ) {
                position++;

                position = this.skipTemplateSpace(
                    text,
                    position
                );

                const operatorMatch = text
                    .slice(position)
                    .match(
                        /^(format|if)\b/i
                    );

                if (!operatorMatch) {
                    throw new ApiError(
                        400,
                        `Hàm báo cáo không hợp lệ sau key "${key}".`
                    );
                }

                const operator = operatorMatch[1]
                    .toLowerCase();

                position +=
                    operatorMatch[0]
                        .length;

                position = this.skipTemplateSpace(
                    text,
                    position
                );

                if (
                    text[position] !==
                    "("
                ) {
                    throw new ApiError(
                        400,
                        `Thiếu "(" của hàm "${operator}" tại key "${key}".`
                    );
                }

                position++;

                const argumentStart = position;
                let depth = 1;

                while (
                    position < text.length &&
                    depth > 0
                ) {
                    const char = text[position];

                    if (
                        char ===
                        "("
                    ) {
                        depth++;
                    } else if (
                        char ===
                        ")"
                    ) {
                        depth--;
                    }

                    if (depth > 0) {
                        position++;
                    }
                }

                if (
                    depth !==
                    0
                ) {
                    throw new ApiError(
                        400,
                        `Thiếu ")" của hàm "${operator}" tại key "${key}".`
                    );
                }

                const argument = text.slice(
                    argumentStart,
                    position
                );

                /*
                * Bỏ ")"
                */
                position++;

                position = this.skipTemplateSpace(
                    text,
                    position
                );

                /*
                * Dấu "]" cuối cùng của:
                *
                * [[key]:format(...)]
                *                   ^
                */
                if (
                    text[position] !==
                    "]"
                ) {
                    throw new ApiError(
                        400,
                        `Thiếu dấu "]" kết thúc hàm "${operator}" tại key "${key}".`
                    );
                }

                position++;

                expressions.push({
                    start,
                    end: position,
                    key,
                    operator,
                    argument,
                    value: this.renderTemplateExpression(
                        text.slice(
                            start,
                            position
                        ),
                        key,
                        operator,
                        argument,
                        data
                    )
                });

                cursor = position;
                continue;
            }

            /*
            * ===============================
            * KEY THƯỜNG
            * ===============================
            *
            * Đến đây đã ăn:
            *
            * [[key]
            *
            * Phải ăn THÊM dấu "]"
            * thứ hai.
            */
            if (
                text[position] !==
                "]"
            ) {
                throw new ApiError(
                    400,
                    `Key "${key}" phải có định dạng [[${key}]].`
                );
            }

            /*
            * Đây chính là dấu trước đây
            * code của m KHÔNG ăn.
            */
            position++;

            expressions.push({
                start,
                end: position,
                key,
                operator: null,
                argument: null,
                value: this.renderTemplateExpression(
                    text.slice(
                        start,
                        position
                    ),
                    key,
                    null,
                    null,
                    data
                )
            });

            cursor = position;
        }

        return expressions;
    }

    renderTemplateExpression(
        match,
        key,
        operator,
        argument,
        data
    ) {
        const action = String(
            operator ||
            ""
        )
            .trim()
            .toLowerCase();

        if (!action) {
            const value = this.getValueByPath(
                data,
                key
            );

            return value === null ||
                value === undefined
                ? ""
                : String(value);
        }

        if (
            action ===
            "format"
        ) {
            const value = this.getValueByPath(
                data,
                key
            );

            return String(
                applyFormatRule(
                    value,
                    argument
                ) ??
                ""
            );
        }

        if (
            action ===
            "if"
        ) {
            const value = this.getValueByPath(
                data,
                key
            );

            return String(
                this.formatIf(
                    value,
                    argument
                ) ??
                ""
            );
        }

        return match;
    }

    extractTextNodes(
        xml,
        textTagNames
    ) {
        const escapedNames = textTagNames.map(
            name =>
                name.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )
        );

        const regex = new RegExp(
            `<(${escapedNames.join("|")})\\b([^>]*)>([\\s\\S]*?)<\\/\\1>`,
            "g"
        );

        const nodes = [];
        let match;
        let textOffset = 0;

        while (
            (
                match =
                    regex.exec(xml)
            ) !==
            null
        ) {
            const content = this.decodeXmlText(
                match[3]
            );

            const full = match[0];

            nodes.push({
                fullStart: match.index,
                fullEnd:
                    match.index +
                    full.length,
                tagName: match[1],
                attributes:
                    match[2] ||
                    "",
                textStart: textOffset,
                textEnd:
                    textOffset +
                    content.length,
                content
            });

            textOffset += content.length;
        }

        return nodes;
    }

    ensureXmlSpacePreserve(
        attributes,
        content
    ) {
        let attrs = String(
            attributes ||
            ""
        );

        const text = String(
            content ??
            ""
        );

        const needsPreserve =
            /^[\t\n\r ]/.test(text) ||
            /[\t\n\r ]$/.test(text);

        if (!needsPreserve) {
            return attrs;
        }

        const xmlSpaceRegex =
            /\bxml:space\s*=\s*(["'])[^"']*\1/i;

        if (
            xmlSpaceRegex.test(attrs)
        ) {
            return attrs.replace(
                xmlSpaceRegex,
                'xml:space="preserve"'
            );
        }

        return (
            attrs +
            ' xml:space="preserve"'
        );
    }

    findNodeByPosition(
        nodes,
        position,
        isEnd = false
    ) {
        return nodes.findIndex(
            node => {
                if (isEnd) {
                    return (
                        position > node.textStart &&
                        position <= node.textEnd
                    );
                }

                return (
                    position >= node.textStart &&
                    position < node.textEnd
                );
            }
        );
    }

    renderXmlTextScope(
        xml,
        data,
        textTagNames
    ) {
        const nodes = this.extractTextNodes(
            xml,
            textTagNames
        );

        if (
            nodes.length ===
            0
        ) {
            return xml;
        }

        const source = nodes
            .map(
                node => node.content
            )
            .join("");

        const expressions =
            this.parseTemplateExpressions(
                source,
                data
            );

        if (
            expressions.length ===
            0
        ) {
            return xml;
        }

        for (
            let expressionIndex =
                expressions.length -
                1;
            expressionIndex >= 0;
            expressionIndex--
        ) {
            const expression =
                expressions[
                    expressionIndex
                ];

            const startNodeIndex =
                this.findNodeByPosition(
                    nodes,
                    expression.start
                );

            const endNodeIndex =
                this.findNodeByPosition(
                    nodes,
                    expression.end,
                    true
                );

            if (
                startNodeIndex < 0 ||
                endNodeIndex < 0
            ) {
                continue;
            }

            const startNode =
                nodes[startNodeIndex];

            const endNode =
                nodes[endNodeIndex];

            const localStart =
                expression.start -
                startNode.textStart;

            const localEnd =
                expression.end -
                endNode.textStart;

            if (
                startNodeIndex ===
                endNodeIndex
            ) {
                startNode.content =
                    startNode.content.slice(
                        0,
                        localStart
                    ) +
                    expression.value +
                    startNode.content.slice(
                        localEnd
                    );
            } else {
                startNode.content =
                    startNode.content.slice(
                        0,
                        localStart
                    ) +
                    expression.value;

                for (
                    let nodeIndex =
                        startNodeIndex +
                        1;
                    nodeIndex <
                        endNodeIndex;
                    nodeIndex++
                ) {
                    nodes[
                        nodeIndex
                    ].content = "";
                }

                endNode.content =
                    endNode.content.slice(
                        localEnd
                    );
            }
        }

        let result = xml;

        for (
            let index =
                nodes.length -
                1;
            index >= 0;
            index--
        ) {
            const node =
                nodes[index];

            const attributes =
                this.ensureXmlSpacePreserve(
                    node.attributes,
                    node.content
                );

            const textNode =
                `<${node.tagName}${attributes}>` +
                this.encodeXmlText(
                    node.content
                ) +
                `</${node.tagName}>`;

            result =
                result.slice(
                    0,
                    node.fullStart
                ) +
                textNode +
                result.slice(
                    node.fullEnd
                );
        }

        return result;
    }

    getOoxmlTemplateDefinitions(extension) {
        switch (extension) {
            case ".docx":
                return [
                    {
                        filePattern:
                            /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes)\.xml$/,
                        scopePattern:
                            /<w:p\b[\s\S]*?<\/w:p>/g,
                        textTags: [
                            "w:t"
                        ]
                    }
                ];

            case ".xlsx":
                return [
                    {
                        filePattern:
                            /^xl\/sharedStrings\.xml$/,
                        scopePattern:
                            /<si\b[\s\S]*?<\/si>/g,
                        textTags: [
                            "t"
                        ]
                    },
                    {
                        filePattern:
                            /^xl\/worksheets\/[^/]+\.xml$/,
                        scopePattern:
                            /<is\b[\s\S]*?<\/is>/g,
                        textTags: [
                            "t"
                        ]
                    },
                    {
                        filePattern:
                            /^xl\/drawings\/[^/]+\.xml$/,
                        scopePattern:
                            /<a:p\b[\s\S]*?<\/a:p>/g,
                        textTags: [
                            "a:t"
                        ]
                    }
                ];

            case ".pptx":
                return [
                    {
                        filePattern:
                            /^ppt\/(?:slides|notesSlides)\/[^/]+\.xml$/,
                        scopePattern:
                            /<a:p\b[\s\S]*?<\/a:p>/g,
                        textTags: [
                            "a:t"
                        ]
                    }
                ];

            default:
                return [];
        }
    }

    renderOoxml(
        buffer,
        extension,
        data
    ) {
        const definitions =
            this.getOoxmlTemplateDefinitions(
                extension
            );

        if (
            definitions.length ===
            0
        ) {
            throw new ApiError(
                400,
                `Định dạng "${extension}" chưa hỗ trợ ghép dữ liệu.`
            );
        }

        let zip;

        try {
            zip = new PizZip(
                buffer
            );
        } catch {
            throw new ApiError(
                400,
                `File mẫu "${extension}" không hợp lệ.`
            );
        }

        const fileNames =
            Object.keys(
                zip.files
            );

        for (
            const definition of definitions
        ) {
            const targetFiles =
                fileNames.filter(
                    fileName =>
                        definition
                            .filePattern
                            .test(fileName)
                );

            for (
                const fileName of targetFiles
            ) {
                const file =
                    zip.file(fileName);

                if (!file) {
                    continue;
                }

                const xml =
                    file.asText();

                const regex =
                    new RegExp(
                        definition
                            .scopePattern
                            .source,
                        definition
                            .scopePattern
                            .flags
                    );

                const rendered =
                    xml.replace(
                        regex,
                        scope =>
                            this.renderXmlTextScope(
                                scope,
                                data,
                                definition.textTags
                            )
                    );

                if (
                    rendered !==
                    xml
                ) {
                    zip.file(
                        fileName,
                        rendered
                    );
                }
            }
        }

        return zip.generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });
    }

    decodeXmlText(value) {
        return String(
            value ||
            ""
        )
            .replace(
                /&#x([0-9a-fA-F]+);/g,
                (
                    match,
                    code
                ) => {
                    try {
                        return String.fromCodePoint(
                            parseInt(
                                code,
                                16
                            )
                        );
                    } catch {
                        return match;
                    }
                }
            )
            .replace(
                /&#(\d+);/g,
                (
                    match,
                    code
                ) => {
                    try {
                        return String.fromCodePoint(
                            parseInt(
                                code,
                                10
                            )
                        );
                    } catch {
                        return match;
                    }
                }
            )
            .replace(
                /&lt;/g,
                "<"
            )
            .replace(
                /&gt;/g,
                ">"
            )
            .replace(
                /&quot;/g,
                "\""
            )
            .replace(
                /&apos;/g,
                "'"
            )
            .replace(
                /&amp;/g,
                "&"
            );
    }

    encodeXmlText(value) {
        return String(
            value ??
            ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );
    }

    getNgayThuMuc(
        date = new Date()
    ) {
        const parts =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Ho_Chi_Minh",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            )
                .formatToParts(date);

        const map =
            Object.fromEntries(
                parts.map(
                    item => [
                        item.type,
                        item.value
                    ]
                )
            );

        return [
            map.year,
            map.month,
            map.day
        ].join("-");
    }

    stringifyJson(data) {
        return JSON.stringify(
            data,
            (
                key,
                value
            ) => {
                if (
                    typeof value ===
                    "bigint"
                ) {
                    return value.toString();
                }

                return value;
            },
            2
        );
    }

    getValueByPath(
        scope,
        pathValue
    ) {
        const pathText =
            String(
                pathValue ||
                ""
            ).trim();

        if (!pathText) {
            return "";
        }

        if (
            pathText ===
            "."
        ) {
            return scope;
        }

        if (
            scope &&
            Object.prototype
                .hasOwnProperty
                .call(
                    scope,
                    pathText
                )
        ) {
            return scope[
                pathText
            ];
        }

        return pathText
            .split(".")
            .reduce(
                (
                    current,
                    key
                ) => {
                    if (
                        current === null ||
                        current === undefined
                    ) {
                        return undefined;
                    }

                    return current[
                        key
                    ];
                },
                scope
            );
    }

    formatIf(
        value,
        expression
    ) {
        const options =
            String(
                expression ||
                ""
            )
                .split(";");

        let fallback = null;

        for (
            const option of options
        ) {
            const index =
                option.indexOf("?");

            if (index < 0) {
                fallback = option;
                continue;
            }

            const condition =
                option
                    .slice(
                        0,
                        index
                    )
                    .trim();

            const result =
                option
                    .slice(
                        index + 1
                    );

            if (
                String(value) ===
                condition
            ) {
                return result;
            }
        }

        return (
            fallback ??
            value ??
            ""
        );
    }

    evaluateTemplateExpression(
        expression,
        scope
    ) {
        const tag =
            String(
                expression ||
                ""
            ).trim();

        const formatMatch =
            tag.match(
                /^(.+?):format\(([\s\S]*)\)$/
            );

        if (formatMatch) {
            const value =
                this.getValueByPath(
                    scope,
                    formatMatch[1]
                );

            return applyFormatRule(
                value,
                formatMatch[2]
            );
        }

        const ifMatch =
            tag.match(
                /^(.+?):if\(([\s\S]*)\)$/
            );

        if (ifMatch) {
            const value =
                this.getValueByPath(
                    scope,
                    ifMatch[1]
                );

            return this.formatIf(
                value,
                ifMatch[2]
            );
        }

        const value =
            this.getValueByPath(
                scope,
                tag
            );

        return (
            value === null ||
            value === undefined
        )
            ? ""
            : value;
    }

    async taoFileDuLieu(data) {
        const ngay =
            this.getNgayThuMuc();

        const fileName =
            `${randomUUID()}.json`;

        const relativeDirectory =
            path.posix.join(
                "dl-bao-cao",
                ngay
            );

        const relativePath =
            path.posix.join(
                relativeDirectory,
                fileName
            );

        const absoluteDirectory =
            path.join(
                this.getStorageRoot(),
                ...relativeDirectory
                    .split("/")
            );

        const absolutePath =
            path.join(
                absoluteDirectory,
                fileName
            );

        await fs.mkdir(
            absoluteDirectory,
            {
                recursive: true
            }
        );

        await fs.writeFile(
            absolutePath,
            this.stringifyJson(data),
            {
                encoding: "utf8"
            }
        );

        return relativePath;
    }

    async taoFileBaoCao({
        baoCao,
        id,
        soPhieu,
        data
    }) {
        const fileMau =
            await this.resolveFileMau(
                baoCao.file_mau
            );

        const baseName =
            this.sanitizeFileName(
                [
                    baoCao.ma_bao_cao,
                    soPhieu ||
                        id
                ].join("-")
            );

        const rendered =
            await this.prepareTemplate(
                fileMau,
                data,
                baseName
            );

        const relativeDirectory =
            path.posix.join(
                "bao-cao",
                this.getNgayThuMuc(),
                randomUUID()
            );

        const absoluteDirectory =
            path.join(
                this.getStorageRoot(),
                ...relativeDirectory
                    .split("/")
            );

        await fs.mkdir(
            absoluteDirectory,
            {
                recursive: true
            }
        );

        if (
            rendered.sourceExtension ===
            ".pdf"
        ) {
            const pdfName =
                `${baseName}.pdf`;

            const pdfPath =
                path.posix.join(
                    relativeDirectory,
                    pdfName
                );

            await fs.writeFile(
                path.join(
                    absoluteDirectory,
                    pdfName
                ),
                rendered.pdfBuffer
            );

            return {
                pdf: pdfPath
            };
        }

        const sourceName =
            `${baseName}${rendered.sourceExtension}`;

        const pdfName =
            `${baseName}.pdf`;

        const sourcePath =
            path.posix.join(
                relativeDirectory,
                sourceName
            );

        const pdfPath =
            path.posix.join(
                relativeDirectory,
                pdfName
            );

        await Promise.all([
            fs.writeFile(
                path.join(
                    absoluteDirectory,
                    sourceName
                ),
                rendered.sourceBuffer
            ),
            fs.writeFile(
                path.join(
                    absoluteDirectory,
                    pdfName
                ),
                rendered.pdfBuffer
            )
        ]);

        return {
            [
                rendered.sourceExtension
                    .slice(1)
            ]: sourcePath,
            pdf: pdfPath
        };
    }

    async resolveFileDuLieu(value) {
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

        if (!filePath) {
            throw new ApiError(
                400,
                "Đường dẫn file dữ liệu không hợp lệ."
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
                "Đường dẫn file dữ liệu không hợp lệ."
            );
        }

        if (
            !filePath.startsWith(
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
                filePath
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
                "Đường dẫn file dữ liệu không hợp lệ."
            );
        }

        try {
            const stat =
                await fs.stat(
                    absolutePath
                );

            if (!stat.isFile()) {
                throw new ApiError(
                    404,
                    "File dữ liệu báo cáo không tồn tại."
                );
            }

            return absolutePath;
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
                    404,
                    "File dữ liệu báo cáo không tồn tại."
                );
            }

            throw error;
        }
    }

    async convertOfficeFile(
        buffer,
        inputExtension,
        outputExtension,
        fileName
    ) {
        return libreOffice
            .convert({
                buffer,
                inputExtension,
                outputExtension,
                fileName
            });
    }

    async prepareTemplate(
        fileMau,
        data,
        baseName
    ) {
        let extension =
            path.extname(fileMau)
                .toLowerCase();

        let buffer =
            await fs.readFile(
                fileMau
            );

        if (
            extension ===
            ".pdf"
        ) {
            return {
                sourceExtension: ".pdf",
                sourceBuffer: buffer,
                pdfBuffer: buffer
            };
        }

        const legacyMap = {
            ".doc": ".docx",
            ".odt": ".docx",
            ".rtf": ".docx",
            ".xls": ".xlsx",
            ".ods": ".xlsx",
            ".ppt": ".pptx",
            ".odp": ".pptx"
        };

        if (
            legacyMap[
                extension
            ]
        ) {
            const target =
                legacyMap[
                    extension
                ];

            buffer =
                await this.convertOfficeFile(
                    buffer,
                    extension,
                    target,
                    `${baseName}-template`
                );

            extension = target;
        }

        if (
            ![
                ".docx",
                ".xlsx",
                ".pptx"
            ].includes(
                extension
            )
        ) {
            throw new ApiError(
                400,
                `Không hỗ trợ file mẫu "${extension}".`
            );
        }

        const sourceBuffer =
            this.renderOoxml(
                buffer,
                extension,
                data
            );

        const pdfBuffer =
            await this.convertOfficeFile(
                sourceBuffer,
                extension,
                ".pdf",
                baseName
            );

        return {
            sourceExtension: extension,
            sourceBuffer,
            pdfBuffer
        };
    }

    async getBaoCao(maBaoCao) {
        const ma =
            this.chuanHoaMaBaoCao(
                maBaoCao
            );

        const baoCao =
            await inBaoCaoRepository
                .getByMa(ma);

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

    chuanHoaDuongDanFileMau(value) {
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

    async resolveFileMau(fileMau) {
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

            if (!stat.isFile()) {
                throw new ApiError(
                    404,
                    `Không tìm thấy file mẫu báo cáo "${normalized}".`
                );
            }

            return absolutePath;
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
                console.error(
                    "Không tìm thấy file mẫu báo cáo.",
                    {
                        fileMau: normalized,
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

        if (Array.isArray(value)) {
            if (prefix) {
                result[prefix] = value;
            }

            return result;
        }

        if (
            typeof value === "object" &&
            !(value instanceof Date)
        ) {
            Object.entries(value).forEach(([
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
            result[prefix] = value;
        }

        return result;
    }

    sanitizeFileName(value) {
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

    async getThietLapBaoCao() {
        const definitions = [
            {
                ma: "QUOC_HIEU",
                key: "quocHieu"
            },
            {
                ma: "TIEU_NGU",
                key: "tieuNgu"
            },
            {
                ma: "TIEU_DE",
                key: "tieuDe"
            }
        ];

        const danhSach =
            await inBaoCaoRepository
                .getThietLapTheoMa(
                    definitions.map(
                        item => item.ma
                    )
                );

        const settingMap =
            new Map(
                danhSach.map(
                    item => [
                        item.maThietLap,
                        item.active === true
                            ? (
                                item.giaTri ??
                                ""
                            )
                            : ""
                    ]
                )
            );

        return Object.fromEntries(
            definitions.map(
                item => [
                    item.key,
                    settingMap.get(
                        item.ma
                    ) ??
                    ""
                ]
            )
        );
    }

    async getNguoiIn(taiKhoanId) {
        const id = Number(taiKhoanId);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new ApiError(
                401,
                "Không xác định được người thực hiện in."
            );
        }

        const nguoiIn =
            await inBaoCaoRepository
                .getNguoiIn(id);

        if (!nguoiIn) {
            throw new ApiError(
                404,
                "Không tìm thấy thông tin người thực hiện in."
            );
        }

        return nguoiIn;
    }

    async taoBaoCao({
        maBaoCao,
        id,
        soPhieu,
        data,
        nguoiInId
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

        const [
            baoCao,
            nguoiIn,
            thietLapBaoCao
        ] =
            await Promise.all([
                this.getBaoCao(
                    maBaoCao
                ),
                this.getNguoiIn(
                    nguoiInId
                ),
                this.getThietLapBaoCao()
            ]);

        const thoiGianIn =
            this.normalizeDateTime(
                new Date()
            );

        const duLieuBaoCao = {
            ...(
                data &&
                typeof data ===
                    "object" &&
                !Array.isArray(
                    data
                )
                    ? data
                    : {}
            )
        };

        delete duLieuBaoCao
            .quocHieu;

        delete duLieuBaoCao
            .tieuNgu;

        delete duLieuBaoCao
            .tieuDe;

        const reportData =
            this.normalizeReportData({
                quocHieu: thietLapBaoCao.quocHieu || "",
                tieuNgu: thietLapBaoCao.tieuNgu || "",
                tieuDe: thietLapBaoCao.tieuDe || "",
                ...duLieuBaoCao,
                nguoiInId: nguoiIn.taiKhoanId,
                nhanVienInId: nguoiIn.nhanVienId,
                maNguoiIn: nguoiIn.maNhanVien,
                tenNguoiIn: nguoiIn.hoTen || nguoiIn.tenDangNhap,
                tenDangNhapNguoiIn: nguoiIn.tenDangNhap,
                thoiGianIn
            });

        const [
            fileDuLieu,
            file
        ] =
            await Promise.all([
                this.taoFileDuLieu(
                    reportData
                ),
                this.taoFileBaoCao({
                    baoCao,
                    id,
                    soPhieu,
                    data: reportData
                })
            ]);

        return {
            baoCaoId: Number(
                baoCao.id
            ),

            dinhDang: baoCao.loai_xuat_file ?? null,

            file,
            fileDuLieu,
            id,
            maBaoCao: baoCao.ma_bao_cao,
            soPhieu: soPhieu || null,
            mauBaoCao: baoCao.file_mau || null,
            tenBaoCao: baoCao.ten_bao_cao,
            nguoiIn: {
                taiKhoanId: nguoiIn.taiKhoanId,
                nhanVienId: nguoiIn.nhanVienId,
                maNhanVien: nguoiIn.maNhanVien,
                tenDangNhap: nguoiIn.tenDangNhap,
                hoTen: nguoiIn.hoTen
            },
            thoiGianIn
        };
    }
}

module.exports = new InBaoCaoService();
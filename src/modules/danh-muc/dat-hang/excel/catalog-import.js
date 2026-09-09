"use strict";

const ApiError = require("../../../../utils/api-error");
const { readExcel } = require("../../../../helpers/excel/excel-reader");
const { toNumber } = require("../../../../helpers/excel/excel-value");
const { createResultFile, sendExcel } = require("../../../../helpers/excel/excel-result");
const { isTemplateValue } = require("../../../../helpers/excel/excel-template");

const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function createCatalogImport(config) {
    async function xuLyImport(
        file,
        context = {}
    ) {
        const source = await readExcel(
            file,
            { headerRowNumber: HEADER_ROW }
        );

        const {
            workbook,
            worksheet,
            headerMap,
            getValue,
            hasData
        } = source;

        const codeKey = headerMap.has(`${config.codeField}/k`)
            ? `${config.codeField}/k`
            : config.codeField;

        if (!headerMap.has(codeKey)) {
            throw new ApiError(
                400,
                `File import phải có field "${config.codeField}" hoặc "${config.codeField}/k".`
            );
        }

        const successes = [];
        const errors = [];

        for (
            let rowNumber = DATA_START_ROW;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {
            const row = worksheet.getRow(rowNumber);

            if (!hasData(row)) {
                continue;
            }

            const rawValues = [...headerMap.keys()]
                .map(key => getValue(row, key))
                .filter(value =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                );

            if (
                rawValues.length &&
                rawValues.every(value => isTemplateValue(value))
            ) {
                continue;
            }

            try {
                const idRaw = headerMap.has("id/k")
                    ? getValue(row, "id/k")
                    : undefined;

                const id = idRaw === undefined
                    ? undefined
                    : toNumber(idRaw);

                if (
                    idRaw !== undefined &&
                    (
                        !Number.isInteger(id) ||
                        id <= 0
                    )
                ) {
                    throw new ApiError(
                        400,
                        `ID ${config.entityName} phải là số nguyên lớn hơn 0.`
                    );
                }

                const data = {};

                for (const field of config.fields) {
                    const raw = getValue(
                        row,
                        field.key
                    );

                    if (raw !== undefined) {
                        data[field.key] = field.convert
                            ? field.convert(raw)
                            : raw;
                    }
                }

                data[config.codeField] = getValue(
                    row,
                    codeKey
                );

                const existing = id
                    ? await config.repository.getChiTiet(id)
                    : await config.repository.getChiTietByMa(data[config.codeField]);

                if (
                    id &&
                    !existing
                ) {
                    throw new ApiError(
                        404,
                        `Không tìm thấy ${config.entityName} có ID ${id}.`
                    );
                }

                const validation = (
                    existing
                        ? config.updateSchema
                        : config.createSchema
                ).validate(
                    data,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                );

                if (validation.error) {
                    throw new ApiError(
                        400,
                        validation.error.details
                            .map(item => item.message)
                            .join(", ")
                    );
                }

                const result = existing
                    ? await config.service.update(
                        existing.id,
                        validation.value
                    )
                    : await config.create(
                        validation.value,
                        context
                    );

                successes.push({
                    rowNumbers: [rowNumber],
                    id: result.id,
                    message: `${existing ? "Cập nhật" : "Thêm mới"} thành công - ID ${result.id}`
                });
            } catch (error) {
                errors.push({
                    rowNumbers: [rowNumber],
                    message: error.message || "Dữ liệu không hợp lệ."
                });
            }
        }

        if (
            !successes.length &&
            !errors.length
        ) {
            throw new ApiError(
                400,
                "File import không có dữ liệu."
            );
        }

        return createResultFile(
            workbook,
            worksheet,
            {
                fileName: `${config.maBaoCao}.xlsx`,
                headerRowNumber: HEADER_ROW,
                successes,
                errors
            }
        );
    }

    async function importData(
        req,
        res,
        next
    ) {
        try {
            return sendExcel(
                res,
                await xuLyImport(
                    req.file,
                    { user: req.user }
                )
            );
        } catch (error) {
            return next(error);
        }
    }

    return {
        importData,
        xuLyImport
    };
}

module.exports = createCatalogImport;
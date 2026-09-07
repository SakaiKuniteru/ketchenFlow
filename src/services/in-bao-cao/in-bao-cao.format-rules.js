"use strict";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

const DINH_DANG_NGAY_GIO = Object.freeze([
    "ngày dd tháng MM năm yyyy",
    "Ngày dd tháng MM năm yyyy",
    "dd tháng MM năm yyyy",
    "HH:mm:ss, ngày dd tháng MM năm yyyy",
    "HH:mm:ss, Ngày dd tháng MM năm yyyy",
    "HH:mm, ngày dd tháng MM năm yyyy",
    "HH:mm, Ngày dd tháng MM năm yyyy",
    "HH giờ mm phút ss giây, ngày dd tháng MM năm yyyy",
    "HH giờ mm phút ss giây, Ngày dd tháng MM năm yyyy",
    "HH giờ mm phút, ngày dd tháng MM năm yyyy",
    "HH giờ mm phút, Ngày dd tháng MM năm yyyy",
    "HH:mm:ss, dd tháng MM năm yyyy",
    "HH:mm, dd tháng MM năm yyyy",
    "HH giờ mm phút ss giây, dd tháng MM năm yyyy",
    "HH giờ mm phút, dd tháng MM năm yyyy",
    "dd/MM/yyyy",
    "HH:mm:ss dd/MM/yyyy",
    "HH:mm dd/MM/yyyy",
    "dd/MM/yyyy HH:mm:ss",
    "dd/MM/yyyy HH:mm",
    "yyyy/MM/dd",
    "yyyy/MM/dd HH:mm:ss",
    "yyyy/MM/dd HH:mm",
    "HH:mm:ss yyyy/MM/dd",
    "HH:mm yyyy/MM/dd",
    "dd-MM-yyyy",
    "HH:mm:ss dd-MM-yyyy",
    "HH:mm dd-MM-yyyy",
    "dd-MM-yyyy HH:mm:ss",
    "dd-MM-yyyy HH:mm",
    "yyyy-MM-dd",
    "yyyy-MM-dd HH:mm:ss",
    "yyyy-MM-dd HH:mm",
    "HH:mm:ss yyyy-MM-dd",
    "HH:mm yyyy-MM-dd"
]);

const DATE_TIME_TOKENS = Object.freeze({
    yyyy: parts => parts.year,

    yy: parts =>
        String(
            parts.year ||
            ""
        )
            .slice(-2),

    MM: parts => parts.month,
    dd: parts => parts.day,
    HH: parts => parts.hour,
    hh: parts => parts.hour,
    mm: parts => parts.minute,
    ss: parts => parts.second
});

function getDateTimeParts(value) {
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
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    )
        .formatToParts(date);

    return Object.fromEntries(
        parts.map(
            item => [
                item.type,
                item.value
            ]
        )
    );
}

function getReportDateParts(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const text = String(value).trim();

    const timeMatch = text.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:[+-]\d{2}:\d{2})?$/
    );

    if (timeMatch) {
        return {
            year: "",
            month: "",
            day: "",
            hour: String(timeMatch[1]).padStart(2, "0"),
            minute: timeMatch[2],
            second: timeMatch[3] || "00"
        };
    }

    const dateMatch = text.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (dateMatch) {
        return {
            year: dateMatch[1],
            month: dateMatch[2],
            day: dateMatch[3],
            hour: "00",
            minute: "00",
            second: "00"
        };
    }

    const parts = getDateTimeParts(value);

    if (!parts) {
        return null;
    }

    return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        hour: parts.hour,
        minute: parts.minute,
        second: parts.second
    };
}

function formatDateByPattern(
    value,
    pattern
) {
    const parts = getReportDateParts(value);

    if (!parts) {
        return value ??
            "";
    }

    const format = String(
        pattern ||
        ""
    );

    if (!format) {
        return value ??
            "";
    }

    return format.replace(
        /yyyy|yy|MM|dd|HH|hh|mm|ss/g,
        token => {
            const formatter = DATE_TIME_TOKENS[token];

            if (
                typeof formatter !==
                "function"
            ) {
                return token;
            }

            const result = formatter(parts);

            return result === null ||
                result === undefined
                ? ""
                : String(result);
        }
    );
}

function formatNumberByPattern(
    value,
    pattern
) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return value ??
            "";
    }

    const format = String(
        pattern ||
        ""
    )
        .trim();

    if (!format) {
        return String(number);
    }

    const lastComma = format.lastIndexOf(",");
    const lastDot = format.lastIndexOf(".");

    let decimalSeparator = null;
    let groupSeparator = null;

    if (
        lastComma >= 0 &&
        lastDot >= 0
    ) {
        if (
            lastComma >
            lastDot
        ) {
            decimalSeparator = ",";
            groupSeparator = ".";
        } else {
            decimalSeparator = ".";
            groupSeparator = ",";
        }
    } else {
        const separator = lastComma >= 0
            ? ","
            : lastDot >= 0
                ? "."
                : null;

        if (separator) {
            const index = format.lastIndexOf(separator);

            const fractionPattern = format
                .slice(
                    index + 1
                )
                .replace(
                    /[^#0]/g,
                    ""
                );

            if (
                fractionPattern.length === 3 &&
                !fractionPattern.includes("0")
            ) {
                groupSeparator = separator;
            } else {
                decimalSeparator = separator;
            }
        }
    }

    let maximumFractionDigits = 0;
    let minimumFractionDigits = 0;

    if (decimalSeparator) {
        const fractionPattern = format
            .slice(
                format.lastIndexOf(
                    decimalSeparator
                ) + 1
            )
            .replace(
                /[^#0]/g,
                ""
            );

        maximumFractionDigits = fractionPattern.length;

        minimumFractionDigits = (
            fractionPattern
                .match(/0/g) ||
            []
        )
            .length;
    }

    let [
        integerPart,
        fractionPart = ""
    ] = Math.abs(number)
        .toFixed(maximumFractionDigits)
        .split(".");

    while (
        fractionPart.length > minimumFractionDigits &&
        fractionPart.endsWith("0")
    ) {
        fractionPart = fractionPart.slice(
            0,
            -1
        );
    }

    if (groupSeparator) {
        integerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            groupSeparator
        );
    }

    const sign = number < 0
        ? "-"
        : "";

    if (fractionPart) {
        return (
            sign +
            integerPart +
            (
                decimalSeparator ||
                "."
            ) +
            fractionPart
        );
    }

    return (
        sign +
        integerPart
    );
}

function isDateValue(value) {
    if (value instanceof Date) {
        return true;
    }

    const text = String(
        value ??
        ""
    )
        .trim();

    return (
        /^\d{4}-\d{2}-\d{2}$/.test(text) ||
        /^\d{4}-\d{2}-\d{2}T/.test(text) ||
        /^\d{1,2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:\d{2})?$/.test(text)
    );
}

function isNumberValue(value) {
    if (
        typeof value ===
        "number"
    ) {
        return Number.isFinite(value);
    }

    const text = String(
        value ??
        ""
    )
        .trim();

    if (!text) {
        return false;
    }

    return /^-?\d+(?:\.\d+)?$/.test(text);
}

function formatValue(
    value,
    pattern
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (isDateValue(value)) {
        return formatDateByPattern(
            value,
            pattern
        );
    }

    if (isNumberValue(value)) {
        return formatNumberByPattern(
            value,
            pattern
        );
    }

    return value;
}

function isKnownDateTimePattern(pattern) {
    return DINH_DANG_NGAY_GIO
        .includes(
            String(
                pattern ||
                ""
            )
                .trim()
        );
}

module.exports = {
    TIME_ZONE,
    DINH_DANG_NGAY_GIO,
    DATE_TIME_TOKENS,
    getDateTimeParts,
    getReportDateParts,
    formatDateByPattern,
    formatNumberByPattern,
    formatValue,
    isDateValue,
    isNumberValue,
    isKnownDateTimePattern
};
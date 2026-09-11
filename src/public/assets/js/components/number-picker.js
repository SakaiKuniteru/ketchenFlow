'use strict';

(function () {
    function formatIntegerPart(value) {
        if (!value) {
            return '';
        }

        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function formatInputValue(value, integer = false, allowSign = false) {
        let raw = String(value ?? '')
            .trim()
            .replace(/\s/g, '');

        if (!raw) {
            return '';
        }

        if (allowSign && (raw === '-' || raw === '+')) {
            return raw;
        }

        let sign = '';

        if (allowSign && (raw.startsWith('-') || raw.startsWith('+'))) {
            sign = raw.charAt(0);
        }

        raw = raw.replace(/[+-]/g, '');

        if (integer) {
            const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

            if (!digits) {
                return sign;
            }

            return sign + formatIntegerPart(digits);
        }

        const commaIndex = raw.indexOf(',');
        let integerPart = '';
        let decimalPart = null;

        if (commaIndex >= 0) {
            integerPart = raw.slice(0, commaIndex).replace(/\D/g, '');
            decimalPart = raw.slice(commaIndex + 1).replace(/\D/g, '');
        } else {
            integerPart = raw.replace(/\D/g, '');
        }

        if (!integerPart && decimalPart === null) {
            return sign;
        }

        let result = formatIntegerPart(integerPart);

        if (decimalPart !== null) {
            if (!result) {
                result = '0';
            }

            result += ',' + decimalPart;
        }

        return sign + result;
    }

    function formatExternalValue(value, integer = false, allowSign = false) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        let raw = String(value).trim().replace(/\s/g, '');

        if (!raw) {
            return '';
        }

        if (allowSign && (raw === '-' || raw === '+')) {
            return raw;
        }

        let sign = '';

        if (allowSign && (raw.startsWith('-') || raw.startsWith('+'))) {
            sign = raw.charAt(0);
        }

        raw = raw.replace(/[+-]/g, '');

        if (integer) {
            const digits = raw.replace(/\D/g, '');

            if (!digits) {
                return sign;
            }

            return sign + formatIntegerPart(digits);
        }

        let integerPart = '';
        let decimalPart = null;

        if (raw.includes(',')) {
            const commaIndex = raw.indexOf(',');
            integerPart = raw.slice(0, commaIndex).replace(/\D/g, '');
            decimalPart = raw.slice(commaIndex + 1).replace(/\D/g, '');
        } else if (raw.includes('.')) {
            const lastDotIndex = raw.lastIndexOf('.');
            const beforeDot = raw.slice(0, lastDotIndex);
            const afterDot = raw.slice(lastDotIndex + 1);
            const looksLikeBackendDecimal =
                /^\d+$/.test(beforeDot) && /^\d+$/.test(afterDot) && raw.split('.').length === 2;

            if (looksLikeBackendDecimal) {
                integerPart = beforeDot;
                decimalPart = afterDot;
            } else {
                integerPart = raw.replace(/\D/g, '');
            }
        } else {
            integerPart = raw.replace(/\D/g, '');
        }

        if (!integerPart) {
            return sign;
        }

        let result = formatIntegerPart(integerPart);

        if (decimalPart !== null && decimalPart !== '') {
            result += ',' + decimalPart;
        }

        return sign + result;
    }

    function normalizeValue(value) {
        const raw = String(value ?? '')
            .trim()
            .replace(/\s/g, '');

        if (!raw || raw === ',' || raw === '-' || raw === '+' || raw === '-,' || raw === '+,') {
            return '';
        }

        if (raw.includes(',')) {
            return raw.replace(/\./g, '').replace(',', '.');
        }

        return raw.replace(/\./g, '');
    }

    function getValue(input) {
        if (!input) {
            return null;
        }

        const value = normalizeValue(input.value);

        if (!value) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function initialize(input) {
        if (!input) {
            return null;
        }

        if (input.numberInput) {
            return input.numberInput;
        }

        const integer = input.dataset.numberInteger === 'true';
        const allowSign = input.dataset.numberAllowSign === 'true';

        function setValue(value, { silent = true } = {}) {
            input.value = formatExternalValue(value, integer, allowSign);

            if (!silent) {
                input.dispatchEvent(
                    new Event('input', {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event('change', {
                        bubbles: true
                    })
                );
            }
        }

        function formatCurrentValue() {
            const oldValue = input.value;
            const oldCursor = input.selectionStart ?? oldValue.length;
            const charactersBeforeCursor = oldValue.slice(0, oldCursor).replace(/\./g, '').length;
            const formatted = formatInputValue(oldValue, integer, allowSign);

            input.value = formatted;

            if (!formatted) {
                try {
                    input.setSelectionRange(0, 0);
                } catch (error) {
                    void error;
                }

                return;
            }

            let cursor = 0;
            let characters = 0;

            while (cursor < formatted.length) {
                if (formatted[cursor] !== '.') {
                    characters++;
                }

                cursor++;

                if (characters >= charactersBeforeCursor) {
                    break;
                }
            }

            try {
                input.setSelectionRange(cursor, cursor);
            } catch (error) {
                void error;
            }
        }

        input.addEventListener('input', formatCurrentValue);

        input.addEventListener('blur', () => {
            input.value = formatInputValue(input.value, integer, allowSign);
        });

        const api = {
            setValue,

            format() {
                input.value = formatInputValue(input.value, integer, allowSign);
            },

            getValue() {
                return getValue(input);
            }
        };

        input.numberInput = api;

        setValue(input.value);

        return api;
    }

    function initializeAll(root = document) {
        root.querySelectorAll('[data-number-input]').forEach((input) => {
            initialize(input);
        });
    }

    function refresh(root = document) {
        if (!root) {
            return;
        }

        root.querySelectorAll('[data-number-input]').forEach((input) => {
            const instance = initialize(input);

            instance?.format();
        });
    }

    function formatValue(value, integer = false) {
        return formatExternalValue(value, integer);
    }

    window.MCS = window.MCS || {};

    window.MCS.numberInput = {
        initialize,
        initializeAll,
        refresh,
        formatValue,
        formatInputValue,
        normalizeValue,
        getValue
    };

    document.addEventListener('DOMContentLoaded', () => {
        initializeAll();
    });
})();

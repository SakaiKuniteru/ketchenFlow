'use strict';

window.MCS = window.MCS || {};

window.MCS.timePicker = {
    initialize(root) {
        if (!root) {
            return null;
        }

        if (root.timePicker) {
            return root.timePicker;
        }

        const input = root.querySelector('[data-time-input]');
        const toggle = root.querySelector('[data-time-toggle]');
        const dropdown = root.querySelector('[data-time-dropdown]');
        const hourInput = root.querySelector('[data-time-hour]');
        const minuteInput = root.querySelector('[data-time-minute]');
        const secondInput = root.querySelector('[data-time-second]');
        const clearButton = root.querySelector('[data-time-clear]');
        const confirmButton = root.querySelector('[data-time-confirm]');

        if (!input || !toggle || !dropdown || !hourInput || !minuteInput) {
            return null;
        }

        const showSeconds = root.dataset.showSeconds === 'true';

        function pad(value) {
            return String(value).padStart(2, '0');
        }

        function normalizeNumber(value, min, max) {
            const number = Number(value);

            if (!Number.isFinite(number)) {
                return min;
            }

            return Math.min(max, Math.max(min, Math.trunc(number)));
        }

        function parseTime(value) {
            const text = String(value || '').trim();

            if (!text) {
                return null;
            }

            const match = text.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);

            if (!match) {
                return null;
            }

            const hour = Number(match[1]);
            const minute = Number(match[2]);
            const second = Number(match[3] || 0);

            if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
                return null;
            }

            return {
                hour,
                minute,
                second
            };
        }

        function formatTime({ hour, minute, second = 0 }) {
            const base = `${pad(hour)}:${pad(minute)}`;

            if (showSeconds) {
                return `${base}:${pad(second)}`;
            }

            return base;
        }

        function setFields(time) {
            const value = time || {
                hour: 0,
                minute: 0,
                second: 0
            };

            hourInput.value = pad(value.hour);
            minuteInput.value = pad(value.minute);

            if (secondInput) {
                secondInput.value = pad(value.second);
            }
        }

        function getFields() {
            return {
                hour: normalizeNumber(hourInput.value, 0, 23),

                minute: normalizeNumber(minuteInput.value, 0, 59),

                second: secondInput ? normalizeNumber(secondInput.value, 0, 59) : 0
            };
        }

        function dispatchChange() {
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

        function setValue(value, { silent = false } = {}) {
            const parsed = parseTime(value);

            if (!parsed) {
                input.value = '';
                setFields(null);

                if (!silent) {
                    dispatchChange();
                }

                return;
            }

            const formatted = formatTime(parsed);

            input.value = formatted;
            setFields(parsed);

            if (!silent) {
                dispatchChange();
            }
        }

        function open() {
            if (input.disabled || input.readOnly) {
                return;
            }

            window.MCS.timePicker.closeAll(root);

            const parsed = parseTime(input.value);

            setFields(parsed);

            dropdown.hidden = false;
            root.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
        }

        function close() {
            dropdown.hidden = true;
            root.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        function toggleDropdown() {
            if (dropdown.hidden) {
                open();
            } else {
                close();
            }
        }

        function confirm() {
            const time = getFields();

            setValue(formatTime(time));

            close();
        }

        function clear() {
            input.value = '';
            setFields(null);
            dispatchChange();
            close();
        }

        function step(field, direction) {
            let target = null;
            let max = 59;

            if (field === 'hour') {
                target = hourInput;
                max = 23;
            } else if (field === 'minute') {
                target = minuteInput;
            } else if (field === 'second') {
                target = secondInput;
            }

            if (!target) {
                return;
            }

            let value = normalizeNumber(target.value, 0, max);

            value += Number(direction);

            if (value > max) {
                value = 0;
            }

            if (value < 0) {
                value = max;
            }

            target.value = pad(value);
        }

        function handleNumberInput(target, max) {
            let value = String(target.value || '')
                .replace(/\D/g, '')
                .slice(0, 2);

            if (value && Number(value) > max) {
                value = String(max);
            }

            target.value = value;
        }

        function handleNumberBlur(target) {
            if (target.value === '') {
                target.value = '00';
                return;
            }

            target.value = pad(Number(target.value));
        }

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleDropdown();
        });

        confirmButton?.addEventListener('click', (event) => {
            event.preventDefault();
            confirm();
        });

        clearButton?.addEventListener('click', (event) => {
            event.preventDefault();
            clear();
        });

        root.querySelectorAll('[data-time-step]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();

                step(button.dataset.timeStep, Number(button.dataset.timeDirection));
            });
        });

        hourInput.addEventListener('input', () => {
            handleNumberInput(hourInput, 23);
        });

        minuteInput.addEventListener('input', () => {
            handleNumberInput(minuteInput, 59);
        });

        secondInput?.addEventListener('input', () => {
            handleNumberInput(secondInput, 59);
        });

        [hourInput, minuteInput, secondInput].filter(Boolean).forEach((target) => {
            target.addEventListener('blur', () => {
                handleNumberBlur(target);
            });
        });

        let isDeletingTime = false;

        input.addEventListener('input', () => {
            if (isDeletingTime) {
                isDeletingTime = false;
                return;
            }

            const rawValue = String(input.value || '');

            let digits = rawValue.replace(/\D/g, '').slice(0, showSeconds ? 6 : 4);

            let value = '';

            if (digits.length >= 1) {
                const hourRaw = digits.slice(0, 2);

                if (hourRaw.length === 1) {
                    value = hourRaw;
                } else {
                    const hour = Math.min(Number(hourRaw), 23);

                    value = pad(hour);

                    if (digits.length > 2) {
                        value += ':';
                    }
                }
            }

            if (digits.length >= 3) {
                const minuteRaw = digits.slice(2, 4);

                if (minuteRaw.length === 1) {
                    value += minuteRaw;
                } else {
                    const minute = Math.min(Number(minuteRaw), 59);

                    value += pad(minute);

                    if (showSeconds && digits.length > 4) {
                        value += ':';
                    }
                }
            }

            if (showSeconds && digits.length >= 5) {
                const secondRaw = digits.slice(4, 6);

                if (secondRaw.length === 1) {
                    value += secondRaw;
                } else {
                    value += pad(Math.min(Number(secondRaw), 59));
                }
            }

            input.value = value;
        });

        input.addEventListener('blur', () => {
            const digits = String(input.value || '')
                .replace(/\D/g, '')
                .slice(0, showSeconds ? 6 : 4);

            if (!digits) {
                input.value = '';
                return;
            }

            const hour = Math.min(Number(digits.slice(0, 2) || 0), 23);

            const minute = Math.min(Number(digits.slice(2, 4) || 0), 59);

            const second = showSeconds ? Math.min(Number(digits.slice(4, 6) || 0), 59) : 0;

            input.value = formatTime({
                hour,
                minute,
                second
            });
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace') {
                const start = input.selectionStart;
                const end = input.selectionEnd;

                if (start === end && start > 0 && input.value[start - 1] === ':') {
                    event.preventDefault();

                    input.value = input.value.slice(0, start - 1) + input.value.slice(end);

                    input.setSelectionRange(start - 1, start - 1);

                    isDeletingTime = true;

                    input.dispatchEvent(
                        new Event('input', {
                            bubbles: true
                        })
                    );

                    return;
                }
            }

            if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && !/\d/.test(event.key)) {
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                open();
            }

            if (event.key === 'Escape') {
                close();
            }
        });

        const initial = parseTime(input.value);

        if (initial) {
            input.value = formatTime(initial);
            setFields(initial);
        } else {
            setFields(null);
        }

        const api = {
            open,
            close,
            clear,
            setValue,

            getValue() {
                return input.value || '';
            },

            setDisabled(disabled = true) {
                const value = Boolean(disabled);

                input.disabled = value;
                toggle.disabled = value;

                root.classList.toggle('is-disabled', value);

                if (value) {
                    close();
                }
            }
        };

        root.timePicker = api;

        return api;
    },

    initializeAll(container = document) {
        container.querySelectorAll('[data-time-picker]').forEach((root) => {
            this.initialize(root);
        });
    },

    closeAll(except = null) {
        document.querySelectorAll('[data-time-picker]').forEach((root) => {
            if (root === except) {
                return;
            }

            root.timePicker?.close();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.MCS.timePicker.initializeAll();

    document.addEventListener('click', (event) => {
        const picker = event.target.closest('[data-time-picker]');

        if (picker) {
            return;
        }

        window.MCS.timePicker.closeAll();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        window.MCS.timePicker.closeAll();
    });
});

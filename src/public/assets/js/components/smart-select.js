'use strict';

window.MCS = window.MCS || {};

window.MCS.smartSelect = {
    initialize(root) {
        if (!root) {
            return null;
        }

        if (root.smartSelect) {
            return root.smartSelect;
        }

        const elements = {
            native: root.querySelector('[data-smart-select-native]'),
            control: root.querySelector('[data-smart-select-control]'),
            selection: root.querySelector('[data-smart-select-selection]'),
            search: root.querySelector('[data-smart-select-search]'),
            toggle: root.querySelector('[data-smart-select-toggle]'),
            clear: root.querySelector('[data-smart-select-clear]'),
            dropdown: root.querySelector('[data-smart-select-dropdown]'),
            options: root.querySelector('[data-smart-select-options]'),
            empty: root.querySelector('[data-smart-select-empty]')
        };

        if (
            !elements.native ||
            !elements.control ||
            !elements.selection ||
            !elements.search ||
            !elements.dropdown ||
            !elements.options
        ) {
            console.error('Smart Select thiếu phần tử bắt buộc:', root);

            return null;
        }

        const mode = root.dataset.selectMode || 'single';
        const compactMultiple = root.dataset.selectCompactMultiple === 'true';
        const checkboxOptions = root.dataset.selectCheckboxOptions === 'true';

        function getPlaceholder() {
            return root.dataset.selectPlaceholder || 'Chọn dữ liệu...';
        }

        const allLabel = root.dataset.selectAllLabel || 'Tất cả';

        const state = {
            opened: false,
            searching: false,
            activeIndex: -1
        };

        bindEvents();
        renderOptions();
        renderSelection();

        function getOptions() {
            return Array.from(elements.native.options);
        }

        function getNormalOptions() {
            return getOptions().filter(
                (option) => option.value !== '' && option.value !== '__ALL__' && !option.disabled
            );
        }

        function getSelectedOptions() {
            return getOptions().filter(
                (option) => option.selected && option.value !== '' && option.value !== '__ALL__'
            );
        }

        function getAllOption() {
            return getOptions().find((option) => option.value === '__ALL__') || null;
        }

        function getRenderedOptionButtons() {
            return Array.from(elements.options.querySelectorAll('.smart-select__option:not(:disabled)'));
        }

        function setActiveIndex(index) {
            const buttons = getRenderedOptionButtons();

            if (!buttons.length) {
                state.activeIndex = -1;

                return;
            }

            let nextIndex = Number(index);

            if (!Number.isInteger(nextIndex)) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = buttons.length - 1;
            }

            if (nextIndex >= buttons.length) {
                nextIndex = 0;
            }

            state.activeIndex = nextIndex;

            buttons.forEach((button, buttonIndex) => {
                button.classList.toggle('is-highlighted', buttonIndex === nextIndex);
            });

            buttons[nextIndex]?.scrollIntoView({
                block: 'nearest'
            });
        }

        function setActiveValue(value) {
            const buttons = getRenderedOptionButtons();

            if (!buttons.length) {
                state.activeIndex = -1;

                return;
            }

            const index = buttons.findIndex((button) => String(button.dataset.optionValue) === String(value));

            setActiveIndex(index >= 0 ? index : 0);
        }

        function getActiveOption() {
            const buttons = getRenderedOptionButtons();

            const button = buttons[state.activeIndex];

            if (!button) {
                return null;
            }

            return getOptions().find((option) => String(option.value) === String(button.dataset.optionValue)) || null;
        }

        function isAllSelected() {
            return Boolean(getAllOption()?.selected);
        }

        function hasValue() {
            if (isAllSelected()) {
                return true;
            }

            return getSelectedOptions().length > 0;
        }

        function bindEvents() {
            elements.control.addEventListener('click', (event) => {
                if (
                    event.target.closest('[data-smart-select-remove]') ||
                    event.target.closest('[data-smart-select-toggle]') ||
                    event.target.closest('[data-smart-select-clear]')
                ) {
                    return;
                }

                if (elements.native.disabled) {
                    return;
                }

                open(true);
            });

            elements.toggle?.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                toggle();
            });

            elements.clear?.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (elements.native.disabled) {
                    return;
                }

                clear(true);
                close();
                syncControlState();
            });

            elements.search.addEventListener('focus', () => {
                if (elements.native.disabled) {
                    return;
                }

                state.searching = true;

                root.classList.add('is-searching');

                if (!state.opened) {
                    open(false);
                }
            });

            elements.search.addEventListener('input', () => {
                state.searching = true;

                root.classList.add('is-searching');

                renderOptions(elements.search.value);

                if (!state.opened) {
                    open(false);
                }
            });

            elements.search.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();

                    if (!state.opened) {
                        open(false);

                        return;
                    }

                    setActiveIndex(state.activeIndex + 1);

                    return;
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();

                    if (!state.opened) {
                        open(false);

                        return;
                    }

                    setActiveIndex(state.activeIndex - 1);

                    return;
                }

                if (event.key === 'Enter') {
                    if (!state.opened) {
                        event.preventDefault();

                        open(false);

                        return;
                    }

                    const option = getActiveOption();

                    if (!option) {
                        return;
                    }

                    event.preventDefault();

                    selectOption(option);

                    return;
                }

                if (event.key === 'Escape') {
                    event.preventDefault();

                    close();

                    elements.search.blur();

                    return;
                }

                if (event.key === 'Backspace' && !elements.search.value && mode === 'multiple') {
                    removeLastValue();
                }
            });

            root.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            document.addEventListener('click', (event) => {
                if (!root.contains(event.target)) {
                    close();
                }
            });
        }

        function open(focusSearch = true) {
            if (elements.native.disabled) {
                return;
            }

            closeOtherPopups();

            state.opened = true;
            state.searching = true;

            elements.dropdown.hidden = false;

            root.classList.add('is-open', 'is-searching');

            elements.toggle?.setAttribute('aria-expanded', 'true');

            elements.search.hidden = false;

            elements.search.placeholder = hasValue() ? '' : getPlaceholder();

            renderOptions(elements.search.value);
            syncControlState();

            if (focusSearch) {
                requestAnimationFrame(() => {
                    elements.search.focus();
                });
            }
        }

        function close() {
            state.opened = false;
            state.searching = false;
            state.activeIndex = -1;

            elements.dropdown.hidden = true;

            root.classList.remove('is-open', 'is-searching');

            elements.toggle?.setAttribute('aria-expanded', 'false');

            elements.search.value = '';
            elements.search.placeholder = '';

            renderOptions();
            renderSelection();
            syncControlState();
        }

        function closeOtherPopups() {
            document.querySelectorAll('[data-smart-select]').forEach((item) => {
                if (item === root) {
                    return;
                }

                const api = item.smartSelect;

                if (api && typeof api.close === 'function') {
                    api.close();
                }
            });

            document.querySelectorAll('[data-date-picker]').forEach((item) => {
                const dropdown = item.querySelector('[data-date-dropdown]');
                const toggle = item.querySelector('[data-date-toggle]');

                if (dropdown) {
                    dropdown.hidden = true;
                }

                toggle?.setAttribute('aria-expanded', 'false');

                item.classList.remove('is-open');
            });
        }

        function toggle() {
            if (state.opened) {
                close();
                return;
            }

            open(true);
        }

        function renderOptions(keyword = '', preferredValue = null) {
            const normalizedKeyword = normalizeSearchText(keyword);

            elements.options.innerHTML = '';

            const visibleOptions = getOptions().filter((option) => {
                if (option.value === '') {
                    return false;
                }

                const optionLabel = normalizeSearchText(option.textContent);

                return !normalizedKeyword || optionLabel.includes(normalizedKeyword);
            });

            visibleOptions.forEach((option) => {
                const button = document.createElement('button');

                button.type = 'button';
                button.className = 'smart-select__option';
                button.dataset.optionValue = option.value;

                button.addEventListener('mouseenter', () => {
                    if (button.disabled) {
                        return;
                    }

                    const buttons = getRenderedOptionButtons();

                    const index = buttons.indexOf(button);

                    if (index < 0) {
                        return;
                    }

                    setActiveIndex(index);
                });

                if (option.value === '__ALL__') {
                    button.dataset.optionAll = 'true';
                }

                if (option.selected) {
                    button.classList.add('is-selected');
                }

                if (option.disabled) {
                    button.disabled = true;
                    button.classList.add('is-disabled');
                }

                const label = document.createElement('span');

                label.className = 'smart-select__option-label';
                label.textContent = option.textContent.trim();

                if (checkboxOptions) {
                    const check = document.createElement('span');

                    check.className = 'smart-select__check';

                    const checkBox = document.createElement('span');

                    checkBox.className = 'smart-select__checkbox';

                    if (option.selected) {
                        checkBox.classList.add('is-checked');
                    }

                    checkBox.innerHTML = `
                            <i
                                class="fa-solid fa-check"
                                aria-hidden="true">
                            </i>
                        `;

                    check.appendChild(checkBox);

                    button.appendChild(check);
                    button.appendChild(label);
                } else {
                    button.appendChild(label);

                    const check = document.createElement('span');

                    check.className = 'smart-select__default-check';

                    check.setAttribute('aria-hidden', 'true');

                    check.textContent = '✓';

                    button.appendChild(check);
                }

                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    selectOption(option);
                });

                elements.options.appendChild(button);
            });

            if (elements.empty) {
                elements.empty.hidden = visibleOptions.length === 0 ? false : true;
            }

            if (!state.opened) {
                state.activeIndex = -1;
                return;
            }

            if (preferredValue !== null && preferredValue !== undefined) {
                setActiveValue(preferredValue);
                return;
            }
            setActiveIndex(0);
        }

        function selectOption(option) {
            if (mode === 'multiple') {
                const activeValue = option.value;
                selectMultiple(option);
                emitChange();
                elements.search.value = '';
                renderOptions('', activeValue);
                renderSelection();
                elements.search.focus();
                return;
            }

            getOptions().forEach((item) => {
                item.selected = false;
            });

            option.selected = true;

            emitChange();
            renderOptions();
            renderSelection();
            close();
        }

        function selectMultiple(option) {
            const allOption = getAllOption();
            const normalOptions = getNormalOptions();

            if (option.value === '__ALL__') {
                const shouldSelectAll = !normalOptions.every((item) => item.selected);

                normalOptions.forEach((item) => {
                    item.selected = shouldSelectAll;
                });

                if (allOption) {
                    allOption.selected = shouldSelectAll;
                }

                return;
            }

            option.selected = !option.selected;

            const selectedNormalOptions = normalOptions.filter((item) => item.selected);

            if (allOption) {
                allOption.selected = normalOptions.length > 0 && selectedNormalOptions.length === normalOptions.length;
            }
        }

        function syncControlState() {
            const hasSelectedValue = hasValue();
            const opened = state.opened;

            const placeholderElement = elements.selection.querySelector('.smart-select__placeholder');

            if (elements.clear) {
                if (compactMultiple) {
                    elements.clear.hidden = true;
                } else {
                    elements.clear.hidden = !hasSelectedValue;
                }

                elements.clear.disabled = elements.native.disabled;
            }

            if (elements.toggle) {
                if (compactMultiple) {
                    elements.toggle.hidden = false;
                } else {
                    elements.toggle.hidden = hasSelectedValue;
                }

                elements.toggle.disabled = elements.native.disabled;
            }

            if (elements.search) {
                if (opened) {
                    elements.search.hidden = false;

                    elements.search.placeholder = hasSelectedValue ? '' : getPlaceholder();
                } else {
                    elements.search.hidden = true;
                    elements.search.placeholder = '';
                }
            }

            if (placeholderElement) {
                placeholderElement.hidden = opened;
            }

            root.classList.toggle('has-value', hasSelectedValue);

            root.classList.toggle('has-clear', hasSelectedValue);
        }

        function renderSelection() {
            elements.selection.innerHTML = '';

            if (!root.classList.contains('is-searching')) {
                elements.search.value = '';
                elements.search.placeholder = '';
            }

            if (mode === 'multiple' && isAllSelected()) {
                if (compactMultiple) {
                    appendCompactMultipleAll();
                } else {
                    const allOption = getAllOption();

                    if (allOption) {
                        appendTag(allOption);
                    }
                }

                syncControlState();
                return;
            }

            const selectedOptions = getSelectedOptions();

            if (mode === 'multiple' && compactMultiple) {
                appendCompactMultiple(selectedOptions);
                return;
            }

            if (selectedOptions.length === 0) {
                const placeholderElement = document.createElement('span');

                placeholderElement.className = 'smart-select__placeholder';
                placeholderElement.textContent = getPlaceholder();

                elements.selection.appendChild(placeholderElement);

                syncControlState();

                return;
            }

            if (mode !== 'multiple') {
                appendSingleValue(selectedOptions[0].textContent.trim());

                syncControlState();

                return;
            }

            selectedOptions.forEach((option) => {
                appendTag(option);
            });

            syncControlState();
        }

        function appendSingleValue(label) {
            const wrapper = document.createElement('div');

            wrapper.className = 'smart-select__single';

            const value = document.createElement('span');

            value.className = 'smart-select__single-value';
            value.textContent = label;

            wrapper.appendChild(value);

            elements.selection.appendChild(wrapper);
        }

        function appendCompactMultiple(selectedOptions) {
            const wrapper = document.createElement('div');

            wrapper.className = 'smart-select__multiple-compact';

            const label = document.createElement('span');

            label.className = 'smart-select__multiple-compact-label';
            label.textContent = getPlaceholder();

            const count = document.createElement('span');

            count.className = 'smart-select__multiple-compact-count';
            count.textContent = String(selectedOptions.length);

            const remove = document.createElement('button');

            remove.type = 'button';
            remove.className = 'smart-select__multiple-compact-remove';
            remove.dataset.smartSelectRemove = 'multiple-all';

            remove.setAttribute('aria-label', 'Xóa tất cả lựa chọn');

            remove.innerHTML = `
                <i
                    class="fa-solid fa-xmark"
                    aria-hidden="true">
                </i>
            `;

            remove.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                clear(true);
            });

            wrapper.appendChild(label);
            wrapper.appendChild(count);

            if (selectedOptions.length > 0) {
                wrapper.appendChild(remove);
            }

            elements.selection.appendChild(wrapper);
        }

        function appendCompactMultipleAll() {
            const wrapper = document.createElement('div');

            wrapper.className = 'smart-select__multiple-compact';

            const label = document.createElement('span');

            label.className = 'smart-select__multiple-compact-label';
            label.textContent = getPlaceholder();

            const count = document.createElement('span');

            count.className = 'smart-select__multiple-compact-count';
            count.textContent = String(getNormalOptions().length);

            const remove = document.createElement('button');

            remove.type = 'button';
            remove.className = 'smart-select__multiple-compact-remove';
            remove.dataset.smartSelectRemove = 'multiple-all';

            remove.setAttribute('aria-label', 'Xóa lựa chọn');

            remove.innerHTML = `
                <i
                    class="fa-solid fa-xmark"
                    aria-hidden="true">
                </i>
            `;

            remove.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                clear(true);
            });

            wrapper.append(label, count, remove);

            elements.selection.appendChild(wrapper);
        }

        function appendTag(option) {
            const tag = document.createElement('span');

            tag.className = 'smart-select__tag';

            const label = document.createElement('span');

            label.className = 'smart-select__tag-label';
            label.textContent = option.textContent.trim();

            const remove = document.createElement('button');

            remove.type = 'button';
            remove.className = 'smart-select__tag-remove';
            remove.dataset.smartSelectRemove = option.value;

            remove.setAttribute('aria-label', `Bỏ chọn ${option.textContent.trim()}`);

            remove.textContent = '×';

            remove.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                option.selected = false;

                emitChange();
                renderOptions();
                renderSelection();
            });

            tag.appendChild(label);
            tag.appendChild(remove);

            elements.selection.appendChild(tag);
        }

        function removeLastValue() {
            const selectedOptions = getSelectedOptions();
            const lastOption = selectedOptions.at(-1);

            if (!lastOption) {
                return;
            }

            lastOption.selected = false;

            emitChange();
            renderOptions();
            renderSelection();
        }

        function emitChange() {
            elements.native.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );

            root.dispatchEvent(
                new CustomEvent('smart-select:change', {
                    bubbles: true,

                    detail: {
                        mode,
                        all: isAllSelected(),
                        value: getValue(),
                        values: getValues()
                    }
                })
            );
        }

        function getValue() {
            return getSelectedOptions()[0]?.value ?? '';
        }

        function getValues() {
            return getSelectedOptions().map((option) => option.value);
        }

        function setValue(value, emit = false) {
            const normalizedValue = value === null || value === undefined ? '' : String(value);

            getOptions().forEach((option) => {
                option.selected = option.value === normalizedValue;
            });

            renderOptions();
            renderSelection();

            if (emit) {
                emitChange();
            }
        }

        function setValues(values, emit = false) {
            const normalizedValues = new Set((Array.isArray(values) ? values : []).map((value) => String(value)));

            getNormalOptions().forEach((option) => {
                option.selected = normalizedValues.has(option.value);
            });

            const allOption = getAllOption();
            const normalOptions = getNormalOptions();

            if (allOption) {
                allOption.selected = normalOptions.length > 0 && normalOptions.every((option) => option.selected);
            }

            renderOptions();
            renderSelection();

            if (emit) {
                emitChange();
            }
        }

        function setAll(selected = true, emit = false) {
            const allOption = getAllOption();
            const normalOptions = getNormalOptions();

            normalOptions.forEach((option) => {
                option.selected = Boolean(selected);
            });

            if (allOption) {
                allOption.selected = Boolean(selected) && normalOptions.length > 0;
            }

            renderOptions();
            renderSelection();

            if (emit) {
                emitChange();
            }
        }

        function clear(emit = false) {
            getOptions().forEach((option) => {
                option.selected = false;
            });

            renderOptions();
            renderSelection();

            if (emit) {
                emitChange();
            }
        }

        function setDisabled(disabled = true) {
            const isDisabled = Boolean(disabled);

            elements.native.disabled = isDisabled;
            elements.search.disabled = isDisabled;

            if (elements.toggle) {
                elements.toggle.disabled = isDisabled;
            }

            if (elements.clear) {
                elements.clear.disabled = isDisabled;
            }

            root.classList.toggle('is-disabled', isDisabled);

            if (isDisabled) {
                close();
            } else {
                renderOptions();
                renderSelection();
            }

            syncControlState();
        }

        const api = {
            open,
            close,
            getValue,
            getValues,
            setValue,
            setValues,
            setAll,
            clear,
            setDisabled,

            refresh() {
                renderOptions();
                renderSelection();
                syncControlState();
            }
        };

        root.smartSelect = api;

        return api;
    },

    initializeAll(container = document) {
        container.querySelectorAll('[data-smart-select]').forEach((root) => {
            this.initialize(root);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.MCS.smartSelect.initializeAll();
});

function normalizeSearchText(value) {
    if (window.MCS?.searchPicker && typeof window.MCS.searchPicker.normalizeText === 'function') {
        return window.MCS.searchPicker.normalizeText(value);
    }

    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

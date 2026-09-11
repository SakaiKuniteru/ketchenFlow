'use strict';

window.MCS = window.MCS || {};

window.MCS.checkboxList = (() => {
    function render(
        container,
        items,
        {
            name,
            selectAll = true,
            selectAllLabel = 'Chọn tất cả',
            getValue,
            getTitle,
            getDescription,
            isChecked,
            onChange
        } = {}
    ) {
        if (!container) {
            return null;
        }

        container.innerHTML = '';

        const list = Array.isArray(items) ? items : [];

        if (!list.length) {
            const empty = document.createElement('div');

            empty.className = 'td-checkbox-list__empty';
            empty.textContent = 'Không có dữ liệu.';

            container.appendChild(empty);

            return null;
        }

        let selectAllInput = null;

        if (selectAll) {
            const selectAllRow = createCheckboxRow({
                name: `${name}__all`,
                value: '__all__',
                title: selectAllLabel,
                description: '',
                checked: false,
                isSelectAll: true
            });

            selectAllInput = selectAllRow.querySelector('input[type="checkbox"]');

            container.appendChild(selectAllRow);
        }

        list.forEach((item) => {
            const value = getValue?.(item) ?? item.id;
            const title = getTitle?.(item) ?? '-';
            const description = getDescription?.(item) ?? '';
            const checked = !!isChecked?.(item);

            const row = createCheckboxRow({
                name,
                value,
                title,
                description,
                checked
            });

            container.appendChild(row);
        });

        function getInputs() {
            return Array.from(container.querySelectorAll(`input[type="checkbox"][name="${name}"]`));
        }

        function refreshSelectAll() {
            if (!selectAllInput) {
                return;
            }

            const inputs = getVisibleInputs();

            const checkedCount = inputs.filter((input) => input.checked).length;

            selectAllInput.checked = inputs.length > 0 && checkedCount === inputs.length;

            selectAllInput.indeterminate = checkedCount > 0 && checkedCount < inputs.length;
        }

        function getVisibleInputs() {
            return getInputs().filter((input) => !input.closest('.td-checkbox-list__item')?.hidden);
        }

        getInputs().forEach((input) => {
            input.addEventListener('change', (event) => {
                refreshSelectAll();

                onChange?.({
                    input: event.currentTarget,
                    values: values(container, name)
                });
            });
        });

        selectAllInput?.addEventListener('change', () => {
            const checked = selectAllInput.checked;

            getInputs().forEach((input) => {
                const row = input.closest('.td-checkbox-list__item');

                if (row?.hidden) {
                    return;
                }

                input.checked = checked;
            });

            refreshSelectAll();

            onChange?.({
                input: selectAllInput,
                selectAll: true,
                values: values(container, name)
            });
        });

        refreshSelectAll();

        return {
            getValues() {
                return values(container, name);
            },

            refreshSelectAll
        };
    }

    function createCheckboxRow({ name, value, title, description, checked, isSelectAll = false }) {
        const wrapper = document.createElement('div');

        wrapper.className = 'form-field form-field--checkbox td-checkbox-list__item';

        wrapper.dataset.searchText = normalizeSearchText(`${title || ''} ${description || ''}`);

        if (isSelectAll) {
            wrapper.classList.add('is-select-all');
        }

        const label = document.createElement('label');

        label.className = 'form-checkbox';

        const input = document.createElement('input');

        input.type = 'checkbox';
        input.name = name;
        input.value = String(value);
        input.checked = !!checked;
        input.className = 'form-checkbox__input';

        const box = document.createElement('span');

        box.className = 'form-checkbox__box';

        box.setAttribute('aria-hidden', 'true');

        const content = document.createElement('span');

        content.className = 'form-checkbox__content';

        const titleElement = document.createElement('span');

        titleElement.className = 'form-checkbox__label';
        titleElement.textContent = title;

        content.appendChild(titleElement);

        if (description) {
            const descriptionElement = document.createElement('small');

            descriptionElement.className = 'form-checkbox__description';
            descriptionElement.textContent = description;

            content.appendChild(descriptionElement);
        }

        label.appendChild(input);
        label.appendChild(box);
        label.appendChild(content);

        wrapper.appendChild(label);

        return wrapper;
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function bindSearch(root) {
        if (!root) {
            return;
        }

        const targetMap = {
            day: '[data-day-checkbox-list]',
            group: '[data-group-checkbox-list]',
            food: '[data-food-checkbox-list]'
        };

        root.querySelectorAll('[data-checkbox-search]').forEach((input) => {
            if (input.dataset.checkboxSearchBound === 'true') {
                return;
            }

            input.dataset.checkboxSearchBound = 'true';

            input.addEventListener('input', () => {
                const target = input.dataset.checkboxSearchTarget;

                const selector = targetMap[target];

                if (!selector) {
                    return;
                }

                const list = root.querySelector(selector);

                if (!list) {
                    return;
                }

                const keyword = normalizeSearchText(input.value);

                list.querySelectorAll('.td-checkbox-list__item:not(.is-select-all)').forEach((row) => {
                    const text = row.dataset.searchText || '';

                    row.hidden = !!keyword && !text.includes(keyword);
                });
            });
        });
    }

    function values(container, name) {
        return Array.from(container.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`)).map(
            (input) => input.value
        );
    }

    return {
        render,
        values,
        bindSearch
    };
})();

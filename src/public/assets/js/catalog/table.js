'use strict';

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSTable {
    constructor(root, options = {}) {
        this.root = typeof root === 'string' ? document.querySelector(root) : root;

        this.options = {
            columns: [],
            showIndex: true,
            showActions: false,
            selectable: false,
            rowKey: 'id',
            statusKey: 'active',
            emptyTitle: 'Không có dữ liệu',
            emptyDescription: 'Chưa có bản ghi nào để hiển thị.',
            emptyIcon: 'inbox',

            statusLabels: {
                true: 'TRUE',
                false: 'FALSE'
            },

            onRowClick: null,
            onAction: null,
            ...options
        };

        this.body = this.root?.querySelector('[data-catalog-table-body]');
        this.loading = this.root?.querySelector('[data-table-loading]');
        this.table = this.root?.querySelector('[data-catalog-table]');

        this.applyColumnWidths();

        this.data = [];
        this.selectedId = null;

        this.sort = {
            key: null,
            direction: 'none'
        };

        this.bindEvents();
    }

    applyColumnWidths() {
        if (!this.table) {
            return;
        }

        const DEFAULT_WIDTH = 180;

        let totalWidth = 0;

        if (this.options.selectable) {
            totalWidth += 46;
        }

        if (this.options.showIndex) {
            totalWidth += 66;
        }

        this.options.columns.forEach((column) => {
            const rawWidth = String(column.width || `${DEFAULT_WIDTH}px`).trim();

            const match = rawWidth.match(/^(\d+(?:\.\d+)?)px$/);

            const width = match ? Number(match[1]) : DEFAULT_WIDTH;

            totalWidth += width;
        });

        this.table.style.width = `max(100%, ${totalWidth}px)`;
        this.table.style.minWidth = `${totalWidth}px`;
    }

    bindEvents() {
        if (!this.root) {
            return;
        }

        this.root.addEventListener('click', (event) => {
            const sortButton = event.target.closest('[data-sort-key]');

            if (sortButton) {
                this.toggleSort(sortButton.dataset.sortKey);

                return;
            }

            const row = event.target.closest('tr[data-record-id]');

            if (!row) {
                return;
            }

            const recordId = row.dataset.recordId;

            this.selectRow(recordId);

            const record = this.getRecord(recordId);

            this.options.onRowClick?.(record, row);
        });

        window.addEventListener('resize', () => {
            this.closeActionMenus();
        });
    }

    setData(data) {
        this.data = Array.isArray(data)
            ? data.filter((record) => {
                  if (!record || typeof record !== 'object') {
                      return false;
                  }

                  const id = record[this.options.rowKey];

                  return id !== null && id !== undefined && id !== '';
              })
            : [];

        this.render();
    }

    getData() {
        return this.data;
    }

    getRecord(id) {
        return this.data.find((item) => String(item[this.options.rowKey]) === String(id)) || null;
    }

    render() {
        if (!this.body) {
            return;
        }

        this.body.innerHTML = '';

        if (this.data.length === 0) {
            this.showEmpty();

            return;
        }

        const fragment = document.createDocumentFragment();

        this.data.forEach((record, index) => {
            fragment.appendChild(this.createRow(record, index));
        });

        this.body.appendChild(fragment);
    }

    createRow(record, index) {
        const row = document.createElement('tr');

        const recordId = record[this.options.rowKey];

        row.dataset.recordId = recordId;

        if (String(recordId) === String(this.selectedId)) {
            row.classList.add('is-selected');
        }

        if (record.active === false) {
            row.classList.add('is-disabled');
        }

        if (this.options.selectable) {
            const cell = document.createElement('td');

            cell.className = 'catalog-table__cell ' + 'catalog-table__cell--checkbox';

            const checkbox = document.createElement('input');

            checkbox.type = 'checkbox';
            checkbox.dataset.rowCheckbox = recordId;

            checkbox.addEventListener('click', (event) => event.stopPropagation());

            cell.appendChild(checkbox);

            row.appendChild(cell);
        }

        if (this.options.showIndex) {
            const indexCell = document.createElement('td');

            indexCell.className = 'catalog-table__cell ' + 'catalog-table__cell--index';

            indexCell.textContent = this.getDisplayIndex(index);

            row.appendChild(indexCell);
        }

        this.options.columns.forEach((column) => {
            const cell = document.createElement('td');

            cell.className = ['catalog-table__cell', column.className || ''].filter(Boolean).join(' ');

            cell.dataset.columnKey = column.key;

            if (column.width) {
                cell.style.width = column.width;
                cell.style.maxWidth = column.width;
            }

            const value = this.resolveValue(record, column.key);

            if (column.isBoolean) {
                const badge = document.createElement('span');

                const isTrue = value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';

                badge.className = ['status-badge', isTrue ? 'status-badge--success' : 'status-badge--neutral'].join(
                    ' '
                );

                const dot = document.createElement('span');

                dot.className = 'status-badge__dot';

                const label = document.createElement('span');

                label.className = 'status-badge__label';

                label.textContent = isTrue ? column.trueLabel || 'TRUE' : column.falseLabel || 'FALSE';

                badge.append(dot, label);

                cell.appendChild(badge);
            } else if (typeof column.render === 'function') {
                const rendered = column.render(value, record, index);

                this.appendRenderedValue(cell, rendered);
            } else {
                cell.textContent = this.formatValue(value, column);
            }

            if (column.title !== false) {
                cell.title = this.getPlainText(cell);
            }

            row.appendChild(cell);
        });

        return row;
    }

    resolveValue(object, path) {
        if (!path) {
            return undefined;
        }

        return String(path)
            .split('.')
            .reduce((value, key) => {
                return value?.[key];
            }, object);
    }

    formatValue(value, column) {
        if (value === null || value === undefined || value === '') {
            return column.emptyText || '—';
        }

        switch (column.type) {
            case 'number': {
                const number = Number(value);

                if (!Number.isFinite(number)) {
                    return String(value);
                }

                return new Intl.NumberFormat('vi-VN', {
                    minimumFractionDigits: column.minimumFractionDigits ?? 0,

                    maximumFractionDigits: column.maximumFractionDigits ?? 20
                }).format(number);
            }

            case 'currency':
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',

                    currency: column.currency || 'VND',

                    maximumFractionDigits: column.maximumFractionDigits ?? 0
                }).format(Number(value));

            case 'date':
                return this.formatDate(value, false);

            case 'datetime':
                return this.formatDate(value, true);

            case 'boolean':
                return value ? column.trueLabel || 'Có' : column.falseLabel || 'Không';

            case 'richtext':
            case 'html':
                return this.formatRichText(value);

            default:
                if (this.containsRichTextHtml(value)) {
                    return this.formatRichText(value);
                }

                return String(value);
        }
    }

    containsRichTextHtml(value) {
        const text = String(value ?? '');

        if (!text) {
            return false;
        }

        return /<\/?(?:div|p|br|span|strong|b|em|i|u|a|ul|ol|li|blockquote)\b[^>]*>/i.test(text);
    }

    formatRichText(value) {
        let html = String(value ?? '').trim();

        if (!html) {
            return '';
        }

        if (!this.containsRichTextHtml(html) && /&lt;|&gt;/i.test(html)) {
            const decoder = document.createElement('textarea');

            decoder.innerHTML = html;

            const decoded = decoder.value;

            if (this.containsRichTextHtml(decoded)) {
                html = decoded;
            }
        }

        const template = document.createElement('template');

        template.innerHTML = html;

        template.content.querySelectorAll('br').forEach((element) => {
            element.replaceWith(document.createTextNode(' '));
        });

        template.content.querySelectorAll('div, p, li, blockquote').forEach((element) => {
            element.appendChild(document.createTextNode(' '));
        });

        return (template.content.textContent || '')
            .replace(/\u00A0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    formatDate(value, includeTime) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            'vi-VN',
            includeTime
                ? {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  }
                : {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                  }
        ).format(date);
    }

    appendRenderedValue(cell, rendered) {
        if (rendered instanceof Node) {
            cell.appendChild(rendered);

            return;
        }

        if (rendered && typeof rendered === 'object' && rendered.html !== undefined) {
            cell.innerHTML = rendered.html;

            return;
        }

        cell.textContent = rendered ?? '—';
    }

    getPlainText(cell) {
        return (cell.textContent || '').trim();
    }

    getDisplayIndex(index) {
        const offset = Number(this.options.offset || 0);

        return offset + index + 1;
    }

    selectRow(id) {
        this.selectedId = id;

        this.body?.querySelectorAll('tr[data-record-id]').forEach((row) => {
            row.classList.toggle('is-selected', String(row.dataset.recordId) === String(id));
        });
    }

    clearSelection() {
        this.selectedId = null;

        this.body?.querySelectorAll('.is-selected').forEach((row) => row.classList.remove('is-selected'));
    }

    showLoading() {
        this.hideEmpty();

        if (this.loading) {
            this.loading.hidden = false;
        }
    }

    hideLoading() {
        if (this.loading) {
            this.loading.hidden = true;
        }
    }

    showEmpty() {
        if (!this.body) {
            return;
        }

        this.body.innerHTML = '';

        const row = document.createElement('tr');

        row.className = 'catalog-table__empty-row';
        row.dataset.emptyRow = '';

        const cell = document.createElement('td');

        cell.className = 'catalog-table__empty-cell';
        cell.colSpan = this.getColumnCount();

        const emptyState = document.createElement('div');

        emptyState.className = 'catalog-table-empty-state';

        const icon = document.createElement('div');

        icon.className = 'catalog-table-empty-state__icon';

        icon.setAttribute('aria-hidden', 'true');

        icon.innerHTML = `
            <svg
                viewBox="0 0 64 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                    d="M14 17.5L21 7H43L50 17.5V37C50 39.7614 47.7614 42 45 42H19C16.2386 42 14 39.7614 14 37V17.5Z"
                    stroke="currentColor"
                    stroke-width="2">
                </path>

                <path
                    d="M14 18H24L27.5 23H36.5L40 18H50"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round">
                </path>

                <ellipse
                    cx="32"
                    cy="43"
                    rx="24"
                    ry="3"
                    fill="currentColor"
                    opacity="0.08">
                </ellipse>

            </svg>
        `;

        const title = document.createElement('strong');

        title.className = 'catalog-table-empty-state__title';
        title.textContent = this.options.emptyTitle;

        const description = document.createElement('p');

        description.className = 'catalog-table-empty-state__description';
        description.textContent = this.options.emptyDescription;

        emptyState.append(icon, title, description);

        cell.appendChild(emptyState);

        row.appendChild(cell);

        this.body.appendChild(row);
    }

    getColumnCount() {
        let count = this.options.columns.length;

        if (this.options.selectable) {
            count += 1;
        }

        if (this.options.showIndex) {
            count += 1;
        }

        return Math.max(count, 1);
    }

    hideEmpty() {
        this.body?.querySelector('[data-empty-row]')?.remove();
    }

    toggleSort(key) {
        if (this.sort.key !== key) {
            this.sort = {
                key,
                direction: 'asc'
            };
        } else {
            const next = {
                none: 'asc',
                asc: 'desc',
                desc: 'none'
            };

            this.sort.direction = next[this.sort.direction];

            if (this.sort.direction === 'none') {
                this.sort.key = null;
            }
        }

        this.updateSortIcons();

        this.options.onSort?.({
            ...this.sort
        });
    }

    updateSortIcons() {
        this.root?.querySelectorAll('[data-sort-icon]').forEach((icon) => {
            const button = icon.closest('[data-sort-key]');

            const key = button?.dataset.sortKey;

            icon.dataset.sortDirection = key === this.sort.key ? this.sort.direction : 'none';
        });
    }
}

window.MCS.catalog.Table = MCSTable;

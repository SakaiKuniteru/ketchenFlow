'use strict';

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSPagination {
    constructor(root, options = {}) {
        this.root = typeof root === 'string' ? document.querySelector(root) : root;

        this.options = {
            page: 1,
            pageSize: 20,
            total: 0,
            onChange: null,
            ...options
        };

        this.elements = {
            from: this.root?.querySelector('[data-pagination-from]'),
            to: this.root?.querySelector('[data-pagination-to]'),
            total: this.root?.querySelector('[data-pagination-total]'),
            currentPage: this.root?.querySelector('[data-pagination-current-page]'),
            totalPages: this.root?.querySelector('[data-pagination-total-pages]'),
            pageSize: this.root?.querySelector('[data-pagination-size]'),
            pageSizePicker: this.root?.querySelector('[data-pagination-size-picker]'),
            pageSizeToggle: this.root?.querySelector('[data-pagination-size-toggle]'),
            pageSizeLabel: this.root?.querySelector('[data-pagination-size-label]'),
            pageSizeMenu: this.root?.querySelector('[data-pagination-size-menu]'),
            pageSizeOptions: this.root?.querySelectorAll('[data-pagination-size-value]'),
            first: this.root?.querySelector('[data-pagination-first]'),
            previous: this.root?.querySelector('[data-pagination-previous]'),
            next: this.root?.querySelector('[data-pagination-next]'),
            last: this.root?.querySelector('[data-pagination-last]')
        };

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.elements.first?.addEventListener('click', () => {
            this.goTo(1);
        });

        this.elements.previous?.addEventListener('click', () => {
            this.goTo(this.options.page - 1);
        });

        this.elements.next?.addEventListener('click', () => {
            this.goTo(this.options.page + 1);
        });

        this.elements.last?.addEventListener('click', () => {
            this.goTo(this.totalPages);
        });

        this.elements.pageSizeToggle?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const menu = this.elements.pageSizeMenu;

            if (!menu) {
                return;
            }

            const willOpen = menu.hidden;

            menu.hidden = !willOpen;

            this.elements.pageSizeToggle.setAttribute('aria-expanded', String(willOpen));

            this.elements.pageSizePicker?.classList.toggle('is-open', willOpen);
        });

        this.elements.pageSizeOptions?.forEach((option) => {
            option.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                const value = option.dataset.paginationSizeValue;

                const pageSize = Number(value);

                if (!Number.isInteger(pageSize) || pageSize <= 0) {
                    return;
                }

                this.elements.pageSize.value = String(pageSize);

                this.elements.pageSize.dispatchEvent(
                    new Event('change', {
                        bubbles: true
                    })
                );

                this.closePageSizeMenu();
            });
        });

        document.addEventListener('click', (event) => {
            if (this.elements.pageSizePicker?.contains(event.target)) {
                return;
            }

            this.closePageSizeMenu();
        });

        this.elements.pageSize?.addEventListener('change', (event) => {
            const pageSize = Number(event.target.value);

            if (!Number.isFinite(pageSize) || pageSize <= 0) {
                return;
            }

            this.options.pageSize = pageSize;
            this.options.page = 1;

            this.render();
            this.emitChange();
        });
    }

    closePageSizeMenu() {
        if (this.elements.pageSizeMenu) {
            this.elements.pageSizeMenu.hidden = true;
        }

        this.elements.pageSizeToggle?.setAttribute('aria-expanded', 'false');

        this.elements.pageSizePicker?.classList.remove('is-open');
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.options.total / this.options.pageSize));
    }

    setData({ page, pageSize, total } = {}) {
        if (page !== undefined) {
            this.options.page = Math.max(1, Number(page) || 1);
        }

        if (pageSize !== undefined) {
            this.options.pageSize = Math.max(1, Number(pageSize) || 20);
        }

        if (total !== undefined) {
            this.options.total = Math.max(0, Number(total) || 0);
        }

        if (this.options.page > this.totalPages) {
            this.options.page = this.totalPages;
        }

        this.render();
    }

    getState() {
        return {
            page: this.options.page,
            pageSize: this.options.pageSize,
            total: this.options.total,
            totalPages: this.totalPages
        };
    }

    goTo(page) {
        const target = Math.min(this.totalPages, Math.max(1, Number(page) || 1));

        if (target === this.options.page) {
            return;
        }

        this.options.page = target;

        this.render();
        this.emitChange();
    }

    emitChange() {
        this.options.onChange?.(this.getState());
    }

    render() {
        if (!this.root) {
            return;
        }

        const total = this.options.total;
        const page = this.options.page;
        const pageSize = this.options.pageSize;

        const from = total === 0 ? 0 : (page - 1) * pageSize + 1;

        const to = Math.min(total, page * pageSize);

        const numberFormatter = new Intl.NumberFormat('vi-VN');

        if (this.elements.from) {
            this.elements.from.textContent = numberFormatter.format(from);
        }

        if (this.elements.to) {
            this.elements.to.textContent = numberFormatter.format(to);
        }

        if (this.elements.total) {
            this.elements.total.textContent = numberFormatter.format(total);
        }

        if (this.elements.currentPage) {
            this.elements.currentPage.textContent = numberFormatter.format(page);
        }

        if (this.elements.totalPages) {
            this.elements.totalPages.textContent = numberFormatter.format(this.totalPages);
        }

        if (this.elements.pageSize) {
            const value = String(pageSize);

            this.elements.pageSize.value = value;

            if (this.elements.pageSizeLabel) {
                this.elements.pageSizeLabel.textContent = `${pageSize} dòng`;
            }

            this.elements.pageSizeOptions?.forEach((option) => {
                option.classList.toggle('is-selected', option.dataset.paginationSizeValue === value);
            });
        }

        const isFirstPage = page <= 1;

        const isLastPage = page >= this.totalPages;

        if (this.elements.first) {
            this.elements.first.disabled = isFirstPage;
        }

        if (this.elements.previous) {
            this.elements.previous.disabled = isFirstPage;
        }

        if (this.elements.next) {
            this.elements.next.disabled = isLastPage;
        }

        if (this.elements.last) {
            this.elements.last.disabled = isLastPage;
        }
    }
}

window.MCS.catalog.Pagination = MCSPagination;

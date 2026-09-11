'use strict';

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSCatalog {
    constructor(options = {}) {
        this.options = {
            root: '[data-catalog-page]',

            endpoints: {
                list: '',
                detail: '',
                create: '',
                update: ''
            },
            columns: [],
            toolbarActions: [],
            headerActions: [],
            currentPermissionCodes: [],
            onHeaderAction: null,
            permissions: {
                configured: false,
                canView: true,
                canCreate: true,
                canUpdate: true
            },
            rowKey: 'id',
            pageSize: 20,
            clientPagination: true,
            debounce: 350,

            defaultValues: {
                active: true
            },

            form: {},
            table: {},

            mapListResponse: (result) => result?.data || [],

            mapDetailResponse: (result) => result?.data || null,

            buildDetailUrl: (endpoint, id) => `${endpoint}/${id}`,

            buildUpdateUrl: (endpoint, id) => `${endpoint}/${id}`,

            onBeforeLoad: null,
            onAfterLoad: null,
            onRecordLoaded: null,
            onAction: null,

            ...options
        };

        this.access = {
            canView: this.options.permissions?.canView === true,

            canCreate: this.options.permissions?.canCreate === true,

            canUpdate: this.options.permissions?.canUpdate === true
        };

        if (!this.options.permissions?.configured) {
            this.access = {
                canView: true,
                canCreate: true,
                canUpdate: true
            };
        }

        if (this.options.viewOnly) {
            this.access.canCreate = false;
            this.access.canUpdate = false;
        }

        this.root =
            typeof this.options.root === 'string' ? document.querySelector(this.options.root) : this.options.root;

        if (!this.root) {
            throw new Error('Không tìm thấy catalog root.');
        }

        this.state = {
            allData: [],
            filteredData: [],
            visibleData: [],
            selectedId: null,
            keyword: '',
            filters: {},

            sort: {
                key: null,
                direction: 'none'
            },

            page: 1,
            pageSize: this.options.pageSize,
            loading: false
        };

        this.elements = {
            content: this.root.querySelector('[data-catalog-content]'),
            noPermission: this.root.querySelector('[data-catalog-no-permission]'),
            search: this.root.querySelector('[data-catalog-search]'),
            clearSearch: this.root.querySelector('[data-catalog-clear-search]'),
            create: this.root.querySelector('[data-catalog-create]'),
            refresh: this.root.querySelector('[data-catalog-refresh]'),
            filterToggle: this.root.querySelector('[data-catalog-filter-toggle]'),
            filterToggleLabel: this.root.querySelector('[data-filter-toggle-label]'),
            utilityToggle: this.root.querySelector('[data-catalog-utility-toggle]'),
            utilityMenu: this.root.querySelector('[data-catalog-utility-menu]'),
            expandTable: this.root.querySelector('[data-catalog-expand-table]'),
            expandInfo: this.root.querySelector('[data-catalog-expand-info]'),
            tableSection: this.root.querySelector('[data-catalog-table-section]'),
            filterRow: this.root.querySelector('[data-table-filter-row]'),
            clearFilters: this.root.querySelector('[data-clear-table-filters]'),
            total: this.root.querySelector('[data-catalog-total]'),
            detailRoot: this.root.querySelector('[data-catalog-detail-panel]'),
            form: this.root.querySelector('[data-catalog-form]'),
            overlay: this.root.querySelector('[data-catalog-overlay]')
        };

        this.table = new window.MCS.catalog.Table(this.root.querySelector('[data-catalog-table-wrapper]'), {
            columns: this.options.columns,
            rowKey: this.options.rowKey,
            showIndex: true,
            showActions: false,

            onRowClick: async (record) => {
                if (!record) {
                    return;
                }

                const id = record[this.options.rowKey];

                if (id === null || id === undefined) {
                    return;
                }

                if (!this.canView()) {
                    return;
                }

                if (this.canUpdate()) {
                    await this.openUpdate(id);
                    return;
                }

                await this.openDetail(id);
            },

            onSort: (sort) => {
                this.state.sort = sort;

                this.applyState();
            }
        });

        this.pagination = new window.MCS.catalog.Pagination(this.root.querySelector('[data-catalog-pagination]'), {
            page: this.state.page,
            pageSize: this.state.pageSize,
            total: 0,

            onChange: (pagination) => {
                this.state.page = pagination.page;
                this.state.pageSize = pagination.pageSize;

                this.applyPagination();
            }
        });

        this.detailPanel = new window.MCS.catalog.DetailPanel(this.elements.detailRoot, {
            defaultTitle: this.options.detailTitle || 'Thông tin chi tiết',

            headerActions: this.options.headerActions || [],

            currentPermissions: this.options.currentPermissionCodes || [],

            onHeaderAction: (context) => {
                this.options.onHeaderAction?.(context, this);
            },

            onEdit: (record) => {
                if (!record) {
                    return;
                }

                const id = record[this.options.rowKey];

                if (id === null || id === undefined) {
                    return;
                }

                this.openUpdate(id);
            },

            onClose: () => {
                this.table.clearSelection();

                this.state.selectedId = null;

                this.initializeDefaultDetail();
            }
        });

        this.form = new window.MCS.catalog.Form(this.elements.form, {
            ...this.options.form,

            onSubmit: (data, form) => this.submitForm(data, form),

            onCancel: () => this.cancelForm()
        });

        this.toolbar = new window.MCS.catalog.Toolbar(this.root, {
            actions: this.options.toolbarActions,

            onAction: (action) => {
                if (action === 'filter') {
                    this.toggleFilterRow();
                    return;
                }
                this.options.onAction?.(action, null, this);
            }
        });

        this.syncPermissionUI();

        this.lastIsMobile = this.detailPanel.isMobile();

        this.bindEvents();
    }

    canView() {
        return this.access.canView === true;
    }

    canCreate() {
        return this.access.canCreate === true && !this.options.viewOnly;
    }

    canUpdate() {
        return this.access.canUpdate === true && !this.options.viewOnly;
    }

    syncPermissionUI() {
        const allowed = this.canView();

        this.root.hidden = false;

        const noPermission = this.elements.noPermission;

        const pageContent = this.root.closest('.page-content');

        if (!allowed) {
            this.root.classList.add('is-permission-hidden');

            if (noPermission && !noPermission._mcsOriginalParent) {
                noPermission._mcsOriginalParent = noPermission.parentElement;
            }
            if (noPermission && pageContent && noPermission.parentElement !== pageContent) {
                pageContent.appendChild(noPermission);
            }

            if (noPermission) {
                noPermission.hidden = false;
            }

            document.documentElement.classList.add('catalog-permission-denied');

            document.body.classList.add('catalog-permission-denied');

            return;
        }

        this.root.classList.remove('is-permission-hidden');

        if (noPermission) {
            noPermission.hidden = true;

            const originalParent = noPermission._mcsOriginalParent;

            if (originalParent && originalParent.isConnected && noPermission.parentElement !== originalParent) {
                originalParent.appendChild(noPermission);
            }
        }

        document.documentElement.classList.remove('catalog-permission-denied');

        document.body.classList.remove('catalog-permission-denied');

        if (this.elements.content) {
            this.elements.content.hidden = false;
        }

        if (this.elements.create) {
            this.elements.create.hidden = !this.canCreate();
        }
    }

    bindEvents() {
        this.elements.search?.addEventListener(
            'input',
            this.debounce((event) => {
                this.state.keyword = event.target.value.trim();
                this.state.page = 1;

                if (this.elements.clearSearch) {
                    this.elements.clearSearch.hidden = !this.state.keyword;
                }

                this.applyState();
            }, this.options.debounce)
        );

        this.elements.clearSearch?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (this.elements.search) {
                this.elements.search.value = '';
            }

            this.state.keyword = '';
            this.state.page = 1;

            this.elements.clearSearch.hidden = true;

            this.applyState();

            this.elements.search?.focus();
        });

        this.elements.create?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.canCreate()) {
                return;
            }
            this.toolbar?.close();
            this.openCreate();
        });

        this.elements.expandTable?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.toolbar?.close();

            const expanded = !this.root.classList.contains('is-list-expanded');

            this.root.classList.toggle('is-list-expanded', expanded);

            this.elements.expandTable.setAttribute('aria-pressed', String(expanded));

            this.elements.expandTable.setAttribute('aria-label', expanded ? 'Thu nhỏ danh sách' : 'Mở rộng danh sách');

            this.elements.expandTable.setAttribute('title', expanded ? 'Thu nhỏ danh sách' : 'Mở rộng danh sách');
        });

        this.elements.expandInfo?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.toolbar?.close();

            if (this.root.classList.contains('is-list-expanded')) {
                this.root.classList.remove('is-list-expanded');

                this.elements.expandTable?.setAttribute('aria-pressed', 'false');

                if (this.elements.expandTable) {
                    this.elements.expandTable.setAttribute('aria-label', 'Mở rộng danh sách');

                    this.elements.expandTable.setAttribute('title', 'Mở rộng danh sách');
                }
            }

            const expanded = !this.root.classList.contains('is-info-expanded');

            this.root.classList.toggle('is-info-expanded', expanded);

            this.elements.expandInfo.setAttribute('aria-pressed', String(expanded));

            this.elements.expandInfo.setAttribute('aria-label', expanded ? 'Thu nhỏ thông tin' : 'Mở rộng thông tin');

            this.elements.expandInfo.setAttribute('title', expanded ? 'Thu nhỏ thông tin' : 'Mở rộng thông tin');
        });

        this.elements.refresh?.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (this.state.loading) {
                return;
            }

            this.elements.refresh.disabled = true;

            try {
                await this.load();
            } finally {
                this.elements.refresh.disabled = false;
            }
        });

        this.root.addEventListener('input', (event) => {
            const filter = event.target.closest('input[data-filter-key]');

            if (!filter) {
                return;
            }

            this.state.filters[filter.dataset.filterKey] = filter.value;

            this.state.page = 1;

            this.applyState();
        });

        this.root.addEventListener('change', (event) => {
            const nativeSelect = event.target.closest('[data-smart-select-native]');

            const smartFilter = nativeSelect?.closest('[data-catalog-filter-select]' + '[data-filter-key]');

            if (!smartFilter) {
                return;
            }

            let value = nativeSelect.value;

            if (value === '__ALL__') {
                value = '';
            }

            this.state.filters[smartFilter.dataset.filterKey] = value;

            this.state.page = 1;

            this.applyState();
        });

        this.elements.clearFilters?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.clearFilters();
        });

        this.elements.overlay?.addEventListener('click', (event) => {
            event.preventDefault();

            this.detailPanel.close();
        });

        this.handleWindowResize = this.debounce(() => {
            this.syncResponsiveState();
        }, 120);

        window.addEventListener('resize', this.handleWindowResize);
    }

    async initialize() {
        this.syncPermissionUI();

        if (!this.canView()) {
            return this;
        }

        await this.load();

        if (this.detailPanel.isMobile()) {
            this.detailPanel.close();
            return this;
        }

        if (this.canCreate()) {
            this.openCreate();
            return this;
        }

        this.initializeDefaultDetail();

        return this;
    }

    initializeDefaultDetail() {
        if (!this.canView()) {
            this.table.clearSelection();
            this.state.selectedId = null;

            if (this.elements.detailRoot) {
                this.elements.detailRoot.hidden = true;
            }
            return;
        }

        if (this.detailPanel.isMobile()) {
            this.detailPanel.close();
            this.table.clearSelection();
            this.state.selectedId = null;
            return;
        }

        if (this.canCreate()) {
            this.openCreate();
            return;
        }
        this.table.clearSelection();
        this.state.selectedId = null;
        this.form.clear();
        this.form.setMode('view');
        this.detailPanel.showDefault({
            title: this.options.detailTitle || 'Thông tin chi tiết'
        });
    }

    syncResponsiveState() {
        const isMobile = this.detailPanel.isMobile();

        if (isMobile === this.lastIsMobile) {
            return;
        }

        this.lastIsMobile = isMobile;

        if (isMobile) {
            this.root.classList.remove('is-list-expanded', 'is-info-expanded');

            this.elements.expandTable?.setAttribute('aria-pressed', 'false');

            this.elements.expandInfo?.setAttribute('aria-pressed', 'false');

            if (this.elements.detailRoot) {
                this.elements.detailRoot.classList.remove('is-open', 'is-expanded');

                this.elements.detailRoot.hidden = true;

                this.elements.detailRoot.dataset.panelMode = 'closed';
            }

            document.body.classList.remove('catalog-panel-open');

            return;
        }

        if (this.elements.detailRoot) {
            this.elements.detailRoot.hidden = false;

            this.elements.detailRoot.classList.add('is-open');

            this.elements.detailRoot.dataset.panelMode = this.detailPanel.mode;
        }

        document.body.classList.remove('catalog-panel-open');

        if (this.canCreate() && this.detailPanel.mode === 'view' && this.state.selectedId === null) {
            this.openCreate();
        }
    }

    toggleFilterRow() {
        const filterRow = this.elements.filterRow;

        if (!filterRow) {
            return;
        }

        const button = this.root.querySelector('[data-catalog-toolbar-action="filter"]');

        const willOpen = filterRow.hidden;

        filterRow.hidden = !willOpen;

        if (button) {
            button.classList.toggle('is-active', willOpen);

            button.setAttribute('aria-expanded', String(willOpen));

            const label = button.querySelector('span');

            if (label) {
                label.textContent = willOpen ? 'Đóng tìm kiếm chi tiết' : 'Tìm kiếm chi tiết';
            }
        }

        this.toolbar?.close();

        if (willOpen) {
            filterRow.querySelector('input, select')?.focus();
        }
    }

    async load() {
        if (!this.canView()) {
            this.state.allData = [];
            this.state.filteredData = [];
            this.state.visibleData = [];

            return [];
        }
        if (!this.options.endpoints.list) {
            throw new Error('Chưa cấu hình API danh sách.');
        }

        this.setLoading(true);

        try {
            this.options.onBeforeLoad?.(this);

            const result = await window.MCS.api.request(this.options.endpoints.list);

            const mapped = this.options.mapListResponse(result);

            const list = Array.isArray(mapped) ? mapped : mapped?.items || mapped?.data || [];

            this.state.allData = Array.isArray(list)
                ? list.filter((record) => {
                      if (!record || typeof record !== 'object') {
                          return false;
                      }

                      const id = record[this.options.rowKey];

                      return id !== null && id !== undefined && id !== '';
                  })
                : [];

            this.applyState();

            this.options.onAfterLoad?.(this.state.allData, this);
        } catch (error) {
            window.MCS.toast?.error(error.message || 'Không thể tải dữ liệu.');

            this.state.allData = [];

            this.applyState();

            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    applyState() {
        let data = [...this.state.allData];

        data = this.applySearch(data);
        data = this.applyFilters(data);
        data = this.applySort(data);

        this.state.filteredData = data;

        const totalPages = Math.max(1, Math.ceil(data.length / this.state.pageSize));

        this.state.page = Math.min(Math.max(1, this.state.page), totalPages);

        this.pagination.setData({
            page: this.state.page,
            pageSize: this.state.pageSize,
            total: data.length
        });

        this.applyPagination();

        this.updateTotal();
    }

    applySearch(data) {
        const keyword = this.normalizeText(this.state.keyword);

        if (!keyword) {
            return data;
        }

        const searchableColumns = this.options.columns.filter((column) => column.searchable !== false);

        return data.filter((record) => {
            return searchableColumns.some((column) => {
                const value = this.resolveValue(record, column.key);

                return this.normalizeText(value).includes(keyword);
            });
        });
    }

    applyFilters(data) {
        const filters = Object.entries(this.state.filters).filter(
            ([, value]) => value !== '' && value !== null && value !== undefined
        );

        if (filters.length === 0) {
            return data;
        }

        return data.filter((record) => {
            return filters.every(([key, expected]) => {
                const actual = this.resolveValue(record, key);

                if (String(expected) === 'true') {
                    return actual === true;
                }

                if (String(expected) === 'false') {
                    return actual === false;
                }

                return this.normalizeText(actual).includes(this.normalizeText(expected));
            });
        });
    }

    applySort(data) {
        const { key, direction } = this.state.sort;

        if (!key || direction === 'none') {
            return data;
        }

        return [...data].sort((first, second) => {
            const firstValue = this.resolveValue(first, key);

            const secondValue = this.resolveValue(second, key);

            const result = this.compareValues(firstValue, secondValue);

            return direction === 'asc' ? result : -result;
        });
    }

    applyPagination() {
        const start = (this.state.page - 1) * this.state.pageSize;

        const end = start + this.state.pageSize;

        this.state.visibleData = this.state.filteredData.slice(start, end);

        this.table.options.offset = start;

        this.table.setData(this.state.visibleData);

        if (this.state.selectedId !== null) {
            this.table.selectRow(this.state.selectedId);
        }
    }

    async openDetail(id) {
        if (!this.canView()) {
            return null;
        }
        const record = await this.getDetail(id);

        if (!record) {
            return;
        }
        this.state.selectedId = id;
        this.table.selectRow(id);
        this.form.setMode('view');
        this.form.setData(this.mapRecordToForm(record));

        this.detailPanel.showForm({
            mode: 'view',
            record,

            title: this.options.detailTitle || 'Thông tin chi tiết',

            subtitle: this.getRecordSubtitle(record)
        });

        this.options.onRecordLoaded?.(record, 'view', this);
    }

    openCreate() {
        if (!this.canCreate()) {
            return;
        }

        this.state.selectedId = null;
        this.table.clearSelection();
        this.form.clear();
        this.form.setMode('create');
        this.form.setData(
            this.options.defaultValues || {
                active: true
            }
        );

        this.detailPanel.showForm({
            mode: 'create',
            record: null,

            title: this.options.createTitle || 'Thêm mới',

            subtitle: ''
        });

        this.options.onRecordLoaded?.(null, 'create', this);
    }

    async openUpdate(id) {
        if (!this.canUpdate()) {
            if (this.canView()) {
                return this.openDetail(id);
            }

            return null;
        }

        const record = await this.getDetail(id);

        if (!record) {
            return;
        }
        this.state.selectedId = id;
        this.table.selectRow(id);
        this.form.setMode('update');
        this.form.setData(this.mapRecordToForm(record));

        this.detailPanel.showForm({
            mode: 'update',
            record,

            title: this.options.updateTitle || 'Cập nhật',

            subtitle: this.getRecordSubtitle(record)
        });

        this.options.onRecordLoaded?.(record, 'update', this);
    }

    async getDetail(id) {
        if (!this.canView()) {
            return null;
        }
        const local = this.state.allData.find((item) => String(item[this.options.rowKey]) === String(id));

        if (!this.options.endpoints.detail) {
            return local || null;
        }

        this.setLoading(true);

        try {
            const url = this.options.buildDetailUrl(this.options.endpoints.detail, id);

            const result = await window.MCS.api.request(url);

            return this.options.mapDetailResponse(result);
        } catch (error) {
            window.MCS.toast?.error(error.message || 'Không thể lấy chi tiết dữ liệu.');

            return null;
        } finally {
            this.setLoading(false);
        }
    }

    hasFile(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        return Object.values(data).some(
            (value) => value instanceof File || (Array.isArray(value) && value.some((item) => item instanceof File))
        );
    }

    buildRequestBody(data) {
        if (data instanceof FormData) {
            return data;
        }

        if (!this.hasFile(data)) {
            return JSON.stringify(data);
        }

        const body = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            if (value instanceof File) {
                body.append(key, value);

                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    body.append(key, String(item));
                });

                return;
            }

            body.append(key, String(value));
        });

        return body;
    }

    async submitForm(data, form) {
        const mode = form.options.mode;

        const isCreate = mode === 'create';
        if (isCreate && !this.canCreate()) {
            return null;
        }

        if (!isCreate && !this.canUpdate()) {
            return null;
        }
        const id = this.state.selectedId;

        let url;
        let method;

        if (isCreate) {
            url = this.options.endpoints.create;

            method = 'POST';
        } else {
            if (id === null || id === undefined) {
                throw new Error('Chưa chọn dữ liệu cần cập nhật.');
            }

            url = this.options.buildUpdateUrl(this.options.endpoints.update, id);

            method = 'PATCH';
        }

        if (!url) {
            throw new Error('Chưa cấu hình API lưu dữ liệu.');
        }

        try {
            const result = await window.MCS.api.request(url, {
                method,

                body: this.buildRequestBody(data)
            });

            const saved = result?.data || null;

            window.MCS.toast?.success(
                result?.message || (isCreate ? 'Thêm dữ liệu thành công.' : 'Cập nhật dữ liệu thành công.')
            );

            await this.load();

            if (saved) {
                const savedId = saved[this.options.rowKey];

                if (savedId !== null && savedId !== undefined) {
                    this.state.selectedId = savedId;

                    await this.openUpdate(savedId);
                }
            }

            return saved;
        } catch (error) {
            let handled = false;

            if (typeof this.options.onSubmitError === 'function') {
                handled =
                    this.options.onSubmitError(error, {
                        mode,
                        id,
                        form,
                        catalog: this
                    }) === true;
            }

            if (!handled) {
                window.MCS.toast?.error(error?.message || 'Không thể lưu dữ liệu.');
            }

            throw error;
        }
    }

    cancelForm() {
        if (this.form.isDirty) {
            window.MCS.confirm?.show({
                title: 'Hủy thay đổi',

                message: 'Dữ liệu chưa được lưu. Bạn có chắc chắn muốn hủy thay đổi không?',

                confirmLabel: 'Hủy thay đổi',

                type: 'danger',

                onConfirm: () => this.finishCancel()
            });

            return;
        }

        this.finishCancel();
    }

    finishCancel() {
        this.initializeDefaultDetail();
    }

    async handleAction(action, id) {
        switch (action) {
            case 'view':
                await this.openDetail(id);

                break;

            case 'edit':
                if (!this.options.viewOnly) {
                    await this.openUpdate(id);
                }

                break;

            case 'lock':
                await this.confirmActiveChange(id, false);

                break;

            case 'unlock':
                await this.confirmActiveChange(id, true);

                break;

            default:
                this.options.onAction?.(action, id, this);
        }
    }

    async confirmActiveChange(id, active) {
        if (!this.canUpdate()) {
            return;
        }
        window.MCS.confirm?.show({
            title: active ? 'Mở khóa dữ liệu' : 'Khóa dữ liệu',

            message: active
                ? 'Bạn có chắc chắn muốn mở khóa dữ liệu này không?'
                : 'Bạn có chắc chắn muốn khóa dữ liệu này không?',

            confirmLabel: active ? 'Mở khóa' : 'Khóa',

            type: active ? 'primary' : 'danger',

            onConfirm: async () => {
                const url = this.options.buildUpdateUrl(this.options.endpoints.update, id);

                const result = await window.MCS.api.request(url, {
                    method: 'PATCH',

                    body: JSON.stringify({
                        active
                    })
                });

                window.MCS.toast?.success(result?.message || (active ? 'Mở khóa thành công.' : 'Khóa thành công.'));

                await this.load();

                await this.openDetail(id);
            }
        });
    }

    clearFilters() {
        this.state.filters = {};

        this.root.querySelectorAll('input[data-filter-key]').forEach((field) => {
            field.value = '';
        });

        this.root.querySelectorAll('[data-catalog-filter-select]').forEach((filter) => {
            const select = filter.querySelector('[data-smart-select-native]');

            if (!select) {
                return;
            }

            select.value = '';

            const root = select.closest('[data-smart-select]');

            root?.smartSelect?.setValue?.('', false);
        });

        this.state.page = 1;

        this.applyState();
    }

    setLoading(loading) {
        this.state.loading = loading;

        this.table[loading ? 'showLoading' : 'hideLoading']();

        this.root.classList.toggle('is-loading', loading);
    }

    updateTotal() {
        if (!this.elements.total) {
            return;
        }

        this.elements.total.textContent = `${new Intl.NumberFormat('vi-VN').format(
            this.state.filteredData.length
        )} bản ghi`;
    }

    mapRecordToForm(record) {
        if (typeof this.options.mapRecordToForm === 'function') {
            return this.options.mapRecordToForm(record, this);
        }

        return record;
    }

    getRecordSubtitle(record) {
        if (typeof this.options.getRecordSubtitle === 'function') {
            return this.options.getRecordSubtitle(record);
        }

        return record?.ma || record?.maCoSo || record?.maPhongBan || record?.maChucVu || '';
    }

    resolveValue(object, path) {
        if (!path) {
            return undefined;
        }

        return String(path)
            .split('.')
            .reduce((value, key) => value?.[key], object);
    }

    normalizeText(value) {
        if (window.MCS?.searchPicker && typeof window.MCS.searchPicker.normalizeText === 'function') {
            return window.MCS.searchPicker.normalizeText(value);
        }

        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    compareValues(first, second) {
        if (first === second) {
            return 0;
        }

        if (first === null || first === undefined) {
            return 1;
        }

        if (second === null || second === undefined) {
            return -1;
        }

        if (typeof first === 'number' && typeof second === 'number') {
            return first - second;
        }

        if (typeof first === 'boolean' && typeof second === 'boolean') {
            return Number(first) - Number(second);
        }

        return String(first).localeCompare(String(second), 'vi', {
            sensitivity: 'base',
            numeric: true
        });
    }

    debounce(callback, delay) {
        let timeout;

        return (...args) => {
            window.clearTimeout(timeout);

            timeout = window.setTimeout(() => callback(...args), delay);
        };
    }
}

window.MCS.catalog.Catalog = MCSCatalog;

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/thuc-don';
    const pageRoot = document.querySelector('[data-module-list-page="thuc-don"]');

    const permission = window.ThucDon.permission;

    let permissions = new Set();
    const TRANG_THAI_THUC_DON = Object.freeze({
        TAO_MOI: 10,
        CHO_DUYET: 20,
        DANG_AP_DUNG: 30,
        CHO_DUYET_LAI: 40,
        DA_HUY: 50,
        DA_KET_THUC: 60
    });
    const ACTIONS = {
        view: {
            icon: 'fa-regular fa-eye',
            title: 'Xem chi tiết',
            className: 'is-view'
        },
        print: {
            icon: 'fa-solid fa-print',
            title: 'In thực đơn',
            className: 'is-print'
        },
        delete: {
            icon: 'fa-regular fa-trash-can',
            title: 'Xóa',
            className: 'is-delete'
        }
    };
    const state = {
        keyword: '',
        loaiThucDon: [],
        coSoId: [],
        nhaAnId: [],
        caAnId: [],
        trangThai: [],
        page: 1,
        limit: 20
    };
    const lookupData = {
        loaiThucDon: [],
        trangThai: [],
        coSo: [],
        nhaAn: [],
        caAn: []
    };
    const elements = {
        search: document.querySelector('[data-list-search]'),
        clearSearch: document.querySelector('[data-list-clear-search]'),
        body: document.querySelector('[data-list-body]'),
        empty: document.querySelector('[data-list-empty]'),
        filterToggle: document.querySelector('[data-list-filter-toggle]'),
        filterPanel: document.querySelector('[data-list-filter-panel]'),
        applyFilter: document.querySelector('[data-list-filter-apply]'),
        resetFilter: document.querySelector('[data-list-filter-reset]'),
        pagination: document.querySelector('#thucDonPagination')
    };
    let pagination = null;

    initialize();

    async function initialize() {
        try {
            permissions = await permission.load();
        } catch (error) {
            console.error('Không thể tải quyền thực đơn:', error);

            permission.showNoPermission(pageRoot);

            return;
        }

        if (!permission.canView(permissions)) {
            permission.showNoPermission(pageRoot);
            return;
        }

        applyPermissionUI();
        initializePagination();
        bindEvents();
        await loadFilterOptions();
        initializeFilterClearButtons();
        initializeFilterSearchBehavior();
        await loadData();
    }

    function applyPermissionUI() {
        const createButton = document.querySelector('[data-list-create]');

        if (createButton) {
            createButton.hidden = !permission.canCreate(permissions);
        }
    }

    function initializeFilterClearButtons() {
        const ids = ['loaiThucDon', 'coSoId', 'nhaAnId', 'caAnId', 'trangThai'];

        ids.forEach((id) => {
            initializeFilterClearButton(id);
        });
    }

    function initializeFilterSearchBehavior() {
        const roots = document.querySelectorAll('.thuc-don-list-filter [data-smart-select]');

        roots.forEach((root) => {
            const search = root.querySelector('[data-smart-select-search]');

            if (!search || search.dataset.thucDonFilterSearchBound === 'true') {
                return;
            }

            search.dataset.thucDonFilterSearchBound = 'true';

            const clearPlaceholder = () => {
                search.placeholder = '';
            };

            search.addEventListener('focus', clearPlaceholder);
            search.addEventListener('input', clearPlaceholder);

            root.addEventListener('click', () => {
                requestAnimationFrame(clearPlaceholder);
            });
        });
    }

    function initializeFilterClearButton(id) {
        const select = document.getElementById(id);

        if (!select) {
            return;
        }

        const root = select.closest('[data-smart-select]');
        const control = root?.querySelector('[data-smart-select-control]');

        if (!root || !control) {
            return;
        }

        let clearButton = control.querySelector('[data-filter-select-clear]');

        if (!clearButton) {
            clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'thuc-don-filter-select__clear';
            clearButton.dataset.filterSelectClear = id;
            clearButton.setAttribute('aria-label', 'Xóa lựa chọn');
            clearButton.setAttribute('title', 'Xóa lựa chọn');
            clearButton.innerHTML = `
                    <i
                        class="fa-solid fa-xmark"
                        aria-hidden="true">
                    </i>
                `;

            clearButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                clearFilterSelect(id);
            });

            control.appendChild(clearButton);
        }

        const updateClearButton = () => {
            const hasValue = Array.from(select.selectedOptions || []).some((option) => option.value);

            clearButton.hidden = !hasValue;

            root.classList.toggle('has-filter-value', hasValue);
        };

        if (!select.dataset.filterClearBound) {
            select.addEventListener('change', updateClearButton);
            select.dataset.filterClearBound = 'true';
        }

        updateClearButton();
    }

    function clearFilterSelect(id) {
        const select = document.getElementById(id);

        if (!select) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.selected = false;
        });

        select.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );

        const root = select.closest('[data-smart-select]');

        if (root?.smartSelect?.refresh) {
            root.smartSelect.refresh();
        }

        readFilterState();

        state.page = 1;

        if (id === 'coSoId') {
            refreshNhaAnFilter([]);
        }

        loadData();
    }

    function initializePagination() {
        if (!elements.pagination || !window.MCS?.catalog?.Pagination) {
            return;
        }

        pagination = new window.MCS.catalog.Pagination(elements.pagination, {
            page: state.page,
            pageSize: state.limit,
            total: 0,
            onChange: async (paginationState) => {
                state.page = paginationState.page;
                state.limit = paginationState.pageSize;

                await loadData();
            }
        });
    }

    function bindEvents() {
        bindFilter();
        bindSearch();
        bindTableActions();
        bindFilterDependencies();
    }

    function openDetail(id) {
        if (!permission.canView(permissions)) {
            return;
        }

        window.location.href = `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`;
    }

    function bindFilter() {
        elements.filterToggle?.addEventListener('click', () => {
            const open = elements.filterPanel.hidden;

            elements.filterPanel.hidden = !open;

            elements.filterToggle.classList.toggle('is-active', open);
        });

        const filterSelectIds = ['loaiThucDon', 'coSoId', 'nhaAnId', 'caAnId', 'trangThai'];

        filterSelectIds.forEach((id) => {
            const select = document.getElementById(id);

            if (!select) {
                return;
            }

            select.addEventListener('change', async () => {
                readFilterState();

                state.page = 1;

                await loadData();
            });
        });

        elements.resetFilter?.addEventListener('click', async () => {
            resetFilters();

            state.page = 1;

            await loadData();
        });
    }

    function bindFilterDependencies() {
        const coSoSelect = document.getElementById('coSoId');

        coSoSelect?.addEventListener('change', () => {
            const coSoIds = getMultiValues('coSoId');

            refreshNhaAnFilter(coSoIds);
        });
    }

    function refreshNhaAnFilter(coSoIds) {
        let records = lookupData.nhaAn;

        if (Array.isArray(coSoIds) && coSoIds.length) {
            const ids = new Set(coSoIds.map((value) => String(value)));

            records = lookupData.nhaAn.filter((item) => ids.has(String(item.coSoId ?? item.coSo?.id)));
        }

        refreshSelectOptions(
            'nhaAnId',
            records,
            (item) => item.id,
            (item) => item.tenNhaAn
        );

        initializeFilterClearButton('nhaAnId');
    }

    function bindSearch() {
        if (!elements.search) {
            return;
        }

        const updateClearButton = () => {
            if (elements.clearSearch) {
                elements.clearSearch.hidden = !elements.search.value.trim();
            }
        };

        elements.search.addEventListener(
            'input',
            debounce(async (event) => {
                state.keyword = event.target.value.trim();

                state.page = 1;

                updateClearButton();

                await loadData();
            }, 350)
        );

        elements.clearSearch?.addEventListener('click', async (event) => {
            event.preventDefault();

            elements.search.value = '';
            state.keyword = '';
            state.page = 1;

            updateClearButton();

            elements.search.focus();

            await loadData();
        });

        updateClearButton();
    }

    function bindTableActions() {
        elements.body?.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-action]');

            if (button) {
                event.preventDefault();
                event.stopPropagation();

                const action = button.dataset.action;
                const id = Number(button.dataset.id);

                if (!id) {
                    return;
                }

                switch (action) {
                    case 'view':
                        openDetail(id);
                        return;

                    case 'print':
                        return;

                    case 'delete':
                        await deleteRecord(id);
                        return;
                }
            }

            const row = event.target.closest('tr[data-record-id]');

            if (!row) {
                return;
            }

            const id = Number(row.dataset.recordId);

            if (!id || !permission.canView(permissions)) {
                return;
            }
            openDetail(id);
        });
    }

    async function loadData() {
        try {
            setLoading(true);

            const query = buildQuery();

            const response = await window.MCS.api.request(`${API_BASE}/tong-hop?${query}`);

            const result = normalizeListResponse(response);

            renderRows(result.items);

            pagination?.setData({
                page: result.page,
                pageSize: result.limit,
                total: result.total
            });
        } catch (error) {
            console.error(error);

            renderRows([]);

            showError(error?.message || 'Không thể tải danh sách thực đơn.');
        } finally {
            setLoading(false);
        }
    }

    function normalizeListResponse(response) {
        const data = response?.data;

        if (Array.isArray(data)) {
            return {
                items: data,
                total: data.length,
                page: state.page,
                limit: state.limit
            };
        }

        const items = data?.danhSach || data?.items || data?.rows || [];

        return {
            items: Array.isArray(items) ? items : [],
            total: Number(data?.total || data?.tongSoBanGhi || data?.tongSo || items.length || 0),
            page: Number(data?.page || state.page),
            limit: Number(data?.limit || state.limit)
        };
    }

    function buildQuery() {
        const params = new URLSearchParams();

        if (state.keyword) {
            params.set('keyword', state.keyword);
        }

        appendArray(params, 'loaiThucDon', state.loaiThucDon);
        appendArray(params, 'coSoId', state.coSoId);
        appendArray(params, 'nhaAnId', state.nhaAnId);
        appendArray(params, 'caAnId', state.caAnId);
        appendArray(params, 'trangThai', state.trangThai);

        params.set('page', String(state.page));
        params.set('limit', String(state.limit));

        return params.toString();
    }

    function appendArray(params, key, values) {
        if (!Array.isArray(values) || values.length === 0) {
            return;
        }

        params.set(key, values.join(','));
    }

    function readFilterState() {
        state.loaiThucDon = getMultiValues('loaiThucDon');
        state.coSoId = getMultiValues('coSoId');
        state.nhaAnId = getMultiValues('nhaAnId');
        state.caAnId = getMultiValues('caAnId');
        state.trangThai = getMultiValues('trangThai');
    }

    function getMultiValues(id) {
        const select = document.getElementById(id);

        if (!select) {
            return [];
        }

        const values = Array.from(select.selectedOptions || [])
            .map((option) => option.value)
            .filter((value) => value && value !== '__ALL__');

        return values;
    }

    function resetFilters() {
        state.loaiThucDon = [];
        state.coSoId = [];
        state.nhaAnId = [];
        state.caAnId = [];
        state.trangThai = [];

        elements.filterPanel?.querySelectorAll('[data-smart-select]').forEach((root) => {
            const native = root.querySelector('[data-smart-select-native]');

            if (!native) {
                return;
            }

            Array.from(native.options).forEach((option) => {
                option.selected = false;
            });

            native.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );
        });

        refreshNhaAnFilter([]);
    }

    function resetDateRange(id, time) {
        const hidden = document.getElementById(id);
        const display = document.getElementById(`${id}Display`);

        if (!hidden || !display) {
            return;
        }

        const now = new Date();
        const year = now.getFullYear();

        const month = String(now.getMonth() + 1).padStart(2, '0');

        const day = String(now.getDate()).padStart(2, '0');

        hidden.value = `${year}-${month}-${day} ${time}`;
        display.value = `${day}/${month}/${year} ${time}`;

        hidden.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function renderAction(action, id) {
        if (action === 'view' && !permission.canView(permissions)) {
            return '';
        }

        if (action === 'delete' && !permission.canDelete(permissions)) {
            return '';
        }
        const config = ACTIONS[action];

        if (!config) {
            return '';
        }

        return `
                <button
                    type="button"
                    class="
                        module-list-table__action
                        ${config.className || ''}
                    "
                    data-action="${action}"
                    data-id="${id}"
                    title="${config.title}"
                    aria-label="${config.title}">
                    <i
                        class="${config.icon}">
                    </i>
                </button>
            `;
    }

    function renderRows(danhSach) {
        if (!elements.body) {
            return;
        }

        elements.body.innerHTML = '';

        if (!Array.isArray(danhSach) || danhSach.length === 0) {
            if (elements.empty) {
                elements.empty.hidden = false;
            }

            return;
        }

        if (elements.empty) {
            elements.empty.hidden = true;
        }

        danhSach.forEach((item) => {
            const row = document.createElement('tr');

            row.dataset.recordId = String(item.id);

            row.innerHTML = `
                        <td>
                            <strong
                                class="
                                    thuc-don-list-code
                                ">
                                ${escapeHtml(item.maThucDon || '')}
                            </strong>
                        </td>
                        <td>
                            <span
                                class="
                                    thuc-don-list-name
                                ">
                                ${escapeHtml(item.tenThucDon || '')}
                            </span>
                        </td>
                        <td>
                            ${renderMenuType(item.loaiThucDon)}
                        </td>
                        <td>
                            ${escapeHtml(item.tenCoSo || item.coSo?.tenCoSo || '-')}
                        </td>
                        <td>
                            ${escapeHtml(item.tenNhaAn || item.nhaAn?.tenNhaAn || '-')}
                        </td>
                        <td>
                            ${escapeHtml(item.tenCaAn || item.caAn?.tenCaAn || '-')}
                        </td>
                        <td>
                            ${renderStatus(item)}
                        </td>
                        <td>
                            <div
                                class="
                                    module-list-table__row-actions
                                ">
                                ${renderAction('view', item.id)}
                                ${renderAction('print', item.id)}
                                ${renderAction('delete', item.id)}
                            </div>
                        </td>
                    `;

            elements.body.appendChild(row);
        });
    }

    function renderMenuType(value) {
        const type = Number(value);

        const label = getEnumLabel(lookupData.loaiThucDon, type);

        return `
                <span
                    class="
                        thuc-don-list-type
                        type-${type}
                    ">
                    ${escapeHtml(label)}
                </span>
            `;
    }

    function renderStatus(item) {
        const status = Number(item.trangThai);

        const text = getEnumLabel(lookupData.trangThai, status);

        return `
                <span
                    class="
                        thuc-don-list-status
                        ${getStatusClass(status)}
                    ">
                    <span
                        class="
                            thuc-don-list-status__dot
                        ">
                    </span>
                    <span>
                        ${escapeHtml(text)}
                    </span>
                </span>
            `;
    }

    function getEnumLabel(list, value) {
        const item = (Array.isArray(list) ? list : []).find((option) => String(option.value) === String(value));

        return item?.label || item?.name || '-';
    }

    async function deleteRecord(id) {
        if (!permission.canDelete(permissions)) {
            return;
        }
        const executeDelete = async () => {
            try {
                setLoading(true);

                const response = await window.MCS.api.request(`${API_BASE}/xoa/${id}`, {
                    method: 'DELETE'
                });

                showSuccess(response?.message || 'Xóa thực đơn thành công.');

                await loadData();
            } catch (error) {
                console.error(error);

                showError(error?.message || 'Xóa thực đơn thất bại.');
            } finally {
                setLoading(false);
            }
        };

        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title: 'Xác nhận xóa',
                message: 'Bạn có chắc chắn muốn xóa thực đơn này không?',
                confirmLabel: 'Xóa',
                type: 'danger',
                onConfirm: executeDelete
            });

            return;
        }

        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa thực đơn này không?');

        if (confirmed) {
            await executeDelete();
        }
    }

    function showSuccess(message) {
        if (window.MCS?.toast?.success) {
            window.MCS.toast.success(message);

            return;
        }

        console.log(message);
    }

    function showError(message) {
        if (window.MCS?.toast?.error) {
            window.MCS.toast.error(message);

            return;
        }

        console.error(message);
    }

    function setLoading(loading) {
        if (loading && window.MCS?.loading?.show) {
            window.MCS.loading.show();

            return;
        }

        if (!loading && window.MCS?.loading?.hide) {
            window.MCS.loading.hide();
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function debounce(callback, delay) {
        let timeout;

        return (...args) => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }

    function normalizeActiveRecords(data) {
        const records = Array.isArray(data) ? data : data?.items || data?.rows || data?.danhSach || [];

        return records.filter((item) => item?.active === true);
    }

    function refreshSelectOptions(id, records, getValue, getLabel) {
        const select = document.getElementById(id);

        if (!select) {
            return;
        }

        const allOption = select.querySelector('option[value="__ALL__"]');

        select.innerHTML = '';

        if (allOption) {
            select.appendChild(allOption);
        } else {
            const option = document.createElement('option');

            option.value = '__ALL__';
            option.textContent = 'Tất cả';

            select.appendChild(option);
        }

        records.forEach((record) => {
            const option = document.createElement('option');

            option.value = String(getValue(record));
            option.textContent = getLabel(record) || '';

            select.appendChild(option);
        });

        const smartSelectRoot = select.closest('[data-smart-select]');

        if (smartSelectRoot?.smartSelect?.refresh) {
            smartSelectRoot.smartSelect.refresh();
        } else {
            window.MCS?.smartSelect?.initialize(smartSelectRoot);
        }
    }

    async function loadFilterOptions() {
        try {
            const [enumsResponse, coSoResponse, nhaAnResponse, caAnResponse] = await Promise.all([
                window.MCS.api.request('/api/mcs/v1/enums'),
                window.MCS.api.request('/api/mcs/v1/dm-co-so/tong-hop?active=true'),
                window.MCS.api.request('/api/mcs/v1/dm-nha-an/tong-hop?active=true'),
                window.MCS.api.request('/api/mcs/v1/dm-ca-an/tong-hop?active=true')
            ]);

            const enums = enumsResponse?.data ?? enumsResponse ?? {};

            lookupData.loaiThucDon = Array.isArray(enums.loaiThucDon) ? enums.loaiThucDon : [];

            lookupData.trangThai = Array.isArray(enums.trangThaiThucDon) ? enums.trangThaiThucDon : [];

            lookupData.coSo = normalizeActiveRecords(coSoResponse?.data);
            lookupData.nhaAn = normalizeActiveRecords(nhaAnResponse?.data);
            lookupData.caAn = normalizeActiveRecords(caAnResponse?.data);

            refreshSelectOptions(
                'loaiThucDon',
                lookupData.loaiThucDon,
                (item) => item.value,
                (item) => item.label || item.name || '-'
            );

            refreshSelectOptions(
                'trangThai',
                lookupData.trangThai,
                (item) => item.value,
                (item) => item.label || item.name || '-'
            );

            refreshSelectOptions(
                'coSoId',
                lookupData.coSo,
                (item) => item.id,
                (item) => item.tenCoSo
            );

            refreshSelectOptions(
                'nhaAnId',
                lookupData.nhaAn,
                (item) => item.id,
                (item) => item.tenNhaAn
            );

            refreshSelectOptions(
                'caAnId',
                lookupData.caAn,
                (item) => item.id,
                (item) => item.tenCaAn
            );
        } catch (error) {
            console.error('Không tải được dữ liệu bộ lọc:', error);
        }
    }

    function getStatusClass(status) {
        switch (Number(status)) {
            case TRANG_THAI_THUC_DON.TAO_MOI:
                return 'is-new';

            case TRANG_THAI_THUC_DON.CHO_DUYET:
                return 'is-pending';

            case TRANG_THAI_THUC_DON.DANG_AP_DUNG:
                return 'is-active';

            case TRANG_THAI_THUC_DON.CHO_DUYET_LAI:
                return 'is-review';

            case TRANG_THAI_THUC_DON.DA_HUY:
                return 'is-cancelled';

            case TRANG_THAI_THUC_DON.DA_KET_THUC:
                return 'is-ended';

            default:
                return 'is-default';
        }
    }
});

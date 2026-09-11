'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-vote-list-page]');

    if (!root) {
        return;
    }

    const API = {
        current: '/api/mcs/v1/binh-chon/cua-toi/hien-tai',
        upcoming: '/api/mcs/v1/binh-chon/cua-toi/sap-toi',
        history: '/api/mcs/v1/binh-chon/cua-toi/lich-su',
        nhaAn: '/api/mcs/v1/dm-nha-an/tong-hop?active=true',
        caAn: '/api/mcs/v1/dm-ca-an/tong-hop?active=true'
    };

    const PAGE_SIZE = 20;
    let pagination = null;

    const elements = {
        list: root.querySelector('[data-vote-list-items]'),
        loading: root.querySelector('[data-vote-list-loading]'),
        empty: root.querySelector('[data-vote-list-empty]'),
        pagination: root.querySelector('[data-vote-list-pagination]'),
        tabs: root.querySelectorAll('[data-vote-tab]'),
        search: root.querySelector('#binhChonSearch') || root.querySelector('.vote-list-search input'),
        filter: root.querySelector('[data-vote-filter]'),
        filterToggle: root.querySelector('[data-vote-filter-toggle]'),
        filterDropdown: root.querySelector('[data-vote-filter-dropdown]'),
        filterClose: root.querySelector('[data-vote-filter-close]'),
        filterReset: root.querySelector('[data-vote-filter-reset]'),
        filterApply: root.querySelector('[data-vote-filter-apply]'),
        summaryTotal: root.querySelector('[data-summary-total]'),
        summaryRequired: root.querySelector('[data-summary-required]'),
        summaryUpcoming: root.querySelector('[data-summary-upcoming]'),
        summaryParticipated: root.querySelector('[data-summary-participated]')
    };

    const state = {
        records: [],
        filtered: [],
        activeTab: 'all',
        search: '',
        page: 1,
        pageSize: PAGE_SIZE,
        filters: {
            tuNgay: null,
            denNgay: null,
            nhaAnIds: [],
            caAnIds: []
        }
    };

    const permissions = getPermissionSet();

    const canViewCurrent = permissions.has('Q001023') || permissions.has('Q001025');

    const canViewUpcoming = permissions.has('Q001024');

    const canViewHistory = permissions.has('Q001027') || permissions.has('Q001026');

    initializePagination();
    bindEvents();
    await load();

    async function load() {
        setLoading(true);

        try {
            const [currentResult, upcomingResult, historyResult, nhaAnResult, caAnResult] = await Promise.all([
                safeRequest(API.current, canViewCurrent),
                safeRequest(API.upcoming, canViewUpcoming),
                safeRequest(API.history, canViewHistory),
                safeRequest(API.nhaAn, true),
                safeRequest(API.caAn, true)
            ]);

            const current = extractArray(currentResult);
            const upcoming = extractArray(upcomingResult);
            const history = extractArray(historyResult);
            const nhaAn = extractList(nhaAnResult);
            const caAn = extractList(caAnResult);

            state.records = mergeRecords(current, upcoming, history);

            buildFilterOptions(nhaAn, caAn);

            renderSummary();
            applyFilters();
        } catch (error) {
            console.error('Không thể tải danh sách bình chọn:', error);

            window.MCS?.toast?.error?.(error?.message || 'Không thể tải danh sách bình chọn.');
        } finally {
            setLoading(false);
        }
    }

    async function safeRequest(url, enabled = true) {
        if (!enabled) {
            return null;
        }

        try {
            return await request(url);
        } catch (error) {
            console.warn(`Không thể tải API ${url}:`, error);

            return null;
        }
    }

    function getPermissionSet() {
        let currentUser = null;

        try {
            currentUser =
                window.MCS?.storage?.getCurrentUser?.() || JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch (error) {
            currentUser = null;
        }

        const permissions = Array.isArray(currentUser?.dsQuyen) ? currentUser.dsQuyen : [];

        return new Set(
            permissions
                .map((item) => (typeof item === 'string' ? item : item?.maQuyen || item?.ma_quyen || ''))
                .map((item) => String(item).trim().toUpperCase())
                .filter(Boolean)
        );
    }

    async function request(url) {
        return await window.MCS.api.request(url, {
            method: 'GET'
        });
    }

    function extractArray(result) {
        const data = result?.data ?? result;

        return Array.isArray(data) ? data : [];
    }

    function extractList(response) {
        const data = response?.data ?? response;

        if (Array.isArray(data)) {
            return data;
        }

        const list = data?.danhSach ?? data?.items ?? data?.rows ?? data?.data ?? [];

        return Array.isArray(list) ? list : [];
    }

    function mergeRecords(current, upcoming, history) {
        const map = new Map();

        current.forEach((record) => {
            const item = normalizeRecord(record, 'current');

            if (item.id) {
                map.set(String(item.id), item);
            }
        });

        upcoming.forEach((record) => {
            const item = normalizeRecord(record, 'upcoming');

            if (item.id && !map.has(String(item.id))) {
                map.set(String(item.id), item);
            }
        });

        history.forEach((record) => {
            const id = record.dotBinhChonId ?? record.id;

            if (!id) {
                return;
            }

            const key = String(id);
            const old = map.get(key);

            if (old) {
                old.luaChonCuaToi = record.luaChon;
                old.thoiGianBinhChon = record.thoiGianBinhChon;
                return;
            }

            map.set(
                key,
                normalizeRecord(
                    {
                        ...record,
                        id
                    },
                    'history'
                )
            );
        });

        return Array.from(map.values()).sort((a, b) => getDateTime(b.ngay) - getDateTime(a.ngay));
    }

    function normalizeRecord(record, source) {
        const id = record.id ?? record.dotBinhChonId;

        const luaChon = record.luaChonCuaToi ?? record.luaChon ?? null;

        return {
            ...record,
            id,
            source,
            luaChonCuaToi: luaChon,
            nhaAnId: record.nhaAnId ?? null,
            caAnId: record.caAnId ?? null,
            dsNhomMonAn: Array.isArray(record.dsNhomMonAn) ? record.dsNhomMonAn : []
        };
    }

    function applyFilters() {
        const keyword = normalizeText(state.search);

        state.filtered = state.records.filter((record) => {
            if (!matchTab(record)) {
                return false;
            }

            if (keyword && !matchSearch(record, keyword)) {
                return false;
            }

            if (!matchDate(record)) {
                return false;
            }

            if (!matchMultiSelect(record.nhaAnId, state.filters.nhaAnIds)) {
                return false;
            }

            if (!matchMultiSelect(record.caAnId, state.filters.caAnIds)) {
                return false;
            }

            return true;
        });

        const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));

        if (state.page > totalPages) {
            state.page = totalPages;
        }

        renderList();
        syncPagination();
    }

    function matchTab(record) {
        switch (state.activeTab) {
            case 'active':
                return getRecordStatus(record) === 'active';

            case 'upcoming':
                return getRecordStatus(record) === 'upcoming';

            case 'participated':
                return hasParticipated(record);

            case 'ended':
                return getRecordStatus(record) === 'ended';

            default:
                return true;
        }
    }

    function matchSearch(record, keyword) {
        const values = [
            record.ngay,
            formatDate(record.ngay),
            record.tenThucDon,
            record.tenNhaAn,
            record.tenCaAn,
            getWeekday(record.ngay),
            ...getFoodNames(record)
        ];

        return values.some((value) => normalizeText(value).includes(keyword));
    }

    function matchDate(record) {
        const ngay = getDateTime(record.ngay);

        if (!Number.isFinite(ngay)) {
            return true;
        }

        if (state.filters.tuNgay) {
            const from = getDateTime(state.filters.tuNgay);

            if (Number.isFinite(from) && ngay < from) {
                return false;
            }
        }

        if (state.filters.denNgay) {
            const to = getDateTime(state.filters.denNgay);

            if (Number.isFinite(to) && ngay > to) {
                return false;
            }
        }

        return true;
    }

    function matchMultiSelect(value, selected) {
        if (!selected || selected.length === 0) {
            return true;
        }

        return selected.includes(String(value));
    }

    function getRecordStatus(record) {
        const now = Date.now();
        const start = getDateTime(record.batDauBinhChon);
        const end = getDateTime(record.hanBinhChon);

        if (Number.isFinite(end) && now > end) {
            return 'ended';
        }

        if (Number.isFinite(start) && now < start) {
            return 'upcoming';
        }

        if (record.source === 'upcoming') {
            return 'upcoming';
        }

        return 'active';
    }

    function hasParticipated(record) {
        return record.luaChonCuaToi === true || record.luaChonCuaToi === false;
    }

    function renderSummary() {
        const records = state.records;

        const required = records.filter(
            (record) => getRecordStatus(record) === 'active' && !hasParticipated(record)
        ).length;

        const upcoming = records.filter((record) => getRecordStatus(record) === 'upcoming').length;

        const participated = records.filter(hasParticipated).length;

        setText(elements.summaryTotal, records.length);

        setText(elements.summaryRequired, required);

        setText(elements.summaryUpcoming, upcoming);

        setText(elements.summaryParticipated, participated);
    }

    function renderList() {
        const start = (state.page - 1) * state.pageSize;

        const records = state.filtered.slice(start, start + state.pageSize);

        elements.list.innerHTML = '';
        elements.empty.hidden = records.length > 0;
        elements.list.hidden = records.length === 0;

        records.forEach((record) => {
            elements.list.insertAdjacentHTML('beforeend', createCardHtml(record));
        });
    }

    function createCardHtml(record) {
        const status = getRecordStatus(record);
        const participated = hasParticipated(record);
        const foods = getFoodNames(record);

        const foodHtml = foods.length
            ? foods
                  .slice(0, 6)
                  .map(
                      (food) =>
                          `
                                    <span class="vote-list-card__food">
                                        ${escapeHtml(food)}
                                    </span>
                                `
                  )
                  .join('')
            : `
                        <span class="vote-list-card__food">
                            ${escapeHtml(record.tenThucDon || 'Thực đơn')}
                        </span>
                    `;

        let timeHtml = '';

        if (status === 'upcoming') {
            timeHtml = `
                    <div class="vote-list-card__time">

                        <div class="vote-list-card__time-row">
                            <i class="fa-regular fa-clock"></i>
                            <span>
                                Bắt đầu bình chọn:
                                <strong>
                                    ${escapeHtml(formatDateTime(record.batDauBinhChon))}
                                </strong>
                            </span>
                        </div>

                        <div class="vote-list-card__time-row">
                            <i class="fa-regular fa-clock"></i>
                            <span>
                                Hạn bình chọn:
                                <strong>
                                    ${escapeHtml(formatDateTime(record.hanBinhChon))}
                                </strong>
                            </span>
                        </div>

                    </div>
                `;
        } else if (participated) {
            const yes = record.luaChonCuaToi === true;

            timeHtml = `
                    <div class="
                        vote-list-card__selection
                        ${yes ? 'is-yes' : 'is-no'}
                    ">
                        <i class="
                            fa-regular
                            ${yes ? 'fa-circle-check' : 'fa-circle-xmark'}
                        "></i>

                        <span>
                            ${status === 'ended' ? 'Lựa chọn của bạn:' : 'Bạn đã chọn:'}

                            <strong>
                                ${yes ? 'Có tham gia' : 'Không tham gia'}
                            </strong>
                        </span>
                    </div>
                `;
        } else {
            timeHtml = `
                    <div class="vote-list-card__time-row">
                        <i class="fa-regular fa-clock"></i>

                        <span>
                            Hạn bình chọn:

                            <strong>
                                ${escapeHtml(formatDateTime(record.hanBinhChon))}
                            </strong>
                        </span>
                    </div>
                `;
        }

        const action = getAction(record, status);

        return `
                <article
                    class="
                        vote-list-card
                        ${status === 'active' ? 'is-current' : ''}
                    "
                    data-vote-list-id="${escapeHtml(record.id)}">

                    <div class="vote-list-card__date">

                        <div class="vote-list-card__weekday">

                            <i
                                class="fa-regular fa-calendar"
                                aria-hidden="true">
                            </i>

                            <span>
                                ${escapeHtml(getWeekday(record.ngay))}
                            </span>

                        </div>


                        <strong class="vote-list-card__date-value">
                            ${escapeHtml(formatDate(record.ngay))}
                        </strong>


                        <div class="vote-list-card__meal">

                            <i
                                class="fa-solid fa-utensils"
                                aria-hidden="true">
                            </i>

                            <span>
                                ${escapeHtml(record.tenCaAn || 'Ca ăn')}
                            </span>

                        </div>

                    </div>


                    <div class="vote-list-card__body">

                        <h2>
                            ${escapeHtml(record.tenThucDon || 'Bình chọn tham gia ăn')}
                        </h2>


                        <div class="vote-list-card__foods">
                            ${foodHtml}
                        </div>


                        ${timeHtml}

                        ${createStatisticsHtml(record, status)}

                    </div>


                    <div class="vote-list-card__actions">

                        ${createStatusHtml(status, participated)}


                        ${
                            status === 'active' && !participated
                                ? `
                                    <div class="vote-list-card__notice">

                                        <i
                                            class="fa-solid fa-circle-info">
                                        </i>

                                        <span>
                                            Bạn chưa bình chọn
                                        </span>

                                    </div>
                                `
                                : ''
                        }


                        <a
                            href="${escapeHtml(action.href)}"
                            class="
                                vote-list-card__action
                                ${action.primary ? 'is-primary' : ''}
                            ">

                            <span>
                                ${escapeHtml(action.label)}
                            </span>

                            <i
                                class="fa-solid fa-arrow-right"
                                aria-hidden="true">
                            </i>

                        </a>

                    </div>

                </article>
            `;
    }

    function createStatisticsHtml(record, status) {
        if (status !== 'active') {
            return '';
        }

        const stats = record.thongKe;

        if (!stats) {
            return '';
        }

        return `
                <div class="vote-list-card__stats">

                    <span class="
                        vote-list-card__stat
                        vote-list-card__stat--yes
                    ">
                        <i class="fa-regular fa-circle-check"></i>

                        Có tham gia:

                        <strong>
                            ${Number(stats.coThamGia || 0)}
                        </strong>
                    </span>


                    <span class="
                        vote-list-card__stat
                        vote-list-card__stat--no
                    ">
                        <i class="fa-regular fa-circle-xmark"></i>

                        Không tham gia:

                        <strong>
                            ${Number(stats.khongThamGia || 0)}
                        </strong>
                    </span>

                </div>
            `;
    }

    function createStatusHtml(status, participated) {
        if (status === 'ended') {
            return `
                    <span class="
                        vote-list-status
                        vote-list-status--ended
                    ">
                        Đã kết thúc
                    </span>
                `;
        }

        if (status === 'upcoming') {
            return `
                    <span class="
                        vote-list-status
                        vote-list-status--upcoming
                    ">
                        Sắp diễn ra
                    </span>
                `;
        }

        if (participated) {
            return `
                    <span class="
                        vote-list-status
                        vote-list-status--participated
                    ">
                        Đã tham gia
                    </span>
                `;
        }

        return `
                <span class="
                    vote-list-status
                    vote-list-status--active
                ">
                    Đang diễn ra
                </span>
            `;
    }

    function getAction(record, status) {
        const thucDonId = record.thucDonId;
        const dotBinhChonId = record.id;

        const href = buildVoteDetailUrl(thucDonId, dotBinhChonId);

        if (status === 'active') {
            return {
                label: 'Vào bình chọn',
                href,
                primary: true
            };
        }

        if (status === 'ended') {
            return {
                label: 'Xem kết quả',
                href,
                primary: false
            };
        }

        return {
            label: 'Xem chi tiết',
            href,
            primary: false
        };
    }

    function buildVoteDetailUrl(thucDonId, dotBinhChonId) {
        if (!thucDonId || !dotBinhChonId) {
            return '#';
        }

        return (
            '/binh-chon/chi-tiet-binh-chon/' + encodeURIComponent(thucDonId) + '/' + encodeURIComponent(dotBinhChonId)
        );
    }

    function getFoodNames(record) {
        const result = [];

        (record.dsNhomMonAn || []).forEach((group) => {
            (group.dsMonAn || []).forEach((item) => {
                if (item?.tenMonAn) {
                    result.push(item.tenMonAn);
                }
            });
        });

        return result;
    }

    function openFilter() {
        elements.filterDropdown.hidden = false;

        elements.filterToggle?.classList.add('is-active');

        elements.filterToggle?.setAttribute('aria-expanded', 'true');
    }

    function closeFilter() {
        elements.filterDropdown.hidden = true;

        elements.filterToggle?.classList.remove('is-active');

        elements.filterToggle?.setAttribute('aria-expanded', 'false');
    }

    function toggleFilter() {
        if (elements.filterDropdown.hidden) {
            openFilter();
        } else {
            closeFilter();
        }
    }

    function applyFilterForm() {
        state.filters.tuNgay = getDateValue('tuNgay');
        state.filters.denNgay = getDateValue('denNgay');
        state.filters.nhaAnIds = getSelectValues('nhaAnIds');
        state.filters.caAnIds = getSelectValues('caAnIds');
        state.page = 1;

        closeFilter();
        applyFilters();
    }

    function resetFilterForm() {
        clearDate('tuNgay');
        clearDate('denNgay');
        clearSelect('nhaAnIds');
        clearSelect('caAnIds');

        state.filters = {
            tuNgay: null,
            denNgay: null,
            nhaAnIds: [],
            caAnIds: []
        };

        state.page = 1;

        applyFilters();
    }

    function getDateValue(id) {
        const input = root.querySelector(`#${id}`);

        return input?.value || null;
    }

    function clearDate(id) {
        const value = root.querySelector(`#${id}`);
        const display = root.querySelector(`#${id}Display`);

        if (value) {
            value.value = '';
        }

        if (display) {
            display.value = '';
        }
    }

    function getSelectValues(id) {
        const select = document.getElementById(id);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => option.value)
            .filter((value) => value && value !== '__ALL__');
    }

    function clearSelect(id) {
        const select = root.querySelector(`#${id}`);

        if (!select) {
            return;
        }

        if (select.tagName === 'SELECT') {
            Array.from(select.options).forEach((option) => {
                option.selected = false;
            });

            select.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );

            return;
        }

        select.value = '';

        select.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function buildFilterOptions(nhaAn, caAn) {
        setSelectOptions(
            'nhaAnIds',
            nhaAn.map((item) => ({
                value: item.id,
                label: item.tenNhaAn || item.ten || '-'
            }))
        );

        setSelectOptions(
            'caAnIds',
            caAn.map((item) => ({
                value: item.id,
                label: item.tenCaAn || item.ten || '-'
            }))
        );

        bindAllOption('nhaAnIds');
        bindAllOption('caAnIds');
    }

    function getMultiValues(id) {
        const select = root.querySelector(`#${id}`);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => option.value)
            .filter((value) => value && value !== '__ALL__');
    }

    function resetMultiSelectToAll(id) {
        const select = root.querySelector(`#${id}`);

        if (!select) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.selected = option.value === '__ALL__';
        });

        const wrapper = select.closest('[data-smart-select]');

        wrapper?.smartSelect?.refresh?.();

        select.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function uniqueOptions(records, valueKey, labelKey) {
        const map = new Map();

        records.forEach((record) => {
            const value = record[valueKey];
            const label = record[labelKey];

            if (value === undefined || value === null || !label) {
                return;
            }

            map.set(String(value), label);
        });

        return Array.from(map.entries()).map(([value, label]) => ({
            value,
            label
        }));
    }

    function setSelectOptions(id, options) {
        const select = root.querySelector(`#${id}`);

        if (!select) {
            return;
        }

        select.innerHTML = '';

        const allOption = document.createElement('option');

        allOption.value = '__ALL__';
        allOption.textContent = 'Tất cả';

        select.appendChild(allOption);

        options.forEach((item) => {
            if (item.value === undefined || item.value === null) {
                return;
            }

            const option = document.createElement('option');

            option.value = String(item.value);
            option.textContent = item.label || '-';

            select.appendChild(option);
        });

        const wrapper = select.closest('[data-smart-select]');

        const smartSelect = wrapper?.smartSelect || (wrapper && window.MCS?.smartSelect?.initialize?.(wrapper));

        smartSelect?.refresh?.();

        select.value = '__ALL__';

        Array.from(select.options).forEach((option) => {
            option.selected = option.value === '__ALL__';
        });

        smartSelect?.refresh?.();

        select.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function bindAllOption(id) {
        const select = root.querySelector(`#${id}`);

        if (!select || select.dataset.allOptionBound === 'true') {
            return;
        }

        select.dataset.allOptionBound = 'true';

        select.addEventListener('change', () => {
            const options = Array.from(select.options);

            const allOption = options.find((option) => option.value === '__ALL__');

            if (!allOption) {
                return;
            }

            const selected = options.filter((option) => option.selected);

            if (allOption.selected && selected.length > 1) {
                options.forEach((option) => {
                    option.selected = option.value === '__ALL__';
                });
            }

            const selectedSpecific = options.filter((option) => option.value !== '__ALL__' && option.selected);

            if (selectedSpecific.length > 0) {
                allOption.selected = false;
            }

            const hasSelected = options.some((option) => option.selected);

            if (!hasSelected) {
                allOption.selected = true;
            }

            const wrapper = select.closest('[data-smart-select]');

            wrapper?.smartSelect?.refresh?.();
        });
    }

    function initializePagination() {
        const paginationRoot = root.querySelector('[data-catalog-pagination]');

        if (!paginationRoot || !window.MCS?.catalog?.Pagination) {
            return;
        }

        pagination = new window.MCS.catalog.Pagination(paginationRoot, {
            page: state.page,
            pageSize: state.pageSize,
            total: 0,

            onChange: (paginationState) => {
                state.page = paginationState.page;
                state.pageSize = paginationState.pageSize;

                renderList();
                syncPagination();
            }
        });
    }

    function syncPagination() {
        if (!pagination) {
            return;
        }

        pagination.setData({
            page: state.page,
            pageSize: state.pageSize,
            total: state.filtered.length
        });
    }

    function bindEvents() {
        elements.tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                elements.tabs.forEach((item) => item.classList.remove('is-active'));

                tab.classList.add('is-active');

                state.activeTab = tab.dataset.voteTab || 'all';

                state.page = 1;

                applyFilters();
            });
        });

        elements.search?.addEventListener(
            'input',
            debounce((event) => {
                state.search = event.target.value || '';

                state.page = 1;

                applyFilters();
            }, 250)
        );

        elements.filterToggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFilter();
        });

        elements.filterClose?.addEventListener('click', closeFilter);

        elements.filterApply?.addEventListener('click', applyFilterForm);

        elements.filterReset?.addEventListener('click', resetFilterForm);

        document.addEventListener('click', (event) => {
            if (elements.filter && !elements.filter.contains(event.target)) {
                closeFilter();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeFilter();
            }
        });
    }

    function setLoading(loading) {
        elements.loading.hidden = !loading;

        if (loading) {
            elements.list.hidden = true;
            elements.empty.hidden = true;
        }
    }

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    function getDateTime(value) {
        if (!value) {
            return NaN;
        }

        const date = new Date(value);

        return date.getTime();
    }

    function formatDate(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function formatDateTime(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        const dateText = new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);

        const timeText = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);

        return timeText + ' - ' + dateText;
    }

    function getWeekday(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

        return weekdays[date.getDay()];
    }

    function normalizeText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
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
        let timer;

        return (...args) => {
            clearTimeout(timer);

            timer = setTimeout(() => callback(...args), delay);
        };
    }
});

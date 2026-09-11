'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-vote-history-page]');

    if (!root) {
        return;
    }

    const API_HISTORY_ALL = '/api/mcs/v1/binh-chon/lich-su';
    const API_HISTORY_MINE = '/api/mcs/v1/binh-chon/cua-toi/lich-su';
    const API_TAI_KHOAN = '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true';

    const elements = {
        content: root.querySelector('[data-vote-history-content]'),
        loading: root.querySelector('[data-history-loading]'),
        noPermission: root.querySelector('[data-catalog-no-permission]'),
        total: root.querySelector('[data-history-total]'),
        yes: root.querySelector('[data-history-yes]'),
        no: root.querySelector('[data-history-no]'),
        from: document.getElementById('historyFromDate'),
        to: document.getElementById('historyToDate'),
        choice: document.getElementById('historyChoice'),
        voters: document.getElementById('historyVoters'),
        search: root.querySelector('[data-history-search]'),
        reset: root.querySelector('[data-history-reset]'),
        tableBody: root.querySelector('[data-history-table-body]'),
        empty: root.querySelector('[data-history-empty]')
    };

    const state = {
        items: [],
        loading: false
    };

    const permissions = getPermissionSet();
    const canViewAll = permissions.has('Q001026');
    const canViewMine = permissions.has('Q001027');
    const canView = canViewAll || canViewMine;

    if (!canView) {
        showNoPermission();
        return;
    }

    hideNoPermission();
    initializeChoiceSelect();
    await initializeVoterSelect();
    bindEvents();
    await load();

    async function load() {
        if (state.loading) {
            return;
        }

        state.loading = true;
        setLoading(true);

        try {
            const url = buildUrl();

            const result = await window.MCS.api.request(url, {
                method: 'GET'
            });

            const data = result?.data ?? result;

            state.items = Array.isArray(data) ? data : [];

            render();
        } catch (error) {
            console.error('Không thể tải lịch sử bình chọn:', error);

            state.items = [];

            render();

            window.MCS?.toast?.error?.(error?.message || 'Không thể tải lịch sử bình chọn.');
        } finally {
            state.loading = false;
            setLoading(false);
        }
    }

    function initializeChoiceSelect() {
        const select = elements.choice;

        if (!select) {
            return;
        }

        Array.from(select.options)
            .filter((option) => option.value !== '__ALL__')
            .forEach((option) => {
                option.remove();
            });

        const options = [
            {
                value: 'true',
                label: 'Có tham gia'
            },
            {
                value: 'false',
                label: 'Không tham gia'
            }
        ];

        options.forEach((item) => {
            const option = document.createElement('option');

            option.value = item.value;
            option.textContent = item.label;

            select.appendChild(option);
        });

        const smartSelect = getSmartSelect(select);

        smartSelect?.refresh?.();

        smartSelect?.setValue?.('__ALL__', false);
    }

    async function initializeVoterSelect() {
        const select = elements.voters;

        if (!select) {
            return;
        }

        select.innerHTML = '';

        const allOption = document.createElement('option');

        allOption.value = '__ALL__';
        allOption.textContent = 'Tất cả';
        allOption.selected = true;

        select.appendChild(allOption);

        if (canViewAll) {
            try {
                const result = await window.MCS.api.request(API_TAI_KHOAN, {
                    method: 'GET'
                });

                const danhSach = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

                danhSach
                    .map((item) => ({
                        value: item.id,
                        label: buildTaiKhoanLabel(item)
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
                    .forEach((item) => {
                        const option = document.createElement('option');

                        option.value = String(item.value);
                        option.textContent = item.label;

                        select.appendChild(option);
                    });
            } catch (error) {
                console.error('Không thể tải danh sách tài khoản:', error);

                window.MCS?.toast?.error?.('Không thể tải danh sách người bình chọn.');
            }
        } else {
            const currentUser = getCurrentUser();

            const option = document.createElement('option');

            option.value = '__SELF__';
            option.textContent = buildCurrentUserLabel(currentUser);

            select.appendChild(option);
        }

        const smartSelect = getSmartSelect(select);

        smartSelect?.refresh?.();

        resetMultiSelectToAll('historyVoters');
        bindAllOption('historyVoters');
    }

    function getDatePicker(input) {
        if (!input) {
            return null;
        }

        const dateRoot = input.closest('[data-date-picker]');

        if (!dateRoot) {
            return null;
        }

        return dateRoot.datePicker || input.datePicker || null;
    }

    function getSmartSelect(select) {
        if (!select) {
            return null;
        }

        const root = select.closest('[data-smart-select]');

        if (!root) {
            return null;
        }

        return root.smartSelect || window.MCS?.smartSelect?.initialize?.(root) || null;
    }

    function buildUrl() {
        const params = new URLSearchParams();

        const from = elements.from?.value;
        const to = elements.to?.value;
        const choice = elements.choice?.value;

        if (from) {
            params.set('tuNgay', from);
        }

        if (to) {
            params.set('denNgay', to);
        }

        if (choice && choice !== '__ALL__') {
            params.set('luaChon', choice);
        }

        if (canViewAll) {
            const taiKhoanIds = getMultiValues('historyVoters');

            if (taiKhoanIds.length > 0) {
                params.set('taiKhoanIds', taiKhoanIds.join(','));
            }
        }

        const query = params.toString();

        const baseApi = canViewAll ? API_HISTORY_ALL : API_HISTORY_MINE;

        return query ? `${baseApi}?${query}` : baseApi;
    }

    function bindEvents() {
        elements.search?.addEventListener('click', () => {
            if (!validateDateRange()) {
                return;
            }

            load();
        });

        elements.reset?.addEventListener('click', () => {
            if (elements.from) {
                elements.from.value = '';
            }

            if (elements.to) {
                elements.to.value = '';
            }

            if (elements.choice) {
                Array.from(elements.choice.options).forEach((option) => {
                    option.selected = option.value === '__ALL__';
                });

                getSmartSelect(elements.choice)?.refresh?.();
            }

            resetMultiSelectToAll('historyVoters');

            load();
        });

        [elements.from, elements.to, elements.voters, elements.choice].filter(Boolean).forEach((element) => {
            element.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') {
                    return;
                }

                if (validateDateRange()) {
                    load();
                }
            });
        });
    }

    function validateDateRange() {
        const from = elements.from?.value;
        const to = elements.to?.value;

        if (from && to && from > to) {
            window.MCS?.toast?.error?.('Từ ngày không được lớn hơn đến ngày.');

            return false;
        }

        return true;
    }

    function render() {
        renderSummary();
        renderTable();
    }

    function renderSummary() {
        const total = state.items.length;

        const yes = state.items.filter((item) => item?.luaChon === true).length;

        const no = state.items.filter((item) => item?.luaChon === false).length;

        elements.total.textContent = String(total);
        elements.yes.textContent = String(yes);
        elements.no.textContent = String(no);
    }

    function renderTable() {
        const items = state.items;

        elements.empty.hidden = items.length > 0;

        elements.tableBody.closest('.vote-history-table-wrapper').hidden = items.length === 0;

        elements.tableBody.innerHTML = items.map(renderRow).join('');
    }

    function renderRow(item) {
        const trangThaiThoiGian = item?.trangThaiThoiGian?.name || item?.trangThaiThoiGian || 'Đã kết thúc';

        const trangThaiClass =
            trangThaiThoiGian === 'Đang diễn ra' ? 'vote-history-status--active' : 'vote-history-status--ended';

        const trangThaiIcon = 'fa-solid fa-circle';
        const hoTenNguoiBinhChon = String(item?.hoTen || '-');
        const maNhanVien = String(item?.maNhanVien || '');

        let choiceClass = 'vote-history-choice--pending';
        let choiceIcon = 'fa-regular fa-clock';
        let choiceLabel = 'Chưa bình chọn';

        if (item?.luaChon === true) {
            choiceClass = 'vote-history-choice--yes';
            choiceIcon = 'fa-solid fa-check';
            choiceLabel = 'Có tham gia';
        } else if (item?.luaChon === false) {
            choiceClass = 'vote-history-choice--no';
            choiceIcon = 'fa-solid fa-xmark';
            choiceLabel = 'Không tham gia';
        }

        const menuUrl = buildMenuDetailUrl(item);

        return `
            <tr>

                <td>

                    <span
                        class="
                            vote-history-status
                            ${trangThaiClass}
                        ">

                        <i
                            class="${trangThaiIcon}"
                            aria-hidden="true">
                        </i>

                        ${escapeHtml(trangThaiThoiGian)}

                    </span>

                </td>


                <td>

                    ${escapeHtml(formatDate(item?.ngay))}

                </td>


                <td>

                    <div class="vote-history-voter">

                        <strong>

                            ${escapeHtml(hoTenNguoiBinhChon)}

                        </strong>

                        ${
                            maNhanVien
                                ? `
                                    <span>

                                        ${escapeHtml(maNhanVien)}

                                    </span>
                                `
                                : ''
                        }

                    </div>

                </td>


                <td>

                    <div
                        class="
                            vote-history-menu
                        ">

                        <strong>

                            ${escapeHtml(item?.tenThucDon || '-')}

                        </strong>

                        ${
                            item?.maThucDon
                                ? `
                                    <span>

                                        ${escapeHtml(item.maThucDon)}

                                    </span>
                                `
                                : ''
                        }

                    </div>

                </td>


                <td>

                    ${escapeHtml(item?.tenNhaAn || '-')}

                </td>


                <td>

                    ${escapeHtml(item?.tenCaAn || '-')}

                </td>


                <td>

                    <span
                        class="
                            vote-history-choice
                            ${choiceClass}
                        ">

                        <i
                            class="${choiceIcon}"
                            aria-hidden="true">
                        </i>

                        ${choiceLabel}

                    </span>

                </td>


                <td>

                    ${escapeHtml(formatDateTime(item?.thoiGianBinhChon))}

                </td>


                <td>

                    ${
                        menuUrl !== '#'
                            ? `
                                <a
                                    href="${escapeAttribute(menuUrl)}"
                                    class="
                                        vote-history-view
                                    ">

                                    Xem thực đơn

                                    <i
                                        class="
                                            fa-solid
                                            fa-arrow-right
                                        "
                                        aria-hidden="true">
                                    </i>

                                </a>
                            `
                            : '-'
                    }

                </td>

            </tr>
        `;
    }

    function buildMenuDetailUrl(item) {
        const thucDonId = Number(item?.thucDonId);
        const thucDonNgayId = Number(item?.thucDonNgayId);

        if (!Number.isInteger(thucDonId) || thucDonId <= 0 || !Number.isInteger(thucDonNgayId) || thucDonNgayId <= 0) {
            return '#';
        }

        return (
            '/thong-tin-chi-tiet-thuc-don/' + encodeURIComponent(thucDonId) + '/' + encodeURIComponent(thucDonNgayId)
        );
    }

    function buildTaiKhoanLabel(item) {
        const tenDangNhap = item?.tenDangNhap || item?.taiKhoan || '';

        const hoTen = item?.nhanVien?.hoTen ?? item?.hoTenNhanVien ?? item?.hoTen ?? item?.tenNhanVien ?? '';

        return [tenDangNhap, hoTen].filter(Boolean).join(' - ') || `Tài khoản #${item?.id || ''}`;
    }

    function buildCurrentUserLabel(currentUser) {
        if (!currentUser) {
            return 'Tài khoản của tôi';
        }

        return [currentUser.maNhanVien, currentUser.hoTen].filter(Boolean).join(' - ') || 'Tài khoản của tôi';
    }

    function getCurrentUser() {
        try {
            return window.MCS?.storage?.getCurrentUser?.() || JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch (error) {
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

    function getMultiValues(id) {
        const select = document.getElementById(id);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => option.value)
            .filter((value) => value && value !== '__ALL__');
    }

    function resetMultiSelectToAll(id) {
        const select = document.getElementById(id);

        if (!select) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.selected = option.value === '__ALL__';
        });

        select._historyPreviousValues = new Set(['__ALL__']);

        getSmartSelect(select)?.refresh?.();
    }

    function bindAllOption(id) {
        const select = document.getElementById(id);

        if (!select || select.dataset.allOptionBound === 'true') {
            return;
        }

        select.dataset.allOptionBound = 'true';

        select._historyPreviousValues = new Set(Array.from(select.selectedOptions || []).map((option) => option.value));

        select.addEventListener('change', () => {
            const options = Array.from(select.options);

            const allOption = options.find((option) => option.value === '__ALL__');

            if (!allOption) {
                return;
            }

            const previousValues =
                select._historyPreviousValues instanceof Set ? select._historyPreviousValues : new Set();

            const selectedSpecific = options.filter((option) => option.value !== '__ALL__' && option.selected);

            const hadAllBefore = previousValues.has('__ALL__');
            const hasAllNow = allOption.selected;

            if (hadAllBefore && hasAllNow && selectedSpecific.length > 0) {
                allOption.selected = false;
            } else if (!hadAllBefore && hasAllNow) {
                options.forEach((option) => {
                    option.selected = option.value === '__ALL__';
                });
            } else if (!hasAllNow && selectedSpecific.length === 0) {
                allOption.selected = true;
            }

            select._historyPreviousValues = new Set(
                options.filter((option) => option.selected).map((option) => option.value)
            );

            getSmartSelect(select)?.refresh?.();
        });
    }

    function showNoPermission() {
        setLoading(false);

        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        const noPermission = elements.noPermission || document.querySelector('[data-catalog-no-permission]');

        if (!pageContent || !noPermission) {
            return;
        }

        if (noPermission.parentElement !== pageContent) {
            pageContent.appendChild(noPermission);
        }

        root.classList.add('is-permission-hidden');

        noPermission.hidden = false;

        document.documentElement.classList.add('catalog-permission-denied');

        document.body.classList.add('catalog-permission-denied');
    }

    function hideNoPermission() {
        root.classList.remove('is-permission-hidden');

        const noPermission = elements.noPermission;

        if (noPermission) {
            noPermission.hidden = true;
        }

        document.documentElement.classList.remove('catalog-permission-denied');

        document.body.classList.remove('catalog-permission-denied');
    }

    function setLoading(loading) {
        elements.loading.hidden = !loading;
        elements.content.hidden = loading;
    }

    function formatDate(value) {
        const date = parseDate(value);

        if (!date) {
            return '-';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function formatDateTime(value) {
        const date = parseDate(value);

        if (!date) {
            return '-';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
        }).format(date);
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
});

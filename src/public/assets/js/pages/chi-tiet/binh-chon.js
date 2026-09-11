'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-meal-vote-page]');

    if (!root) {
        return;
    }

    const thucDonId = String(root.dataset.thucDonId || '').trim();
    const dotBinhChonId = String(root.dataset.dotBinhChonId || '').trim();

    if (!thucDonId || !dotBinhChonId) {
        window.location.replace('/binh-chon/danh-sach-binh-chon');

        return;
    }

    const API = {
        current: '/api/mcs/v1/binh-chon/cua-toi/hien-tai',
        upcoming: '/api/mcs/v1/binh-chon/cua-toi/sap-toi',
        history: '/api/mcs/v1/binh-chon/cua-toi/lich-su',

        detail(id) {
            return '/api/mcs/v1/binh-chon/cua-toi/' + encodeURIComponent(id);
        },

        vote(id) {
            return '/api/mcs/v1/binh-chon/cua-toi/' + encodeURIComponent(id) + '/binh-chon';
        }
    };

    const elements = {
        content: root.querySelector('[data-meal-vote-content]'),
        loading: root.querySelector('[data-meal-vote-loading]'),
        noPermission: root.querySelector('[data-catalog-no-permission]'),
        history: root.querySelector('[data-meal-vote-history]'),
        current: root.querySelector('[data-meal-vote-current]'),
        currentEmpty: root.querySelector('[data-meal-vote-current-empty]'),
        currentStatus: root.querySelector('[data-current-status]'),
        currentDate: root.querySelector('[data-current-date]'),
        currentMeal: root.querySelector('[data-current-meal]'),
        currentDeadline: root.querySelector('[data-current-deadline]'),
        currentFoodList: root.querySelector('[data-current-food-list]'),
        currentMenuLink: root.querySelector('[data-current-menu-link]'),
        voteButtons: root.querySelectorAll('[data-vote-choice]'),
        voteSelected: root.querySelector('[data-vote-selected]'),
        voteSelectedLabel: root.querySelector('[data-vote-selected-label]'),
        voteChange: root.querySelector('[data-vote-change]'),
        resultTotal: root.querySelector('[data-result-total]'),
        resultYes: root.querySelector('[data-result-yes]'),
        resultNo: root.querySelector('[data-result-no]'),
        resultYesPercent: root.querySelector('[data-result-yes-percent]'),
        resultNoPercent: root.querySelector('[data-result-no-percent]'),
        resultYesCount: root.querySelector('[data-result-yes-count]'),
        resultNoCount: root.querySelector('[data-result-no-count]'),
        resultYesPercentRow: root.querySelector('[data-result-yes-percent-row]'),
        resultNoPercentRow: root.querySelector('[data-result-no-percent-row]'),
        resultYesBar: root.querySelector('[data-result-yes-bar]'),
        resultNoBar: root.querySelector('[data-result-no-bar]'),
        resultUpdated: root.querySelector('[data-result-updated]'),
        upcomingList: root.querySelector('[data-upcoming-list]'),
        upcomingEmpty: root.querySelector('[data-upcoming-empty]'),
        relatedTabs: root.querySelectorAll('[data-related-tab]'),
        relatedEmptyTitle: root.querySelector('[data-related-empty-title]'),
        relatedEmptyDescription: root.querySelector('[data-related-empty-description]')
    };

    const state = {
        current: null,
        upcoming: [],
        relatedFilter: 'all',
        changingVote: false,
        voting: false,
        refreshTimer: null
    };

    const permissions = getPermissionSet();

    const canViewCurrent = permissions.has('Q001023') || permissions.has('Q001025');

    const canVote = permissions.has('Q001025');
    const canViewUpcoming = permissions.has('Q001024');

    const canViewHistory = permissions.has('Q001027') || permissions.has('Q001026');

    if (!canViewCurrent && !canViewUpcoming) {
        showNoPermission();
        return;
    }

    hideNoPermission();

    if (elements.history) {
        elements.history.hidden = !canViewHistory;
    }

    bindEvents();
    await load();
    startAutoRefresh();

    async function load({ silent = false } = {}) {
        const detailResult = await window.MCS.api.request(API.detail(dotBinhChonId), {
            method: 'GET'
        });

        const currentRecord = detailResult?.data ?? detailResult;

        if (!silent) {
            setLoading(true);
        }

        try {
            const requests = [];

            if (canViewCurrent) {
                requests.push(
                    window.MCS.api
                        .request(API.current, {
                            method: 'GET'
                        })
                        .then((result) => ({
                            type: 'current',
                            result
                        }))
                );
            }

            if (canViewUpcoming) {
                requests.push(
                    window.MCS.api
                        .request(API.upcoming, {
                            method: 'GET'
                        })
                        .then((result) => ({
                            type: 'upcoming',
                            result
                        }))
                );
            }

            if (canViewHistory) {
                requests.push(
                    window.MCS.api
                        .request(API.history, {
                            method: 'GET'
                        })
                        .then((result) => ({
                            type: 'history',
                            result
                        }))
                );
            }

            const responses = await Promise.all(requests);
            const records = [];

            responses.forEach((response) => {
                const data = response.result?.data ?? response.result;

                if (!Array.isArray(data)) {
                    return;
                }

                data.forEach((item) => {
                    records.push({
                        ...item,
                        source: response.type
                    });
                });
            });

            const record = currentRecord;

            if (!record) {
                state.current = null;
                state.upcoming = [];

                render();

                if (!silent) {
                    window.MCS?.toast?.error?.('Không tìm thấy đợt bình chọn.');
                }

                return;
            }

            state.current = record;
            state.upcoming = buildRelatedRecords(records);

            render();
        } catch (error) {
            console.error('Không thể tải bình chọn:', error);

            if (!silent) {
                window.MCS?.toast?.error?.(error?.message || 'Không thể tải thông tin bình chọn.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }

    function findTargetRecord(records) {
        if (!Array.isArray(records)) {
            return null;
        }

        return (
            records.find((record) => {
                const recordId = String(record.dotBinhChonId ?? record.id ?? '');

                const recordThucDonId = String(record.thucDonId ?? '');

                return recordId === dotBinhChonId && recordThucDonId === thucDonId;
            }) || null
        );
    }

    function buildRelatedRecords(records) {
        if (!Array.isArray(records)) {
            return [];
        }

        const map = new Map();

        records.forEach((record) => {
            if (record.source !== 'current' && record.source !== 'upcoming') {
                return;
            }

            const recordId = String(record.dotBinhChonId ?? record.id ?? '');

            const recordThucDonId = String(record.thucDonId ?? '');

            if (recordId === dotBinhChonId && recordThucDonId === thucDonId) {
                return;
            }

            if (!recordId) {
                return;
            }

            map.set(recordId, record);
        });

        return Array.from(map.values()).sort((a, b) => {
            const dateA = normalizeDate(a.batDauBinhChon);
            const dateB = normalizeDate(b.batDauBinhChon);

            return (dateA?.getTime() ?? 0) - (dateB?.getTime() ?? 0);
        });
    }

    function render() {
        renderCurrent();
        renderUpcoming();
    }

    function renderCurrent() {
        const record = state.current;

        elements.current.hidden = !record;
        elements.currentEmpty.hidden = !!record;

        if (!record) {
            return;
        }

        renderCurrentStatus(record);

        const date = normalizeDate(record.ngay);

        elements.currentDate.textContent = `${getWeekday(date)}, ${formatDate(date)}`;

        elements.currentMeal.textContent = record.tenCaAn || 'Ca ăn';

        elements.currentDeadline.textContent = formatDateTimeShort(record.hanBinhChon);

        elements.currentMenuLink.href = buildMenuDetailUrl(record);

        renderFoods(record);
        renderVoteSelection(record);
        renderStatistics(record);
    }

    function renderCurrentStatus(record) {
        if (!elements.currentStatus) {
            return;
        }

        const status = getRelatedStatus(record);

        elements.currentStatus.classList.remove(
            'meal-vote-status--active',
            'meal-vote-status--upcoming',
            'meal-vote-status--ended'
        );

        if (status === 'ended') {
            elements.currentStatus.textContent = 'Đã kết thúc';

            elements.currentStatus.classList.add('meal-vote-status--ended');

            return;
        }

        if (status === 'upcoming') {
            elements.currentStatus.textContent = 'Sắp diễn ra';

            elements.currentStatus.classList.add('meal-vote-status--upcoming');

            return;
        }

        elements.currentStatus.textContent = 'Đang diễn ra';

        elements.currentStatus.classList.add('meal-vote-status--active');
    }

    function renderFoods(record) {
        const foods = flattenFoods(record?.dsNhomMonAn || []);

        if (!foods.length) {
            elements.currentFoodList.innerHTML = `
                    <span
                        class="
                            meal-vote-food-empty
                        ">
                        Chưa có món ăn.
                    </span>
                `;

            return;
        }

        elements.currentFoodList.innerHTML = foods
            .map(
                (food) => `
                        <span
                            class="
                                meal-vote-food-item
                            ">
                            ${escapeHtml(getFoodName(food))}
                        </span>
                    `
            )
            .join('');
    }

    function renderVoteSelection(record) {
        const status = getRelatedStatus(record);

        const canInteract = canVote && status === 'active';

        const selected = record?.luaChonCuaToi;

        const hasSelected = selected === true || selected === false;

        const allowChange = record?.choPhepThayDoi !== false;

        elements.voteButtons.forEach((button) => {
            const value = button.dataset.voteChoice === 'true';

            button.classList.toggle('is-selected', hasSelected && selected === value);

            button.disabled = !canInteract || state.voting || (hasSelected && !state.changingVote);
        });

        elements.voteSelected.hidden = !hasSelected;

        if (!hasSelected) {
            state.changingVote = false;
            return;
        }

        elements.voteSelectedLabel.textContent = selected ? 'Có tham gia' : 'Không tham gia';

        elements.voteSelectedLabel.className = selected ? 'is-positive' : 'is-negative';

        if (elements.voteChange) {
            elements.voteChange.hidden = !allowChange || !canInteract;

            elements.voteChange.disabled = !canInteract || state.voting;
        }
    }

    function renderStatistics(record) {
        const statistics = record?.thongKe || {};

        const total = toNumber(statistics.tongBinhChon ?? record?.tongBinhChon);

        const yes = toNumber(statistics.coThamGia ?? record?.coThamGia);

        const no = toNumber(statistics.khongThamGia ?? record?.khongThamGia);

        const yesPercent = total > 0 ? roundPercent((yes * 100) / total) : 0;

        const noPercent = total > 0 ? roundPercent((no * 100) / total) : 0;

        elements.resultTotal.textContent = String(total);
        elements.resultYes.textContent = String(yes);
        elements.resultNo.textContent = String(no);
        elements.resultYesPercent.textContent = String(yesPercent);
        elements.resultNoPercent.textContent = String(noPercent);
        elements.resultYesCount.textContent = String(yes);
        elements.resultNoCount.textContent = String(no);
        elements.resultYesPercentRow.textContent = String(yesPercent);
        elements.resultNoPercentRow.textContent = String(noPercent);

        elements.resultYesBar.style.width = `${yesPercent}%`;

        elements.resultNoBar.style.width = `${noPercent}%`;

        elements.resultUpdated.textContent = `Cập nhật lúc ${formatTime(new Date())}`;
    }

    function renderUpcoming() {
        const records = Array.isArray(state.upcoming) ? state.upcoming : [];

        const filtered = records.filter((record) => {
            const status = getRelatedStatus(record);

            if (state.relatedFilter === 'active') {
                return status === 'active';
            }

            if (state.relatedFilter === 'upcoming') {
                return status === 'upcoming';
            }

            return status === 'active' || status === 'upcoming';
        });

        elements.upcomingList.innerHTML = filtered.map(renderUpcomingCard).join('');

        elements.upcomingEmpty.hidden = filtered.length > 0;

        renderRelatedEmpty();
    }

    function getRelatedStatus(record) {
        const now = Date.now();

        const startDate = normalizeDate(record?.batDauBinhChon);

        const endDate = normalizeDate(record?.hanBinhChon);

        const start = startDate?.getTime();
        const end = endDate?.getTime();

        if (Number.isFinite(end) && now > end) {
            return 'ended';
        }

        if (Number.isFinite(start) && now < start) {
            return 'upcoming';
        }

        if (Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end) {
            return 'active';
        }

        if (record.source === 'upcoming') {
            return 'upcoming';
        }

        if (record.source === 'current') {
            return 'active';
        }

        return 'other';
    }

    function renderRelatedEmpty() {
        if (!elements.relatedEmptyTitle || !elements.relatedEmptyDescription) {
            return;
        }

        if (state.relatedFilter === 'active') {
            elements.relatedEmptyTitle.textContent = 'Chưa có bình chọn đang diễn ra';

            elements.relatedEmptyDescription.textContent = 'Hiện chưa có đợt bình chọn nào đang diễn ra.';

            return;
        }

        if (state.relatedFilter === 'upcoming') {
            elements.relatedEmptyTitle.textContent = 'Chưa có bình chọn sắp tới';

            elements.relatedEmptyDescription.textContent = 'Hiện chưa có đợt bình chọn nào được lên lịch.';

            return;
        }

        elements.relatedEmptyTitle.textContent = 'Chưa có bình chọn';

        elements.relatedEmptyDescription.textContent = 'Hiện chưa có đợt bình chọn đang diễn ra hoặc sắp diễn ra.';
    }

    function renderUpcomingCard(record) {
        const status = getRelatedStatus(record);
        const isActive = status === 'active';

        const participated = record?.luaChonCuaToi === true || record?.luaChonCuaToi === false;

        const foods = flattenFoods(record?.dsNhomMonAn || []);

        const foodHtml = foods.length
            ? foods
                  .slice(0, 6)
                  .map(
                      (food) => `
                            <span
                                class="
                                    vote-list-card__food
                                ">
                                ${escapeHtml(getFoodName(food))}
                            </span>
                        `
                  )
                  .join('')
            : `
                    <span
                        class="
                            vote-list-card__food
                        ">
                        ${escapeHtml(record?.tenThucDon || 'Thực đơn')}
                    </span>
                `;

        let informationHtml = '';

        if (status === 'upcoming') {
            informationHtml = `
                <div
                    class="
                        vote-list-card__time
                    ">

                    <div
                        class="
                            vote-list-card__time-row
                        ">

                        <i
                            class="
                                fa-regular
                                fa-clock
                            ">
                        </i>

                        <span>
                            Bắt đầu bình chọn:

                            <strong>
                                ${escapeHtml(formatDateTimeShort(record?.batDauBinhChon))}
                            </strong>
                        </span>

                    </div>


                    <div
                        class="
                            vote-list-card__time-row
                        ">

                        <i
                            class="
                                fa-regular
                                fa-clock
                            ">
                        </i>

                        <span>
                            Hạn bình chọn:

                            <strong>
                                ${escapeHtml(formatDateTimeShort(record?.hanBinhChon))}
                            </strong>
                        </span>

                    </div>

                </div>
            `;
        } else if (participated) {
            const yes = record.luaChonCuaToi === true;

            informationHtml = `
                <div
                    class="
                        vote-list-card__selection
                        ${yes ? 'is-yes' : 'is-no'}
                    ">

                    <i
                        class="
                            fa-regular
                            ${yes ? 'fa-circle-check' : 'fa-circle-xmark'}
                        ">
                    </i>

                    <span>
                        Bạn đã chọn:

                        <strong>
                            ${yes ? 'Có tham gia' : 'Không tham gia'}
                        </strong>
                    </span>

                </div>
            `;
        } else {
            informationHtml = `
                <div
                    class="
                        vote-list-card__time-row
                    ">

                    <i
                        class="
                            fa-regular
                            fa-clock
                        ">
                    </i>

                    <span>
                        Hạn bình chọn:

                        <strong>
                            ${escapeHtml(formatDateTimeShort(record?.hanBinhChon))}
                        </strong>
                    </span>

                </div>
            `;
        }

        const statistics = record?.thongKe || {};

        const statisticsHtml = isActive
            ? `
                    <div
                        class="
                            vote-list-card__stats
                        ">

                        <span
                            class="
                                vote-list-card__stat
                                vote-list-card__stat--yes
                            ">

                            <i
                                class="
                                    fa-regular
                                    fa-circle-check
                                ">
                            </i>

                            Có tham gia:

                            <strong>
                                ${Number(statistics.coThamGia || 0)}
                            </strong>

                        </span>


                        <span
                            class="
                                vote-list-card__stat
                                vote-list-card__stat--no
                            ">

                            <i
                                class="
                                    fa-regular
                                    fa-circle-xmark
                                ">
                            </i>

                            Không tham gia:

                            <strong>
                                ${Number(statistics.khongThamGia || 0)}
                            </strong>

                        </span>

                    </div>
                `
            : '';

        let statusClass = 'vote-list-status--upcoming';
        let statusText = 'Sắp diễn ra';

        if (isActive && participated) {
            statusClass = 'vote-list-status--participated';
            statusText = 'Đã tham gia';
        } else if (isActive) {
            statusClass = 'vote-list-status--active';
            statusText = 'Đang diễn ra';
        }

        const href = buildVoteDetailUrl(record);

        return `
            <article
                class="
                    vote-list-card
                    ${isActive ? 'is-current' : ''}
                ">

                <div
                    class="
                        vote-list-card__date
                    ">

                    <div
                        class="
                            vote-list-card__weekday
                        ">

                        <i
                            class="
                                fa-regular
                                fa-calendar
                            ">
                        </i>

                        <span>
                            ${escapeHtml(getWeekday(record?.ngay))}
                        </span>

                    </div>


                    <strong
                        class="
                            vote-list-card__date-value
                        ">
                        ${escapeHtml(formatDate(record?.ngay))}
                    </strong>


                    <div
                        class="
                            vote-list-card__meal
                        ">

                        <i class="fa-solid fa-utensils"></i>

                        <span>
                            ${escapeHtml(record?.tenCaAn || 'Ca ăn')}
                        </span>

                    </div>

                </div>


                <div
                    class="
                        vote-list-card__body
                    ">

                    <h2>
                        ${escapeHtml(record?.tenThucDon || 'Bình chọn tham gia ăn')}
                    </h2>


                    <div
                        class="
                            vote-list-card__foods
                        ">
                        ${foodHtml}
                    </div>


                    ${informationHtml}

                    ${statisticsHtml}

                </div>


                <div
                    class="
                        vote-list-card__actions
                    ">

                    <span
                        class="
                            vote-list-status
                            ${statusClass}
                        ">
                        ${statusText}
                    </span>


                    ${
                        isActive && !participated
                            ? `
                                <div
                                    class="
                                        vote-list-card__notice
                                    ">

                                    <i
                                        class="
                                            fa-solid
                                            fa-circle-info
                                        ">
                                    </i>

                                    <span>
                                        Bạn chưa bình chọn
                                    </span>

                                </div>
                            `
                            : ''
                    }


                    <a
                        href="${escapeAttribute(href)}"
                        class="
                            vote-list-card__action
                            ${isActive ? 'is-primary' : ''}
                        ">

                        <span>
                            ${isActive ? 'Vào bình chọn' : 'Xem chi tiết'}
                        </span>

                        <i
                            class="
                                fa-solid
                                fa-arrow-right
                            ">
                        </i>

                    </a>

                </div>

            </article>
        `;
    }

    function bindEvents() {
        elements.relatedTabs.forEach((button) => {
            button.addEventListener('click', () => {
                const filter = button.dataset.relatedTab;

                if (!filter || state.relatedFilter === filter) {
                    return;
                }

                state.relatedFilter = filter;

                elements.relatedTabs.forEach((item) => {
                    item.classList.toggle('is-active', item === button);
                });

                renderUpcoming();
            });
        });

        elements.voteButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (!canVote || state.voting || !state.current) {
                    return;
                }

                const value = button.dataset.voteChoice === 'true';

                submitVote(value);
            });
        });

        elements.voteChange?.addEventListener('click', () => {
            if (!state.current || state.current.choPhepThayDoi === false) {
                return;
            }

            state.changingVote = true;

            renderVoteSelection(state.current);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            load({
                silent: true
            });
        });
    }

    async function submitVote(luaChon) {
        const record = state.current;

        if (!record?.id) {
            return;
        }

        if (state.voting) {
            return;
        }

        state.voting = true;

        renderVoteSelection(record);

        try {
            const result = await window.MCS.api.request(API.vote(record.id), {
                method: 'PUT',
                body: JSON.stringify({
                    luaChon
                })
            });

            state.changingVote = false;

            window.MCS?.toast?.success?.(result?.message || 'Bình chọn thành công.');

            await load({
                silent: true
            });
        } catch (error) {
            console.error('Không thể bình chọn:', error);

            window.MCS?.toast?.error?.(error?.message || 'Không thể thực hiện bình chọn.');
        } finally {
            state.voting = false;

            if (state.current) {
                renderVoteSelection(state.current);
            }
        }
    }

    function startAutoRefresh() {
        stopAutoRefresh();

        state.refreshTimer = window.setInterval(() => {
            if (document.visibilityState !== 'visible' || state.voting) {
                return;
            }

            load({
                silent: true
            });
        }, 30000);
    }

    function stopAutoRefresh() {
        if (!state.refreshTimer) {
            return;
        }

        window.clearInterval(state.refreshTimer);

        state.refreshTimer = null;
    }

    function flattenFoods(groups) {
        if (!Array.isArray(groups)) {
            return [];
        }

        return groups.flatMap((group) => {
            const foods = Array.isArray(group?.dsMonAn) ? group.dsMonAn : [];

            return foods.map((food) => ({
                ...food,
                _group: group
            }));
        });
    }

    function getFoodName(food) {
        const record = food?.monAn || food || {};

        return record?.tenMonAn || record?.tenMon || record?.name || 'Món ăn';
    }

    function buildMenuDetailUrl(record) {
        const thucDonId = Number(record?.thucDonId);
        const thucDonNgayId = Number(record?.thucDonNgayId);

        if (!Number.isInteger(thucDonId) || thucDonId <= 0 || !Number.isInteger(thucDonNgayId) || thucDonNgayId <= 0) {
            return '#';
        }

        return (
            '/thong-tin-chi-tiet-thuc-don/' + encodeURIComponent(thucDonId) + '/' + encodeURIComponent(thucDonNgayId)
        );
    }

    function buildVoteDetailUrl(record) {
        const recordThucDonId = record?.thucDonId;

        const recordId = record?.id ?? record?.dotBinhChonId;

        if (!recordThucDonId || !recordId) {
            return '#';
        }

        return (
            '/binh-chon/chi-tiet-binh-chon/' + encodeURIComponent(recordThucDonId) + '/' + encodeURIComponent(recordId)
        );
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

    function showNoPermission() {
        setLoading(false);

        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        const noPermission = elements.noPermission || document.querySelector('[data-catalog-no-permission]');

        if (!pageContent || !noPermission) {
            return;
        }

        if (!noPermission._mcsOriginalParent) {
            noPermission._mcsOriginalParent = noPermission.parentElement;
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

        const noPermission = elements.noPermission || document.querySelector('[data-catalog-no-permission]');

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

    function normalizeDate(value) {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(value) {
        const date = value instanceof Date ? value : normalizeDate(value);

        if (!date) {
            return '—';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function formatTime(value) {
        const date = value instanceof Date ? value : normalizeDate(value);

        if (!date) {
            return '—';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatDateTimeShort(value) {
        const date = normalizeDate(value);

        if (!date) {
            return '—';
        }

        return `${formatTime(date)} - ${formatDate(date)}`;
    }

    function getWeekday(value) {
        const date = value instanceof Date ? value : normalizeDate(value);

        if (!date) {
            return '—';
        }

        const result = new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long'
        }).format(date);

        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    function roundPercent(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        return Number(number.toFixed(1));
    }

    function toNumber(value) {
        const number = Number(value);

        return Number.isFinite(number) ? number : 0;
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

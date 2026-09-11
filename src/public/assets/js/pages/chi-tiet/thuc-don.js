'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-menu-detail-page]');

    if (!root) {
        return;
    }

    const thucDonId = Number(root.dataset.thucDonId);
    const thucDonNgayId = Number(root.dataset.thucDonNgayId);

    const elements = {
        content: root.querySelector('[data-menu-detail-content]'),
        loading: root.querySelector('[data-menu-detail-loading]'),
        heroImage: root.querySelector('[data-menu-hero-image]'),
        heroImagePlaceholder: root.querySelector('[data-menu-hero-image-placeholder]'),
        heroCategory: root.querySelector('[data-menu-hero-category]'),
        heroTitle: root.querySelector('[data-menu-hero-title]'),
        heroCode: root.querySelector('[data-menu-hero-code]'),
        heroGroup: root.querySelector('[data-menu-hero-group]'),
        heroUnit: root.querySelector('[data-menu-hero-unit]'),
        heroStatus: root.querySelector('[data-menu-hero-status]'),
        heroMenu: root.querySelector('[data-menu-hero-menu]'),
        heroDescription: root.querySelector('[data-menu-hero-description]'),
        currentMenuLabel: root.querySelector('[data-current-menu-label]'),
        foodTrack: root.querySelector('[data-menu-food-track]'),
        foodEmpty: root.querySelector('[data-menu-food-empty]'),
        dayGrid: root.querySelector('[data-menu-day-grid]'),
        dayEmpty: root.querySelector('[data-menu-day-empty]')
    };

    const state = {
        menu: null,
        day: null,
        days: [],
        foods: [],
        selectedFoodId: null
    };

    if (!Number.isInteger(thucDonId) || thucDonId <= 0 || !Number.isInteger(thucDonNgayId) || thucDonNgayId <= 0) {
        showError('Thông tin thực đơn không hợp lệ.');
        return;
    }

    const canContinue = await checkPermission();

    if (!canContinue) {
        return;
    }

    bindEvents();
    await load();

    async function checkPermission() {
        const permission = window.ThucDon?.permission;

        if (!permission?.load || !permission?.canView) {
            return true;
        }

        try {
            const permissions = await permission.load();

            if (permission.canView(permissions)) {
                permission.hideNoPermission?.(root);
                return true;
            }

            permission.showNoPermission?.(root);
            return false;
        } catch (error) {
            console.error('Không thể kiểm tra quyền thực đơn:', error);

            permission?.showNoPermission?.(root);

            return false;
        }
    }

    async function load() {
        setLoading(true);

        try {
            const response = await window.ThucDon.api.detail(thucDonId);
            const data = response?.data ?? response;

            if (!data) {
                throw new Error('Không tìm thấy thực đơn.');
            }

            state.menu = data;
            state.days = normalizeDays(data.dsNgay || []);

            state.day = state.days.find((day) => Number(day.id) === thucDonNgayId);

            if (!state.day) {
                throw new Error('Ngày thực đơn không tồn tại trong thực đơn này.');
            }

            state.foods = flattenFoods(state.day);

            state.selectedFoodId = state.foods[0] ? getFoodKey(state.foods[0]) : null;

            render();
        } catch (error) {
            console.error(error);

            showError(error?.message || 'Không thể tải chi tiết thực đơn.');
        } finally {
            setLoading(false);
        }
    }

    function render() {
        renderCurrentMenuLabel();
        renderFoodList();
        renderOtherDays();

        const food = state.foods.find((item) => getFoodKey(item) === state.selectedFoodId) || state.foods[0] || null;

        renderHero(food);
    }

    function renderHero(food) {
        if (!food) {
            renderHeroImage('');

            elements.heroCategory.textContent = 'Chưa có món';
            elements.heroTitle.textContent = 'Chưa có món ăn';
            elements.heroCode.textContent = '—';
            elements.heroGroup.textContent = '—';
            elements.heroUnit.textContent = '—';
            elements.heroDescription.textContent = 'Ngày thực đơn này chưa có món ăn.';

            renderHeroStatus();

            elements.heroMenu.textContent = getMenuDayLabel();
            return;
        }

        const mon = getFoodRecord(food);
        const group = food._group || {};
        const image = getFoodImage(mon);

        renderHeroImage(image, getFoodName(mon));

        const groupName = getGroupName(group, mon);

        elements.heroCategory.textContent = groupName;
        elements.heroTitle.textContent = getFoodName(mon);
        elements.heroCode.textContent = getFoodCode(mon);
        elements.heroGroup.textContent = groupName;
        elements.heroUnit.textContent = getUnitName(food, mon);
        elements.heroMenu.textContent = getMenuDayLabel();
        elements.heroDescription.textContent = getFoodDescription(food, mon);

        renderHeroStatus();
    }

    function renderHeroStatus() {
        const status = getStatusInformation(state.menu?.trangThai, state.menu?.tenTrangThai);

        elements.heroStatus.className = `menu-detail-status ${status.className}`;

        elements.heroStatus.textContent = status.label;
    }

    function renderHeroImage(url, alt = '') {
        if (!url) {
            elements.heroImage.hidden = true;
            elements.heroImagePlaceholder.hidden = false;

            elements.heroImage.removeAttribute('src');
            return;
        }

        elements.heroImage.src = url;
        elements.heroImage.alt = alt;
        elements.heroImage.hidden = false;
        elements.heroImagePlaceholder.hidden = true;

        elements.heroImage.onerror = () => {
            elements.heroImage.hidden = true;
            elements.heroImagePlaceholder.hidden = false;
        };
    }

    function renderCurrentMenuLabel() {
        elements.currentMenuLabel.textContent = getMenuDayLabel();
    }

    function renderFoodList() {
        if (!state.foods.length) {
            elements.foodTrack.innerHTML = '';
            elements.foodEmpty.hidden = false;
            return;
        }

        elements.foodEmpty.hidden = true;

        elements.foodTrack.innerHTML = state.foods.map(renderFoodCard).join('');
    }

    function renderFoodCard(food) {
        const mon = getFoodRecord(food);
        const key = getFoodKey(food);
        const active = key === state.selectedFoodId;
        const image = getFoodImage(mon);

        const groupName = getGroupName(food._group, mon);

        return `
            <button
                type="button"
                class="
                    menu-detail-food-card
                    ${active ? 'is-active' : ''}
                "
                data-food-id="${escapeAttribute(key)}">

                <span
                    class="
                        menu-detail-food-card__image
                    ">

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeAttribute(image)}"
                                    alt="${escapeAttribute(getFoodName(mon))}">
                            `
                            : `
                                <span
                                    class="
                                        menu-detail-card-placeholder
                                    ">

                                    <i
                                        class="
                                            fa-solid
                                            fa-utensils
                                        ">
                                    </i>

                                </span>
                            `
                    }

                </span>

                <span
                    class="
                        menu-detail-food-card__body
                    ">

                    <span
                        class="
                            menu-detail-food-card__category
                        ">
                        ${escapeHtml(groupName)}
                    </span>

                    <strong
                        class="
                            menu-detail-food-card__name
                        ">
                        ${escapeHtml(getFoodName(mon))}
                    </strong>

                </span>

            </button>
        `;
    }

    function renderOtherDays() {
        if (!state.days.length) {
            elements.dayGrid.innerHTML = '';
            elements.dayEmpty.hidden = false;
            return;
        }

        elements.dayEmpty.hidden = true;

        elements.dayGrid.innerHTML = state.days.map(renderDayCard).join('');
    }

    function renderDayCard(day) {
        const active = Number(day.id) === thucDonNgayId;

        const groups = normalizeGroups(day.dsNhomMonAn || []);

        const total = groups.reduce((sum, group) => sum + (group.dsMonAn?.length || 0), 0);

        const date = normalizeDate(day.ngay || day.ngayApDung);

        return `
            <article
                class="
                    menu-detail-day-card
                    ${active ? 'is-active' : ''}
                ">

                <div
                    class="
                        menu-detail-day-card__header
                    ">

                    <span
                        class="
                            menu-detail-day-card__calendar
                        ">

                        <i
                            class="
                                fa-regular
                                fa-calendar
                            ">
                        </i>

                    </span>

                    <div
                        class="
                            menu-detail-day-card__date
                        ">

                        <strong>
                            ${escapeHtml(getWeekday(date))}
                        </strong>

                        <span>
                            ${escapeHtml(formatDate(date))}
                        </span>

                    </div>

                    ${
                        active
                            ? `
                                <span
                                    class="
                                        menu-detail-day-card__status
                                    ">
                                    Đang xem
                                </span>
                            `
                            : ''
                    }

                </div>

                <div
                    class="
                        menu-detail-day-card__meal
                    ">
                    ${escapeHtml(getMealName())}
                </div>

                <div
                    class="
                        menu-detail-day-card__groups
                    ">

                    ${
                        groups.length
                            ? groups.map((group) => renderDayGroup(group)).join('')
                            : `
                                <span
                                    class="
                                        menu-detail-day-card__no-group
                                    ">
                                    Chưa có nhóm món
                                </span>
                            `
                    }

                </div>

                <div
                    class="
                        menu-detail-day-card__total
                    ">

                    <strong>
                        Tổng: ${total} món
                    </strong>

                </div>

                <a
                    href="/thong-tin-chi-tiet-thuc-don/${encodeURIComponent(thucDonId)}/${encodeURIComponent(day.id)}"
                    class="
                        menu-detail-day-card__link
                    ">

                    Xem thực đơn

                    <i
                        class="
                            fa-solid
                            fa-arrow-right
                        ">
                    </i>

                </a>

            </article>
        `;
    }

    function renderDayGroup(group) {
        const name = getGroupName(group);
        const count = group.dsMonAn?.length || 0;

        return `
            <div
                class="
                    menu-detail-day-group
                ">

                <span>

                    <i
                        class="
                            fa-solid
                            fa-shapes
                        ">
                    </i>

                    ${escapeHtml(name)}

                </span>

                <strong>
                    ${count} món
                </strong>

            </div>
        `;
    }

    function bindEvents() {
        elements.foodTrack?.addEventListener('click', (event) => {
            const card = event.target.closest('[data-food-id]');

            if (!card) {
                return;
            }

            state.selectedFoodId = card.dataset.foodId;

            renderFoodList();

            const selected = state.foods.find((food) => getFoodKey(food) === state.selectedFoodId);

            renderHero(selected);
        });

        root.querySelectorAll('[data-food-scroll]').forEach((button) => {
            button.addEventListener('click', () => {
                const direction = button.dataset.foodScroll === 'prev' ? -1 : 1;

                elements.foodTrack?.scrollBy({
                    left: direction * 560,
                    behavior: 'smooth'
                });
            });
        });
    }

    function flattenFoods(day) {
        return normalizeGroups(day?.dsNhomMonAn || []).flatMap((group) =>
            normalizeFoods(group.dsMonAn || []).map((food) => ({
                ...food,
                _group: group
            }))
        );
    }

    function normalizeDays(days) {
        return [...days].sort((a, b) => {
            const orderA = Number(a?.thuTuHienThi);
            const orderB = Number(b?.thuTuHienThi);

            if (Number.isFinite(orderA) && Number.isFinite(orderB) && orderA !== orderB) {
                return orderA - orderB;
            }

            return normalizeDate(a?.ngay || a?.ngayApDung).localeCompare(normalizeDate(b?.ngay || b?.ngayApDung));
        });
    }

    function normalizeGroups(groups) {
        return [...groups].sort((a, b) => Number(a?.thuTuHienThi || 0) - Number(b?.thuTuHienThi || 0));
    }

    function normalizeFoods(foods) {
        return [...foods].sort((a, b) => Number(a?.thuTuHienThi || 0) - Number(b?.thuTuHienThi || 0));
    }

    function getFoodRecord(food) {
        return food?.monAn || food || {};
    }

    function getFoodKey(food) {
        return String(food?.id ?? food?.monAnId ?? food?.monAn?.id ?? '');
    }

    function getFoodName(mon) {
        return mon?.tenMonAn || mon?.tenMon || mon?.name || 'Món ăn';
    }

    function getFoodCode(mon) {
        return mon?.maMonAn || mon?.maMon || mon?.code || '—';
    }

    function getGroupName(group = {}, mon = {}) {
        return (
            group?.tenNhomMonAn ||
            group?.nhomMonAn?.tenNhomMonAn ||
            mon?.nhomMonAn?.tenNhomMonAn ||
            mon?.tenNhomMonAn ||
            'Nhóm món'
        );
    }

    function getUnitName(food, mon) {
        return (
            food?.donViTinh?.tenDonViTinh ||
            food?.donViTinh?.tenDvt ||
            mon?.donViTinh?.tenDonViTinh ||
            mon?.donViTinh?.tenDvt ||
            mon?.tenDonViTinh ||
            '—'
        );
    }

    function getFoodDescription(food, mon) {
        return mon?.moTa || mon?.moTaMonAn || food?.ghiChu || 'Chưa có mô tả cho món ăn này.';
    }

    function getFoodImage(mon) {
        const value =
            mon?.anhDaiDien || mon?.anhMonAn || mon?.hinhAnh || mon?.duongDanAnh || mon?.urlAnh || mon?.image || '';

        const image = String(value).trim();

        if (!image) {
            return '';
        }

        if (image.startsWith('/') || /^https?:\/\//i.test(image)) {
            return image;
        }

        return `/${image}`;
    }

    function getMealName() {
        return state.menu?.caAn?.tenCaAn || state.menu?.tenCaAn || 'Ca ăn';
    }

    function getMenuDayLabel() {
        const date = normalizeDate(state.day?.ngay || state.day?.ngayApDung);

        return `Thực đơn ngày ` + `${formatDate(date)} ` + `(${getMealName()})`;
    }

    function getStatusInformation(value, labelFromApi) {
        const status = Number(value);

        const map = {
            10: {
                label: 'Mới',
                className: 'is-new'
            },

            20: {
                label: 'Chờ duyệt',
                className: 'is-pending'
            },

            30: {
                label: 'Đang áp dụng',
                className: 'is-active'
            },

            40: {
                label: 'Đang rà soát',
                className: 'is-review'
            },

            50: {
                label: 'Đã hủy',
                className: 'is-cancelled'
            },

            60: {
                label: 'Đã kết thúc',
                className: 'is-ended'
            }
        };

        const result = map[status] || {
            label: 'Đang áp dụng',
            className: 'is-active'
        };

        if (labelFromApi) {
            result.label = String(labelFromApi);
        }

        return result;
    }

    function normalizeDate(value) {
        if (!value) {
            return '';
        }

        const text = String(value);

        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (match) {
            return `${match[1]}-` + `${match[2]}-` + `${match[3]}`;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-` + `${month}-` + `${day}`;
    }

    function formatDate(value) {
        const date = normalizeDate(value);

        if (!date) {
            return '—';
        }

        const [year, month, day] = date.split('-');

        return `${day}/` + `${month}/` + `${year}`;
    }

    function getWeekday(value) {
        const date = normalizeDate(value);

        if (!date) {
            return '—';
        }

        const [year, month, day] = date.split('-').map(Number);

        const valueDate = new Date(year, month - 1, day);

        const names = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

        return names[valueDate.getDay()];
    }

    function setLoading(loading) {
        if (elements.loading) {
            elements.loading.hidden = !loading;
        }

        if (elements.content) {
            elements.content.hidden = loading;
        }
    }

    function showError(message) {
        setLoading(false);

        if (elements.content) {
            elements.content.innerHTML = `
                <div
                    class="
                        menu-detail-error
                    ">

                    <i
                        class="
                            fa-solid
                            fa-circle-exclamation
                        ">
                    </i>

                    <strong>
                        Không thể hiển thị thực đơn
                    </strong>

                    <span>
                        ${escapeHtml(message)}
                    </span>

                </div>
            `;
        }

        window.MCS?.toast?.error?.(message);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
});

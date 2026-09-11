'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.form = (() => {
    const STATUS = Object.freeze({
        TAO_MOI: 0,

        TAO_MOI_CHO_DUYET: 10,

        CHO_DUYET: 20,

        DANG_AP_DUNG: 30,

        CHO_DUYET_LAI: 40,

        DA_HUY: 50,

        DA_KET_THUC: 60
    });

    const STATUS_LABEL = Object.freeze({
        0: 'Tạo mới',

        10: 'Tạo mới/ Chờ duyệt',

        20: 'Chờ duyệt',

        30: 'Đang áp dụng',

        40: 'Chờ duyệt lại',

        50: 'Đã hủy',

        60: 'Đã kết thúc'
    });

    const STATUS_CLASS = Object.freeze({
        0: 'is-new',

        10: 'is-new',

        20: 'is-pending',

        30: 'is-active',

        40: 'is-review',

        50: 'is-cancelled',

        60: 'is-ended'
    });

    const PLACEHOLDER_IMAGE = '/uploads/danh-muc/mon-an/mon-an.png';

    function init(root, { mode = 'detail', settings = {} } = {}) {
        if (!root) return null;

        const directFoodMode = mode !== 'detail' && settings?.batBuocChonNhomMon === false;

        const state = {
            mode,

            directFoodMode,

            contentView: directFoodMode ? 'food' : 'detail',

            daySearch: '',

            data: null,

            selectedDayId: null,

            selectedGroupId: null
        };

        const contentSection = root.querySelector('[data-content-section]');

        if (contentSection) {
            contentSection.dataset.contentViewMode = state.contentView;
        }

        root.dataset.formMode = mode;

        applyMode(root, mode);

        bindToggleEvents(root, state);

        bindContentViewEvents(root, state);

        bindDaySearchEvents(root, state);

        bindGeneralFieldEvents(root, state);

        return {
            setData(data) {
                state.data = normalizeData(clone(data || {}));

                renderGeneral(root, state);

                renderContent(root, state);
            },

            getData() {
                if (mode !== 'detail') {
                    syncGeneral(root, state);
                }

                return clone(state.data);
            },

            getState() {
                return state;
            },

            setWorkingData(data) {
                if (state.data && state.mode !== 'detail') {
                    syncGeneral(root, state);
                }

                const currentGeneral = {
                    maThucDon: state.data?.maThucDon,

                    tenThucDon: state.data?.tenThucDon,

                    loaiThucDon: state.data?.loaiThucDon,

                    coSoId: state.data?.coSoId,

                    nhaAnId: state.data?.nhaAnId,

                    caAnId: state.data?.caAnId,

                    tuNgay: state.data?.tuNgay,

                    denNgay: state.data?.denNgay,

                    moTa: state.data?.moTa
                };

                state.data = normalizeData(clone(data || {}));

                Object.assign(state.data, currentGeneral);

                renderContent(root, state);
            },

            setFieldError(fieldName, message) {
                setFieldError(root, fieldName, message);
            },

            clearFieldError(fieldName) {
                clearFieldError(root, fieldName);
            },

            clearErrors() {
                clearAllFieldErrors(root);
            },

            focusFirstError() {
                focusFirstFieldError(root);
            },

            render() {
                renderGeneral(root, state);

                renderContent(root, state);
            },

            selectDay(id) {
                state.selectedDayId = id == null ? null : String(id);
            },

            selectGroup(id) {
                state.selectedGroupId = id == null ? null : String(id);
            }
        };
    }

    function applyMode(root, mode) {
        root.querySelectorAll('[data-editor-only]').forEach((el) => {
            el.hidden = mode === 'detail';
        });

        const editFields = root.querySelector('[data-general-edit-fields]');

        const detailFields = root.querySelector('[data-general-detail-fields]');

        if (editFields) {
            editFields.hidden = mode === 'detail';
        }

        if (detailFields) {
            detailFields.hidden = mode !== 'detail';
        }
    }

    function applyContentView(root, state) {
        const directFoodMode = state.directFoodMode === true;

        /*
         * Nút cấp ngày:
         *
         * TRUE  -> Thêm nhóm
         * FALSE -> Thêm món
         */
        root.querySelectorAll('[data-day-add-group]').forEach((button) => {
            button.hidden = state.mode === 'detail';

            const label = button.querySelector('span');

            if (label) {
                label.textContent = directFoodMode ? 'Thêm món' : 'Thêm nhóm';
            }

            button.title = directFoodMode ? 'Thêm món' : 'Thêm nhóm';
        });

        /*
         * FALSE:
         * Không có Chi tiết / Nhóm món / Món ăn.
         *
         * Chỉ còn duy nhất chế độ món ăn.
         */
        const switcher = root.querySelector('[data-content-view-switcher]');

        if (switcher) {
            switcher.hidden = directFoodMode;
        }

        root.querySelectorAll('[data-content-view]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.contentView === state.contentView);
        });
    }

    function normalizeData(data) {
        data.dsNgay = Array.isArray(data.dsNgay) ? data.dsNgay : data.danhSachNgay || [];

        data.dsNgay.forEach((day, di) => {
            if (day.id == null) {
                day.id = tempId('day', di);
            }

            day.ngay = normalizeDate(day.ngay || day.ngayApDung || day.ngayThucDon);

            day.dsNhomMonAn = Array.isArray(day.dsNhomMonAn) ? day.dsNhomMonAn : day.danhSachNhomMonAn || [];

            day.dsNhomMonAn.forEach((group, gi) => {
                if (group.id == null) {
                    group.id = tempId('group', gi);
                }

                group.dsMonAn = Array.isArray(group.dsMonAn) ? group.dsMonAn : group.danhSachMonAn || [];

                group.dsMonAn.forEach((food, fi) => {
                    if (food.id == null) {
                        food.id = tempId('food', fi);
                    }
                });
            });
        });

        return data;
    }

    function renderGeneral(root, state) {
        const d = state.data;

        if (!d) return;

        if (state.mode === 'detail') {
            setText(root, '[data-detail-ma]', d.maThucDon);

            setText(root, '[data-detail-ten]', d.tenThucDon);

            setText(
                root,
                '[data-detail-loai]',
                d.loaiThucDonText || getEnumLabel(root, 'loaiThucDon', d.loaiThucDon) || '-'
            );

            setText(root, '[data-detail-co-so]', d.tenCoSo || d.coSo?.tenCoSo || '-');

            setText(root, '[data-detail-nha-an]', d.tenNhaAn || d.nhaAn?.tenNhaAn || '-');

            setText(root, '[data-detail-ca-an]', d.tenCaAn || d.caAn?.tenCaAn || '-');

            setText(root, '[data-detail-thoi-gian]', `${formatDate(d.tuNgay)} - ${formatDate(d.denNgay)}`);

            setText(root, '[data-detail-mo-ta]', d.moTa || '-');

            renderStatus(root.querySelector('[data-detail-trang-thai]'), d.trangThai);

            return;
        }

        setField(root, 'maThucDon', d.maThucDon);

        setField(root, 'tenThucDon', d.tenThucDon);

        setSelect(root, 'loaiThucDon', d.loaiThucDon);

        setSelect(root, 'coSoId', d.coSoId);

        setSelect(root, 'nhaAnId', d.nhaAnId);

        setSelect(root, 'caAnId', d.caAnId);

        window.ThucDon.options?.setTimeValue?.(root, d);

        setField(root, 'moTa', d.moTa);

        renderStatus(root.querySelector('[data-editor-status]'), d.trangThai);
    }

    function syncGeneral(root, state) {
        const d = state.data;

        if (!d) return;

        d.maThucDon = value(root, 'maThucDon');

        d.tenThucDon = value(root, 'tenThucDon');

        d.loaiThucDon = numberValue(root, 'loaiThucDon');

        d.coSoId = numberValue(root, 'coSoId');

        d.nhaAnId = numberValue(root, 'nhaAnId');

        d.caAnId = numberValue(root, 'caAnId');

        const time = window.ThucDon.options?.syncTimeValue?.(root) || {};

        d.tuNgay = normalizeDate(time.tuNgay);

        d.denNgay = normalizeDate(time.denNgay);

        d.moTa = value(root, 'moTa');
    }

    function renderContent(root, state) {
        const list = root.querySelector('[data-days-list]');

        const tpl = document.getElementById('td-template-day');

        if (!list || !tpl) {
            return;
        }

        list.innerHTML = '';

        const days = state.data?.dsNgay || [];

        const filteredDays = filterDays(days, state.daySearch);

        const empty = root.querySelector('[data-empty-day]');

        const searchEmpty = root.querySelector('[data-day-search-empty]');

        if (searchEmpty) {
            searchEmpty.hidden = !(days.length > 0 && filteredDays.length === 0 && state.daySearch);
        }

        if (empty) {
            empty.hidden = days.length > 0;
        }

        filteredDays.forEach((day) => {
            const index = days.indexOf(day);

            const fragment = tpl.content.cloneNode(true);

            const item = fragment.querySelector('[data-day-item]');

            item.dataset.dayId = String(day.id);

            const dayBody = fragment.querySelector('[data-day-body]');

            const isDayOpen = String(state.selectedDayId) === String(day.id);

            if (dayBody) {
                dayBody.hidden = !isDayOpen;
            }

            item.classList.toggle('is-open', isDayOpen);

            setFragmentText(fragment, '[data-day-index]', String(index + 1).padStart(2, '0'));

            setFragmentText(fragment, '[data-day-weekday]', weekday(day.ngay));

            setFragmentText(fragment, '[data-day-date]', formatDate(day.ngay));

            const groupCount = fragment.querySelector('[data-day-group-count]');

            const groupSeparator = fragment.querySelector('[data-day-group-separator]');

            if (state.directFoodMode) {
                if (groupCount) {
                    groupCount.hidden = true;
                }

                if (groupSeparator) {
                    groupSeparator.hidden = true;
                }
            } else {
                setFragmentText(fragment, '[data-day-group-count]', `${day.dsNhomMonAn.length} nhóm`);
            }

            setFragmentText(fragment, '[data-day-food-count]', `${countFoods(day)} món`);

            const noteWrap = fragment.querySelector('[data-day-note-wrap]');

            if (day.ghiChu && noteWrap) {
                noteWrap.hidden = false;

                setFragmentText(fragment, '[data-day-note]', day.ghiChu);
            }

            const groupsList = fragment.querySelector('[data-groups-list]');

            setFragmentText(
                fragment,
                '[data-day-content-title]',
                state.directFoodMode
                    ? 'Danh sách món ăn'
                    : state.contentView === 'food'
                      ? 'Danh sách món ăn'
                      : 'Danh sách nhóm món'
            );

            const addGroupButton = fragment.querySelector('[data-day-add-group]');

            renderDayContent(groupsList, day, state);

            list.appendChild(fragment);
        });

        applyMode(root, state.mode);

        applyContentView(root, state);
    }

    function renderDayContent(container, day, state) {
        /*
         * Không bắt buộc nhóm:
         * luôn render món trực tiếp.
         */
        if (state.directFoodMode) {
            renderFoodOverview(container, day, state);

            return;
        }

        switch (state.contentView) {
            case 'group':
                renderGroupOverview(container, day, state);

                break;

            case 'food':
                renderFoodOverview(container, day, state);

                break;

            case 'detail':

            default:
                renderGroups(container, day, state);

                break;
        }
    }

    function renderGroupOverview(container, day, state) {
        const tpl = document.getElementById('td-template-group-overview');

        if (!container || !tpl) {
            return;
        }

        container.innerHTML = '';

        const groups = day.dsNhomMonAn || [];

        groups.forEach((group) => {
            const fragment = tpl.content.cloneNode(true);

            setFragmentText(
                fragment,
                '[data-group-overview-name]',
                group.tenNhomMonAn || group.nhomMonAn?.tenNhomMonAn || '-'
            );

            setFragmentText(
                fragment,
                '[data-group-overview-code]',
                group.maNhomMonAn || group.nhomMonAn?.maNhomMonAn || '-'
            );

            setFragmentText(fragment, '[data-group-overview-food-count]', `${(group.dsMonAn || []).length} món`);

            container.appendChild(fragment);
        });
    }

    function getDayFoods(day) {
        return (day.dsNhomMonAn || []).flatMap((group) => {
            return (group.dsMonAn || []).map((food) => ({
                food,

                group
            }));
        });
    }

    function renderFoodOverview(container, day, state) {
        const tpl = document.getElementById('td-template-food-overview');

        if (!container || !tpl) {
            return;
        }

        container.innerHTML = '';

        const foods = getDayFoods(day);

        foods.forEach(({ food, group }) => {
            const fragment = tpl.content.cloneNode(true);

            const mon = food.monAn || food;

            setFragmentText(fragment, '[data-food-overview-name]', mon.tenMonAn || food.tenMonAn || '-');

            setFragmentText(fragment, '[data-food-overview-code]', mon.maMonAn || food.maMonAn || '-');

            const groupField = fragment.querySelector('[data-food-overview-group-field]');

            if (state.directFoodMode) {
                groupField?.remove();
            } else {
                setFragmentText(
                    fragment,
                    '[data-food-overview-group]',
                    group.tenNhomMonAn || group.nhomMonAn?.tenNhomMonAn || '-'
                );
            }

            setFragmentText(fragment, '[data-food-overview-quantity]', food.dinhLuong ?? '-');

            setFragmentText(
                fragment,
                '[data-food-overview-unit]',
                food.donViTinh?.tenDonViTinh || mon.donViTinh?.tenDonViTinh || food.tenDonViTinh || '-'
            );

            setFragmentText(fragment, '[data-food-overview-portion]', food.khauPhan ?? mon.khauPhan ?? '-');

            const img = fragment.querySelector('[data-food-overview-image]');

            if (img) {
                img.src = normalizeImage(mon.hinhAnh || food.hinhAnh);

                img.onerror = () => {
                    img.onerror = null;

                    img.src = PLACEHOLDER_IMAGE;
                };
            }

            container.appendChild(fragment);
        });
    }

    function renderGroups(container, day, state) {
        const tpl = document.getElementById('td-template-group');

        if (!container || !tpl) {
            return;
        }

        container.innerHTML = '';

        day.dsNhomMonAn.forEach((group) => {
            const fragment = tpl.content.cloneNode(true);

            const item = fragment.querySelector('[data-group-item]');

            item.dataset.groupId = String(group.id);

            item.dataset.dayId = String(day.id);

            const groupBody = fragment.querySelector('[data-group-body]');

            const isGroupOpen =
                String(state.selectedDayId) === String(day.id) && String(state.selectedGroupId) === String(group.id);

            if (groupBody) {
                groupBody.hidden = !isGroupOpen;
            }

            item.classList.toggle('is-open', isGroupOpen);

            setFragmentText(fragment, '[data-group-name]', group.tenNhomMonAn || group.nhomMonAn?.tenNhomMonAn || '-');

            setFragmentText(fragment, '[data-group-food-count]', `${group.dsMonAn.length} món`);

            const foodsList = fragment.querySelector('[data-food-list]');

            renderFoods(foodsList, group, day, state.mode);

            container.appendChild(fragment);
        });
    }

    function renderFoods(container, group, day, mode) {
        const tpl = document.getElementById('td-template-food');

        if (!container || !tpl) {
            return;
        }

        container.innerHTML = '';

        group.dsMonAn.forEach((food) => {
            const fragment = tpl.content.cloneNode(true);

            const item = fragment.querySelector('[data-food-item]');

            item.dataset.foodId = String(food.id);

            item.dataset.groupId = String(group.id);

            item.dataset.dayId = String(day.id);

            const mon = food.monAn || food;

            setFragmentText(fragment, '[data-food-name]', mon.tenMonAn || food.tenMonAn || '-');

            setFragmentText(fragment, '[data-food-code]', mon.maMonAn || food.maMonAn || '-');

            setFragmentText(fragment, '[data-food-quantity]', food.dinhLuong ?? '-');

            setFragmentText(
                fragment,
                '[data-food-unit]',
                food.donViTinh?.tenDonViTinh || mon.donViTinh?.tenDonViTinh || food.tenDonViTinh || '-'
            );

            setFragmentText(fragment, '[data-food-portion]', food.khauPhan ?? mon.khauPhan ?? '-');

            setFragmentText(fragment, '[data-food-note]', food.ghiChu || '-');

            const img = fragment.querySelector('[data-food-image]');

            if (img) {
                img.src = normalizeImage(mon.hinhAnh || food.hinhAnh);

                img.onerror = () => {
                    img.onerror = null;

                    img.src = PLACEHOLDER_IMAGE;
                };
            }

            container.appendChild(fragment);
        });
    }

    function bindToggleEvents(root, state) {
        root.addEventListener('click', (event) => {
            const dayToggle = event.target.closest('[data-toggle-day]');

            if (dayToggle) {
                const item = dayToggle.closest('[data-day-item]');

                const body = item?.querySelector('[data-day-body]');

                toggleBody(body, dayToggle);

                if (body && !body.hidden) {
                    state.selectedDayId = item.dataset.dayId;
                } else if (String(state.selectedDayId) === String(item?.dataset.dayId)) {
                    state.selectedDayId = null;

                    state.selectedGroupId = null;
                }

                return;
            }

            const groupToggle = event.target.closest('[data-toggle-group]');

            if (groupToggle) {
                const item = groupToggle.closest('[data-group-item]');

                const body = item?.querySelector('[data-group-body]');

                toggleBody(body, groupToggle);

                if (body && !body.hidden) {
                    state.selectedDayId = item.dataset.dayId;

                    state.selectedGroupId = item.dataset.groupId;
                } else if (String(state.selectedGroupId) === String(item?.dataset.groupId)) {
                    state.selectedGroupId = null;
                }
            }
        });
    }

    function bindContentViewEvents(root, state) {
        root.addEventListener('click', (event) => {
            const button = event.target.closest('[data-content-view]');

            if (!button) {
                return;
            }

            const view = button.dataset.contentView;

            if (!['detail', 'group', 'food'].includes(view)) {
                return;
            }

            state.contentView = view;

            const contentSection = root.querySelector('[data-content-section]');

            if (contentSection) {
                contentSection.dataset.contentViewMode = view;
            }

            state.selectedGroupId = null;

            root.querySelectorAll('[data-content-view]').forEach((item) => {
                item.classList.toggle('is-active', item.dataset.contentView === view);
            });

            renderContent(root, state);
        });
    }

    function bindDaySearchEvents(root, state) {
        const searchRoot = root.querySelector('[data-day-search]');

        const input = searchRoot?.querySelector('[data-list-search]');

        const clearButton = searchRoot?.querySelector('[data-list-clear-search]');

        if (!input) {
            return;
        }

        input.addEventListener('input', () => {
            state.daySearch = input.value.trim();

            if (clearButton) {
                clearButton.hidden = state.daySearch === '';
            }

            renderContent(root, state);
        });

        clearButton?.addEventListener('click', () => {
            input.value = '';

            state.daySearch = '';

            clearButton.hidden = true;

            renderContent(root, state);

            input.focus();
        });
    }

    function bindGeneralFieldEvents(root, state) {
        if (root.dataset.tdGeneralFieldsBound === 'true') {
            return;
        }

        root.dataset.tdGeneralFieldsBound = 'true';

        root.addEventListener('input', (event) => {
            const fieldName = resolveFieldName(event.target);

            if (fieldName) {
                clearFieldError(root, fieldName);
            }
        });

        root.addEventListener('change', (event) => {
            const fieldName = resolveFieldName(event.target);

            if (fieldName) {
                clearFieldError(root, fieldName);
            }

            if (state.data && state.mode !== 'detail') {
                syncGeneral(root, state);
            }
        });
    }

    function resolveFieldName(target) {
        if (!(target instanceof Element)) {
            return null;
        }

        if (target.matches('[data-date-input]')) {
            return target.closest('[data-form-field]')?.dataset?.formField || null;
        }

        const named = target.closest('[name]');

        if (named?.name) {
            return named.name;
        }

        return target.closest('[data-form-field]')?.dataset?.formField || null;
    }

    function setFieldError(root, fieldName, message) {
        if (!fieldName) {
            return;
        }

        const container = root.querySelector(`[data-form-field="${fieldName}"]`);

        if (!container) {
            return;
        }

        const errorElement = container.querySelector(`[data-field-error="${fieldName}"]`);

        container.classList.add('is-invalid');

        container.querySelector('[data-smart-select]')?.classList.add('is-invalid');

        if (errorElement) {
            errorElement.textContent = message || 'Dữ liệu không hợp lệ.';

            errorElement.hidden = false;
        }
    }

    function clearFieldError(root, fieldName) {
        if (!fieldName) {
            return;
        }

        const container = root.querySelector(`[data-form-field="${fieldName}"]`);

        if (!container) {
            return;
        }

        container.classList.remove('is-invalid');

        container.querySelector('[data-smart-select]')?.classList.remove('is-invalid');

        const errorElement = container.querySelector(`[data-field-error="${fieldName}"]`);

        if (errorElement) {
            errorElement.textContent = '';

            errorElement.hidden = true;
        }
    }

    function clearAllFieldErrors(root) {
        root.querySelectorAll('[data-form-field]').forEach((container) => {
            const fieldName = container.dataset.formField;

            if (fieldName) {
                clearFieldError(root, fieldName);
            }
        });
    }

    function focusFirstFieldError(root) {
        const invalid = root.querySelector('.form-field.is-invalid');

        if (!invalid) {
            return;
        }

        const target = invalid.querySelector(
            `
                        [data-date-input],
                        [data-smart-select-control],
                        input:not([type="hidden"]),
                        textarea,
                        button
                    `
        );

        invalid.scrollIntoView({
            behavior: 'smooth',

            block: 'center'
        });

        setTimeout(() => {
            target?.focus?.();
        }, 250);
    }

    function filterDays(days, search) {
        const keyword = normalizeSearchText(search);

        if (!keyword) {
            return days;
        }

        return days.filter((day) => {
            const isoDate = normalizeDate(day.ngay);

            const formattedDate = formatDate(day.ngay);

            const dayName = weekday(day.ngay);

            const searchText = normalizeSearchText([isoDate, formattedDate, dayName].join(' '));

            return searchText.includes(keyword);
        });
    }

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

    function toggleBody(body, button) {
        if (!body) return;

        body.hidden = !body.hidden;

        button?.closest('article')?.classList.toggle('is-open', !body.hidden);
    }

    function renderStatus(el, status) {
        if (!el) {
            return;
        }

        const value = status === null || status === undefined || status === '' ? 10 : Number(status);

        el.textContent = STATUS_LABEL[value] || '-';

        el.className = `td-status ${STATUS_CLASS[value] || 'is-default'}`;
    }

    function setField(root, name, val) {
        const el = root.querySelector(`[name="${name}"]`);

        if (el) {
            el.value = val ?? '';
        }
    }

    function setSelect(root, name, val) {
        const el = root.querySelector(`select[name="${name}"]`);

        if (!el) return;

        const normalized = val == null ? '' : String(val);

        el.value = normalized;

        const api = el.closest('[data-smart-select]')?.smartSelect;

        api?.setValue?.(normalized, false);
    }

    function value(root, name) {
        return root.querySelector(`[name="${name}"]`)?.value?.trim?.() || '';
    }

    function numberValue(root, name) {
        const v = value(root, name);

        return v === '' ? null : Number(v);
    }

    function setText(root, selector, val) {
        const el = root.querySelector(selector);

        if (el) {
            el.textContent = val ?? '-';
        }
    }

    function getEnumLabel(root, enumName, value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const pageRoot = root.closest('[data-thuc-don-page]');

        const list = pageRoot?._tdOptions?.[enumName] || [];

        const item = list.find((option) => String(option.value) === String(value));

        return item?.label || item?.name || '';
    }

    function setFragmentText(root, selector, val) {
        const el = root.querySelector(selector);

        if (el) {
            el.textContent = val ?? '-';
        }
    }

    function countFoods(day) {
        return (day.dsNhomMonAn || []).reduce((n, g) => n + (g.dsMonAn || []).length, 0);
    }

    function normalizeDate(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const text = String(value).trim();

        /*
         * YYYY-MM-DD
         * hoặc YYYY-MM-DD + phần thời gian.
         */
        let match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);

        if (match) {
            return createIsoDate(Number(match[1]), Number(match[2]), Number(match[3]));
        }

        /*
         * DD/MM/YYYY
         */
        match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

        if (match) {
            return createIsoDate(Number(match[3]), Number(match[2]), Number(match[1]));
        }

        return '';
    }

    function createIsoDate(year, month, day) {
        if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
            return '';
        }

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return '';
        }

        const check = new Date(Date.UTC(year, month - 1, day));

        if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
            return '';
        }

        return `${year}-` + `${String(month).padStart(2, '0')}-` + `${String(day).padStart(2, '0')}`;
    }

    function formatDate(v) {
        const d = normalizeDate(v);

        if (!d) return '-';

        const [y, m, day] = d.split('-');

        return `${day}/${m}/${y}`;
    }

    function weekday(v) {
        const d = normalizeDate(v);

        if (!d) return '-';

        const [y, m, day] = d.split('-').map(Number);

        return ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][
            new Date(y, m - 1, day).getDay()
        ];
    }

    function normalizeImage(v) {
        if (!v) {
            return PLACEHOLDER_IMAGE;
        }

        const s = String(v);

        return /^(https?:|blob:|data:|\/)/.test(s) ? s : `/${s}`;
    }

    function tempId(type, i = 0) {
        return `tmp-${type}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    }

    function clone(v) {
        return JSON.parse(JSON.stringify(v));
    }

    return {
        init,
        STATUS,
        STATUS_LABEL,
        normalizeDate,
        formatDate
    };
})();

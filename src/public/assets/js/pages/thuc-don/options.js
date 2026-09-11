'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.options = (() => {
    const LOAI_THUC_DON = {
        NGAY: 10,
        TUAN: 20,
        THANG: 30,
        KHOANG_NGAY: 40
    };

    const DEFAULT_SETTINGS = {
        ngayBatDauTuan: 0,
        batBuocDuSoNgay: false,
        soTuanHienThi: 5,
        soNamHienThiThang: 5,
        batBuocChonNhomMon: true
    };

    async function init(root, data = null) {
        const [
            enumsResponse,
            coSo,
            nhaAn,
            caAn,
            nhomMonAn,
            monAn,
            donViTinh,
            ngayBatDauTuan,
            batBuocDuSoNgay,
            soTuanHienThi,
            soNamHienThiThang,
            batBuocChonNhomMon
        ] = await Promise.all([
            window.ThucDon.api.enums(),

            getList('/api/mcs/v1/dm-co-so/tong-hop?active=true'),

            getList('/api/mcs/v1/dm-nha-an/tong-hop?active=true'),

            getList('/api/mcs/v1/dm-ca-an/tong-hop?active=true'),

            getList('/api/mcs/v1/dm-nhom-mon-an/tong-hop?active=true'),

            getList('/api/mcs/v1/dm-mon-an/tong-hop?active=true'),

            getList('/api/mcs/v1/dm-don-vi-tinh/tong-hop?active=true').catch(() => []),

            getSetting('NGAY_BAT_DAU_TUAN_THUC_DON', DEFAULT_SETTINGS.ngayBatDauTuan),
            getSetting('THUC_DON_BAT_BUOC_DU_SO_NGAY', DEFAULT_SETTINGS.batBuocDuSoNgay),

            getSetting('SO_TUAN_HIEN_THI_THUC_DON', DEFAULT_SETTINGS.soTuanHienThi),

            getSetting('SO_NAM_HIEN_THI_THUC_DON_THANG', DEFAULT_SETTINGS.soNamHienThiThang),

            getSetting('BAT_BUOC_CHON_NHOM_MON', DEFAULT_SETTINGS.batBuocChonNhomMon)
        ]);

        const enums = enumsResponse?.data ?? enumsResponse ?? {};

        const loaiThucDon = Array.isArray(enums.loaiThucDon) ? enums.loaiThucDon : [];

        root._tdOptions = {
            loaiThucDon,
            coSo,
            nhaAn,
            caAn,
            nhomMonAn,
            monAn,
            donViTinh,
            settings: {
                ngayBatDauTuan: normalizeWeekStart(ngayBatDauTuan),

                batBuocDuSoNgay: normalizeBoolean(batBuocDuSoNgay, DEFAULT_SETTINGS.batBuocDuSoNgay),

                soTuanHienThi: positiveInteger(soTuanHienThi, DEFAULT_SETTINGS.soTuanHienThi),

                soNamHienThiThang: positiveInteger(soNamHienThiThang, DEFAULT_SETTINGS.soNamHienThiThang),

                batBuocChonNhomMon: normalizeBoolean(batBuocChonNhomMon, DEFAULT_SETTINGS.batBuocChonNhomMon)
            }
        };

        fillEnum(root.querySelector('[name="loaiThucDon"]'), loaiThucDon, data?.loaiThucDon);

        fill(root.querySelector('[name="coSoId"]'), coSo, 'id', 'tenCoSo', data?.coSoId);

        fill(root.querySelector('[name="caAnId"]'), caAn, 'id', 'tenCaAn', data?.caAnId);

        refreshNhaAn(root, data?.coSoId, data?.nhaAnId);

        fill(root.querySelector('[name="tdDonViTinhId"]'), donViTinh, 'id', 'tenDonViTinh', null);

        bindDependencies(root);

        initTimeApplication(root, data);
    }

    function bindDependencies(root) {
        const coSoSelect = root.querySelector('[name="coSoId"]');

        if (coSoSelect && !coSoSelect.dataset.tdBound) {
            coSoSelect.dataset.tdBound = 'true';

            coSoSelect.addEventListener('change', () => {
                refreshNhaAn(root, coSoSelect.value, null);
            });
        }

        const loaiThucDonSelect = root.querySelector('[name="loaiThucDon"]');

        if (loaiThucDonSelect && !loaiThucDonSelect.dataset.tdTimeBound) {
            loaiThucDonSelect.dataset.tdTimeBound = 'true';

            loaiThucDonSelect.addEventListener('change', () => {
                applyTimeType(root, Number(loaiThucDonSelect.value), {
                    clear: true
                });
            });
        }
    }

    function refreshNhaAn(root, coSoId, selectedId = null) {
        const select = root.querySelector('[name="nhaAnId"]');

        if (!select) {
            return;
        }

        const wrapper = select.closest('[data-smart-select]');

        if (!coSoId) {
            fill(select, [], 'id', 'tenNhaAn', null);

            if (wrapper) {
                wrapper.dataset.selectPlaceholder = 'Chọn cơ sở trước';
            }

            disable(select, true);

            wrapper?.smartSelect?.refresh?.();

            return;
        }

        const targetId = String(coSoId);

        const list = (root._tdOptions?.nhaAn || []).filter((item) => {
            const itemCoSoId = item.coSoId ?? item.coSo?.id;

            return String(itemCoSoId) === targetId;
        });

        if (wrapper) {
            wrapper.dataset.selectPlaceholder = list.length ? 'Chọn nhà ăn' : 'Cơ sở chưa có nhà ăn';
        }

        fill(select, list, 'id', 'tenNhaAn', selectedId);

        disable(select, list.length === 0);

        wrapper?.smartSelect?.refresh?.();
    }

    function refreshDayOptions(root, tuNgay, denNgay, selectedDays = []) {
        const container = root.querySelector('[data-day-checkbox-list]');

        if (!container) {
            return;
        }

        const from = window.ThucDon.form.normalizeDate(tuNgay);

        const to = window.ThucDon.form.normalizeDate(denNgay);

        if (!from || !to) {
            container.innerHTML = `
                        <div class="td-checkbox-list__empty">
                            Vui lòng chọn từ ngày và đến ngày trước.
                        </div>
                    `;

            return;
        }

        if (from > to) {
            container.innerHTML = `
                        <div class="td-checkbox-list__empty">
                            Từ ngày không được lớn hơn đến ngày.
                        </div>
                    `;

            return;
        }

        const selectedDateSet = new Set(
            selectedDays.map((day) => window.ThucDon.form.normalizeDate(day.ngay || day.ngayApDung))
        );

        const days = buildDateRange(from, to);

        window.MCS?.checkboxList?.render(container, days, {
            name: 'tdNgay',

            selectAll: true,

            selectAllLabel: 'Chọn tất cả ngày',

            getValue: (item) => item.value,

            getTitle: (item) => `${item.weekday} - ${item.label}`,

            isChecked: (item) => selectedDateSet.has(item.value)
        });
    }

    function refreshGroupOptions(root, selectedGroups = []) {
        const container = root.querySelector('[data-group-checkbox-list]');

        if (!container) {
            return;
        }

        const selectedIds = new Set(selectedGroups.map((group) => String(group.nhomMonAnId ?? group.nhomMonAn?.id)));

        const list = root._tdOptions?.nhomMonAn || [];

        window.MCS?.checkboxList?.render(container, list, {
            name: 'tdNhomMonAnId',

            selectAll: true,

            selectAllLabel: 'Chọn tất cả nhóm món',

            getValue: (item) => item.id,

            getTitle: (item) => `${item.maNhomMonAn || '-'} - ${item.tenNhomMonAn || '-'}`,

            isChecked: (item) => selectedIds.has(String(item.id))
        });
    }

    function refreshFoodOptions(root, nhomMonAnId, selectedFoods = []) {
        const container = root.querySelector('[data-food-checkbox-list]');

        if (!container) {
            return;
        }

        const groupId = Number(nhomMonAnId);

        const coLocTheoNhom = Number.isInteger(groupId) && groupId > 0;

        const selectedIds = new Set(selectedFoods.map((food) => String(food.monAnId ?? food.monAn?.id)));

        const list = (root._tdOptions?.monAn || []).filter((item) => {
            if (!coLocTheoNhom) {
                return true;
            }

            const itemGroupId = Number(item.nhomMonAnId ?? item.nhomMonAn?.id);

            return itemGroupId === groupId;
        });

        window.MCS?.checkboxList?.render(container, list, {
            name: 'tdMonAnId',

            selectAll: true,

            selectAllLabel: 'Chọn tất cả món ăn',

            getValue: (item) => item.id,

            getTitle: (item) => `${item.maMonAn || '-'} - ${item.tenMonAn || '-'}`,

            getDescription: (item) => formatMoney(item.giaTien),

            isChecked: (item) => selectedIds.has(String(item.id))
        });
    }

    function buildDateRange(from, to) {
        const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);

        const [toYear, toMonth, toDay] = to.split('-').map(Number);

        let current = Date.UTC(fromYear, fromMonth - 1, fromDay);

        const end = Date.UTC(toYear, toMonth - 1, toDay);

        const result = [];

        while (current <= end) {
            const date = new Date(current);

            const year = date.getUTCFullYear();

            const month = String(date.getUTCMonth() + 1).padStart(2, '0');

            const day = String(date.getUTCDate()).padStart(2, '0');

            const value = `${year}-${month}-${day}`;

            result.push({
                value,

                label: `${day}/${month}/${year}`,

                weekday: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][date.getUTCDay()]
            });

            current += 24 * 60 * 60 * 1000;
        }

        return result;
    }

    function formatMoney(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 'Chưa có giá';
        }

        return number.toLocaleString('vi-VN') + ' đ';
    }

    async function getEnums() {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('/api/mcs/v1/enums', {
            method: 'GET',

            headers: {
                Accept: 'application/json',

                Authorization: `Bearer ${token}`
            },

            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.message || 'Không thể tải enums.');
        }

        return result?.data || result || {};
    }

    async function getList(url) {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',

                Authorization: `Bearer ${token}`
            },

            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.message || 'Không thể tải danh mục.');
        }

        const data = result?.data ?? result;

        const list = Array.isArray(data) ? data : data?.items || data?.rows || data?.danhSach || [];

        return list.filter((item) => item?.active !== false);
    }

    function fill(select, list, valueKey, labelKey, selected = null) {
        if (!select) {
            return;
        }

        const normalizedSelected =
            selected === null || selected === undefined || selected === '' ? '' : String(selected);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';

        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        (Array.isArray(list) ? list : []).forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item[valueKey]);

            option.textContent = item[labelKey] || item.ten || '-';

            option.selected = String(item[valueKey]) === normalizedSelected;

            select.appendChild(option);
        });

        select.value = normalizedSelected;

        if (!normalizedSelected) {
            select.selectedIndex = 0;
        }

        const wrapper = select.closest('[data-smart-select]');

        if (!wrapper) {
            return;
        }

        const api = wrapper.smartSelect || window.MCS?.smartSelect?.initialize(wrapper);

        api?.refresh?.();

        api?.setValue?.(normalizedSelected, false);
    }

    function fillEnum(select, list, selected = null) {
        if (!select) {
            return;
        }

        const normalizedSelected =
            selected === null || selected === undefined || selected === '' ? '' : String(selected);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';

        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        (Array.isArray(list) ? list : []).forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);

            option.textContent = item.label || item.name || '-';

            option.selected = String(item.value) === normalizedSelected;

            select.appendChild(option);
        });

        select.value = normalizedSelected;

        if (!normalizedSelected) {
            select.selectedIndex = 0;
        }

        const wrapper = select.closest('[data-smart-select]');

        if (!wrapper) {
            return;
        }

        const api = wrapper.smartSelect || window.MCS?.smartSelect?.initialize(wrapper);

        api?.refresh?.();

        api?.setValue?.(normalizedSelected, false);
    }

    function disable(select, disabled) {
        if (!select) {
            return;
        }

        select.disabled = !!disabled;

        const wrapper = select.closest('[data-smart-select]');

        wrapper?.smartSelect?.setDisabled?.(!!disabled);
    }

    async function getSetting(ma, fallback) {
        try {
            const response = await window.ThucDon.api.setting(ma);

            const data = response?.data ?? response;

            if (data && typeof data === 'object' && data.active === false) {
                return fallback;
            }

            const rawValue = data && typeof data === 'object' ? (data.giaTri ?? data.value) : data;

            if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
                return fallback;
            }

            return rawValue;
        } catch {
            return fallback;
        }
    }

    function normalizeWeekStart(value) {
        return String(value ?? '').trim() === '1' ? 1 : 0;
    }

    function normalizeBoolean(value, fallback = false) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return fallback;
        }

        return String(value).trim().toLowerCase() === 'true';
    }

    function positiveInteger(value, fallback) {
        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            return fallback;
        }

        return number;
    }

    function initTimeApplication(root, data = null) {
        buildWeekOptions(root, data);

        buildYearOptions(root, data);

        bindTimeEvents(root);

        setTimeValue(root, data || {});
    }

    function bindTimeEvents(root) {
        if (root.dataset.tdTimeApplicationBound === 'true') {
            return;
        }

        root.dataset.tdTimeApplicationBound = 'true';

        root.addEventListener('change', (event) => {
            const target = event.target;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            switch (target.name) {
                case 'ngayApDung': {
                    const ngay = normalizeDate(target.value);

                    setCanonicalTime(root, ngay, ngay);

                    break;
                }

                case 'tuanApDung':
                    syncWeekValue(root);

                    break;

                case 'namApDung':
                    refreshMonthOptions(root, target.value, null);

                    clearCanonicalTime(root);

                    break;

                case 'thangApDung':
                    syncMonthValue(root);

                    break;

                case 'tuNgayKhoang':
                    setCanonicalTime(
                        root,
                        normalizeDate(target.value),
                        normalizeDate(fieldValue(root, 'denNgayKhoang'))
                    );

                    break;

                case 'denNgayKhoang':
                    setCanonicalTime(
                        root,
                        normalizeDate(fieldValue(root, 'tuNgayKhoang')),
                        normalizeDate(target.value)
                    );

                    break;
            }
        });
    }

    function applyTimeType(root, loaiThucDon, { clear = false } = {}) {
        const type = Number(loaiThucDon);

        toggle(root, '[data-menu-time-day]', type === LOAI_THUC_DON.NGAY);

        toggle(root, '[data-menu-time-week]', type === LOAI_THUC_DON.TUAN);

        toggle(root, '[data-menu-time-month]', type === LOAI_THUC_DON.THANG);

        toggle(root, '[data-menu-time-range-from]', type === LOAI_THUC_DON.KHOANG_NGAY);

        toggle(root, '[data-menu-time-range-to]', type === LOAI_THUC_DON.KHOANG_NGAY);

        if (clear) {
            clearTimeControls(root);

            clearCanonicalTime(root);
        }
    }

    function toggle(root, selector, visible) {
        const element = root.querySelector(selector);

        if (element) {
            element.hidden = !visible;
        }
    }

    function clearTimeControls(root) {
        clearDateValue(root, 'ngayApDung');

        clearSelect(root, 'tuanApDung');

        clearSelect(root, 'namApDung');

        clearSelect(root, 'thangApDung');

        disableMonthSelect(root, true);

        clearDateValue(root, 'tuNgayKhoang');

        clearDateValue(root, 'denNgayKhoang');
    }

    function clearCanonicalTime(root) {
        setCanonicalTime(root, '', '');
    }

    function setCanonicalTime(root, from, to) {
        const fromInput = root.querySelector('[name="tuNgay"]');

        const toInput = root.querySelector('[name="denNgay"]');

        if (fromInput) {
            fromInput.value = from || '';
        }

        if (toInput) {
            toInput.value = to || '';
        }
    }

    function syncWeekValue(root) {
        const value = fieldValue(root, 'tuanApDung');

        const [from = '', to = ''] = value.split('|');

        setCanonicalTime(root, normalizeDate(from), normalizeDate(to));
    }

    function syncMonthValue(root) {
        const year = Number(fieldValue(root, 'namApDung'));

        const month = Number(fieldValue(root, 'thangApDung'));

        if (!Number.isInteger(year) || !Number.isInteger(month)) {
            clearCanonicalTime(root);

            return;
        }

        const from = isoDate(year, month, 1);

        const lastDay = new Date(year, month, 0).getDate();

        const to = isoDate(year, month, lastDay);

        setCanonicalTime(root, from, to);
    }

    function buildWeekOptions(root, data = null) {
        const select = root.querySelector('[name="tuanApDung"]');

        if (!select) {
            return;
        }

        const settings = root._tdOptions?.settings || {};

        const count = positiveInteger(settings.soTuanHienThi, DEFAULT_SETTINGS.soTuanHienThi);

        const startMode = normalizeWeekStart(settings.ngayBatDauTuan);

        const startDay = startMode === 1 ? 6 : 1;

        const today = todayVietnam();

        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const difference = (weekStart.getDay() - startDay + 7) % 7;

        weekStart.setDate(weekStart.getDate() - difference);

        const list = [];

        for (let index = 0; index < count; index += 1) {
            const from = new Date(weekStart);

            from.setDate(weekStart.getDate() + index * 7);

            const to = new Date(from);

            to.setDate(from.getDate() + 6);

            const fromIso = dateToIso(from);

            const toIso = dateToIso(to);

            list.push({
                value: `${fromIso}|${toIso}`,

                label: `${formatIsoDate(fromIso)} - ${formatIsoDate(toIso)}`
            });
        }

        const currentFrom = normalizeDate(data?.tuNgay);

        const currentTo = normalizeDate(data?.denNgay);

        let selected = '';

        if (currentFrom && currentTo) {
            selected = `${currentFrom}|${currentTo}`;

            if (!list.some((item) => item.value === selected)) {
                list.unshift({
                    value: selected,

                    label: `${formatIsoDate(currentFrom)} - ${formatIsoDate(currentTo)}`
                });
            }
        }

        fillSimpleOptions(select, list, selected);
    }

    function buildYearOptions(root, data = null) {
        const select = root.querySelector('[name="namApDung"]');

        if (!select) {
            return;
        }

        const today = todayVietnam();

        const currentYear = today.getFullYear();

        const count = positiveInteger(root._tdOptions?.settings?.soNamHienThiThang, DEFAULT_SETTINGS.soNamHienThiThang);

        const list = [];

        for (let offset = 0; offset < count; offset += 1) {
            const year = currentYear + offset;

            list.push({
                value: String(year),

                label: String(year)
            });
        }

        const selectedDate = normalizeDate(data?.tuNgay);

        const selectedYearCandidate = selectedDate ? selectedDate.slice(0, 4) : '';

        const selectedYear = list.some((item) => item.value === selectedYearCandidate) ? selectedYearCandidate : '';

        fillSimpleOptions(select, list, selectedYear);

        refreshMonthOptions(root, selectedYear, selectedDate ? Number(selectedDate.slice(5, 7)) : null);
    }

    function refreshMonthOptions(root, yearValue, selectedMonth = null) {
        const select = root.querySelector('[name="thangApDung"]');

        if (!select) {
            return;
        }

        const year = Number(yearValue);

        if (!Number.isInteger(year) || year <= 0) {
            fillSimpleOptions(select, [], '');

            disableMonthSelect(root, true);

            return;
        }

        disableMonthSelect(root, false);

        const today = todayVietnam();

        const currentYear = today.getFullYear();

        const currentMonth = today.getMonth() + 1;

        const firstMonth = year === currentYear ? currentMonth : 1;

        const list = [];

        for (let month = firstMonth; month <= 12; month += 1) {
            const value = String(month).padStart(2, '0');

            list.push({
                value,

                label: `${value}/${year}`
            });
        }

        const selectedCandidate = selectedMonth ? String(selectedMonth).padStart(2, '0') : '';

        const selected = list.some((item) => item.value === selectedCandidate) ? selectedCandidate : '';

        fillSimpleOptions(select, list, selected);

        disableMonthSelect(root, false);
    }

    function setTimeValue(root, data = {}) {
        const type = Number(data.loaiThucDon);

        const from = normalizeDate(data.tuNgay);

        const to = normalizeDate(data.denNgay);

        applyTimeType(root, type);

        setCanonicalTime(root, from, to);

        switch (type) {
            case LOAI_THUC_DON.NGAY:
                setDatePickerValue(root, 'ngayApDung', from);

                break;

            case LOAI_THUC_DON.TUAN:
                buildWeekOptions(root, data);

                setSelectControl(root, 'tuanApDung', from && to ? `${from}|${to}` : '');

                break;

            case LOAI_THUC_DON.THANG: {
                const year = from ? from.slice(0, 4) : '';

                const month = from ? from.slice(5, 7) : '';

                buildYearOptions(root, data);

                setSelectControl(root, 'namApDung', year);

                refreshMonthOptions(root, year, month);

                setSelectControl(root, 'thangApDung', month);

                break;
            }

            case LOAI_THUC_DON.KHOANG_NGAY:
                setDatePickerValue(root, 'tuNgayKhoang', from);

                setDatePickerValue(root, 'denNgayKhoang', to);

                break;
        }
    }

    function clearDatePicker(root, fieldName) {
        const fieldContainer = root.querySelector(`[data-form-field="${fieldName}"]`);

        if (!fieldContainer) {
            return;
        }

        const hiddenInput = fieldContainer.querySelector('[data-date-value]');

        const displayInput = fieldContainer.querySelector('[data-date-input]');

        if (hiddenInput) {
            hiddenInput.value = '';
        }

        if (displayInput) {
            displayInput.value = '';
        }

        const datePickerRoot = fieldContainer.matches('[data-date-picker]')
            ? fieldContainer
            : fieldContainer.querySelector('[data-date-picker]');

        (datePickerRoot?.datePicker || fieldContainer.datePicker)?.setValue?.('', false);
    }

    function clearTimeControls(root) {
        clearDatePicker(root, 'ngayApDung');

        clearSelect(root, 'tuanApDung');

        clearSelect(root, 'namApDung');

        clearSelect(root, 'thangApDung');

        disableMonthSelect(root, true);

        clearDatePicker(root, 'tuNgayKhoang');

        clearDatePicker(root, 'denNgayKhoang');
    }

    function dateFieldValue(root, fieldName) {
        const fieldContainer = root.querySelector(`[data-form-field="${fieldName}"]`);

        if (!fieldContainer) {
            return '';
        }

        const displayInput = fieldContainer.querySelector('[data-date-input]');

        const hiddenInput = fieldContainer.querySelector('[data-date-value]');

        const displayValue = normalizeDate(displayInput?.value || '');

        if (displayValue) {
            if (hiddenInput) {
                hiddenInput.value = displayValue;
            }

            return displayValue;
        }

        return normalizeDate(hiddenInput?.value || '');
    }

    function syncTimeValue(root) {
        const type = Number(fieldValue(root, 'loaiThucDon'));

        let from = '';

        let to = '';

        switch (type) {
            case LOAI_THUC_DON.NGAY:
                from = normalizeDate(fieldValue(root, 'ngayApDung'));

                to = from;

                break;

            case LOAI_THUC_DON.TUAN: {
                const value = fieldValue(root, 'tuanApDung');

                const parts = value.split('|');

                from = normalizeDate(parts[0] || '');

                to = normalizeDate(parts[1] || '');

                break;
            }

            case LOAI_THUC_DON.THANG: {
                const year = Number(fieldValue(root, 'namApDung'));

                const month = Number(fieldValue(root, 'thangApDung'));

                if (Number.isInteger(year) && Number.isInteger(month) && year > 0 && month >= 1 && month <= 12) {
                    from = isoDate(year, month, 1);

                    const lastDay = new Date(year, month, 0).getDate();

                    to = isoDate(year, month, lastDay);
                }

                break;
            }

            case LOAI_THUC_DON.KHOANG_NGAY:
                from = dateFieldValue(root, 'tuNgayKhoang');

                to = dateFieldValue(root, 'denNgayKhoang');

                break;
        }

        setCanonicalTime(root, from, to);

        return {
            tuNgay: from,

            denNgay: to
        };
    }

    function setDatePickerValue(root, fieldName, value) {
        const fieldContainer = root.querySelector(`[data-form-field="${fieldName}"]`);

        if (!fieldContainer) {
            return;
        }

        const hiddenInput = fieldContainer.querySelector('[data-date-value]');

        const displayInput = fieldContainer.querySelector('[data-date-input]');

        const databaseValue = normalizeDate(value);

        const displayValue = formatIsoDate(databaseValue);

        if (hiddenInput) {
            hiddenInput.value = databaseValue;
        }

        if (displayInput) {
            displayInput.value = displayValue;
        }

        const datePickerRoot = fieldContainer.matches('[data-date-picker]')
            ? fieldContainer
            : fieldContainer.querySelector('[data-date-picker]');

        const datePickerApi = datePickerRoot?.datePicker || fieldContainer.datePicker;

        datePickerApi?.setValue?.(databaseValue, false);
    }

    function disableMonthSelect(root, disabled) {
        const select = root.querySelector('[name="thangApDung"]');

        if (!select) {
            return;
        }

        const wrapper = select.closest('[data-smart-select]');

        select.disabled = !!disabled;

        if (wrapper) {
            wrapper.dataset.selectPlaceholder = disabled ? 'Chọn năm trước' : 'Chọn tháng';
        }

        wrapper?.smartSelect?.setDisabled?.(!!disabled);

        wrapper?.smartSelect?.refresh?.();
    }

    function fillSimpleOptions(select, list, selected = '') {
        if (!select) {
            return;
        }

        select.innerHTML = '';

        const empty = document.createElement('option');

        empty.value = '';

        empty.textContent = '';

        select.appendChild(empty);

        list.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);

            option.textContent = item.label;

            select.appendChild(option);
        });

        select.value = selected || '';

        const wrapper = select.closest('[data-smart-select]');

        const api = wrapper?.smartSelect || (wrapper ? window.MCS?.smartSelect?.initialize(wrapper) : null);

        api?.refresh?.();

        api?.setValue?.(selected || '', false);
    }

    function setSelectControl(root, name, value) {
        const select = root.querySelector(`select[name="${name}"]`);

        if (!select) {
            return;
        }

        select.value = value || '';

        select.closest('[data-smart-select]')?.smartSelect?.setValue?.(value || '', false);
    }

    function clearSelect(root, name) {
        setSelectControl(root, name, '');
    }

    function fieldValue(root, name) {
        return root.querySelector(`[name="${name}"]`)?.value?.trim?.() || '';
    }

    function normalizeDate(value) {
        return window.ThucDon.form.normalizeDate(value);
    }

    function todayVietnam() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',

            year: 'numeric',

            month: '2-digit',

            day: '2-digit'
        }).formatToParts(new Date());

        const data = Object.fromEntries(parts.map((item) => [item.type, item.value]));

        return new Date(Number(data.year), Number(data.month) - 1, Number(data.day));
    }

    function dateToIso(date) {
        return isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    function isoDate(year, month, day) {
        return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function formatIsoDate(value) {
        if (!value) {
            return '';
        }

        const [year, month, day] = value.split('-');

        return `${day}/${month}/${year}`;
    }

    return {
        init,
        fill,
        refreshNhaAn,
        refreshDayOptions,
        refreshGroupOptions,
        refreshFoodOptions,
        setTimeValue,
        syncTimeValue,
        applyTimeType
    };
})();

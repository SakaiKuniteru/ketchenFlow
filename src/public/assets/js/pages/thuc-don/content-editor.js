'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.contentEditor = (() => {
    function isBatBuocChonNhomMon(root) {
        return root?._tdOptions?.settings?.batBuocChonNhomMon !== false;
    }

    function init(root, form) {
        if (!root || !form || root.dataset.tdContentBound === 'true') {
            return null;
        }

        root.dataset.tdContentBound = 'true';

        const ctx = {
            dayId: null,

            groupId: null
        };

        root.addEventListener('click', (event) => {
            const addDay = event.target.closest('[data-add-day]');

            if (addDay) {
                event.preventDefault();

                openDay(root, form);

                return;
            }

            const addGroup = event.target.closest('[data-add-group]');

            if (addGroup) {
                event.preventDefault();

                const day = addGroup.closest('[data-day-item]');

                ctx.dayId = day?.dataset.dayId || null;

                ctx.groupId = null;

                if (!isBatBuocChonNhomMon(root)) {
                    openFood(root, form, ctx);

                    return;
                }

                openGroup(root, form, ctx);

                return;
            }

            const addFood = event.target.closest('[data-add-food]');

            if (addFood) {
                event.preventDefault();

                const day = addFood.closest('[data-day-item]');

                const group = addFood.closest('[data-group-item]');

                ctx.dayId = day?.dataset.dayId || null;

                ctx.groupId = group?.dataset.groupId || null;

                openFood(root, form, ctx);

                return;
            }

            const deleteDay = event.target.closest('[data-delete-day]');

            if (deleteDay) {
                event.preventDefault();

                removeDay(root, form, deleteDay.closest('[data-day-item]')?.dataset.dayId);

                return;
            }

            const deleteGroup = event.target.closest('[data-delete-group]');

            if (deleteGroup) {
                event.preventDefault();

                const day = deleteGroup.closest('[data-day-item]');

                const group = deleteGroup.closest('[data-group-item]');

                removeGroup(root, form, day?.dataset.dayId, group?.dataset.groupId);

                return;
            }

            const deleteFood = event.target.closest('[data-delete-food]');

            if (deleteFood) {
                event.preventDefault();

                const day = deleteFood.closest('[data-day-item]');

                const group = deleteFood.closest('[data-group-item]');

                const food = deleteFood.closest('[data-food-item]');

                removeFood(root, form, day?.dataset.dayId, group?.dataset.groupId, food?.dataset.foodId);

                return;
            }

            if (event.target.closest('[data-modal-close]')) {
                closeAll(root);

                return;
            }

            if (event.target.closest('[data-save-day-modal]')) {
                saveDay(root, form);

                return;
            }

            if (event.target.closest('[data-save-group-modal]')) {
                saveGroup(root, form, ctx);

                return;
            }

            if (event.target.closest('[data-save-food-modal]')) {
                saveFood(root, form, ctx);

                return;
            }
        });

        return {};
    }

    function prepareCheckboxSearch(root, type) {
        const searchRoot = root.querySelector(`[data-checkbox-search-target="${type}"]`);

        const input = searchRoot?.querySelector('[data-list-search]');

        const clearButton = searchRoot?.querySelector('[data-list-clear-search]');

        const list = root.querySelector(`[data-checkbox-list-type="${type}"]`);

        if (!input || !list) {
            return;
        }

        input.value = '';

        if (clearButton) {
            clearButton.hidden = true;
        }

        filterCheckboxList(list, '');

        if (input.dataset.tdSearchBound === 'true') {
            return;
        }

        input.dataset.tdSearchBound = 'true';

        input.addEventListener('input', () => {
            const keyword = input.value.trim();

            if (clearButton) {
                clearButton.hidden = !keyword;
            }

            filterCheckboxList(list, keyword);
        });

        clearButton?.addEventListener('click', (event) => {
            event.preventDefault();

            input.value = '';

            clearButton.hidden = true;

            filterCheckboxList(list, '');

            input.focus();
        });
    }

    function filterCheckboxList(list, value) {
        if (!list) {
            return;
        }

        const keyword = normalizeSearchText(value);

        list.querySelectorAll('.td-checkbox-list__item').forEach((item) => {
            /*
             * Chọn tất cả luôn giữ lại.
             */
            if (item.classList.contains('is-select-all')) {
                item.hidden = false;

                return;
            }

            const text = normalizeSearchText(item.textContent);

            item.hidden = Boolean(keyword) && !text.includes(keyword);
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

    function openDay(root, form) {
        const data = form.getData();

        if (!data.tuNgay || !data.denNgay) {
            error('Vui lòng chọn thời gian áp dụng trước.');

            return;
        }

        window.ThucDon.options.refreshDayOptions(root, data.tuNgay, data.denNgay, data.dsNgay || []);

        prepareCheckboxSearch(root, 'day');

        open(root.querySelector('[data-modal-day]'));
    }

    function openGroup(root, form, ctx) {
        clearModal(root, 'group');

        const data = form.getData();

        const day = (data.dsNgay || []).find((item) => String(item.id) === String(ctx.dayId));

        if (!day) {
            error('Không xác định được ngày.');

            return;
        }

        window.ThucDon.options.refreshGroupOptions(root, day.dsNhomMonAn || []);

        prepareCheckboxSearch(root, 'group');

        open(root.querySelector('[data-modal-group]'));
    }

    function openFood(root, form, ctx) {
        clearModal(root, 'food');

        const data = form.getData();

        const day = (data.dsNgay || []).find((item) => String(item.id) === String(ctx.dayId));

        if (!day) {
            error('Không xác định được ngày.');

            return;
        }

        if (!isBatBuocChonNhomMon(root)) {
            const selectedFoods = (day.dsNhomMonAn || []).flatMap((group) => group.dsMonAn || []);

            window.ThucDon.options.refreshFoodOptions(root, null, selectedFoods);

            prepareCheckboxSearch(root, 'food');

            open(root.querySelector('[data-modal-food]'));

            return;
        }

        const group = (day.dsNhomMonAn || []).find((item) => String(item.id) === String(ctx.groupId));

        if (!group) {
            error('Không xác định được nhóm món.');

            return;
        }

        const nhomMonAnId = group.nhomMonAnId ?? group.nhomMonAn?.id;

        window.ThucDon.options.refreshFoodOptions(root, nhomMonAnId, group.dsMonAn || []);

        prepareCheckboxSearch(root, 'food');

        open(root.querySelector('[data-modal-food]'));
    }

    function open(modal) {
        if (!modal) return;

        modal.hidden = false;

        document.documentElement.classList.add('td-modal-open');
    }

    function closeAll(root) {
        root.querySelectorAll('.td-modal').forEach((m) => (m.hidden = true));

        document.documentElement.classList.remove('td-modal-open');
    }

    function clearModal(root, type) {
        const names =
            type === 'day'
                ? ['tdNgay', 'tdGhiChuNgay']
                : type === 'group'
                  ? ['tdNhomMonAnId']
                  : ['tdMonAnId', 'tdDinhLuong', 'tdDonViTinhId', 'tdKhauPhan', 'tdGhiChuMon'];

        names.forEach((name) => {
            const checkboxes = root.querySelectorAll(`input[type="checkbox"][name="${name}"]`);

            if (checkboxes.length) {
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });

                return;
            }

            const el = root.querySelector(`[name="${name}"]`);

            if (!el) {
                return;
            }

            if (el.matches('select')) {
                el.closest('[data-smart-select]')?.smartSelect?.clear?.(false);
            } else if (el.hasAttribute('data-date-value')) {
                el.closest('[data-date-picker]')?.datePicker?.setValue?.('', false);
            } else {
                el.value = '';
            }
        });
    }

    function saveDay(root, form) {
        const dayList = root.querySelector('[data-day-checkbox-list]');

        const selectedDateSet = new Set(scopedTextField(dayList, 'tdNgay'));

        const data = form.getData();

        const currentDays = data.dsNgay || [];

        const blockedDays = [];

        currentDays.forEach((day) => {
            const date = normalizeDate(day.ngay || day.ngayApDung);

            if (selectedDateSet.has(date)) {
                return;
            }

            const groupCount = (day.dsNhomMonAn || []).length;

            if (groupCount > 0) {
                selectedDateSet.add(date);

                blockedDays.push({
                    date,

                    groupCount
                });
            }
        });

        const currentMap = new Map(currentDays.map((day) => [normalizeDate(day.ngay || day.ngayApDung), day]));

        const nextDays = [];

        selectedDateSet.forEach((date) => {
            const existed = currentMap.get(date);

            if (existed) {
                nextDays.push(existed);

                return;
            }

            nextDays.push({
                id: tempId('day'),

                ngay: date,

                ghiChu: null,

                dsNhomMonAn: []
            });
        });

        nextDays.sort((a, b) => normalizeDate(a.ngay).localeCompare(normalizeDate(b.ngay)));

        data.dsNgay = nextDays;

        form.setWorkingData(data);

        closeAll(root);

        if (blockedDays.length) {
            const first = blockedDays[0];

            if (!isBatBuocChonNhomMon(root)) {
                const foodCount = (
                    currentDays.find((day) => normalizeDate(day.ngay || day.ngayApDung) === first.date)?.dsNhomMonAn ||
                    []
                ).reduce((total, group) => total + (group.dsMonAn || []).length, 0);

                window.MCS?.toast?.warning?.(
                    `Ngày ${formatDate(first.date)} đang tồn tại ${foodCount} món ăn nên không thể bỏ chọn.`
                );
            } else {
                window.MCS?.toast?.warning?.(
                    blockedDays.length === 1
                        ? `Ngày ${formatDate(first.date)} đang tồn tại ${first.groupCount} nhóm món nên không thể bỏ chọn.`
                        : `${blockedDays.length} ngày đang có nhóm món nên không thể bỏ chọn.`
                );
            }
        } else {
            success(`Đã cập nhật ${nextDays.length} ngày áp dụng.`);
        }
    }

    function formatDate(value) {
        return window.ThucDon.form.formatDate(value);
    }

    function saveGroup(root, form, ctx) {
        if (!ctx.dayId) {
            error('Không xác định được ngày.');

            return;
        }

        const groupList = root.querySelector('[data-group-checkbox-list]');

        const selectedIds = new Set(scopedMultiField(groupList, 'tdNhomMonAnId').map(String));

        const data = form.getData();

        const day = (data.dsNgay || []).find((item) => String(item.id) === String(ctx.dayId));

        if (!day) {
            return;
        }

        day.dsNhomMonAn = day.dsNhomMonAn || [];

        const blockedGroups = [];

        day.dsNhomMonAn.forEach((group) => {
            const groupId = String(group.nhomMonAnId ?? group.nhomMonAn?.id);

            if (selectedIds.has(groupId)) {
                return;
            }

            const foodCount = (group.dsMonAn || []).length;

            if (foodCount > 0) {
                selectedIds.add(groupId);

                blockedGroups.push({
                    id: groupId,

                    name: group.tenNhomMonAn || group.nhomMonAn?.tenNhomMonAn || 'Nhóm món',

                    foodCount
                });
            }
        });

        const oldMap = new Map(
            day.dsNhomMonAn.map((group) => [String(group.nhomMonAnId ?? group.nhomMonAn?.id), group])
        );

        const nextGroups = [];

        selectedIds.forEach((id) => {
            const existed = oldMap.get(id);

            if (existed) {
                nextGroups.push(existed);

                return;
            }

            const selected = root._tdOptions?.nhomMonAn?.find((item) => String(item.id) === id);

            if (!selected) {
                return;
            }

            nextGroups.push({
                id: tempId('group'),

                nhomMonAnId: Number(selected.id),

                nhomMonAn: {
                    ...selected
                },

                tenNhomMonAn: selected.tenNhomMonAn || '-',

                dsMonAn: []
            });
        });

        day.dsNhomMonAn = nextGroups;

        form.selectDay(ctx.dayId);

        form.selectGroup(null);

        form.setWorkingData(data);

        closeAll(root);

        if (blockedGroups.length) {
            if (blockedGroups.length === 1) {
                const blocked = blockedGroups[0];

                window.MCS?.toast?.warning?.(
                    `${blocked.name} đang tồn tại ${blocked.foodCount} món ăn nên không thể bỏ chọn.`
                );
            } else {
                window.MCS?.toast?.warning?.(`${blockedGroups.length} nhóm đang tồn tại món ăn nên không thể bỏ chọn.`);
            }

            return;
        }

        success(`Đã cập nhật ${nextGroups.length} nhóm món.`);
    }

    function saveFoodTheoNgay(
        root,
        form,
        ctx,
        data,
        day,
        selectedIds,
        { dinhLuong, donViTinhId, unit, khauPhan, ghiChu }
    ) {
        const oldGroups = day.dsNhomMonAn || [];

        const oldGroupMap = new Map(
            oldGroups.map((group) => [String(group.nhomMonAnId ?? group.nhomMonAn?.id), group])
        );

        const oldFoodMap = new Map();

        oldGroups.forEach((group) => {
            (group.dsMonAn || []).forEach((food) => {
                oldFoodMap.set(String(food.monAnId ?? food.monAn?.id), food);
            });
        });

        const nextGroupMap = new Map();

        let loi = null;

        selectedIds.forEach((monAnId) => {
            if (loi) {
                return;
            }

            const mon = root._tdOptions?.monAn?.find((item) => String(item.id) === String(monAnId));

            if (!mon) {
                return;
            }

            const nhomMonAnId = Number(mon.nhomMonAnId ?? mon.nhomMonAn?.id);

            if (!Number.isInteger(nhomMonAnId) || nhomMonAnId <= 0) {
                loi = `Món "${mon.tenMonAn || mon.maMonAn || mon.id}" chưa được gán nhóm món ăn.`;

                return;
            }

            const nhomOption = root._tdOptions?.nhomMonAn?.find((item) => Number(item.id) === nhomMonAnId);

            if (!nhomOption) {
                loi = `Nhóm món của "${mon.tenMonAn || mon.maMonAn || mon.id}" không tồn tại hoặc đã bị khóa.`;

                return;
            }

            const groupKey = String(nhomMonAnId);

            let group = nextGroupMap.get(groupKey);

            if (!group) {
                const oldGroup = oldGroupMap.get(groupKey);

                group = oldGroup
                    ? {
                          ...oldGroup,

                          nhomMonAnId,

                          nhomMonAn: {
                              ...nhomOption
                          },

                          maNhomMonAn: nhomOption.maNhomMonAn || oldGroup.maNhomMonAn || null,

                          tenNhomMonAn: nhomOption.tenNhomMonAn || oldGroup.tenNhomMonAn || '-',

                          dsMonAn: []
                      }
                    : {
                          id: tempId('group'),

                          nhomMonAnId,

                          nhomMonAn: {
                              ...nhomOption
                          },

                          maNhomMonAn: nhomOption.maNhomMonAn || null,

                          tenNhomMonAn: nhomOption.tenNhomMonAn || '-',

                          dsMonAn: []
                      };

                nextGroupMap.set(groupKey, group);
            }

            const oldFood = oldFoodMap.get(String(monAnId));

            group.dsMonAn.push(
                oldFood || {
                    id: tempId('food'),

                    monAnId: Number(mon.id),

                    monAn: {
                        ...mon
                    },

                    dinhLuong,

                    donViTinhId,

                    donViTinh: unit
                        ? {
                              ...unit
                          }
                        : null,

                    khauPhan,

                    ghiChu
                }
            );
        });

        if (loi) {
            error(loi);

            return;
        }

        day.dsNhomMonAn = Array.from(nextGroupMap.values()).map((group, groupIndex) => ({
            ...group,

            thuTuHienThi: groupIndex + 1,

            dsMonAn: (group.dsMonAn || []).map((food, foodIndex) => ({
                ...food,

                thuTuHienThi: foodIndex + 1
            }))
        }));

        form.selectDay(ctx.dayId);

        form.selectGroup(null);

        form.setWorkingData(data);

        closeAll(root);

        success(`Đã cập nhật ${selectedIds.size} món ăn.`);
    }

    function saveFood(root, form, ctx) {
        const batBuocChonNhom = isBatBuocChonNhomMon(root);

        if (!ctx.dayId || (batBuocChonNhom && !ctx.groupId)) {
            error(batBuocChonNhom ? 'Không xác định được nhóm món.' : 'Không xác định được ngày.');

            return;
        }

        const foodList = root.querySelector('[data-food-checkbox-list]');

        const selectedIds = new Set(scopedMultiField(foodList, 'tdMonAnId').map(String));

        const dinhLuong = numberOrNull(field(root, 'tdDinhLuong'));

        const donViTinhId = numberOrNull(field(root, 'tdDonViTinhId'));

        const khauPhan = numberOrNull(field(root, 'tdKhauPhan'));

        const ghiChu = field(root, 'tdGhiChuMon');

        const data = form.getData();

        const day = (data.dsNgay || []).find((item) => String(item.id) === String(ctx.dayId));

        if (!day) {
            error('Không xác định được ngày.');

            return;
        }

        const unit = root._tdOptions?.donViTinh?.find((item) => Number(item.id) === Number(donViTinhId));

        if (!batBuocChonNhom) {
            saveFoodTheoNgay(root, form, ctx, data, day, selectedIds, {
                dinhLuong,
                donViTinhId,
                unit,
                khauPhan,
                ghiChu
            });

            return;
        }

        const group = (day?.dsNhomMonAn || []).find((item) => String(item.id) === String(ctx.groupId));

        if (!group) {
            return;
        }

        group.dsMonAn = group.dsMonAn || [];

        const currentMap = new Map(group.dsMonAn.map((food) => [String(food.monAnId ?? food.monAn?.id), food]));

        const nextFoods = [];

        selectedIds.forEach((monAnId) => {
            const existed = currentMap.get(monAnId);

            if (existed) {
                nextFoods.push(existed);

                return;
            }

            const mon = root._tdOptions?.monAn?.find((item) => String(item.id) === monAnId);

            if (!mon) {
                return;
            }

            const monGroupId = Number(mon.nhomMonAnId ?? mon.nhomMonAn?.id);

            const currentGroupId = Number(group.nhomMonAnId ?? group.nhomMonAn?.id);

            if (monGroupId !== currentGroupId) {
                return;
            }

            nextFoods.push({
                id: tempId('food'),

                monAnId: Number(mon.id),

                monAn: {
                    ...mon
                },

                dinhLuong,

                donViTinhId,

                donViTinh: unit
                    ? {
                          ...unit
                      }
                    : null,

                khauPhan,

                ghiChu
            });
        });

        group.dsMonAn = nextFoods;

        form.selectDay(ctx.dayId);

        form.selectGroup(ctx.groupId);

        form.setWorkingData(data);

        closeAll(root);

        success(`Đã cập nhật ${nextFoods.length} món ăn.`);
    }

    function scopedTextField(container, name) {
        if (!container) {
            return [];
        }

        return Array.from(container.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`))
            .map((input) => String(input.value || ''))
            .filter(Boolean);
    }

    function scopedMultiField(container, name) {
        if (!container) {
            return [];
        }

        return Array.from(container.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`))
            .map((input) => Number(input.value))
            .filter((value) => Number.isFinite(value) && value > 0);
    }

    function multiTextField(root, name) {
        return Array.from(root.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`))
            .map((input) => String(input.value))
            .filter(Boolean);
    }

    function removeDay(root, form, id) {
        confirmDelete('Xóa ngày', 'Toàn bộ nhóm món và món ăn trong ngày sẽ bị xóa.', () => {
            const data = form.getData();

            data.dsNgay = (data.dsNgay || []).filter((d) => String(d.id) !== String(id));

            form.setWorkingData(data);
        });
    }

    function removeGroup(root, form, dayId, groupId) {
        confirmDelete('Xóa nhóm món', 'Toàn bộ món ăn trong nhóm sẽ bị xóa.', () => {
            const data = form.getData();

            const day = (data.dsNgay || []).find((d) => String(d.id) === String(dayId));

            if (day) {
                day.dsNhomMonAn = (day.dsNhomMonAn || []).filter((g) => String(g.id) !== String(groupId));

                form.setWorkingData(data);
            }
        });
    }

    function removeFood(root, form, dayId, groupId, foodId) {
        confirmDelete('Xóa món ăn', 'Bạn có chắc chắn muốn xóa món ăn này?', () => {
            const data = form.getData();

            const day = (data.dsNgay || []).find((d) => String(d.id) === String(dayId));

            const group = (day?.dsNhomMonAn || []).find((g) => String(g.id) === String(groupId));

            if (group) {
                group.dsMonAn = (group.dsMonAn || []).filter((f) => String(f.id) !== String(foodId));

                if (!isBatBuocChonNhomMon(root) && group.dsMonAn.length === 0) {
                    day.dsNhomMonAn = (day.dsNhomMonAn || []).filter((item) => String(item.id) !== String(groupId));
                }

                form.setWorkingData(data);
            }
        });
    }

    function confirmDelete(title, message, onConfirm) {
        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title,
                message,
                confirmLabel: 'Xóa',
                type: 'danger',
                onConfirm
            });
        } else if (window.confirm(message)) {
            onConfirm();
        }
    }

    function field(root, name) {
        return root.querySelector(`[name="${name}"]`)?.value?.trim?.() || '';
    }

    function multiField(root, name) {
        return Array.from(root.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`))
            .map((input) => Number(input.value))
            .filter((value) => Number.isFinite(value) && value > 0);
    }

    function numberOrNull(v) {
        return v === '' ? null : Number(v);
    }

    function normalizeDate(v) {
        return window.ThucDon.form.normalizeDate(v);
    }

    function tempId(type) {
        return `tmp-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function success(m) {
        window.MCS?.toast?.success?.(m);
    }

    function error(m) {
        window.MCS?.toast?.error?.(m);
    }

    return {
        init
    };
})();

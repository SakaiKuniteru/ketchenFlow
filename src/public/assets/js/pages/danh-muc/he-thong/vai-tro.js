'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-vai-tro';
    const API_QUYEN = '/api/mcs/v1/dm-quyen/tong-hop?active=true';
    const API_NHOM_TINH_NANG = '/api/mcs/v1/dm-nhom-tinh-nang/tong-hop?active=true';

    let catalog = null;
    let dsQuyen = [];
    let dsNhomTinhNang = [];
    let dsQuyenDaChon = new Set();
    let dsQuyenTamChon = new Set();
    let currentMode = 'view';
    let detailTrangThai = 'selected';
    let popupTrangThai = [];
    let popupNhomTinhNangId = [];
    let popupSearchText = '';
    let popupDangMo = false;

    initialize();

    async function initialize() {
        await initializeCatalog();
        await Promise.all([loadNhomTinhNang(), loadQuyen()]);
        initializeFilters();
        bindEvents();
        syncChooseButton();
        syncDetailStatusFilter();
        renderDetailQuyen();
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: 'vai-tro',
            permissionCodes: {
                view: 'Q000526',
                create: 'Q000527',
                update: 'Q000528'
            },
            detailTitle: 'Thông tin vai trò',
            createTitle: 'Thêm vai trò',
            updateTitle: 'Cập nhật vai trò',

            columns: [
                {
                    key: 'maVaiTro',
                    label: 'Mã vai trò',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'tenVaiTro',
                    label: 'Tên vai trò',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'moTa',
                    label: 'Mô tả',
                    filterable: true
                },
                {
                    key: 'active',
                    label: 'Trạng thái',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    render: window.createStatusBadge
                }
            ],

            defaultValues: {
                maVaiTro: '',
                tenVaiTro: '',
                moTa: '',
                dsQuyenId: [],
                active: true
            },

            validation: {
                maVaiTro: {
                    label: 'Mã vai trò',
                    required: true,
                    maxLength: 50,
                    unique: true,
                    requiredMessage: 'Vui lòng điền vào trường này.',
                    maxLengthMessage: 'Mã vai trò không được vượt quá 50 ký tự.',
                    uniqueMessage: 'Mã vai trò đã tồn tại.'
                },

                tenVaiTro: {
                    label: 'Tên vai trò',
                    required: true,
                    maxLength: 255,
                    unique: true,
                    requiredMessage: 'Vui lòng điền vào trường này.',
                    maxLengthMessage: 'Tên vai trò không được vượt quá 255 ký tự.',
                    uniqueMessage: 'Tên vai trò đã tồn tại.'
                },

                moTa: {
                    label: 'Mô tả',
                    maxLength: 500,
                    maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                }
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? '',
                    maVaiTro: record?.maVaiTro || '',
                    tenVaiTro: record?.tenVaiTro || '',
                    moTa: record?.moTa || '',
                    dsQuyenId: normalizeNumberArray(record?.dsQuyenId),
                    active: record?.active === true
                };
            },

            transformPayload(formData) {
                return {
                    maVaiTro: String(formData.maVaiTro || '')
                        .trim()
                        .toUpperCase(),
                    tenVaiTro: String(formData.tenVaiTro || '').trim(),
                    moTa: String(formData.moTa || '').trim() || null,
                    dsQuyenId: Array.from(dsQuyenDaChon).map(Number).filter(Number.isInteger),
                    active: formData.active === true
                };
            },

            getRecordSubtitle(record) {
                return record?.maVaiTro || '';
            },

            onRecordLoaded(record, mode) {
                currentMode = mode || 'view';
                dsQuyenDaChon = new Set(normalizeNumberArray(record?.dsQuyenId));
                dsQuyenTamChon = new Set(dsQuyenDaChon);
                detailTrangThai = 'selected';
                resetPopupFilters();
                syncChooseButton();
                syncDetailStatusFilter();
                renderDetailQuyen();
            },

            toolbarActions: [
                {
                    action: 'filter',
                    label: 'Tìm kiếm chi tiết',
                    icon: 'search'
                },
                {
                    action: 'export-vai-tro',
                    label: 'Xuất danh mục vai trò',
                    icon: 'download'
                },
                {
                    action: 'import-vai-tro',
                    label: 'Nhập danh mục vai trò',
                    icon: 'upload'
                }
            ],

            onAction(action, id, catalogInstance) {
                if (action === 'export-vai-tro') {
                    exportData();
                    return;
                }

                if (action === 'import-vai-tro') {
                    importData(catalogInstance);
                }
            }
        });
    }

    async function loadQuyen() {
        try {
            const response = await window.MCS.api.request(API_QUYEN);
            const data = response?.data;

            dsQuyen = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsQuyen = dsQuyen.filter((item) => item?.active !== false);
        } catch (error) {
            dsQuyen = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách quyền.');
        }
    }

    async function loadNhomTinhNang() {
        try {
            const response = await window.MCS.api.request(API_NHOM_TINH_NANG);
            const data = response?.data;

            dsNhomTinhNang = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsNhomTinhNang = dsNhomTinhNang.filter((item) => item?.active !== false);
        } catch (error) {
            dsNhomTinhNang = [];
        }
    }

    function initializeFilters() {
        renderSingleSelectOptions(
            'vaiTroDanhSachTrangThai',
            [
                {
                    value: 'selected',
                    label: 'Đã có quyền'
                },
                {
                    value: 'unselected',
                    label: 'Chưa có quyền'
                }
            ],
            'selected'
        );

        renderMultipleSelectOptions('vaiTroPopupTrangThai', [
            {
                value: 'selected',
                label: 'Đã có quyền'
            },
            {
                value: 'unselected',
                label: 'Chưa có quyền'
            }
        ]);

        renderMultipleSelectOptions(
            'vaiTroPopupNhomTinhNang',
            dsNhomTinhNang.map((item) => ({
                value: String(item.id),
                label: `${item.maNhomTinhNang} - ${item.tenNhomTinhNang}`
            }))
        );
    }

    function renderSingleSelectOptions(selectId, options, selectedValue = '') {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.innerHTML = '';

        options.forEach((item) => {
            const option = document.createElement('option');

            option.value = item.value;
            option.textContent = item.label;
            option.selected = String(item.value) === String(selectedValue);

            select.appendChild(option);
        });

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function renderMultipleSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.innerHTML = '';

        const allOption = document.createElement('option');

        allOption.value = '__ALL__';
        allOption.textContent = 'Tất cả';

        select.appendChild(allOption);

        options.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);
            option.textContent = item.label;

            select.appendChild(option);
        });

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function getMultiSelectValues(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return [];
        }

        const values = Array.from(select.selectedOptions || [])
            .map((option) => String(option.value))
            .filter((value) => value !== '__ALL__');

        return values;
    }

    function getDetailQuyen() {
        return dsQuyen.filter((quyen) => {
            const selected = dsQuyenDaChon.has(Number(quyen.id));

            if (detailTrangThai === 'selected') {
                return selected;
            }

            return !selected;
        });
    }

    function renderDetailQuyen() {
        const container = document.querySelector('[data-vai-tro-detail-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const danhSach = getDetailQuyen();
        const groups = buildGroups(danhSach);

        groups.forEach((group) => {
            container.appendChild(createDetailGroup(group));
        });

        if (groups.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'vai-tro-quyen__empty';

            empty.textContent =
                detailTrangThai === 'selected' ? 'Vai trò chưa được gán quyền.' : 'Không còn quyền chưa được gán.';

            container.appendChild(empty);
        }

        const count = document.querySelector('[data-vai-tro-detail-count]');

        if (count) {
            count.textContent = `${danhSach.length} quyền`;
        }
    }

    function createDetailGroup(group) {
        const section = document.createElement('section');
        section.className = 'vai-tro-quyen__group';

        const header = document.createElement('div');
        header.className = 'vai-tro-quyen__group-header';

        const title = document.createElement('span');
        title.className = 'vai-tro-quyen__group-title';
        title.textContent = group.ma ? `${group.ma} - ${group.ten}` : group.ten;

        header.appendChild(title);
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'vai-tro-quyen__group-grid';

        group.quyen.sort(sortQuyen).forEach((quyen) => {
            grid.appendChild(
                createPermissionCheckbox(quyen, {
                    checked: dsQuyenDaChon.has(Number(quyen.id)),
                    disabled: true
                })
            );
        });

        section.appendChild(grid);

        return section;
    }

    function openPermissionPopup() {
        if (currentMode === 'view') {
            return;
        }

        dsQuyenTamChon = new Set(dsQuyenDaChon);

        popupTrangThai = [];
        popupNhomTinhNangId = [];
        popupSearchText = '';

        resetPopupFilters();

        const modal = document.querySelector('[data-vai-tro-permission-modal]');

        if (!modal) {
            return;
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.hidden = false;
        popupDangMo = true;

        document.body.classList.add('vai-tro-permission-open');

        renderPopupQuyen();
    }

    function cancelPermissionPopup() {
        dsQuyenTamChon = new Set(dsQuyenDaChon);
        closePermissionPopup();
    }

    function closePermissionPopup() {
        const modal = document.querySelector('[data-vai-tro-permission-modal]');

        if (modal) {
            modal.hidden = true;
        }

        popupDangMo = false;

        document.body.classList.remove('vai-tro-permission-open');
    }

    function savePermissionPopup() {
        dsQuyenDaChon = new Set(dsQuyenTamChon);

        renderDetailQuyen();
        closePermissionPopup();
    }

    function normalizeSearchText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function getPopupVisibleQuyen() {
        return dsQuyen.filter((quyen) => {
            const id = Number(quyen.id);
            const selected = dsQuyenTamChon.has(id);

            if (popupTrangThai.length === 1) {
                if (popupTrangThai.includes('selected') && !selected) {
                    return false;
                }

                if (popupTrangThai.includes('unselected') && selected) {
                    return false;
                }
            }

            if (popupNhomTinhNangId.length > 0) {
                const ids = getQuyenNhomIds(quyen).map(String);

                const matched = popupNhomTinhNangId.some((nhomId) => ids.includes(String(nhomId)));

                if (!matched) {
                    return false;
                }
            }

            if (popupSearchText) {
                const text = normalizeSearchText([quyen.maQuyen, quyen.tenQuyen].filter(Boolean).join(' '));

                if (!text.includes(popupSearchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    function renderPopupQuyen() {
        const container = document.querySelector('[data-vai-tro-popup-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const visible = getPopupVisibleQuyen();
        const groups = buildGroups(visible);

        groups.forEach((group) => {
            container.appendChild(createPopupGroup(group));
        });

        if (groups.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'vai-tro-quyen__empty';
            empty.textContent = 'Không tìm thấy quyền phù hợp.';

            container.appendChild(empty);
        }

        syncPopupSelectAll();
        syncPopupSummary();
    }

    function createPopupGroup(group) {
        const section = document.createElement('section');
        section.className = 'vai-tro-quyen__group';

        const header = document.createElement('div');
        header.className = 'vai-tro-quyen__group-header';

        const left = document.createElement('div');
        left.className = 'vai-tro-quyen__group-heading';

        const groupCheckbox = document.createElement('input');
        groupCheckbox.type = 'checkbox';
        groupCheckbox.className = 'vai-tro-quyen__group-checkbox';

        const groupIds = [...new Set(group.quyen.map((item) => Number(item.id)))];

        const selectedCount = groupIds.filter((id) => dsQuyenTamChon.has(id)).length;

        groupCheckbox.checked = groupIds.length > 0 && selectedCount === groupIds.length;

        groupCheckbox.indeterminate = selectedCount > 0 && selectedCount < groupIds.length;

        groupCheckbox.addEventListener('change', () => {
            if (groupCheckbox.checked) {
                groupIds.forEach((id) => {
                    dsQuyenTamChon.add(id);
                });
            } else {
                groupIds.forEach((id) => {
                    dsQuyenTamChon.delete(id);
                });
            }

            renderPopupQuyen();
        });

        const title = document.createElement('span');

        title.className = 'vai-tro-quyen__group-title';
        title.textContent = group.ma ? `${group.ma} - ${group.ten}` : group.ten;

        left.appendChild(groupCheckbox);
        left.appendChild(title);
        header.appendChild(left);

        const count = document.createElement('span');

        count.className = 'vai-tro-quyen__group-count';
        count.textContent = `${selectedCount}/${groupIds.length}`;

        header.appendChild(count);
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'vai-tro-quyen__group-grid';

        group.quyen.sort(sortQuyen).forEach((quyen) => {
            grid.appendChild(
                createPermissionCheckbox(quyen, {
                    checked: dsQuyenTamChon.has(Number(quyen.id)),
                    disabled: false,

                    onChange(checked) {
                        const id = Number(quyen.id);

                        if (checked) {
                            dsQuyenTamChon.add(id);
                        } else {
                            dsQuyenTamChon.delete(id);
                        }

                        renderPopupQuyen();
                    }
                })
            );
        });

        section.appendChild(grid);

        return section;
    }

    function bindEvents() {
        document.querySelector('[data-vai-tro-open-permission]')?.addEventListener('click', openPermissionPopup);

        document.querySelectorAll('[data-vai-tro-permission-close]').forEach((button) => {
            button.addEventListener('click', cancelPermissionPopup);
        });

        document.querySelector('[data-vai-tro-permission-cancel]')?.addEventListener('click', cancelPermissionPopup);

        document.querySelector('[data-vai-tro-permission-save]')?.addEventListener('click', savePermissionPopup);

        document.getElementById('vaiTroDanhSachTrangThai')?.addEventListener('change', (event) => {
            detailTrangThai = String(event.target.value || 'selected');
            renderDetailQuyen();
        });

        document.getElementById('vaiTroPopupChonTatCa')?.addEventListener('change', (event) => {
            const visible = getPopupVisibleQuyen();

            const ids = [...new Set(visible.map((item) => Number(item.id)))];

            if (event.target.checked) {
                ids.forEach((id) => dsQuyenTamChon.add(id));
            } else {
                ids.forEach((id) => dsQuyenTamChon.delete(id));
            }

            renderPopupQuyen();
        });

        document.getElementById('vaiTroPopupTrangThai')?.addEventListener('change', () => {
            popupTrangThai = getMultiSelectValues('vaiTroPopupTrangThai');
            renderPopupQuyen();
        });

        document.getElementById('vaiTroPopupNhomTinhNang')?.addEventListener('change', () => {
            popupNhomTinhNangId = getMultiSelectValues('vaiTroPopupNhomTinhNang');
            renderPopupQuyen();
        });

        document.getElementById('vaiTroPopupTimQuyen')?.addEventListener('input', (event) => {
            popupSearchText = normalizeSearchText(event.target.value);
            renderPopupQuyen();
        });

        document.querySelector('[data-catalog-create]')?.addEventListener('click', () => {
            currentMode = 'create';

            dsQuyenDaChon = new Set();
            dsQuyenTamChon = new Set();
            detailTrangThai = 'selected';

            syncChooseButton();
            syncDetailStatusFilter();
            renderDetailQuyen();
        });
    }

    function syncChooseButton() {
        const button = document.querySelector('[data-vai-tro-open-permission]');

        if (!button) {
            return;
        }

        button.hidden = currentMode === 'view';
    }

    function syncDetailStatusFilter() {
        const select = document.getElementById('vaiTroDanhSachTrangThai');

        if (!select) {
            return;
        }

        const value = detailTrangThai || 'selected';

        Array.from(select.options).forEach((option) => {
            option.selected = String(option.value) === String(value);
        });

        select.value = value;

        const smartSelect = select.closest('[data-smart-select]');

        smartSelect?.smartSelect?.refresh?.();
    }

    function syncPopupSummary() {
        const summary = document.querySelector('[data-vai-tro-popup-summary]');

        if (!summary) {
            return;
        }

        summary.textContent = `Đã chọn ${dsQuyenTamChon.size} quyền`;
    }

    function getQuyenNhomIds(quyen) {
        if (Array.isArray(quyen.dsNhomTinhNangId)) {
            return quyen.dsNhomTinhNangId.map(Number).filter(Number.isInteger);
        }

        if (Array.isArray(quyen.dsNhomTinhNang)) {
            return quyen.dsNhomTinhNang.map((item) => Number(item.id)).filter(Number.isInteger);
        }

        return [];
    }

    function buildGroups(quyenList) {
        const groupMap = new Map();

        dsNhomTinhNang.forEach((nhom) => {
            groupMap.set(Number(nhom.id), {
                id: Number(nhom.id),
                ma: nhom.maNhomTinhNang || '',
                ten: nhom.tenNhomTinhNang || '',
                quyen: []
            });
        });

        const otherGroup = {
            id: null,
            ma: '',
            ten: 'Khác',
            quyen: []
        };

        quyenList.forEach((quyen) => {
            const ids = getQuyenNhomIds(quyen);

            if (ids.length === 0) {
                otherGroup.quyen.push(quyen);
                return;
            }

            let assigned = false;

            ids.forEach((id) => {
                const group = groupMap.get(Number(id));

                if (!group) {
                    return;
                }

                group.quyen.push(quyen);
                assigned = true;
            });

            if (!assigned) {
                otherGroup.quyen.push(quyen);
            }
        });

        const groups = Array.from(groupMap.values()).filter((group) => group.quyen.length > 0);

        if (otherGroup.quyen.length > 0) {
            groups.push(otherGroup);
        }

        return groups;
    }

    function createPermissionCheckbox(quyen, options = {}) {
        const template = document.getElementById('vaiTroQuyenCheckboxTemplate');
        const fragment = template.content.cloneNode(true);
        const item = fragment.querySelector('[data-vai-tro-quyen-item]');
        const input = item.querySelector("input[type='checkbox']");
        const label = item.querySelector('.form-checkbox__label');
        const id = Number(quyen.id);

        const inputId = `vaiTroQuyen_${id}_${Math.random().toString(36).slice(2, 8)}`;

        input.id = inputId;
        input.name = 'dsQuyenId';
        input.value = String(id);
        input.checked = options.checked === true;
        input.disabled = options.disabled === true;

        if (label) {
            label.textContent = `${quyen.maQuyen || ''} - ${quyen.tenQuyen || ''}`;
        }

        item.querySelector('label[for]')?.setAttribute('for', inputId);

        if (typeof options.onChange === 'function') {
            input.addEventListener('change', () => {
                options.onChange(input.checked);
            });
        }

        return item;
    }

    function syncPopupSelectAll() {
        const checkbox = document.getElementById('vaiTroPopupChonTatCa');

        if (!checkbox) {
            return;
        }

        const visible = getPopupVisibleQuyen();

        const ids = [...new Set(visible.map((item) => Number(item.id)))];

        const selected = ids.filter((id) => dsQuyenTamChon.has(id)).length;

        checkbox.checked = ids.length > 0 && selected === ids.length;

        checkbox.indeterminate = selected > 0 && selected < ids.length;
    }

    function sortQuyen(a, b) {
        const maA = String(a.maQuyen || '');
        const maB = String(b.maQuyen || '');

        return maA.localeCompare(maB, 'vi', {
            numeric: true,
            sensitivity: 'base'
        });
    }

    function countSelected(quyen) {
        return quyen.filter((item) => dsQuyenDaChon.has(Number(item.id))).length;
    }

    function normalizeNumberArray(value) {
        if (Array.isArray(value)) {
            return [...new Set(value.map(Number).filter(Number.isInteger))];
        }

        if (value === undefined || value === null || value === '') {
            return [];
        }

        return [
            ...new Set(
                String(value)
                    .replace(/^\[/, '')
                    .replace(/\]$/, '')
                    .split(',')
                    .map((item) => Number(item.trim()))
                    .filter(Number.isInteger)
            )
        ];
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_vai_tro.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu vai trò thất bại:', error);

            window.MCS?.toast?.error(error?.message || 'Xuất dữ liệu thất bại.');
        }
    }

    function importData(catalogInstance) {
        const input = document.createElement('input');

        input.type = 'file';
        input.accept = '.xlsx,.xls,.xlsm';
        input.hidden = true;

        document.body.appendChild(input);

        input.addEventListener('change', async () => {
            const file = input.files?.[0];

            if (!file) {
                input.remove();
                return;
            }

            try {
                const body = new FormData();

                body.append('file', file);

                const result = await window.MCS.api.requestFile(`${API_BASE}/import-du-lieu`, {
                    method: 'POST',
                    body
                });

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_vai_tro_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu vai trò thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }

    function resetPopupFilters() {
        popupTrangThai = [];
        popupNhomTinhNangId = [];
        popupSearchText = '';

        clearSmartSelect('vaiTroPopupTrangThai');
        clearSmartSelect('vaiTroPopupNhomTinhNang');

        const search = document.getElementById('vaiTroPopupTimQuyen');

        if (search) {
            search.value = '';

            search.dispatchEvent(
                new Event('input', {
                    bubbles: true
                })
            );
        }
    }

    function clearSmartSelect(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.selected = false;
        });

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }
});

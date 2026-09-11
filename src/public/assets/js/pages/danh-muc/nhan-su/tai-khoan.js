'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-tai-khoan';
    const API_NHAN_VIEN_KHA_DUNG = `${API_BASE}/nhan-vien-kha-dung`;
    const API_VAI_TRO = '/api/mcs/v1/dm-vai-tro/tong-hop?active=true';

    let catalog = null;
    let dsNhanVien = [];
    let dsVaiTro = [];
    let dsVaiTroDaChon = new Set();
    let dsVaiTroTamChon = new Set();
    let currentMode = 'view';
    let detailTrangThai = 'selected';
    let popupTrangThai = [];
    let popupSearchText = '';

    initialize();

    async function initialize() {
        await initializeCatalog();
        await loadVaiTro();
        initializeFilters();
        bindEvents();
        syncChooseButton();
        syncDetailStatusFilter();
        renderDetailVaiTro();
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: 'tai-khoan',
            permissionCodes: {
                view: 'Q000529',
                create: 'Q000530',
                update: 'Q000531'
            },
            detailTitle: 'Thông tin tài khoản',
            createTitle: 'Thêm tài khoản',
            updateTitle: 'Cập nhật tài khoản',

            columns: [
                {
                    key: 'maNhanVien',
                    label: 'Mã nhân viên',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    filterable: true
                },
                {
                    key: 'tenDangNhap',
                    label: 'Tên đăng nhập',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'hoTenNhanVien',
                    label: 'Tên nhân viên',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'soLanDangNhap',
                    label: 'Số lần đăng nhập',
                    sortable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'soLanDangNhapSai',
                    label: 'Số lần nhập sai',
                    sortable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'biKhoa',
                    label: 'Bị khóa',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    render: window.createStatusBadge
                },
                {
                    key: 'khoaDen',
                    label: 'Khóa đến',
                    className: 'catalog-table__cell--center',
                    render: (value) => formatDateTime(value)
                },
                {
                    key: 'active',
                    label: 'Hiệu lực',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    render: window.createStatusBadge
                },
                {
                    key: '__resetPassword',
                    label: 'Thao tác',
                    sortable: false,
                    className: 'catalog-table__cell--center',
                    filterable: false,

                    render: (value, record) => {
                        if (!record?.id) {
                            return '';
                        }

                        return {
                            html: `
                                <button
                                    type="button"
                                    class="tai-khoan-reset-password"
                                    data-tai-khoan-reset-password
                                    data-id="${record.id}"
                                    title="Đặt lại mật khẩu"
                                    aria-label="Đặt lại mật khẩu">

                                    <i
                                        class="fa-solid fa-key"
                                        aria-hidden="true">
                                    </i>

                                </button>
                            `
                        };
                    }
                }
            ],

            defaultValues: {
                tenDangNhap: '',
                nhanVienId: '',
                anhDaiDien: '',
                soLanDangNhap: 0,
                soLanDangNhapSai: 0,
                khoaDen: '',
                lanDangNhapCuoi: '',
                doiMatKhauLanCuoi: '',
                createdAt: '',
                updatedAt: '',
                doiMatKhauLanDau: true,
                biKhoa: false,
                dsVaiTroId: [],
                active: true
            },

            validation: {
                tenDangNhap: {
                    label: 'Tên đăng nhập',
                    required: true,
                    maxLength: 100,
                    unique: true,
                    requiredMessage: 'Vui lòng điền vào trường này.',
                    maxLengthMessage: 'Tên đăng nhập không được vượt quá 100 ký tự.',
                    uniqueMessage: 'Tên đăng nhập đã tồn tại.'
                },

                nhanVienId: {
                    label: 'Mã nhân viên',
                    required: true,
                    requiredMessage: 'Vui lòng chọn nhân viên.'
                }
            },

            mapListResponse(result) {
                const data = Array.isArray(result?.data) ? result.data : [];

                return data.map((item) => ({
                    ...item,
                    maNhanVien: item?.maNhanVien ?? item?.nhanVien?.maNhanVien ?? '',
                    hoTenNhanVien: item?.hoTenNhanVien ?? item?.nhanVien?.hoTen ?? '',
                    anhDaiDien: item?.anhDaiDien ?? item?.nhanVien?.anhDaiDien ?? ''
                }));
            },

            mapDetailResponse(result) {
                return result?.data || null;
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? '',
                    tenDangNhap: record?.tenDangNhap ?? record?.ten_dang_nhap ?? '',
                    nhanVienId: record?.nhanVienId ?? record?.nhan_vien_id ?? record?.nhanVien?.id ?? '',
                    anhDaiDien:
                        record?.anhDaiDien ??
                        record?.anh_dai_dien ??
                        record?.nhanVien?.anhDaiDien ??
                        record?.nhanVien?.anh_dai_dien ??
                        '',
                    soLanDangNhap: record?.soLanDangNhap ?? record?.so_lan_dang_nhap ?? 0,
                    soLanDangNhapSai: record?.soLanDangNhapSai ?? record?.so_lan_dang_nhap_sai ?? 0,
                    khoaDen: formatDateTime(record?.khoaDen ?? record?.khoa_den),
                    lanDangNhapCuoi: formatDateTime(record?.lanDangNhapCuoi ?? record?.lan_dang_nhap_cuoi),
                    doiMatKhauLanCuoi: formatDateTime(record?.doiMatKhauLanCuoi ?? record?.doi_mat_khau_lan_cuoi),
                    createdAt: formatDateTime(record?.createdAt ?? record?.created_at),
                    updatedAt: formatDateTime(record?.updatedAt ?? record?.updated_at),
                    doiMatKhauLanDau: (record?.doiMatKhauLanDau ?? record?.doi_mat_khau_lan_dau) === true,
                    biKhoa: (record?.biKhoa ?? record?.bi_khoa) === true,
                    dsVaiTroId: normalizeNumberArray(record?.dsVaiTroId ?? record?.ds_vai_tro_id),
                    active: record?.active === true
                };
            },

            transformPayload(formData) {
                return {
                    tenDangNhap: String(formData.tenDangNhap || '').trim(),
                    nhanVienId: toNullableNumber(formData.nhanVienId),
                    anhDaiDien: formData.anhDaiDien,
                    dsVaiTroId: Array.from(dsVaiTroDaChon).map(Number).filter(Number.isInteger),
                    biKhoa: formData.biKhoa === true,
                    active: formData.active === true
                };
            },

            getRecordSubtitle(record) {
                return record?.tenDangNhap || '';
            },

            onRecordLoaded(record, mode) {
                currentMode = mode || 'view';

                dsVaiTroDaChon = new Set(normalizeNumberArray(record?.dsVaiTroId));

                dsVaiTroTamChon = new Set(dsVaiTroDaChon);
                detailTrangThai = 'selected';

                const selectedNhanVienId = record?.nhanVienId ?? record?.nhanVien?.id ?? '';

                if (currentMode === 'update') {
                    loadNhanVienKhaDung(record?.id, selectedNhanVienId);
                } else {
                    renderNhanVienHienTai(record);
                }

                syncNhanVienImage(record);

                lockFirstLoginCheckbox((record?.doiMatKhauLanDau ?? record?.doi_mat_khau_lan_dau) === true);

                resetPopupFilters();
                syncChooseButton();
                syncDetailStatusFilter();
                renderDetailVaiTro();
            },

            toolbarActions: [
                {
                    action: 'filter',
                    label: 'Tìm kiếm chi tiết',
                    icon: 'search'
                },
                {
                    action: 'export-tai-khoan',
                    label: 'Xuất danh mục tài khoản',
                    icon: 'download'
                },
                {
                    action: 'import-tai-khoan',
                    label: 'Nhập danh mục tài khoản',
                    icon: 'upload'
                }
            ],

            onAction(action, id, catalogInstance) {
                if (action === 'export-tai-khoan') {
                    exportData();
                    return;
                }

                if (action === 'import-tai-khoan') {
                    importData(catalogInstance);
                }
            }
        });
    }

    function lockFirstLoginCheckbox(value) {
        const checkbox = document.getElementById('doiMatKhauLanDau');

        if (!checkbox) {
            return;
        }

        checkbox.checked = value === true;
        checkbox.disabled = true;
        checkbox.setAttribute('disabled', '');
    }

    async function loadNhanVienKhaDung(taiKhoanId = null, selectedId = '') {
        try {
            const params = new URLSearchParams();
            const accountId = Number(taiKhoanId);

            if (Number.isInteger(accountId) && accountId > 0) {
                params.set('taiKhoanId', String(accountId));
            }

            const queryString = params.toString();

            const url = queryString ? API_NHAN_VIEN_KHA_DUNG + `?${queryString}` : API_NHAN_VIEN_KHA_DUNG;

            const response = await window.MCS.api.request(url);
            const data = response?.data;

            dsNhanVien = Array.isArray(data) ? data : data?.items || data?.data || [];

            renderNhanVienSelect(selectedId);
        } catch (error) {
            dsNhanVien = [];

            renderNhanVienSelect(selectedId);

            window.MCS?.toast?.error?.(error?.message || 'Không thể tải danh sách nhân viên khả dụng.');
        }
    }

    function renderNhanVienHienTai(record) {
        const nhanVien = record?.nhanVien || {};

        const nhanVienId = record?.nhanVienId ?? nhanVien?.id ?? '';

        if (!nhanVienId) {
            dsNhanVien = [];
            renderNhanVienSelect('');
            return;
        }

        dsNhanVien = [
            {
                id: nhanVienId,
                maNhanVien: nhanVien?.maNhanVien ?? record?.maNhanVien ?? '',
                hoTen: nhanVien?.hoTen ?? record?.hoTenNhanVien ?? '',
                anhDaiDien: nhanVien?.anhDaiDien ?? record?.anhDaiDien ?? '',
                active: nhanVien?.active !== false
            }
        ];

        renderNhanVienSelect(nhanVienId);
    }

    async function loadVaiTro() {
        try {
            const response = await window.MCS.api.request(API_VAI_TRO);
            const data = response?.data;

            dsVaiTro = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsVaiTro = dsVaiTro.filter((item) => item?.active !== false);
        } catch (error) {
            dsVaiTro = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách vai trò.');
        }
    }

    function renderNhanVienSelect(selectedId = '') {
        const select = document.getElementById('nhanVienId');

        if (!select) {
            return;
        }

        const currentValue = selectedId === undefined || selectedId === null ? '' : String(selectedId);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';
        emptyOption.selected = currentValue === '';

        select.appendChild(emptyOption);

        dsNhanVien.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);
            option.textContent = `${item.maNhanVien || ''} - ${item.hoTen || ''}`;
            option.selected = String(item.id) === currentValue;

            select.appendChild(option);
        });

        select.value = currentValue;

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function initializeFilters() {
        renderSingleSelectOptions(
            'taiKhoanDanhSachTrangThai',
            [
                {
                    value: 'selected',
                    label: 'Đã có vai trò'
                },
                {
                    value: 'unselected',
                    label: 'Chưa có vai trò'
                }
            ],
            'selected'
        );

        renderMultipleSelectOptions('taiKhoanPopupTrangThai', [
            {
                value: 'selected',
                label: 'Đã có vai trò'
            },
            {
                value: 'unselected',
                label: 'Chưa có vai trò'
            }
        ]);
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

    function bindEvents() {
        document.getElementById('nhanVienId')?.addEventListener('change', (event) => {
            const id = Number(event.target.value);

            const nhanVien = dsNhanVien.find((item) => Number(item.id) === id);

            syncNhanVienImage(nhanVien);
        });

        document.querySelector('[data-tai-khoan-open-role]')?.addEventListener('click', openRolePopup);

        document.querySelectorAll('[data-tai-khoan-role-close]').forEach((button) => {
            button.addEventListener('click', cancelRolePopup);
        });

        document.querySelector('[data-tai-khoan-role-cancel]')?.addEventListener('click', cancelRolePopup);

        document.querySelector('[data-tai-khoan-role-save]')?.addEventListener('click', saveRolePopup);

        document.getElementById('taiKhoanDanhSachTrangThai')?.addEventListener('change', (event) => {
            detailTrangThai = String(event.target.value || 'selected');

            renderDetailVaiTro();
        });

        document.getElementById('taiKhoanPopupChonTatCa')?.addEventListener('change', (event) => {
            const visible = getPopupVisibleVaiTro();

            const ids = visible.map((item) => Number(item.id));

            if (event.target.checked) {
                ids.forEach((id) => dsVaiTroTamChon.add(id));
            } else {
                ids.forEach((id) => dsVaiTroTamChon.delete(id));
            }

            renderPopupVaiTro();
        });

        document.getElementById('taiKhoanPopupTrangThai')?.addEventListener('change', () => {
            popupTrangThai = getMultiSelectValues('taiKhoanPopupTrangThai');

            renderPopupVaiTro();
        });

        document.getElementById('taiKhoanPopupTimVaiTro')?.addEventListener('input', (event) => {
            popupSearchText = normalizeSearchText(event.target.value);

            renderPopupVaiTro();
        });

        document.querySelector('[data-catalog-create]')?.addEventListener('click', async () => {
            currentMode = 'create';
            dsVaiTroDaChon = new Set();
            dsVaiTroTamChon = new Set();
            detailTrangThai = 'selected';

            await loadNhanVienKhaDung(null, '');

            syncNhanVienImage(null);

            lockFirstLoginCheckbox(true);
            syncChooseButton();
            syncDetailStatusFilter();
            renderDetailVaiTro();
        });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tai-khoan-reset-password]');

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const id = Number(button.dataset.id);

            if (!Number.isInteger(id)) {
                return;
            }

            confirmResetPassword(id);
        });
    }

    function confirmResetPassword(id) {
        if (!window.MCS?.confirm?.show) {
            return;
        }

        window.MCS.confirm.show({
            title: 'Đặt lại mật khẩu',
            message: 'Bạn có chắc chắn muốn đặt lại mật khẩu của tài khoản này không?',
            confirmLabel: 'Đặt lại mật khẩu',
            type: 'danger',

            onConfirm: async () => {
                try {
                    const result = await window.MCS.api.request(`${API_BASE}/dat-lai-mat-khau/${id}`, {
                        method: 'PATCH'
                    });

                    window.MCS?.toast?.success(result?.message || 'Đặt lại mật khẩu thành công.');

                    if (catalog?.load) {
                        await catalog.load();
                    }
                } catch (error) {
                    window.MCS?.toast?.error(error?.message || 'Đặt lại mật khẩu thất bại.');
                }
            }
        });
    }

    function getDetailVaiTro() {
        return dsVaiTro.filter((vaiTro) => {
            const selected = dsVaiTroDaChon.has(Number(vaiTro.id));

            return detailTrangThai === 'selected' ? selected : !selected;
        });
    }

    function renderDetailVaiTro() {
        const container = document.querySelector('[data-tai-khoan-role-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const danhSach = getDetailVaiTro().sort(sortVaiTro);

        danhSach.forEach((vaiTro) => {
            container.appendChild(
                createRoleCheckbox(vaiTro, {
                    checked: dsVaiTroDaChon.has(Number(vaiTro.id)),
                    disabled: true
                })
            );
        });

        if (danhSach.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'tai-khoan-vai-tro__empty';

            empty.textContent =
                detailTrangThai === 'selected'
                    ? 'Tài khoản chưa được gán vai trò.'
                    : 'Không còn vai trò chưa được gán.';

            container.appendChild(empty);
        }

        const count = document.querySelector('[data-tai-khoan-role-count]');

        if (count) {
            count.textContent = `${danhSach.length} vai trò`;
        }
    }

    function openRolePopup() {
        if (currentMode === 'view') {
            return;
        }

        dsVaiTroTamChon = new Set(dsVaiTroDaChon);

        resetPopupFilters();

        const modal = document.querySelector('[data-tai-khoan-role-modal]');

        if (!modal) {
            return;
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.hidden = false;

        document.body.classList.add('tai-khoan-role-open');

        renderPopupVaiTro();
    }

    function cancelRolePopup() {
        dsVaiTroTamChon = new Set(dsVaiTroDaChon);

        closeRolePopup();
    }

    function saveRolePopup() {
        dsVaiTroDaChon = new Set(dsVaiTroTamChon);

        renderDetailVaiTro();
        closeRolePopup();
    }

    function closeRolePopup() {
        const modal = document.querySelector('[data-tai-khoan-role-modal]');

        if (modal) {
            modal.hidden = true;
        }

        document.body.classList.remove('tai-khoan-role-open');
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

    function getPopupVisibleVaiTro() {
        return dsVaiTro.filter((vaiTro) => {
            const selected = dsVaiTroTamChon.has(Number(vaiTro.id));

            if (popupTrangThai.length === 1) {
                if (popupTrangThai.includes('selected') && !selected) {
                    return false;
                }

                if (popupTrangThai.includes('unselected') && selected) {
                    return false;
                }
            }

            if (popupSearchText) {
                const text = normalizeSearchText(
                    [vaiTro.maVaiTro, vaiTro.tenVaiTro, vaiTro.moTa].filter(Boolean).join(' ')
                );

                if (!text.includes(popupSearchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    function renderPopupVaiTro() {
        const container = document.querySelector('[data-tai-khoan-popup-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const visible = getPopupVisibleVaiTro().sort(sortVaiTro);

        visible.forEach((vaiTro) => {
            container.appendChild(
                createRoleCheckbox(vaiTro, {
                    checked: dsVaiTroTamChon.has(Number(vaiTro.id)),

                    disabled: false,

                    onChange(checked) {
                        const id = Number(vaiTro.id);

                        if (checked) {
                            dsVaiTroTamChon.add(id);
                        } else {
                            dsVaiTroTamChon.delete(id);
                        }

                        renderPopupVaiTro();
                    }
                })
            );
        });

        if (visible.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'tai-khoan-vai-tro__empty';
            empty.textContent = 'Không tìm thấy vai trò phù hợp.';

            container.appendChild(empty);
        }

        syncPopupSelectAll();
        syncPopupSummary();
    }

    function createRoleCheckbox(vaiTro, options = {}) {
        const template = document.getElementById('taiKhoanVaiTroCheckboxTemplate');

        const fragment = template.content.cloneNode(true);

        const item = fragment.querySelector('[data-tai-khoan-role-item]');

        const input = item.querySelector("input[type='checkbox']");

        const label = item.querySelector('.form-checkbox__label');

        const id = Number(vaiTro.id);

        const inputId = `taiKhoanVaiTro_${id}_${Math.random().toString(36).slice(2, 8)}`;

        input.id = inputId;
        input.name = 'dsVaiTroId';
        input.value = String(id);
        input.checked = options.checked === true;
        input.disabled = options.disabled === true;

        if (label) {
            label.textContent = `${vaiTro.maVaiTro || ''} - ${vaiTro.tenVaiTro || ''}`;
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
        const checkbox = document.getElementById('taiKhoanPopupChonTatCa');

        if (!checkbox) {
            return;
        }

        const ids = getPopupVisibleVaiTro().map((item) => Number(item.id));

        const selected = ids.filter((id) => dsVaiTroTamChon.has(id)).length;

        checkbox.checked = ids.length > 0 && selected === ids.length;

        checkbox.indeterminate = selected > 0 && selected < ids.length;
    }

    function syncPopupSummary() {
        const summary = document.querySelector('[data-tai-khoan-popup-summary]');

        if (summary) {
            summary.textContent = `Đã chọn ${dsVaiTroTamChon.size} vai trò`;
        }
    }

    function syncChooseButton() {
        const button = document.querySelector('[data-tai-khoan-open-role]');

        if (button) {
            button.hidden = currentMode === 'view';
        }
    }

    function syncDetailStatusFilter() {
        const select = document.getElementById('taiKhoanDanhSachTrangThai');

        if (!select) {
            return;
        }

        select.value = detailTrangThai || 'selected';

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function getMultiSelectValues(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => String(option.value))
            .filter((value) => value !== '__ALL__');
    }

    function resetPopupFilters() {
        popupTrangThai = [];
        popupSearchText = '';

        clearSmartSelect('taiKhoanPopupTrangThai');

        const search = document.getElementById('taiKhoanPopupTimVaiTro');

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

    function syncNhanVienImage(record) {
        const root = document.querySelector('[data-form-field="anhDaiDien"]')?.querySelector('[data-image-picker]');

        const imagePicker = root?.imagePicker || window.MCS?.imagePicker?.initialize?.(root);

        if (!imagePicker) {
            return;
        }

        const value = record?.anhDaiDien || record?.nhanVien?.anhDaiDien || '';

        if (typeof imagePicker.setValue === 'function') {
            imagePicker.setValue(value);
            return;
        }

        imagePicker.setExistingImage?.(value);
    }

    function formatDateTime(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        })
            .formatToParts(date)
            .reduce((result, item) => {
                result[item.type] = item.value;

                return result;
            }, {});

        return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
    }

    function toNullableNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const number = Number(value);

        return Number.isInteger(number) ? number : null;
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

    function sortVaiTro(a, b) {
        return String(a.maVaiTro || '').localeCompare(String(b.maVaiTro || ''), 'vi', {
            numeric: true,
            sensitivity: 'base'
        });
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_tai_khoan.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_tai_khoan_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

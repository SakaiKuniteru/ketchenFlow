'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-co-so';
    const API_QUOC_GIA = '/api/mcs/v1/dm-quoc-gia/tong-hop?active=true';
    const API_TINH_THANH = '/api/mcs/v1/dm-tinh-thanh/tong-hop?active=true';
    const API_XA_PHUONG = '/api/mcs/v1/dm-xa-phuong/tong-hop?active=true';

    let catalog = null;
    let dsQuocGia = [];
    let dsTinhThanh = [];
    let dsXaPhuong = [];

    initialize();

    async function initialize() {
        await Promise.all([loadQuocGia(), loadTinhThanh(), loadXaPhuong()]);

        await initializeCatalog();

        renderAllSelects();
        bindDependentSelects();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'co-so',
                permissionCodes: {
                    view: 'Q000501',
                    create: 'Q000502',
                    update: 'Q000503'
                },
                columns: [
                    {
                        key: 'maCoSo',
                        label: 'Mã cơ sở',
                        width: '150px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenCoSo',
                        label: 'Tên cơ sở',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'diaChi',
                        label: 'Địa chỉ',
                        width: '320px',
                        filterable: true
                    },
                    {
                        key: 'tenQuocGia',
                        label: 'Quốc gia',
                        width: '160px',
                        filterable: true
                    },
                    {
                        key: 'tenTinhThanh',
                        label: 'Tỉnh/Thành',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'tenXaPhuong',
                        label: 'Xã/Phường',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'active',
                        label: 'Trạng thái',
                        width: '130px',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: window.createStatusBadge
                    }
                ],

                defaultValues: {
                    maCoSo: '',
                    tenCoSo: '',
                    quocGiaId: '',
                    tinhThanhId: '',
                    xaPhuongId: '',
                    diaChi: '',
                    logo: '',
                    favicon: '',
                    logoDoiTac: '',
                    active: true
                },

                validation: {
                    maCoSo: {
                        label: 'Mã cơ sở',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã cơ sở không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã cơ sở đã tồn tại.'
                    },

                    tenCoSo: {
                        label: 'Tên cơ sở',
                        required: true,
                        maxLength: 150,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên cơ sở không được vượt quá 150 ký tự.',
                        uniqueMessage: 'Tên cơ sở đã tồn tại.'
                    },

                    diaChi: {
                        label: 'Địa chỉ',
                        maxLength: 500,
                        maxLengthMessage: 'Địa chỉ không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin cơ sở',
                createTitle: 'Thêm cơ sở',
                updateTitle: 'Cập nhật cơ sở',

                getRecordSubtitle(record) {
                    return record?.maCoSo || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data)
                        ? result.data
                        : result?.data?.items || result?.data?.data || [];

                    return records.map((record) => mapListRecord(record));
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maCoSo: record?.maCoSo || '',
                        tenCoSo: record?.tenCoSo || '',
                        quocGiaId: record?.quocGiaId ?? record?.quocGia?.id ?? '',
                        tinhThanhId: record?.tinhThanhId ?? record?.tinhThanh?.id ?? '',
                        xaPhuongId: record?.xaPhuongId ?? record?.xaPhuong?.id ?? '',
                        diaChi: record?.diaChi || '',
                        logo: record?.logo || '',
                        favicon: record?.favicon || '',
                        logoDoiTac: record?.logoDoiTac || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maCoSo: String(formData.maCoSo || '')
                            .trim()
                            .toUpperCase(),
                        tenCoSo: String(formData.tenCoSo || '').trim(),
                        quocGiaId: normalizeNullableNumber(formData.quocGiaId),
                        tinhThanhId: normalizeNullableNumber(formData.tinhThanhId),
                        xaPhuongId: normalizeNullableNumber(formData.xaPhuongId),
                        diaChi: buildAddress(formData),
                        logo: formData.logo,
                        favicon: formData.favicon,
                        logoDoiTac: formData.logoDoiTac,
                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    syncImageField('logo', record?.logo, mode);
                    syncImageField('favicon', record?.favicon, mode);
                    syncImageField('logoDoiTac', record?.logoDoiTac, mode);
                    syncAddressHierarchy(record, mode);
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-co-so',
                        label: 'Xuất danh mục cơ sở',
                        icon: 'download'
                    },
                    {
                        action: 'import-co-so',
                        label: 'Nhập danh mục cơ sở',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-co-so') {
                        exportData();
                        return;
                    }

                    if (action === 'import-co-so') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục cơ sở.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục cơ sở.');
        }
    }

    function mapListRecord(record) {
        return {
            ...record,
            tenQuocGia: record?.tenQuocGia || record?.quocGia?.tenQuocGia || record?.quocGia?.ten || '',
            tenTinhThanh: record?.tenTinhThanh || record?.tinhThanh?.tenTinhThanh || record?.tinhThanh?.ten || '',
            tenXaPhuong: record?.tenXaPhuong || record?.xaPhuong?.tenXaPhuong || record?.xaPhuong?.ten || ''
        };
    }

    async function loadQuocGia() {
        dsQuocGia = await loadLookup(API_QUOC_GIA, 'quốc gia');
    }

    async function loadTinhThanh() {
        dsTinhThanh = await loadLookup(API_TINH_THANH, 'tỉnh thành');
    }

    async function loadXaPhuong() {
        dsXaPhuong = await loadLookup(API_XA_PHUONG, 'xã phường');
    }

    async function loadLookup(url, label) {
        try {
            const response = await window.MCS.api.request(url);
            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            return records.filter((item) => item?.active !== false);
        } catch (error) {
            console.error(`Không thể tải ${label}.`, error);

            window.MCS?.toast?.error(error?.message || `Không thể tải danh sách ${label}.`);

            return [];
        }
    }

    function renderAllSelects() {
        renderSelect(
            'quocGiaId',
            dsQuocGia,
            (item) => item.id,
            (item) => buildLabel(item.maQuocGia || item.ma, item.tenQuocGia || item.ten),
            ''
        );

        renderTinhThanhSelect(null, '');
        renderXaPhuongSelect(null, '');
    }

    function renderSelect(selectId, items, getValue, getLabel, selectedValue = '') {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        const selected = selectedValue === null || selectedValue === undefined ? '' : String(selectedValue);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';
        emptyOption.selected = selected === '';

        select.appendChild(emptyOption);

        items.forEach((item) => {
            const value = String(getValue(item));
            const option = document.createElement('option');

            option.value = value;
            option.textContent = getLabel(item);
            option.selected = selected !== '' && value === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = select.closest('[data-smart-select]')?.smartSelect;

        smartSelect?.refresh?.();

        if (selected === '') {
            smartSelect?.clear?.();
        }
    }

    function renderTinhThanhSelect(quocGiaId = null, selectedValue = '') {
        const id = normalizeNullableNumber(quocGiaId);

        const records =
            id === null ? [] : dsTinhThanh.filter((item) => Number(item.quocGiaId ?? item.quocGia?.id) === id);

        renderSelect(
            'tinhThanhId',
            records,
            (item) => item.id,
            (item) => buildLabel(item.maTinhThanh || item.ma, item.tenTinhThanh || item.ten),
            selectedValue
        );

        setSelectPlaceholder('tinhThanhId', id === null ? 'Chọn quốc gia trước' : 'Chọn tỉnh/thành...');

        setSelectDisabled('tinhThanhId', id === null);
    }

    function renderXaPhuongSelect(tinhThanhId = null, selectedValue = '') {
        const id = normalizeNullableNumber(tinhThanhId);

        const records =
            id === null ? [] : dsXaPhuong.filter((item) => Number(item.tinhThanhId ?? item.tinhThanh?.id) === id);

        renderSelect(
            'xaPhuongId',
            records,
            (item) => item.id,
            (item) => buildLabel(item.maXaPhuong || item.ma, item.tenXaPhuong || item.ten),
            selectedValue
        );

        setSelectPlaceholder('xaPhuongId', id === null ? 'Chọn tỉnh/thành trước' : 'Chọn xã/phường...');

        setSelectDisabled('xaPhuongId', id === null);
    }

    function bindDependentSelects() {
        document.getElementById('quocGiaId')?.addEventListener('change', (event) => {
            const quocGiaId = event.target.value;

            renderTinhThanhSelect(quocGiaId, '');

            renderXaPhuongSelect(null, '');
        });

        document.getElementById('tinhThanhId')?.addEventListener('change', (event) => {
            renderXaPhuongSelect(event.target.value, '');
        });
    }

    function syncAddressHierarchy(record, mode) {
        const quocGiaId = record?.quocGiaId ?? record?.quocGia?.id ?? null;
        const tinhThanhId = record?.tinhThanhId ?? record?.tinhThanh?.id ?? null;
        const xaPhuongId = record?.xaPhuongId ?? record?.xaPhuong?.id ?? null;

        renderSelect(
            'quocGiaId',
            dsQuocGia,
            (item) => item.id,
            (item) => buildLabel(item.maQuocGia || item.ma, item.tenQuocGia || item.ten),
            quocGiaId
        );

        renderTinhThanhSelect(quocGiaId, tinhThanhId);

        renderXaPhuongSelect(tinhThanhId, xaPhuongId);

        setSelectMode('quocGiaId', mode);

        setSelectMode('tinhThanhId', mode, !quocGiaId);

        setSelectMode('xaPhuongId', mode, !tinhThanhId);
    }

    function buildAddress(formData) {
        const diaChi = String(formData.diaChi || '').trim();

        if (diaChi) {
            return diaChi;
        }

        const tenXaPhuong = getSelectedLabel('xaPhuongId');
        const tenTinhThanh = getSelectedLabel('tinhThanhId');
        const tenQuocGia = getSelectedLabel('quocGiaId');

        const danhSach = [
            removeCodeFromLabel(tenXaPhuong),
            removeCodeFromLabel(tenTinhThanh),
            removeCodeFromLabel(tenQuocGia)
        ].filter(Boolean);

        return danhSach.length ? danhSach.join(', ') : null;
    }

    function getSelectedLabel(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return '';
        }

        const option = select.options[select.selectedIndex];

        return (option?.textContent || '').trim();
    }

    function removeCodeFromLabel(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        const index = text.indexOf(' - ');

        if (index === -1) {
            return text;
        }

        return text.substring(index + 3).trim();
    }

    function syncImageField(inputId, value, mode) {
        const field = document.querySelector(`[data-form-field="${inputId}"]`);

        const root = field?.querySelector('[data-image-picker]');

        if (!root) {
            return;
        }

        const imagePicker = window.MCS.imagePicker?.initialize(root);

        if (!imagePicker) {
            return;
        }

        imagePicker.setValue(value || '');

        imagePicker.setDisabled(mode === 'view');
    }

    function setSelectPlaceholder(selectId, placeholder) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        if (!root) {
            return;
        }

        root.dataset.selectPlaceholder = placeholder;

        const placeholderElement = root.querySelector('.smart-select__placeholder');

        if (placeholderElement) {
            placeholderElement.textContent = placeholder;
        }
    }

    function setSelectMode(selectId, mode, forceDisabled = false) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        root?.smartSelect?.setDisabled?.(mode === 'view' || forceDisabled);
    }

    function setSelectDisabled(selectId, disabled) {
        document
            .getElementById(selectId)
            ?.closest('[data-smart-select]')
            ?.smartSelect?.setDisabled?.(Boolean(disabled));
    }

    function buildLabel(code, name) {
        const ma = String(code || '').trim();
        const ten = String(name || '').trim();

        if (ma && ten) {
            return `${ma} - ${ten}`;
        }

        return ten || ma;
    }

    function normalizeNullableNumber(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_co_so.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu cơ sở thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_co_so_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu cơ sở thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-phong-ban';
    const API_CO_SO = '/api/mcs/v1/dm-co-so/tong-hop?active=true';

    let catalog = null;
    let dsCoSo = [];

    initialize();

    async function initialize() {
        await loadCoSo();
        await initializeCatalog();
        renderCoSoSelect();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'phong-ban',
                permissionCodes: {
                    view: 'Q000504',
                    create: 'Q000505',
                    update: 'Q000506'
                },
                columns: [
                    {
                        key: 'maPhongBan',
                        label: 'Mã phòng ban',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenPhongBan',
                        label: 'Tên phòng ban',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'coSo.ten',
                        label: 'Cơ sở',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '320px',
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
                    maPhongBan: '',
                    tenPhongBan: '',
                    coSoId: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maPhongBan: {
                        label: 'Mã phòng ban',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã phòng ban không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã phòng ban đã tồn tại.'
                    },

                    tenPhongBan: {
                        label: 'Tên phòng ban',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên phòng ban không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên phòng ban đã tồn tại.'
                    },

                    coSoId: {
                        label: 'Cơ sở',
                        required: true,
                        requiredMessage: 'Vui lòng chọn cơ sở.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin phòng ban',
                createTitle: 'Thêm phòng ban',
                updateTitle: 'Cập nhật phòng ban',

                getRecordSubtitle(record) {
                    return record?.maPhongBan || '';
                },

                mapListResponse(result) {
                    return Array.isArray(result?.data) ? result.data : result?.data?.items || result?.data?.data || [];
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maPhongBan: record?.maPhongBan || '',
                        tenPhongBan: record?.tenPhongBan || '',
                        coSoId: record?.coSoId ?? record?.coSo?.id ?? '',
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maPhongBan: String(formData.maPhongBan || '')
                            .trim()
                            .toUpperCase(),

                        tenPhongBan: String(formData.tenPhongBan || '').trim(),

                        coSoId: normalizeRequiredNumber(formData.coSoId),

                        moTa: String(formData.moTa || '').trim() || null,

                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    renderCoSoSelect(record?.coSoId ?? record?.coSo?.id ?? '');

                    setSelectMode('coSoId', mode);
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-phong-ban',
                        label: 'Xuất danh mục phòng ban',
                        icon: 'download'
                    },
                    {
                        action: 'import-phong-ban',
                        label: 'Nhập danh mục phòng ban',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-phong-ban') {
                        exportData();
                        return;
                    }

                    if (action === 'import-phong-ban') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục phòng ban.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục phòng ban.');
        }
    }

    async function loadCoSo() {
        try {
            const response = await window.MCS.api.request(API_CO_SO);

            const data = response?.data;

            dsCoSo = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsCoSo = dsCoSo.filter((item) => item?.active !== false);
        } catch (error) {
            console.error('Không thể tải danh sách cơ sở.', error);

            dsCoSo = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách cơ sở.');
        }
    }

    function renderCoSoSelect(selectedValue = '') {
        const select = document.getElementById('coSoId');

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

        dsCoSo.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);

            option.textContent = buildLabel(item.maCoSo || item.ma, item.tenCoSo || item.ten);

            option.selected = selected !== '' && String(item.id) === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = select.closest('[data-smart-select]')?.smartSelect;

        smartSelect?.refresh?.();

        if (selected === '') {
            smartSelect?.clear?.();
        }
    }

    function setSelectMode(selectId, mode) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        root?.smartSelect?.setDisabled?.(mode === 'view');
    }

    function buildLabel(code, name) {
        const ma = String(code || '').trim();

        const ten = String(name || '').trim();

        if (ma && ten) {
            return `${ma} - ${ten}`;
        }

        return ten || ma;
    }

    function normalizeRequiredNumber(value) {
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

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_phong_ban.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu phòng ban thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_phong_ban_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu phòng ban thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

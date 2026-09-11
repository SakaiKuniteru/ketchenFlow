'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-quyen';
    const API_NHOM_TINH_NANG = '/api/mcs/v1/dm-nhom-tinh-nang/tong-hop?active=true';

    let catalog = null;
    let dsNhomTinhNang = [];

    initialize();

    async function initialize() {
        await initializeCatalog();
        await loadNhomTinhNang();
        syncCurrentNhomTinhNang();
    }

    const nhomTinhNangSelect = createMultiSelectManager({
        selectId: 'dsNhomTinhNangId',
        items: () => dsNhomTinhNang,
        getLabel: (item) => `${item.maNhomTinhNang} - ${item.tenNhomTinhNang}`
    });

    function createMultiSelectManager(config) {
        const { selectId, items, getLabel } = config;

        function getSelect() {
            return document.getElementById(selectId);
        }

        function getRoot() {
            return getSelect()?.closest('[data-smart-select]') || null;
        }

        function render(selectedIds = []) {
            const select = getSelect();

            if (!select) {
                return;
            }

            const selected = new Set(selectedIds.map(String));

            select.innerHTML = '';

            const allOption = document.createElement('option');

            allOption.value = '__ALL__';
            allOption.textContent = 'Tất cả';

            select.appendChild(allOption);

            items().forEach((item) => {
                const option = document.createElement('option');

                option.value = String(item.id);
                option.textContent = getLabel(item);
                option.selected = selected.has(String(item.id));

                select.appendChild(option);
            });

            getRoot()?.smartSelect?.refresh?.();
        }

        function getValues() {
            const select = getSelect();

            if (!select) {
                return [];
            }

            const options = Array.from(select.selectedOptions || []);

            if (options.some((item) => item.value === '__ALL__')) {
                return items().map((item) => Number(item.id));
            }

            return options.map((item) => Number(item.value)).filter(Number.isInteger);
        }

        return {
            render,
            getValues,
            getSelect,
            getRoot
        };
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'quyen',
                permissionCodes: {
                    view: 'Q000523',
                    create: 'Q000524',
                    update: 'Q000525'
                },
                columns: [
                    {
                        key: 'maQuyen',
                        label: 'Mã quyền',
                        width: '200px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenQuyen',
                        label: 'Tên quyền',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'nhomTinhNang',
                        label: 'Nhóm tính năng',
                        width: '260px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '300px',
                        filterable: true
                    },
                    {
                        key: 'active',
                        label: 'Hiệu lực',
                        width: '130px',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        isBoolean: true,
                        trueLabel: 'TRUE',
                        falseLabel: 'FALSE'
                    }
                ],

                defaultValues: {
                    maQuyen: '',
                    tenQuyen: '',
                    dsNhomTinhNangId: [],
                    moTa: '',
                    active: true
                },

                validation: {
                    maQuyen: {
                        label: 'Mã quyền',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã quyền không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã quyền đã tồn tại.'
                    },

                    tenQuyen: {
                        label: 'Tên quyền',
                        required: true,
                        maxLength: 100,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên quyền không được vượt quá 100 ký tự.'
                    },

                    dsNhomTinhNangId: {
                        label: 'Nhóm tính năng',
                        required: true,
                        requiredMessage: 'Vui lòng chọn ít nhất một nhóm tính năng.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin quyền',
                createTitle: 'Thêm quyền',
                updateTitle: 'Cập nhật quyền',

                getRecordSubtitle(record) {
                    return record?.maQuyen || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data) ? result.data : [];

                    return records.map((record) => mapQuyenRecord(record));
                },

                mapDetailResponse(result) {
                    const record = result?.data || null;

                    return record ? mapQuyenRecord(record) : null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maQuyen: record?.maQuyen || '',
                        tenQuyen: record?.tenQuyen || '',
                        dsNhomTinhNangId: normalizeNumberArray(record?.dsNhomTinhNangId),
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maQuyen: String(formData.maQuyen || '')
                            .trim()
                            .toUpperCase(),

                        tenQuyen: String(formData.tenQuyen || '').trim(),

                        dsNhomTinhNangId: nhomTinhNangSelect.getValues(),

                        moTa: String(formData.moTa || '').trim() || null,

                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    const ids = normalizeNumberArray(record?.dsNhomTinhNangId);

                    nhomTinhNangSelect.render(ids);

                    nhomTinhNangSelect.getRoot()?.smartSelect?.setDisabled?.(mode === 'view');
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-quyen',
                        label: 'Xuất danh mục quyền',
                        icon: 'download'
                    },
                    {
                        action: 'import-quyen',
                        label: 'Nhập danh mục quyền',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-quyen') {
                        exportData();
                        return;
                    }

                    if (action === 'import-quyen') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục quyền.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục quyền.');
        }
    }

    function mapQuyenRecord(record) {
        if (!record || typeof record !== 'object') {
            return {};
        }

        const dsNhomTinhNang = Array.isArray(record.dsNhomTinhNang) ? record.dsNhomTinhNang : [];

        const dsNhomTinhNangId = normalizeNumberArray(record.dsNhomTinhNangId);

        return {
            ...record,
            dsNhomTinhNangId,
            nhomTinhNang:
                record.nhomTinhNang ||
                dsNhomTinhNang
                    .map((item) => item.tenNhomTinhNang || item.ten || '')
                    .filter(Boolean)
                    .join(', ')
        };
    }

    function normalizeNumberArray(value) {
        if (Array.isArray(value)) {
            return value.map(Number).filter(Number.isInteger);
        }

        if (value === null || value === undefined || value === '') {
            return [];
        }

        return String(value)
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(',')
            .map((item) => Number(item.trim()))
            .filter(Number.isInteger);
    }

    async function loadNhomTinhNang() {
        try {
            const response = await window.MCS.api.request(API_NHOM_TINH_NANG);

            const data = response?.data;

            if (Array.isArray(data)) {
                dsNhomTinhNang = data;
            } else {
                dsNhomTinhNang = data?.items || data?.data || [];
            }

            nhomTinhNangSelect.render([]);
        } catch (error) {
            dsNhomTinhNang = [];

            console.error('Không thể tải nhóm tính năng.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách nhóm tính năng.');
        }
    }

    function syncCurrentNhomTinhNang() {
        if (!catalog) {
            return;
        }

        const record =
            catalog.state.selectedId !== null
                ? catalog.state.allData.find((item) => String(item.id) === String(catalog.state.selectedId))
                : null;

        nhomTinhNangSelect.render(normalizeNumberArray(record?.dsNhomTinhNangId));
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_quyen.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu quyền thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_quyen_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu quyền thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

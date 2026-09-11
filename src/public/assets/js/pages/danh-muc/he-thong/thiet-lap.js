'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-thiet-lap';
    const API_NHOM_TINH_NANG = '/api/mcs/v1/dm-nhom-tinh-nang/tong-hop?active=true';
    const API_CO_SO = '/api/mcs/v1/dm-co-so/tong-hop?active=true';

    let catalog = null;
    let dsNhomTinhNang = [];
    let dsCoSo = [];

    initialize();

    async function initialize() {
        await Promise.all([loadCoSo(), loadNhomTinhNang()]);
        await initializeCatalog();
        syncCurrentCoSo();
        syncCurrentNhomTinhNang();
    }

    const coSoSelect = createMultiSelectManager({
        selectId: 'dsCoSoId',
        items: () => dsCoSo,
        getLabel: (item) => `${item.maCoSo} - ${item.tenCoSo}`
    });

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
                moduleName: 'thiet-lap',
                permissionCodes: {
                    view: 'Q000532',
                    create: 'Q000533',
                    update: 'Q000534'
                },
                columns: [
                    {
                        key: 'maThietLap',
                        label: 'Mã thiết lập',
                        width: '230px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenThietLap',
                        label: 'Tên thiết lập',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'giaTri',
                        label: 'Giá trị',
                        width: '160px',
                        filterable: true
                    },
                    {
                        key: 'nhomTinhNang',
                        label: 'Nhóm tính năng',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '250px',
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
                    maThietLap: '',
                    tenThietLap: '',
                    giaTri: '',
                    dsNhomTinhNangId: [],
                    dsCoSoId: [],
                    moTa: '',
                    active: true
                },

                validation: {
                    maThietLap: {
                        label: 'Mã thiết lập',
                        required: true,
                        maxLength: 100,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã thiết lập không được vượt quá 100 ký tự.',
                        uniqueMessage: 'Mã thiết lập đã tồn tại.'
                    },

                    tenThietLap: {
                        label: 'Tên thiết lập',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên thiết lập không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên thiết lập đã tồn tại.'
                    },

                    giaTri: {
                        label: 'Giá trị',
                        required: true,
                        maxLength: 500,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Giá trị không được vượt quá 500 ký tự.'
                    },

                    dsNhomTinhNangId: {
                        label: 'Nhóm tính năng',
                        required: true,
                        requiredMessage: 'Vui lòng chọn ít nhất một nhóm tính năng.'
                    },

                    dsCoSoId: {
                        label: 'Cơ sở',
                        required: true,
                        requiredMessage: 'Vui lòng chọn ít nhất một cơ sở.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        required: true,
                        maxLength: 500,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin thiết lập',
                createTitle: 'Thêm thiết lập',
                updateTitle: 'Cập nhật thiết lập',

                getRecordSubtitle(record) {
                    return record?.maThietLap || '';
                },

                mapListResponse(result) {
                    return Array.isArray(result?.data) ? result.data : [];
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maThietLap: record?.maThietLap || '',
                        tenThietLap: record?.tenThietLap || '',
                        giaTri: record?.giaTri ?? '',
                        dsCoSoId: Array.isArray(record?.dsCoSoId) ? record.dsCoSoId : [],
                        dsNhomTinhNangId: Array.isArray(record?.dsNhomTinhNangId) ? record.dsNhomTinhNangId : [],
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maThietLap: String(formData.maThietLap || '')
                            .trim()
                            .toUpperCase(),
                        tenThietLap: String(formData.tenThietLap || '').trim(),
                        giaTri: String(formData.giaTri ?? '').trim(),
                        dsCoSoId: coSoSelect.getValues(),
                        dsNhomTinhNangId: nhomTinhNangSelect.getValues(),
                        moTa: String(formData.moTa || '').trim() || null,
                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    const dsCoSoId = Array.isArray(record?.dsCoSoId) ? record.dsCoSoId : [];

                    const dsNhomTinhNangId = Array.isArray(record?.dsNhomTinhNangId) ? record.dsNhomTinhNangId : [];

                    coSoSelect.render(dsCoSoId);
                    nhomTinhNangSelect.render(dsNhomTinhNangId);

                    coSoSelect.getRoot()?.smartSelect?.setDisabled?.(mode === 'view');

                    nhomTinhNangSelect.getRoot()?.smartSelect?.setDisabled?.(mode === 'view');
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-thiet-lap',
                        label: 'Xuất danh mục thiết lập',
                        icon: 'download'
                    },
                    {
                        action: 'import-thiet-lap',
                        label: 'Nhập danh mục thiết lập',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-thiet-lap') {
                        exportData();
                        return;
                    }

                    if (action === 'import-thiet-lap') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục thiết lập.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục thiết lập.');
        }
    }

    function normalizeActiveRecords(data) {
        const records = Array.isArray(data) ? data : data?.items || data?.rows || data?.danhSach || data?.data || [];

        return records.filter((item) => {
            const active = item?.active;
            return active === true || active === 1 || active === '1' || String(active).trim().toLowerCase() === 'true';
        });
    }

    async function loadNhomTinhNang() {
        try {
            const response = await window.MCS.api.request(API_NHOM_TINH_NANG);

            dsNhomTinhNang = normalizeActiveRecords(response?.data);
        } catch (error) {
            dsNhomTinhNang = [];

            console.error('Không thể tải nhóm tính năng.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách nhóm tính năng.');
        }
    }

    async function loadCoSo() {
        try {
            const response = await window.MCS.api.request(API_CO_SO);

            dsCoSo = normalizeActiveRecords(response?.data);
        } catch (error) {
            dsCoSo = [];

            console.error('Không thể tải cơ sở.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách cơ sở.');
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

        nhomTinhNangSelect.render(record?.dsNhomTinhNangId || []);
    }

    function syncCurrentCoSo() {
        if (!catalog) {
            return;
        }

        const record =
            catalog.state.selectedId !== null
                ? catalog.state.allData.find((item) => String(item.id) === String(catalog.state.selectedId))
                : null;

        coSoSelect.render(record?.dsCoSoId || []);
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_thiet_lap.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu thiết lập thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_thiet_lap_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu thiết lập thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

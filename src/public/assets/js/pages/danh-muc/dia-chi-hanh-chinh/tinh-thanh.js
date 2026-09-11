'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-tinh-thanh';
    const API_QUOC_GIA = '/api/mcs/v1/dm-quoc-gia/tong-hop?active=true';

    let catalog = null;
    let dsQuocGia = [];

    initialize();

    async function initialize() {
        await initializeCatalog();
        await loadQuocGia();
        syncCurrentQuocGia();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'tinh-thanh',
                permissionCodes: {
                    view: 'Q000514',
                    create: 'Q000515',
                    update: 'Q000515'
                },

                columns: [
                    {
                        key: 'maTinhThanh',
                        label: 'Mã tỉnh thành',
                        width: '160px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenTinhThanh',
                        label: 'Tên tỉnh thành',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenVietTat',
                        label: 'Tên viết tắt',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenQuocGia',
                        label: 'Quốc gia',
                        width: '220px',
                        sortable: true,
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
                    maTinhThanh: '',
                    tenTinhThanh: '',
                    tenVietTat: '',
                    quocGiaId: '',
                    active: true
                },

                validation: {
                    maTinhThanh: {
                        label: 'Mã tỉnh thành',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã tỉnh thành không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã tỉnh thành đã tồn tại.'
                    },

                    tenTinhThanh: {
                        label: 'Tên tỉnh thành',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên tỉnh thành không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên tỉnh thành đã tồn tại.'
                    },

                    tenVietTat: {
                        label: 'Tên viết tắt',
                        maxLength: 50,
                        maxLengthMessage: 'Tên viết tắt không được vượt quá 50 ký tự.'
                    },

                    quocGiaId: {
                        label: 'Quốc gia',
                        required: true,
                        requiredMessage: 'Vui lòng chọn quốc gia.'
                    }
                },

                detailTitle: 'Thông tin tỉnh thành',
                createTitle: 'Thêm tỉnh thành',
                updateTitle: 'Cập nhật tỉnh thành',

                getRecordSubtitle(record) {
                    return record?.maTinhThanh || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data) ? result.data : [];

                    return records.map((record) => mapTinhThanhRecord(record));
                },

                mapDetailResponse(result) {
                    const record = result?.data || null;

                    return record ? mapTinhThanhRecord(record) : null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maTinhThanh: record?.maTinhThanh || '',
                        tenTinhThanh: record?.tenTinhThanh || '',
                        tenVietTat: record?.tenVietTat || '',
                        quocGiaId: record?.quocGiaId ?? record?.quocGia?.id ?? '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maTinhThanh: String(formData.maTinhThanh || '')
                            .trim()
                            .toUpperCase(),
                        tenTinhThanh: String(formData.tenTinhThanh || '').trim(),
                        tenVietTat: String(formData.tenVietTat || '').trim() || null,
                        quocGiaId:
                            formData.quocGiaId === '' || formData.quocGiaId === null || formData.quocGiaId === undefined
                                ? null
                                : Number(formData.quocGiaId),
                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    renderQuocGiaSelect(record?.quocGiaId ?? record?.quocGia?.id ?? '');

                    getQuocGiaRoot()?.smartSelect?.setDisabled?.(mode === 'view');
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-tinh-thanh',
                        label: 'Xuất danh mục tỉnh thành',
                        icon: 'download'
                    },
                    {
                        action: 'import-tinh-thanh',
                        label: 'Nhập danh mục tỉnh thành',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-tinh-thanh') {
                        exportData();
                        return;
                    }

                    if (action === 'import-tinh-thanh') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục tỉnh thành.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục tỉnh thành.');
        }
    }

    function mapTinhThanhRecord(record) {
        if (!record || typeof record !== 'object') {
            return {};
        }

        return {
            ...record,

            quocGiaId: record.quocGiaId ?? record.quocGia?.id ?? null,

            tenQuocGia: record.tenQuocGia || record.quocGia?.tenQuocGia || record.quocGia?.ten || ''
        };
    }

    async function loadQuocGia() {
        try {
            const response = await window.MCS.api.request(API_QUOC_GIA);
            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsQuocGia = records.filter((item) => item?.active === true);

            renderQuocGiaSelect(getCurrentQuocGiaId());
        } catch (error) {
            dsQuocGia = [];

            console.error('Không thể tải danh sách quốc gia.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách quốc gia.');
        }
    }

    function getQuocGiaSelect() {
        return document.getElementById('quocGiaId');
    }

    function getQuocGiaRoot() {
        return getQuocGiaSelect()?.closest('[data-smart-select]') || null;
    }

    function renderQuocGiaSelect(selectedId = '') {
        const select = getQuocGiaSelect();

        if (!select) {
            return;
        }

        const normalizedSelectedId = selectedId === null || selectedId === undefined ? '' : String(selectedId);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';
        emptyOption.hidden = true;
        emptyOption.selected = normalizedSelectedId === '';

        select.appendChild(emptyOption);

        dsQuocGia.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);
            option.textContent = `${item.maQuocGia || ''} - ${item.tenQuocGia || ''}`;
            option.selected = String(item.id) === normalizedSelectedId;

            select.appendChild(option);
        });

        if (normalizedSelectedId === '') {
            select.value = '';
        }

        getQuocGiaRoot()?.smartSelect?.refresh?.();
    }

    function getCurrentQuocGiaId() {
        if (!catalog) {
            return '';
        }

        if (catalog.state.selectedId === null) {
            return '';
        }

        const record = catalog.state.allData.find((item) => String(item.id) === String(catalog.state.selectedId));

        return record?.quocGiaId ?? record?.quocGia?.id ?? '';
    }

    function syncCurrentQuocGia() {
        renderQuocGiaSelect(getCurrentQuocGiaId());
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_tinh_thanh.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu tỉnh thành thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_tinh_thanh_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu tỉnh thành thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-xa-phuong';
    const API_TINH_THANH = '/api/mcs/v1/dm-tinh-thanh/tong-hop?active=true';

    let catalog = null;
    let dsTinhThanh = [];

    initialize();

    async function initialize() {
        await initializeCatalog();
        await loadTinhThanh();
        syncCurrentTinhThanh();
        setQuocGiaReadonly();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'xa-phuong',
                permissionCodes: {
                    view: 'Q000517',
                    create: 'Q000518',
                    update: 'Q000519'
                },

                columns: [
                    {
                        key: 'maXaPhuong',
                        label: 'Mã xã phường',
                        width: '160px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenXaPhuong',
                        label: 'Tên xã phường',
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
                        key: 'tenTinhThanh',
                        label: 'Tỉnh thành',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenQuocGia',
                        label: 'Quốc gia',
                        width: '200px',
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
                    maXaPhuong: '',
                    tenXaPhuong: '',
                    tenVietTat: '',
                    tinhThanhId: '',
                    maQuocGia: '',
                    tenQuocGia: '',
                    active: true
                },

                validation: {
                    maXaPhuong: {
                        label: 'Mã xã phường',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã xã phường không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã xã phường đã tồn tại.'
                    },

                    tenXaPhuong: {
                        label: 'Tên xã phường',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên xã phường không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên xã phường đã tồn tại.'
                    },

                    tenVietTat: {
                        label: 'Tên viết tắt',
                        maxLength: 50,
                        maxLengthMessage: 'Tên viết tắt không được vượt quá 50 ký tự.'
                    },

                    tinhThanhId: {
                        label: 'Tỉnh thành',
                        required: true,
                        requiredMessage: 'Vui lòng chọn tỉnh thành.'
                    }
                },

                detailTitle: 'Thông tin xã phường',
                createTitle: 'Thêm xã phường',
                updateTitle: 'Cập nhật xã phường',

                getRecordSubtitle(record) {
                    return record?.maXaPhuong || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data) ? result.data : [];

                    return records.map((record) => mapXaPhuongRecord(record));
                },

                mapDetailResponse(result) {
                    const record = result?.data || null;

                    return record ? mapXaPhuongRecord(record) : null;
                },

                mapRecordToForm(record) {
                    const data = mapXaPhuongRecord(record);

                    return {
                        id: data?.id ?? '',
                        maXaPhuong: data?.maXaPhuong || '',
                        tenXaPhuong: data?.tenXaPhuong || '',
                        tenVietTat: data?.tenVietTat || '',
                        tinhThanhId: data?.tinhThanhId ?? '',
                        maQuocGia: data?.maQuocGia || '',
                        tenQuocGia: data?.tenQuocGia || '',
                        active: data?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maXaPhuong: String(formData.maXaPhuong || '')
                            .trim()
                            .toUpperCase(),

                        tenXaPhuong: String(formData.tenXaPhuong || '').trim(),

                        tenVietTat: String(formData.tenVietTat || '').trim() || null,

                        tinhThanhId:
                            formData.tinhThanhId === '' ||
                            formData.tinhThanhId === null ||
                            formData.tinhThanhId === undefined
                                ? null
                                : Number(formData.tinhThanhId),

                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    const data = mapXaPhuongRecord(record);

                    renderTinhThanhSelect(data?.tinhThanhId ?? '');

                    fillQuocGiaByTinhThanhId(data?.tinhThanhId ?? '');

                    getTinhThanhRoot()?.smartSelect?.setDisabled?.(mode === 'view');

                    setQuocGiaReadonly();
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-xa-phuong',
                        label: 'Xuất danh mục xã phường',
                        icon: 'download'
                    },
                    {
                        action: 'import-xa-phuong',
                        label: 'Nhập danh mục xã phường',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-xa-phuong') {
                        exportData();
                        return;
                    }

                    if (action === 'import-xa-phuong') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục xã phường.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục xã phường.');
        }
    }

    function mapXaPhuongRecord(record) {
        if (!record || typeof record !== 'object') {
            return {};
        }

        const tinhThanh = record.tinhThanh || {};
        const quocGia = tinhThanh.quocGia || record.quocGia || {};

        return {
            ...record,

            tinhThanhId: record.tinhThanhId ?? tinhThanh.id ?? null,

            maTinhThanh: record.maTinhThanh || tinhThanh.maTinhThanh || tinhThanh.ma || '',

            tenTinhThanh: record.tenTinhThanh || tinhThanh.tenTinhThanh || tinhThanh.ten || '',

            quocGiaId: record.quocGiaId ?? tinhThanh.quocGiaId ?? quocGia.id ?? null,

            maQuocGia: record.maQuocGia || quocGia.maQuocGia || quocGia.ma || '',

            tenQuocGia: record.tenQuocGia || quocGia.tenQuocGia || quocGia.ten || ''
        };
    }

    async function loadTinhThanh() {
        try {
            const response = await window.MCS.api.request(API_TINH_THANH);

            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsTinhThanh = records.filter((item) => item?.active === true).map((item) => mapTinhThanhOption(item));

            renderTinhThanhSelect(getCurrentTinhThanhId());

            bindTinhThanhChange();
        } catch (error) {
            dsTinhThanh = [];

            console.error('Không thể tải danh sách tỉnh thành.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách tỉnh thành.');
        }
    }

    function mapTinhThanhOption(item) {
        const quocGia = item?.quocGia || {};

        return {
            ...item,

            id: item?.id,

            maTinhThanh: item?.maTinhThanh || item?.ma || '',

            tenTinhThanh: item?.tenTinhThanh || item?.ten || '',

            quocGiaId: item?.quocGiaId ?? quocGia.id ?? null,

            maQuocGia: item?.maQuocGia || quocGia.maQuocGia || quocGia.ma || '',

            tenQuocGia: item?.tenQuocGia || quocGia.tenQuocGia || quocGia.ten || ''
        };
    }

    function getTinhThanhSelect() {
        return document.getElementById('tinhThanhId');
    }

    function getTinhThanhRoot() {
        return getTinhThanhSelect()?.closest('[data-smart-select]') || null;
    }

    function renderTinhThanhSelect(selectedId = '') {
        const select = getTinhThanhSelect();

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

        dsTinhThanh.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);

            option.textContent = `${item.maTinhThanh || ''} - ${item.tenTinhThanh || ''}`;

            option.selected = String(item.id) === normalizedSelectedId;

            select.appendChild(option);
        });

        if (normalizedSelectedId === '') {
            select.value = '';
        }

        getTinhThanhRoot()?.smartSelect?.refresh?.();
    }

    function bindTinhThanhChange() {
        const select = getTinhThanhSelect();

        if (!select || select.dataset.xaPhuongBound === 'true') {
            return;
        }

        select.dataset.xaPhuongBound = 'true';

        select.addEventListener('change', () => {
            fillQuocGiaByTinhThanhId(select.value);
        });
    }

    function fillQuocGiaByTinhThanhId(tinhThanhId) {
        const maQuocGiaInput = document.getElementById('maQuocGia');

        const tenQuocGiaInput = document.getElementById('tenQuocGia');

        const tinhThanh = dsTinhThanh.find((item) => String(item.id) === String(tinhThanhId));

        if (maQuocGiaInput) {
            maQuocGiaInput.value = tinhThanh?.maQuocGia || '';
        }

        if (tenQuocGiaInput) {
            tenQuocGiaInput.value = tinhThanh?.tenQuocGia || '';
        }

        setQuocGiaReadonly();
    }

    function setQuocGiaReadonly() {
        const maQuocGiaInput = document.getElementById('maQuocGia');

        const tenQuocGiaInput = document.getElementById('tenQuocGia');

        if (maQuocGiaInput) {
            maQuocGiaInput.readOnly = true;

            maQuocGiaInput.setAttribute('readonly', 'readonly');

            maQuocGiaInput.tabIndex = -1;
        }

        if (tenQuocGiaInput) {
            tenQuocGiaInput.readOnly = true;

            tenQuocGiaInput.setAttribute('readonly', 'readonly');

            tenQuocGiaInput.tabIndex = -1;
        }
    }

    function getCurrentTinhThanhId() {
        if (!catalog) {
            return '';
        }

        if (catalog.state.selectedId === null) {
            return '';
        }

        const record = catalog.state.allData.find((item) => String(item.id) === String(catalog.state.selectedId));

        return record?.tinhThanhId ?? record?.tinhThanh?.id ?? '';
    }

    function syncCurrentTinhThanh() {
        const tinhThanhId = getCurrentTinhThanhId();

        renderTinhThanhSelect(tinhThanhId);

        fillQuocGiaByTinhThanhId(tinhThanhId);
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_xa_phuong.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu xã phường thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_xa_phuong_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu xã phường thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

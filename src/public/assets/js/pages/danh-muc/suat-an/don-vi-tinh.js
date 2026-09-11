'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-don-vi-tinh';
    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'don-vi-tinh',
                permissionCodes: {
                    view: 'Q000541',
                    create: 'Q000542',
                    update: 'Q000543'
                },
                columns: [
                    {
                        key: 'maDonViTinh',
                        label: 'Mã đơn vị',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenDonViTinh',
                        label: 'Tên đơn vị',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'kyHieu',
                        label: 'Ký hiệu',
                        width: '140px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'loaiDonVi',
                        label: 'Loại đơn vị',
                        width: '180px',
                        sortable: true,
                        filterable: true,
                        render(value) {
                            return getLoaiDonViLabel(value);
                        }
                    },
                    {
                        key: 'active',
                        label: 'Trạng thái',
                        width: '130px',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        isBoolean: true,
                        trueLabel: 'TRUE',
                        falseLabel: 'FALSE'
                    }
                ],

                defaultValues: {
                    maDonViTinh: '',
                    tenDonViTinh: '',
                    kyHieu: '',
                    loaiDonVi: '',
                    active: true
                },

                validation: {
                    maDonViTinh: {
                        label: 'Mã đơn vị tính',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã đơn vị tính không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã đơn vị tính đã tồn tại.'
                    },

                    tenDonViTinh: {
                        label: 'Tên đơn vị tính',
                        required: true,
                        maxLength: 100,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên đơn vị tính không được vượt quá 100 ký tự.',
                        uniqueMessage: 'Tên đơn vị tính đã tồn tại.'
                    },

                    kyHieu: {
                        label: 'Ký hiệu',
                        maxLength: 20,
                        maxLengthMessage: 'Ký hiệu không được vượt quá 20 ký tự.'
                    },

                    loaiDonVi: {
                        label: 'Loại đơn vị',
                        required: true,
                        requiredMessage: 'Vui lòng chọn một mục trong danh sách.'
                    }
                },

                detailTitle: 'Thông tin đơn vị tính',
                createTitle: 'Thêm đơn vị tính',
                updateTitle: 'Cập nhật đơn vị tính',

                getRecordSubtitle(record) {
                    return record?.maDonViTinh || '';
                },

                mapListResponse(result) {
                    return Array.isArray(result?.data) ? result.data : [];
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    window.setTimeout(() => {
                        renderLoaiDonVi(record?.loaiDonVi);
                    }, 0);

                    return {
                        id: record?.id ?? '',
                        maDonViTinh: record?.maDonViTinh || '',
                        tenDonViTinh: record?.tenDonViTinh || '',
                        kyHieu: record?.kyHieu || '',
                        loaiDonVi: record?.loaiDonVi ?? '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maDonViTinh: String(formData.maDonViTinh || '')
                            .trim()
                            .toUpperCase(),
                        tenDonViTinh: String(formData.tenDonViTinh || '').trim(),
                        kyHieu: String(formData.kyHieu || '').trim() || null,
                        loaiDonVi: formData.loaiDonVi === '' ? null : Number(formData.loaiDonVi),
                        active: formData.active === true
                    };
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-don-vi-tinh',
                        label: 'Xuất danh mục đơn vị tính',
                        icon: 'download'
                    },
                    {
                        action: 'import-don-vi-tinh',
                        label: 'Nhập danh mục đơn vị tính',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-don-vi-tinh') {
                        exportData();
                        return;
                    }

                    if (action === 'import-don-vi-tinh') {
                        importData(catalogInstance);
                    }
                }
            });

            await loadLoaiDonVi();
        } catch (error) {
            console.error('Không thể khởi tạo danh mục đơn vị tính.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục đơn vị tính.');
        }
    }

    let dsLoaiDonVi = [];

    async function loadLoaiDonVi() {
        try {
            const result = await window.MCS.api.request('/api/mcs/v1/enums?name=loaiDonVi');

            dsLoaiDonVi = Array.isArray(result?.data) ? result.data : [];

            renderLoaiDonVi();
        } catch (error) {
            console.error('Không thể tải loại đơn vị.', error);
        }
    }

    function renderLoaiDonVi(selectedValue = '') {
        const select = document.getElementById('loaiDonVi');

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

        dsLoaiDonVi.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);
            option.textContent = item.name;
            option.selected = String(item.value) === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelectRoot = select.closest('[data-smart-select]');

        window.MCS?.smartSelect?.initialize(smartSelectRoot);

        smartSelectRoot?.smartSelect?.refresh?.();
    }

    function getLoaiDonViLabel(value) {
        const item = dsLoaiDonVi.find((item) => Number(item.value) === Number(value));

        return item?.name || value || '-';
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_don_vi_tinh.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu đơn vị tính thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_don_vi_tinh.xlsx');

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import đơn vị tính thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

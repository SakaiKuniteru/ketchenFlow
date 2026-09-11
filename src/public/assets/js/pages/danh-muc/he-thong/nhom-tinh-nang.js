'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-nhom-tinh-nang';

    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'nhom-tinh-nang',
                permissionCodes: {
                    view: 'Q000520',
                    create: 'Q000521',
                    update: 'Q000522'
                },
                columns: [
                    {
                        key: 'maNhomTinhNang',
                        label: 'Mã nhóm',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenNhomTinhNang',
                        label: 'Tên nhóm tính năng',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '360px',
                        filterable: true
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
                    maNhomTinhNang: '',
                    tenNhomTinhNang: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maNhomTinhNang: {
                        label: 'Mã nhóm tính năng',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã nhóm tính năng không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã nhóm tính năng đã tồn tại.'
                    },

                    tenNhomTinhNang: {
                        label: 'Tên nhóm tính năng',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên nhóm tính năng không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên nhóm tính năng đã tồn tại.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        required: true,
                        maxLength: 500,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin nhóm tính năng',
                createTitle: 'Thêm nhóm tính năng',
                updateTitle: 'Cập nhật nhóm tính năng',

                getRecordSubtitle(record) {
                    return record?.maNhomTinhNang || '';
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
                        maNhomTinhNang: record?.maNhomTinhNang || '',
                        tenNhomTinhNang: record?.tenNhomTinhNang || '',
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maNhomTinhNang: String(formData.maNhomTinhNang || '')
                            .trim()
                            .toUpperCase(),

                        tenNhomTinhNang: String(formData.tenNhomTinhNang || '').trim(),

                        moTa: String(formData.moTa || '').trim(),

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
                        label: 'Xuất danh mục nhóm tính năng',
                        icon: 'download'
                    },
                    {
                        action: 'import-don-vi-tinh',
                        label: 'Nhập danh mục nhóm tính năng',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-nhom-tinh-nang') {
                        exportData();
                        return;
                    }

                    if (action === 'import-nhom-tinh-nang') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục nhóm tính năng.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục nhóm tính năng.');
        }
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_nhom_tinh_nang.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu nhóm tính năng thất bại:', error);

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

                window.MCS.api.downloadBlob(
                    result.blob,
                    result.fileName || `dm_nhom_tinh_nang_import_${Date.now()}.xlsx`
                );

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import nhóm tính năng thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

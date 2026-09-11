'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-chuc-vu';

    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'chuc-vu',
                permissionCodes: {
                    view: 'Q000507',
                    create: 'Q000508',
                    update: 'Q000509'
                },
                columns: [
                    {
                        key: 'maChucVu',
                        label: 'Mã chức vụ',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenChucVu',
                        label: 'Tên chức vụ',
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
                    maChucVu: '',
                    tenChucVu: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maChucVu: {
                        label: 'Mã chức vụ',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã chức vụ không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã chức vụ đã tồn tại.'
                    },

                    tenChucVu: {
                        label: 'Tên chức vụ',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên chức vụ không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên chức vụ đã tồn tại.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin chức vụ',
                createTitle: 'Thêm chức vụ',
                updateTitle: 'Cập nhật chức vụ',

                getRecordSubtitle(record) {
                    return record?.maChucVu || '';
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
                        maChucVu: record?.maChucVu || '',
                        tenChucVu: record?.tenChucVu || '',
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maChucVu: String(formData.maChucVu || '')
                            .trim()
                            .toUpperCase(),
                        tenChucVu: String(formData.tenChucVu || '').trim(),
                        moTa: String(formData.moTa || '').trim() || null,
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
                        action: 'export-chuc-vu',
                        label: 'Xuất danh mục chức vụ',
                        icon: 'download'
                    },
                    {
                        action: 'import-chuc-vu',
                        label: 'Nhập danh mục chức vụ',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-chuc-vu') {
                        exportData();
                        return;
                    }

                    if (action === 'import-chuc-vu') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục chức vụ.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục chức vụ.');
        }
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_chuc_vu.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu chức vụ thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_chuc_vu_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import chức vụ thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

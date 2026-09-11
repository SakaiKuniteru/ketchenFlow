'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-nhom-mon-an';

    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'nhom-mon-an',
                permissionCodes: {
                    view: 'Q000550',
                    create: 'Q000551',
                    update: 'Q000552'
                },
                columns: [
                    {
                        key: 'maNhomMonAn',
                        label: 'Mã nhóm',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenNhomMonAn',
                        label: 'Tên nhóm món ăn',
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
                    maNhomMonAn: '',
                    tenNhomMonAn: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maNhomMonAn: {
                        label: 'Mã nhóm món ăn',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã nhóm món ăn không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã nhóm món ăn đã tồn tại.'
                    },

                    tenNhomMonAn: {
                        label: 'Tên nhóm món ăn',
                        required: true,
                        maxLength: 150,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên nhóm món ăn không được vượt quá 150 ký tự.',
                        uniqueMessage: 'Tên nhóm món ăn đã tồn tại.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        required: true,
                        maxLength: 500,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin nhóm món ăn',
                createTitle: 'Thêm nhóm món ăn',
                updateTitle: 'Cập nhật nhóm món ăn',

                getRecordSubtitle(record) {
                    return record?.maNhomMonAn || '';
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
                        maNhomMonAn: record?.maNhomMonAn || '',
                        tenNhomMonAn: record?.tenNhomMonAn || '',
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maNhomMonAn: String(formData.maNhomMonAn || '')
                            .trim()
                            .toUpperCase(),

                        tenNhomMonAn: String(formData.tenNhomMonAn || '').trim(),

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
                        action: 'export-nhom-mon-an',
                        label: 'Xuất danh mục nhóm món ăn',
                        icon: 'download'
                    },
                    {
                        action: 'import-nhom-mon-an',
                        label: 'Nhập danh mục nhóm món ăn',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-nhom-mon-an') {
                        exportData();
                        return;
                    }

                    if (action === 'import-nhom-mon-an') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục nhóm món ăn.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục nhóm món ăn.');
        }
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_nhom_mon_an.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu nhóm món ăn thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_nhom_mon_an_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import nhóm món ăn thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-quoc-gia';

    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'quoc-gia',
                permissionCodes: {
                    view: 'Q000511',
                    create: 'Q000512',
                    update: 'Q000513'
                },

                columns: [
                    {
                        key: 'maQuocGia',
                        label: 'Mã quốc gia',
                        width: '140px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenQuocGia',
                        label: 'Tên quốc gia',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenTiengAnh',
                        label: 'Tên tiếng Anh',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenVietTat',
                        label: 'Tên viết tắt',
                        width: '160px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'maIso2',
                        label: 'ISO2',
                        width: '85px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'maIso3',
                        label: 'ISO3',
                        width: '85px',
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
                    maQuocGia: '',
                    tenQuocGia: '',
                    tenTiengAnh: '',
                    tenVietTat: '',
                    maIso2: '',
                    maIso3: '',
                    maDienThoai: '',
                    active: true
                },

                validation: {
                    maQuocGia: {
                        label: 'Mã quốc gia',
                        required: true,
                        maxLength: 10,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã quốc gia không được vượt quá 10 ký tự.',
                        uniqueMessage: 'Mã quốc gia đã tồn tại.'
                    },

                    tenQuocGia: {
                        label: 'Tên quốc gia',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên quốc gia không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên quốc gia đã tồn tại.'
                    },

                    tenTiengAnh: {
                        label: 'Tên quốc gia tiếng Anh',
                        maxLength: 255,
                        maxLengthMessage: 'Tên quốc gia tiếng Anh không được vượt quá 255 ký tự.'
                    },

                    maIso2: {
                        label: 'Mã ISO2',
                        required: true,
                        maxLength: 2,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã ISO2 không được vượt quá 2 ký tự.',
                        uniqueMessage: 'Mã ISO2 đã tồn tại.'
                    },

                    maIso3: {
                        label: 'Mã ISO3',
                        required: true,
                        maxLength: 3,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã ISO3 không được vượt quá 3 ký tự.',
                        uniqueMessage: 'Mã ISO3 đã tồn tại.'
                    },

                    maDienThoai: {
                        label: 'Mã điện thoại',
                        maxLength: 10,
                        maxLengthMessage: 'Mã điện thoại không được vượt quá 10 ký tự.'
                    }
                },

                detailTitle: 'Thông tin quốc gia',
                createTitle: 'Thêm quốc gia',
                updateTitle: 'Cập nhật quốc gia',

                getRecordSubtitle(record) {
                    return record?.maQuocGia || '';
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
                        maQuocGia: record?.maQuocGia || '',
                        tenQuocGia: record?.tenQuocGia || '',
                        tenTiengAnh: record?.tenTiengAnh || '',
                        tenVietTat: record?.tenVietTat || '',
                        maIso2: record?.maIso2 || '',
                        maIso3: record?.maIso3 || '',
                        maDienThoai: record?.maDienThoai || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maQuocGia: String(formData.maQuocGia || '')
                            .trim()
                            .toUpperCase(),
                        tenQuocGia: String(formData.tenQuocGia || '').trim(),
                        tenTiengAnh: String(formData.tenTiengAnh || '').trim() || null,
                        tenVietTat: String(formData.tenVietTat || '').trim() || null,
                        maIso2:
                            String(formData.maIso2 || '')
                                .trim()
                                .toUpperCase() || null,
                        maIso3:
                            String(formData.maIso3 || '')
                                .trim()
                                .toUpperCase() || null,
                        maDienThoai: String(formData.maDienThoai || '').trim() || null,
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
                        action: 'export-quoc-gia',
                        label: 'Xuất danh mục quốc gia',
                        icon: 'download'
                    },
                    {
                        action: 'import-quoc-gia',
                        label: 'Nhập danh mục quốc gia',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-quoc-gia') {
                        exportData();
                        return;
                    }

                    if (action === 'import-quoc-gia') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục quốc gia.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục quốc gia.');
        }
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_quoc_gia.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu quốc gia thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_quoc_gia_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import quốc gia thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

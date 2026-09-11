'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-ca-an';

    let catalog = null;

    initialize();

    async function initialize() {
        await initializeCatalog();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'ca-an',
                permissionCodes: {
                    view: 'Q000547',
                    create: 'Q000548',
                    update: 'Q000549'
                },
                columns: [
                    {
                        key: 'maCaAn',
                        label: 'Mã ca ăn',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenCaAn',
                        label: 'Tên ca ăn',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'thoiGianBatDau',
                        label: 'Thời gian bắt đầu',
                        width: '180px',
                        sortable: true,
                        filterable: true,
                        format: formatTime
                    },
                    {
                        key: 'thoiGianKetThuc',
                        label: 'Thời gian kết thúc',
                        width: '180px',
                        sortable: true,
                        filterable: true,
                        format: formatTime
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
                    maCaAn: '',
                    tenCaAn: '',
                    thoiGianBatDau: '',
                    thoiGianKetThuc: '',
                    active: true
                },

                validation: {
                    maCaAn: {
                        label: 'Mã ca ăn',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã ca ăn không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã ca ăn đã tồn tại.'
                    },

                    tenCaAn: {
                        label: 'Tên ca ăn',
                        required: true,
                        maxLength: 100,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên ca ăn không được vượt quá 100 ký tự.',
                        uniqueMessage: 'Tên ca ăn đã tồn tại.'
                    },

                    thoiGianBatDau: {
                        label: 'Thời gian bắt đầu',
                        required: true,
                        requiredMessage: 'Vui lòng chọn thời gian bắt đầu.'
                    },

                    thoiGianKetThuc: {
                        label: 'Thời gian kết thúc',
                        required: true,
                        requiredMessage: 'Vui lòng chọn thời gian kết thúc.'
                    }
                },

                detailTitle: 'Thông tin ca ăn',
                createTitle: 'Thêm ca ăn',
                updateTitle: 'Cập nhật ca ăn',

                getRecordSubtitle(record) {
                    return record?.maCaAn || '';
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
                        maCaAn: record?.maCaAn || '',
                        tenCaAn: record?.tenCaAn || '',
                        thoiGianBatDau: normalizeTime(record?.thoiGianBatDau),
                        thoiGianKetThuc: normalizeTime(record?.thoiGianKetThuc),
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maCaAn: String(formData.maCaAn || '')
                            .trim()
                            .toUpperCase(),
                        tenCaAn: String(formData.tenCaAn || '').trim(),
                        thoiGianBatDau: normalizeTime(formData.thoiGianBatDau),
                        thoiGianKetThuc: normalizeTime(formData.thoiGianKetThuc),
                        active: formData.active === true
                    };
                },

                validate(formData) {
                    const errors = {};

                    const batDau = normalizeTime(formData.thoiGianBatDau);
                    const ketThuc = normalizeTime(formData.thoiGianKetThuc);

                    if (batDau && ketThuc && batDau === ketThuc) {
                        errors.thoiGianKetThuc = 'Thời gian kết thúc phải khác thời gian bắt đầu.';
                    }

                    return errors;
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-ca-an',
                        label: 'Xuất danh mục ca ăn',
                        icon: 'download'
                    },
                    {
                        action: 'import-ca-an',
                        label: 'Nhập danh mục ca ăn',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-ca-an') {
                        exportData();
                        return;
                    }

                    if (action === 'import-ca-an') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục ca ăn.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục ca ăn.');
        }
    }

    function normalizeTime(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        const match = text.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);

        if (!match) {
            return text;
        }

        const hour = String(Number(match[1])).padStart(2, '0');

        const minute = String(Number(match[2])).padStart(2, '0');

        const second = String(Number(match[3] || 0)).padStart(2, '0');

        return `${hour}:${minute}:${second}`;
    }

    function formatTime(value) {
        const time = normalizeTime(value);

        return time || '-';
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_ca_an.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu ca ăn thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_ca_an_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import ca ăn thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

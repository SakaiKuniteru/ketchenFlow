'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-bao-cao';
    const API_LOAI_XUAT_FILE = '/api/mcs/v1/enums?name=loaiXuatFile';

    let catalog = null;
    let dsLoaiXuatFile = [];

    initialize();

    async function initialize() {
        await initializeCatalog();
        await loadLoaiXuatFile();
        syncCurrentLoaiXuatFile();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'bao-cao',
                permissionCodes: {
                    view: 'Q000565',
                    create: 'Q000566',
                    update: 'Q000567'
                },
                columns: [
                    {
                        key: 'maBaoCao',
                        label: 'Mã báo cáo',
                        width: '200px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenBaoCao',
                        label: 'Tên báo cáo',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'loaiXuatFileText',
                        label: 'Loại xuất file',
                        width: '160px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '280px',
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
                    maBaoCao: '',
                    tenBaoCao: '',
                    fileMau: null,
                    loaiXuatFile: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maBaoCao: {
                        label: 'Mã báo cáo',
                        required: true,
                        maxLength: 100,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã báo cáo không được vượt quá 100 ký tự.',
                        uniqueMessage: 'Mã báo cáo đã tồn tại.'
                    },

                    tenBaoCao: {
                        label: 'Tên báo cáo',
                        required: true,
                        maxLength: 255,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên báo cáo không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên báo cáo đã tồn tại.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin báo cáo',
                createTitle: 'Thêm báo cáo',
                updateTitle: 'Cập nhật báo cáo',

                getRecordSubtitle(record) {
                    return record?.maBaoCao || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data) ? result.data : [];

                    return records.map((record) => mapBaoCaoRecord(record));
                },

                mapDetailResponse(result) {
                    const record = result?.data || null;

                    return record ? mapBaoCaoRecord(record) : null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maBaoCao: record?.maBaoCao || '',
                        tenBaoCao: record?.tenBaoCao || '',
                        fileMau: null,
                        loaiXuatFile: record?.loaiXuatFile ?? '',
                        moTa: record?.moTa || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    const payload = {
                        maBaoCao: String(formData.maBaoCao || '').trim(),

                        tenBaoCao: String(formData.tenBaoCao || '').trim(),

                        loaiXuatFile:
                            formData.loaiXuatFile === '' ||
                            formData.loaiXuatFile === null ||
                            formData.loaiXuatFile === undefined
                                ? null
                                : Number(formData.loaiXuatFile),

                        moTa: String(formData.moTa || '').trim() || null,

                        active: formData.active === true
                    };

                    if (formData.fileMau instanceof File) {
                        payload.fileMau = formData.fileMau;
                    }

                    return payload;
                },

                onRecordLoaded(record, mode) {
                    renderLoaiXuatFileSelect(record?.loaiXuatFile ?? '');

                    getLoaiXuatFileRoot()?.smartSelect?.setDisabled?.(mode === 'view');

                    syncFilePicker(record, mode);
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục báo cáo.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục báo cáo.');
        }
    }

    function mapBaoCaoRecord(record) {
        if (!record || typeof record !== 'object') {
            return {};
        }

        const loaiXuatFile =
            record.loaiXuatFile !== null && record.loaiXuatFile !== undefined && record.loaiXuatFile !== ''
                ? Number(record.loaiXuatFile)
                : null;

        return {
            ...record,

            loaiXuatFile,

            loaiXuatFileText: record.loaiXuatFileText || getLoaiXuatFileLabel(loaiXuatFile) || '',

            fileMau: record.fileMau || ''
        };
    }

    async function loadLoaiXuatFile() {
        try {
            const response = await window.MCS.api.request(API_LOAI_XUAT_FILE);

            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsLoaiXuatFile = records.map((item) => mapEnumItem(item)).filter((item) => item.value !== null);

            renderLoaiXuatFileSelect(getCurrentLoaiXuatFile());
        } catch (error) {
            dsLoaiXuatFile = [];

            console.error('Không thể tải enum loại xuất file.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải loại xuất file.');
        }
    }

    function mapEnumItem(item) {
        if (item === null || item === undefined) {
            return {
                value: null,
                label: ''
            };
        }

        if (typeof item !== 'object') {
            return {
                value: Number(item),
                label: String(item)
            };
        }

        const rawValue = item.value ?? item.id ?? item.ma ?? item.code ?? null;

        const value = rawValue === null || rawValue === undefined || rawValue === '' ? null : Number(rawValue);

        return {
            value: Number.isFinite(value) ? value : null,

            label: item.label || item.ten || item.name || item.moTa || String(rawValue ?? '')
        };
    }

    function getLoaiXuatFileLabel(value) {
        const item = dsLoaiXuatFile.find((option) => Number(option.value) === Number(value));

        return item?.label || '';
    }

    function getLoaiXuatFileSelect() {
        return document.getElementById('loaiXuatFile');
    }

    function getLoaiXuatFileRoot() {
        return getLoaiXuatFileSelect()?.closest('[data-smart-select]') || null;
    }

    function renderLoaiXuatFileSelect(selectedValue = '') {
        const select = getLoaiXuatFileSelect();

        if (!select) {
            return;
        }

        const normalizedSelectedValue =
            selectedValue === null || selectedValue === undefined ? '' : String(selectedValue);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';
        emptyOption.hidden = true;
        emptyOption.selected = normalizedSelectedValue === '';

        select.appendChild(emptyOption);

        dsLoaiXuatFile.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);
            option.textContent = item.label;
            option.selected = String(item.value) === normalizedSelectedValue;

            select.appendChild(option);
        });

        if (normalizedSelectedValue === '') {
            select.value = '';
        }

        getLoaiXuatFileRoot()?.smartSelect?.refresh?.();
    }

    function getCurrentLoaiXuatFile() {
        if (!catalog) {
            return '';
        }

        if (catalog.state.selectedId === null) {
            return '';
        }

        const record = catalog.state.allData.find((item) => String(item.id) === String(catalog.state.selectedId));

        return record?.loaiXuatFile ?? '';
    }

    function syncCurrentLoaiXuatFile() {
        renderLoaiXuatFileSelect(getCurrentLoaiXuatFile());
    }

    function syncFilePicker(record, mode) {
        const input = document.getElementById('fileMau');

        const root = input?.closest('[data-file-picker]');

        if (!input || !root) {
            return;
        }

        const picker = root.filePicker || window.MCS?.filePicker?.initialize(root);

        if (!picker) {
            return;
        }

        const fileUrl = String(record?.fileMau || '').trim();

        const hasExistingFile = Boolean(fileUrl);

        picker.setExistingFile({
            name: getFileName(fileUrl),

            url: normalizeFileUrl(fileUrl)
        });

        input.required = mode === 'create' || (mode === 'update' && !hasExistingFile);

        input.setAttribute('aria-required', String(input.required));

        if (hasExistingFile) {
            const field = input.closest("[data-form-field='fileMau']");

            const error = field?.querySelector("[data-field-error='fileMau']");

            field?.classList.remove('is-invalid');

            input.removeAttribute('aria-invalid');

            if (error) {
                error.textContent = '';
                error.hidden = true;
            }
        }

        picker.setDisabled(mode === 'view');
    }

    function normalizeFileUrl(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        if (/^https?:\/\//i.test(text)) {
            return text;
        }

        return text.startsWith('/') ? text : `/${text}`;
    }

    function getFileName(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        return text.split('/').pop() || '';
    }
});

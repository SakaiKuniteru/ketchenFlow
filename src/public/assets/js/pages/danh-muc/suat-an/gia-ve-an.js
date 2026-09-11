'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-gia-ve-an/';

    let catalog = null;
    let dsDoiTuongLayVe = [];
    let dsCoSo = [];
    let dsNhaAn = [];
    let dsCaAn = [];

    initialize();

    async function initialize() {
        await loadOptions();
        await initializeCatalog();
        bindEvents();
    }

    function bindEvents() {
        const coSoSelect = document.getElementById('coSoId');

        if (coSoSelect && coSoSelect.dataset.giaVeAnBound !== 'true') {
            coSoSelect.dataset.giaVeAnBound = 'true';

            coSoSelect.addEventListener('change', async (event) => {
                const coSoId = event.target.value ? Number(event.target.value) : null;

                await loadNhaAn(coSoId);
            });
        }

        bindDonGiaInput();
    }

    function bindDonGiaInput() {
        const input = document.getElementById('donGia');

        if (!input || input.dataset.giaVeAnDonGiaBound === 'true') {
            return;
        }

        input.dataset.giaVeAnDonGiaBound = 'true';

        input.addEventListener('input', () => {
            const raw = String(input.value || '').replace(/\s/g, '');

            const commaIndex = raw.indexOf(',');

            let integerPart = commaIndex === -1 ? raw : raw.slice(0, commaIndex);

            let decimalPart = commaIndex === -1 ? '' : raw.slice(commaIndex + 1);

            integerPart = integerPart.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

            decimalPart = decimalPart.replace(/\D/g, '').slice(0, 5);

            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            input.value = commaIndex !== -1 ? `${formattedInteger},${decimalPart}` : formattedInteger;
        });
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'gia-ve-an',

                permissionCodes: {
                    view: 'Q000568',
                    create: 'Q000569',
                    update: 'Q000570'
                },

                columns: [
                    {
                        key: 'doiTuongLayVe',
                        label: 'Đối tượng lấy vé',
                        width: '180px',
                        sortable: true,
                        filterable: true,

                        render(value) {
                            return getDoiTuongLayVeLabel(value);
                        }
                    },

                    {
                        key: 'tenCoSo',
                        label: 'Cơ sở',
                        width: '200px',
                        sortable: true,
                        filterable: true,

                        render(value) {
                            return value || 'Tất cả';
                        }
                    },

                    {
                        key: 'tenNhaAn',
                        label: 'Nhà ăn',
                        width: '200px',
                        sortable: true,
                        filterable: true,

                        render(value) {
                            return value || 'Tất cả';
                        }
                    },

                    {
                        key: 'tenCaAn',
                        label: 'Ca ăn',
                        width: '180px',
                        sortable: true,
                        filterable: true,

                        render(value) {
                            return value || 'Tất cả';
                        }
                    },

                    {
                        key: 'donGia',
                        label: 'Đơn giá',
                        width: '160px',
                        sortable: true,

                        render(value) {
                            return formatMoney(value);
                        }
                    },

                    {
                        key: 'tuNgay',
                        label: 'Từ ngày',
                        width: '150px',
                        sortable: true,

                        render(value) {
                            return formatDate(value);
                        }
                    },

                    {
                        key: 'denNgay',
                        label: 'Đến ngày',
                        width: '150px',
                        sortable: true,

                        render(value) {
                            return value ? formatDate(value) : '-';
                        }
                    },

                    {
                        key: 'mucDoUuTien',
                        label: 'Ưu tiên',
                        width: '110px',
                        sortable: true
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
                    doiTuongLayVe: '',
                    coSoId: '',
                    nhaAnId: '',
                    caAnId: '',
                    donGia: '',
                    tuNgay: '',
                    denNgay: '',
                    mucDoUuTien: 1,
                    ghiChu: '',
                    active: true
                },

                validation: {
                    doiTuongLayVe: {
                        label: 'Đối tượng lấy vé',
                        required: true,
                        requiredMessage: 'Vui lòng chọn một mục trong danh sách.'
                    },

                    donGia: {
                        label: 'Đơn giá',
                        required: true,
                        min: 0,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        minMessage: 'Đơn giá không được nhỏ hơn 0.'
                    },

                    tuNgay: {
                        label: 'Từ ngày',
                        required: true,
                        requiredMessage: 'Vui lòng điền vào trường này.'
                    },

                    mucDoUuTien: {
                        label: 'Mức độ ưu tiên',
                        required: true,
                        min: 1,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        minMessage: 'Mức độ ưu tiên phải lớn hơn 0.'
                    },

                    ghiChu: {
                        label: 'Ghi chú',
                        maxLength: 500,
                        maxLengthMessage: 'Ghi chú không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin giá vé ăn',
                createTitle: 'Thêm giá vé ăn',
                updateTitle: 'Cập nhật giá vé ăn',

                getRecordSubtitle(record) {
                    return [getDoiTuongLayVeLabel(record?.doiTuongLayVe), record?.tenNhaAn, record?.tenCaAn]
                        .filter(Boolean)
                        .join(' - ');
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

                        doiTuongLayVe: record?.doiTuongLayVe ?? '',

                        coSoId: record?.coSoId ?? '',

                        nhaAnId: record?.nhaAnId ?? '',

                        caAnId: record?.caAnId ?? '',

                        donGia: formatVietnameseNumberInput(record?.donGia),

                        tuNgay: normalizeDate(record?.tuNgay),

                        denNgay: normalizeDate(record?.denNgay),

                        mucDoUuTien: record?.mucDoUuTien ?? 1,

                        ghiChu: record?.ghiChu || '',

                        active: record?.active === true
                    };
                },

                async onRecordLoaded(record, mode) {
                    if (mode === 'create' || !record) {
                        renderDoiTuongLayVe('');
                        renderCoSo('');
                        await loadNhaAn(null);
                        renderNhaAn('');
                        renderCaAn('');
                        syncDateField('tuNgay', '');
                        syncDateField('denNgay', '');
                        const donGiaInput = document.getElementById('donGia');
                        if (donGiaInput) {
                            donGiaInput.value = '';
                        }
                        return;
                    }
                    renderDoiTuongLayVe(record?.doiTuongLayVe);
                    renderCoSo(record?.coSoId);
                    await loadNhaAn(record?.coSoId || null);
                    renderNhaAn(record?.nhaAnId);
                    renderCaAn(record?.caAnId);
                    syncDateField('tuNgay', record?.tuNgay);
                    syncDateField('denNgay', record?.denNgay);
                },

                transformPayload(formData) {
                    return {
                        doiTuongLayVe: formData.doiTuongLayVe === '' ? null : Number(formData.doiTuongLayVe),

                        coSoId: formData.coSoId === '' ? null : Number(formData.coSoId),

                        nhaAnId: formData.nhaAnId === '' ? null : Number(formData.nhaAnId),

                        caAnId: formData.caAnId === '' ? null : Number(formData.caAnId),

                        donGia: parseVietnameseNumber(formData.donGia),

                        tuNgay: formData.tuNgay || null,

                        denNgay: formData.denNgay || null,

                        mucDoUuTien: Number(formData.mucDoUuTien),

                        ghiChu: String(formData.ghiChu || '').trim() || null,

                        active: formData.active === true
                    };
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    }
                ]
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục giá vé ăn.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục giá vé ăn.');
        }
    }

    function normalizeActiveRecords(data) {
        const records = Array.isArray(data) ? data : data?.items || data?.rows || data?.danhSach || data?.data || [];

        return records.filter((item) => item?.active !== false);
    }

    async function loadOptions() {
        await Promise.all([loadDoiTuongLayVe(), loadCoSo(), loadNhaAn(), loadCaAn()]);
    }

    async function loadDoiTuongLayVe() {
        try {
            const result = await window.MCS.api.request('/api/mcs/v1/enums?name=doiTuongLayVe');

            dsDoiTuongLayVe = Array.isArray(result?.data) ? result.data : [];

            renderDoiTuongLayVe();
        } catch (error) {
            console.error('Không thể tải đối tượng lấy vé.', error);
        }
    }

    async function loadCoSo() {
        try {
            const result = await window.MCS.api.request('/api/mcs/v1/dm-co-so/tong-hop?active=true');

            dsCoSo = normalizeActiveRecords(result?.data);

            renderCoSo();
        } catch (error) {
            console.error('Không thể tải cơ sở.', error);
        }
    }

    async function loadNhaAn(coSoId = null) {
        try {
            let url = '/api/mcs/v1/dm-nha-an/tong-hop?active=true';

            if (coSoId) {
                url += `&coSoId=${encodeURIComponent(coSoId)}`;
            }

            const result = await window.MCS.api.request(url);

            const records = normalizeActiveRecords(result?.data);

            dsNhaAn = coSoId
                ? records.filter((item) => Number(item.coSoId ?? item.coSo?.id ?? item.co_so_id) === Number(coSoId))
                : records;

            renderNhaAn();
        } catch (error) {
            console.error('Không thể tải nhà ăn.', error);
        }
    }

    async function loadCaAn() {
        try {
            const result = await window.MCS.api.request('/api/mcs/v1/dm-ca-an/tong-hop?active=true');

            dsCaAn = normalizeActiveRecords(result?.data);

            renderCaAn();
        } catch (error) {
            console.error('Không thể tải ca ăn.', error);
        }
    }

    function renderDoiTuongLayVe(selectedValue = '') {
        renderSelectOptions(
            'doiTuongLayVe',
            dsDoiTuongLayVe,
            selectedValue,
            (item) => item.value,
            (item) => item.name
        );
    }

    function renderCoSo(selectedValue = '') {
        renderSelectOptions(
            'coSoId',
            dsCoSo,
            selectedValue,
            (item) => item.id,
            (item) => item.tenCoSo || item.ten_co_so || item.name || ''
        );
    }

    function renderNhaAn(selectedValue = '') {
        renderSelectOptions(
            'nhaAnId',
            dsNhaAn,
            selectedValue,
            (item) => item.id,
            (item) => item.tenNhaAn || item.ten_nha_an || item.name || ''
        );
    }

    function renderCaAn(selectedValue = '') {
        renderSelectOptions(
            'caAnId',
            dsCaAn,
            selectedValue,
            (item) => item.id,
            (item) => item.tenCaAn || item.ten_ca_an || item.name || ''
        );
    }

    function renderSelectOptions(selectId, items, selectedValue, getValue, getLabel) {
        const select = document.getElementById(selectId);

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

        items.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(getValue(item));

            option.textContent = getLabel(item);

            option.selected = option.value === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelectRoot = select.closest('[data-smart-select]');

        const smartSelect = smartSelectRoot?.smartSelect || window.MCS?.smartSelect?.initialize(smartSelectRoot);
        smartSelect?.refresh?.();
        if (selected === '') {
            smartSelect?.clear?.(false);
        } else {
            smartSelect?.setValue?.(selected, false);
        }
    }

    function getDoiTuongLayVeLabel(value) {
        const item = dsDoiTuongLayVe.find((item) => Number(item.value) === Number(value));

        return item?.name || value || '-';
    }

    function normalizeDate(value) {
        if (!value) {
            return '';
        }

        const text = String(value).trim();

        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (match) {
            return `${match[1]}-` + `${match[2]}-` + `${match[3]}`;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function syncDateField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const dateValue = normalizeDate(value);

        input.value = dateValue;

        const root = input.closest('[data-date-picker]') || input.closest('[data-form-field]');

        const datePicker = input.datePicker || root?.datePicker || window.MCS?.datePicker?.initialize?.(root || input);

        if (datePicker?.setValue) {
            datePicker.setValue(dateValue, false);
        }

        input.dispatchEvent(
            new Event('input', {
                bubbles: true
            })
        );

        input.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const text = String(value).slice(0, 10);

        const parts = text.split('-');

        if (parts.length !== 3) {
            return text;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function formatMoney(value) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return '-';
        }

        return number.toLocaleString('vi-VN', {
            maximumFractionDigits: 5
        });
    }

    function parseVietnameseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const text = String(value).trim().replace(/\s/g, '');

        if (!text) {
            return null;
        }

        const normalized = text.replace(/\./g, '').replace(',', '.');

        const number = Number(normalized);

        return Number.isFinite(number) ? number : null;
    }

    function formatVietnameseNumberInput(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const text = String(value).trim().replace(',', '.');

        const parts = text.split('.');

        const integerPart = String(parts[0] || '0')
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        const decimalPart = parts[1] ?? '';

        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    }
});

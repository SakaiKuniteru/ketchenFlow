'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-voucher';
    const API_LOAI_MIEN_GIAM = '/api/mcs/v1/enums?name=loaiMienGiam';
    const API_QUY_TAC_LAM_TRON = '/api/mcs/v1/thiet-lap/gia-tri?QUY_TAC_LAM_TRON';
    const API_SO_CHU_SO_SAU_DAU_PHAY = '/api/mcs/v1/thiet-lap/gia-tri?SO_CHU_SO_SAU_DAU_PHAY';

    const LOAI_MIEN_GIAM = {
        PHAN_TRAM: 10,
        SO_TIEN: 20
    };

    let catalog = null;
    let dsLoaiMienGiam = [];
    let quyTacLamTron = 0;
    let soChuSoSauDauPhay = 2;

    initialize();

    async function initialize() {
        await Promise.all([loadLoaiMienGiam(), loadQuyTacLamTron(), loadSoChuSoSauDauPhay()]);

        await initializeCatalog();
        renderLoaiMienGiam();
        bindEvents();
        syncGiaTriField();
    }

    function requiredField(label, message = 'Vui lòng điền vào trường này.') {
        return {
            label,
            required: true,
            requiredMessage: message
        };
    }

    function requiredSelect(label) {
        return requiredField(label, 'Vui lòng chọn một mục trong danh sách.');
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'voucher',
                permissionCodes: {
                    view: 'Q000535',
                    create: 'Q000536',
                    update: 'Q000537'
                },
                detailTitle: 'Thông tin voucher',
                createTitle: 'Thêm voucher',
                updateTitle: 'Cập nhật voucher',

                columns: [
                    {
                        key: 'maVoucher',
                        label: 'Mã voucher',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenVoucher',
                        label: 'Tên voucher',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'loaiMienGiam',
                        label: 'Loại miễn giảm',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        filterable: true,

                        render(value) {
                            return getLoaiMienGiamLabel(value);
                        }
                    },
                    {
                        key: 'giaTri',
                        label: 'Giá trị',
                        sortable: true,
                        type: 'number',

                        render(value, record) {
                            return formatGiaTri(value, record?.loaiMienGiam);
                        }
                    },
                    {
                        key: 'soLuong',
                        label: 'Số lượng',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        type: 'number'
                    },
                    {
                        key: 'daSuDung',
                        label: 'Đã sử dụng',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        type: 'number'
                    },
                    {
                        key: 'thoiGianBatDau',
                        label: 'Thời gian bắt đầu',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        type: 'date'
                    },
                    {
                        key: 'thoiGianKetThuc',
                        label: 'Thời gian kết thúc',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        type: 'date'
                    },
                    {
                        key: 'active',
                        label: 'Trạng thái',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: window.createStatusBadge
                    }
                ],

                defaultValues: {
                    maVoucher: '',
                    tenVoucher: '',
                    loaiMienGiam: '',
                    giaTri: '',
                    soLuong: 0,
                    daSuDung: 0,
                    thoiGianBatDau: '',
                    thoiGianKetThuc: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maVoucher: {
                        ...requiredField('Mã voucher'),
                        maxLength: 50,
                        unique: true,
                        maxLengthMessage: 'Mã voucher không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã voucher đã tồn tại.'
                    },

                    tenVoucher: {
                        ...requiredField('Tên voucher'),
                        maxLength: 255,
                        unique: true,
                        maxLengthMessage: 'Tên voucher không được vượt quá 255 ký tự.',
                        uniqueMessage: 'Tên voucher đã tồn tại.'
                    },

                    loaiMienGiam: {
                        ...requiredSelect('Loại miễn giảm')
                    },

                    giaTri: {
                        ...requiredField('Giá trị voucher')
                    },

                    soLuong: {
                        label: 'Số lượng',
                        min: 0,
                        minMessage: 'Số lượng phải lớn hơn hoặc bằng 0.'
                    },

                    thoiGianBatDau: {
                        ...requiredField('Thời gian bắt đầu')
                    },

                    thoiGianKetThuc: {
                        label: 'Thời gian kết thúc'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                validate(formData) {
                    const errors = {};

                    const loaiMienGiam = toNullableNumber(formData.loaiMienGiam);

                    const giaTri = getNumberFieldValue('giaTri', formData.giaTri);

                    const soLuong = getNumberFieldValue('soLuong', formData.soLuong);

                    if (loaiMienGiam !== null) {
                        const exists = dsLoaiMienGiam.some((item) => Number(item.value) === loaiMienGiam);

                        if (!exists) {
                            errors.loaiMienGiam = 'Loại miễn giảm không hợp lệ.';
                        }
                    }

                    if (giaTri !== null && loaiMienGiam === LOAI_MIEN_GIAM.PHAN_TRAM) {
                        if (giaTri <= 0 || giaTri > 100) {
                            errors.giaTri = 'Giá trị phần trăm phải lớn hơn 0 và nhỏ hơn hoặc bằng 100.';
                        } else if (getDecimalLength(giaTri) > 5) {
                            errors.giaTri = 'Giá trị phần trăm chỉ được phép có tối đa 5 chữ số sau dấu phẩy.';
                        }
                    }

                    if (giaTri !== null && loaiMienGiam === LOAI_MIEN_GIAM.SO_TIEN) {
                        if (giaTri <= 0) {
                            errors.giaTri = 'Giá trị tiền phải lớn hơn 0.';
                        } else {
                            const rounded = lamTronTheoThietLap(giaTri);

                            if (rounded <= 0) {
                                errors.giaTri = 'Giá trị tiền sau khi làm tròn phải lớn hơn 0.';
                            }
                        }
                    }

                    if (soLuong !== null) {
                        if (!Number.isInteger(soLuong)) {
                            errors.soLuong = 'Số lượng phải là số nguyên.';
                        } else if (soLuong < 0) {
                            errors.soLuong = 'Số lượng phải lớn hơn hoặc bằng 0.';
                        }
                    }

                    const batDau = parseDateValue(formData.thoiGianBatDau);

                    const ketThuc = parseDateValue(formData.thoiGianKetThuc);

                    if (formData.thoiGianBatDau && formData.thoiGianKetThuc) {
                        if (batDau === null || ketThuc === null) {
                            errors.thoiGianKetThuc = 'Thời gian áp dụng voucher không hợp lệ.';
                        } else if (ketThuc <= batDau) {
                            errors.thoiGianKetThuc = 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.';
                        }
                    }

                    return errors;
                },

                mapListResponse(result) {
                    return Array.isArray(result?.data) ? result.data : result?.data?.items || result?.data?.data || [];
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maVoucher: record?.maVoucher || '',
                        tenVoucher: record?.tenVoucher || '',
                        loaiMienGiam: record?.loaiMienGiam ?? '',
                        giaTri: record?.giaTri ?? '',
                        soLuong: record?.soLuong ?? 0,
                        daSuDung: record?.daSuDung ?? 0,

                        thoiGianBatDau: normalizeDate(record?.thoiGianBatDau),

                        thoiGianKetThuc: normalizeDate(record?.thoiGianKetThuc),

                        moTa: record?.moTa || '',

                        active: record?.active === true
                    };
                },

                onRecordLoaded(record) {
                    renderLoaiMienGiam(record?.loaiMienGiam ?? '');

                    syncNumberField('giaTri', record?.giaTri ?? '');

                    syncNumberField('soLuong', record?.soLuong ?? 0);

                    syncNumberField('daSuDung', record?.daSuDung ?? 0);

                    syncDateField('thoiGianBatDau', normalizeDate(record?.thoiGianBatDau));

                    syncDateField('thoiGianKetThuc', normalizeDate(record?.thoiGianKetThuc));

                    syncGiaTriField(record?.loaiMienGiam);
                },

                transformPayload(formData) {
                    const loaiMienGiam = toNullableNumber(formData.loaiMienGiam);

                    let giaTri = getNumberFieldValue('giaTri', formData.giaTri);

                    if (loaiMienGiam === LOAI_MIEN_GIAM.SO_TIEN && giaTri !== null) {
                        giaTri = lamTronTheoThietLap(giaTri);
                    }

                    const payload = {
                        maVoucher: String(formData.maVoucher || '')
                            .trim()
                            .toUpperCase(),

                        tenVoucher: String(formData.tenVoucher || '').trim(),

                        loaiMienGiam,
                        giaTri,

                        soLuong: Math.max(0, Math.trunc(getNumberFieldValue('soLuong', formData.soLuong) ?? 0)),

                        thoiGianBatDau: buildStartDateTime(formData.thoiGianBatDau),

                        thoiGianKetThuc: buildEndDateTime(formData.thoiGianKetThuc),

                        moTa: normalizeNullableText(formData.moTa),

                        active: formData.active === true
                    };

                    const id = toNullableNumber(formData.id);

                    if (id === null) {
                        payload.daSuDung = 0;
                    }

                    return payload;
                },

                getRecordSubtitle(record) {
                    return record?.maVoucher || '';
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
            console.error('Không thể khởi tạo danh mục voucher.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục voucher.');
        }
    }

    async function loadLoaiMienGiam() {
        try {
            const response = await window.MCS.api.request(API_LOAI_MIEN_GIAM);

            dsLoaiMienGiam = normalizeEnumData(response?.data);
        } catch (error) {
            dsLoaiMienGiam = [];

            console.error('Không thể tải loại miễn giảm.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải loại miễn giảm.');
        }
    }

    async function loadQuyTacLamTron() {
        try {
            const response = await window.MCS.api.request(API_QUY_TAC_LAM_TRON);

            const value = getSettingNumber(response, 0);

            quyTacLamTron = [0, 1, 2].includes(value) ? value : 0;
        } catch (error) {
            quyTacLamTron = 0;
        }
    }

    async function loadSoChuSoSauDauPhay() {
        try {
            const response = await window.MCS.api.request(API_SO_CHU_SO_SAU_DAU_PHAY);

            const value = getSettingNumber(response, 2);

            soChuSoSauDauPhay = Number.isInteger(value) && value >= 0 && value <= 5 ? value : 2;
        } catch (error) {
            soChuSoSauDauPhay = 2;
        }
    }

    function getSettingNumber(response, defaultValue) {
        const data = response?.data;

        if (data?.active === false) {
            return defaultValue;
        }

        const rawValue = data?.giaTri ?? data?.value ?? data;

        if (rawValue === null || rawValue === undefined || rawValue === '') {
            return defaultValue;
        }

        const value = Number(rawValue);

        return Number.isFinite(value) ? value : defaultValue;
    }

    function normalizeEnumData(data) {
        const records = Array.isArray(data) ? data : data?.items || data?.data || [];

        return records.map((item) => ({
            value: item.value,

            label: item.label ?? item.name ?? item.ten ?? String(item.value)
        }));
    }

    function renderLoaiMienGiam(selectedValue = '') {
        renderSelect(
            'loaiMienGiam',
            dsLoaiMienGiam,
            (item) => item.value,
            (item) => item.label,
            selectedValue
        );
    }

    function renderSelect(selectId, items, getValue, getLabel, selectedValue = '') {
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
            const value = String(getValue(item));

            const option = document.createElement('option');

            option.value = value;
            option.textContent = getLabel(item);

            option.selected = value === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelectRoot = select.closest('[data-smart-select]');

        window.MCS?.smartSelect?.initialize(smartSelectRoot);

        smartSelectRoot?.smartSelect?.refresh?.();
    }

    function bindEvents() {
        const loaiMienGiam = document.getElementById('loaiMienGiam');

        loaiMienGiam?.addEventListener('change', (event) => {
            syncGiaTriField(event.target.value);
        });

        bindGiaTriRules();
        bindSoLuongRules();
    }

    function bindGiaTriRules() {
        const input = document.getElementById('giaTri');

        if (!input || input.dataset.voucherGiaTriBound === 'true') {
            return;
        }

        input.dataset.voucherGiaTriBound = 'true';

        input.addEventListener(
            'keydown',
            (event) => {
                const loaiMienGiam = toNullableNumber(document.getElementById('loaiMienGiam')?.value);

                if (loaiMienGiam !== LOAI_MIEN_GIAM.PHAN_TRAM) {
                    return;
                }

                if (!/^\d$/.test(event.key)) {
                    return;
                }

                const raw = String(input.value ?? '')
                    .replace(/\./g, '')
                    .trim();

                if (raw === '0') {
                    if (event.key === '0') {
                        event.preventDefault();
                        return;
                    }

                    if (event.key >= '1' && event.key <= '9') {
                        event.preventDefault();

                        setNumberInputValue(input, Number(event.key));
                    }
                }
            },
            true
        );

        input.addEventListener('input', () => {
            if (input.disabled) {
                return;
            }

            const loaiMienGiam = toNullableNumber(document.getElementById('loaiMienGiam')?.value);

            if (loaiMienGiam === null) {
                return;
            }

            const numberInput = getNumberInput(input);

            const value = numberInput?.getValue?.();

            if (value === null || value === undefined || value === '') {
                return;
            }

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return;
            }

            if (loaiMienGiam === LOAI_MIEN_GIAM.PHAN_TRAM) {
                if (number > 100) {
                    setNumberInputValue(input, 100);

                    return;
                }

                if (number < 0) {
                    setNumberInputValue(input, 0);

                    return;
                }

                const decimalLength = getDecimalLength(number);

                if (decimalLength > 5) {
                    const factor = Math.pow(10, 5);

                    const truncated = Math.floor(number * factor) / factor;

                    setNumberInputValue(input, truncated);
                }

                return;
            }

            if (loaiMienGiam === LOAI_MIEN_GIAM.SO_TIEN) {
                if (number < 0) {
                    setNumberInputValue(input, 0);

                    return;
                }

                const decimalLength = getDecimalLength(number);

                const soChuSoChoPhepNhap = soChuSoSauDauPhay + 1;

                if (decimalLength >= soChuSoChoPhepNhap) {
                    const rounded = lamTronTheoThietLap(number);

                    setNumberInputValue(input, rounded);
                }
            }
        });

        input.addEventListener('blur', () => {
            const loaiMienGiam = toNullableNumber(document.getElementById('loaiMienGiam')?.value);

            if (loaiMienGiam !== LOAI_MIEN_GIAM.SO_TIEN) {
                return;
            }

            const numberInput = getNumberInput(input);

            const value = numberInput?.getValue?.();

            if (value === null || value === undefined || value === '') {
                return;
            }

            setNumberInputValue(input, lamTronTheoThietLap(value));
        });
    }

    function bindSoLuongRules() {
        const input = document.getElementById('soLuong');

        if (!input || input.dataset.voucherSoLuongBound === 'true') {
            return;
        }

        input.dataset.voucherSoLuongBound = 'true';

        input.inputMode = 'numeric';

        input.addEventListener('keydown', (event) => {
            if (['.', ',', '-', '+', 'e', 'E'].includes(event.key)) {
                event.preventDefault();
            }
        });

        let dangDongBo = false;

        input.addEventListener('input', () => {
            if (dangDongBo) {
                return;
            }

            const numberInput = getNumberInput(input);

            const value = numberInput?.getValue?.();

            if (value === null || value === undefined || value === '') {
                return;
            }

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return;
            }

            let newValue = Math.max(0, Math.trunc(number));

            const raw = String(input.value ?? '').trim();

            const coSoKhongODau = /^0\d+/.test(raw);

            const canDongBo = !Number.isInteger(number) || number < 0 || coSoKhongODau;

            if (!canDongBo) {
                return;
            }

            dangDongBo = true;

            setNumberInputValue(input, newValue);

            dangDongBo = false;
        });

        input.addEventListener('blur', () => {
            const value = getNumberFieldValue('soLuong');

            if (value === null) {
                return;
            }

            setNumberInputValue(input, Math.max(0, Math.trunc(value)));
        });
    }

    function syncGiaTriField(explicitLoaiMienGiam) {
        const input = document.getElementById('giaTri');

        if (!input) {
            return;
        }

        const loaiMienGiam = toNullableNumber(explicitLoaiMienGiam ?? document.getElementById('loaiMienGiam')?.value);

        const field = input.closest('[data-form-field]');

        if (!field) {
            return;
        }

        let suffix = field.querySelector('.form-field__suffix');

        if (!suffix) {
            const control = field.querySelector('.form-field__control');

            if (control) {
                suffix = document.createElement('span');

                suffix.className = 'form-field__suffix';

                control.appendChild(suffix);
            }
        }

        if (loaiMienGiam === null) {
            input.disabled = true;

            input.placeholder = 'Chọn loại miễn giảm trước';

            input.min = '0';

            input.removeAttribute('max');

            input.step = 'any';

            if (suffix) {
                suffix.textContent = '';
            }

            setNumberInputValue(input, '');

            window.MCS?.numberInput?.refresh?.(field);

            return;
        }

        input.disabled = false;
        input.placeholder = 'Nhập giá trị';

        if (loaiMienGiam === LOAI_MIEN_GIAM.PHAN_TRAM) {
            input.min = '0.00001';

            input.max = '100';

            input.step = '0.00001';

            if (suffix) {
                suffix.textContent = '%';
            }

            const value = getNumberFieldValue('giaTri');

            if (value !== null && value > 100) {
                setNumberInputValue(input, 100);
            }
        } else if (loaiMienGiam === LOAI_MIEN_GIAM.SO_TIEN) {
            input.min = '0';

            input.removeAttribute('max');

            input.step = 'any';

            if (suffix) {
                suffix.textContent = 'VND';
            }

            const value = getNumberFieldValue('giaTri');

            if (value !== null && getDecimalLength(value) > soChuSoSauDauPhay + 1) {
                setNumberInputValue(input, lamTronTheoThietLap(value));
            }
        }

        window.MCS?.numberInput?.refresh?.(field);
    }

    function getNumberInput(input) {
        if (!input) {
            return null;
        }

        return input.numberInput || window.MCS?.numberInput?.initialize?.(input) || null;
    }

    function setNumberInputValue(input, value) {
        if (!input) {
            return;
        }

        const numberInput = getNumberInput(input);

        if (numberInput?.setValue) {
            numberInput.setValue(value);

            return;
        }

        input.value = value === null || value === undefined ? '' : String(value);
    }

    function getNumberFieldValue(inputId, fallbackValue = null) {
        const input = document.getElementById(inputId);

        if (!input) {
            return toNullableNumber(fallbackValue);
        }

        const numberInput = getNumberInput(input);

        const value = numberInput?.getValue ? numberInput.getValue() : input.value;

        return toNullableNumber(value);
    }

    function syncNumberField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const numberInput = getNumberInput(input);

        if (numberInput?.setValue) {
            numberInput.setValue(value ?? '');

            return;
        }

        input.value = value ?? '';
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
            datePicker.setValue(dateValue);
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

    function lamTronTheoThietLap(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        const decimalPlaces =
            Number.isInteger(soChuSoSauDauPhay) && soChuSoSauDauPhay >= 0 && soChuSoSauDauPhay <= 5
                ? soChuSoSauDauPhay
                : 2;

        const factor = Math.pow(10, decimalPlaces);

        const scaled = number * factor;

        const epsilon = Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4;

        const nearest = Math.round(scaled);

        const isExact = Math.abs(scaled - nearest) <= epsilon;

        let result;

        switch (quyTacLamTron) {
            case 1:
                result = isExact ? nearest : Math.ceil(scaled - epsilon);

                break;

            case 2:
                result = isExact ? nearest : Math.floor(scaled + epsilon);

                break;

            case 0:

            default:
                result = Math.floor(scaled + 0.5 + epsilon);

                break;
        }

        return Number((result / factor).toFixed(decimalPlaces));
    }

    function getLoaiMienGiamLabel(value) {
        const item = dsLoaiMienGiam.find((current) => Number(current.value) === Number(value));

        return item?.label || '-';
    }

    function formatGiaTri(value, loaiMienGiam) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return '-';
        }

        if (Number(loaiMienGiam) === LOAI_MIEN_GIAM.PHAN_TRAM) {
            return `${formatNumber(number, 5)} %`;
        }

        if (Number(loaiMienGiam) === LOAI_MIEN_GIAM.SO_TIEN) {
            return `${formatNumber(lamTronTheoThietLap(number), soChuSoSauDauPhay)} VND`;
        }

        return formatNumber(number, 5);
    }

    function formatNumber(value, maximumFractionDigits) {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits
        }).format(Number(value));
    }

    function getDecimalLength(value) {
        if (value === null || value === undefined) {
            return 0;
        }

        const text = String(value);

        if (!text.includes('.')) {
            return 0;
        }

        return text.split('.')[1]?.length || 0;
    }

    function toNullableNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function normalizeNullableText(value) {
        const text = String(value ?? '').trim();

        return text || null;
    }

    function buildStartDateTime(value) {
        const date = normalizeDateInput(value);

        if (!date) {
            return null;
        }

        return `${date}` + 'T00:00:00+07:00';
    }

    function buildEndDateTime(value) {
        const date = normalizeDateInput(value);

        if (!date) {
            return null;
        }

        return `${date}` + 'T23:59:59+07:00';
    }

    function normalizeDateInput(value) {
        if (!value) {
            return null;
        }

        const text = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
            return text.substring(0, 10);
        }

        const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

        if (!match) {
            return null;
        }

        const day = match[1];

        const month = match[2];

        const year = match[3];

        return `${year}-${month}-${day}`;
    }

    function normalizeDate(value) {
        return normalizeDateInput(value) || '';
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }

        const text = String(value).trim();

        let year;
        let month;
        let day;

        if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
            [year, month, day] = text.substring(0, 10).split('-').map(Number);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
            [day, month, year] = text.split('/').map(Number);
        } else {
            return null;
        }

        const date = new Date(year, month - 1, day);

        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return null;
        }

        return year * 10000 + month * 100 + day;
    }
});

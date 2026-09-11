'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_LOAI_CHINH_SACH = '/api/mcs/v1/enums?name=loaiDoiTuong';
    const API_VOUCHER = '/api/mcs/v1/dm-voucher/tong-hop?active=true';
    const API_VAI_TRO = '/api/mcs/v1/dm-vai-tro/tong-hop?active=true';
    const API_CHUC_VU = '/api/mcs/v1/dm-chuc-vu/tong-hop?active=true';
    const API_TAI_KHOAN = '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true';

    const LOAI_CHINH_SACH = {
        VAI_TRO: 10,
        CHUC_VU: 20,
        TAI_KHOAN: 30
    };

    const PHAM_VI_CONFIG = {
        [LOAI_CHINH_SACH.VAI_TRO]: {
            api: API_VAI_TRO,
            getLabel: buildVaiTroLabel
        },
        [LOAI_CHINH_SACH.CHUC_VU]: {
            api: API_CHUC_VU,
            getLabel: buildChucVuLabel
        },
        [LOAI_CHINH_SACH.TAI_KHOAN]: {
            api: API_TAI_KHOAN,
            getLabel: buildTaiKhoanLabel
        }
    };

    let catalog = null;
    let dsLoaiChinhSach = [];
    let dsVoucher = [];

    const phamViCache = new Map();
    let dsPhamViHienTai = [];

    initialize();

    async function initialize() {
        await Promise.all([loadLoaiChinhSach(), loadVoucher()]);

        await initializeCatalog();

        renderLoaiChinhSach();
        renderVoucher();

        bindEvents();
        bindMucDoUuTienRules();

        await syncPhamViTheoLoai(null);
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
                moduleName: 'chinh-sach',
                permissionCodes: {
                    view: 'Q000538',
                    create: 'Q000539',
                    update: 'Q000540'
                },
                detailTitle: 'Thông tin chính sách',
                createTitle: 'Thêm chính sách',
                updateTitle: 'Cập nhật chính sách',

                columns: [
                    {
                        key: 'maChinhSach',
                        label: 'Mã chính sách',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenChinhSach',
                        label: 'Tên chính sách',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'loaiChinhSach',
                        label: 'Loại chính sách',
                        sortable: true,
                        filterable: true,
                        className: 'catalog-table__cell--center',

                        render(value) {
                            return getLoaiChinhSachLabel(value);
                        }
                    },
                    {
                        key: 'mucDoUuTien',
                        label: 'Mức độ ưu tiên',
                        sortable: true,
                        type: 'number',
                        className: 'catalog-table__cell--center'
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        filterable: true
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
                    maChinhSach: '',
                    tenChinhSach: '',
                    loaiChinhSach: '',
                    voucherIds: [],
                    doiTuongApDungIds: [],
                    mucDoUuTien: '',
                    moTa: '',
                    active: true
                },

                validation: {
                    maChinhSach: {
                        ...requiredField('Mã chính sách'),
                        maxLength: 50,
                        unique: true,
                        maxLengthMessage: 'Mã chính sách không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã chính sách đã tồn tại.'
                    },

                    tenChinhSach: {
                        ...requiredField('Tên chính sách'),
                        maxLength: 255,
                        maxLengthMessage: 'Tên chính sách không được vượt quá 255 ký tự.'
                    },

                    loaiChinhSach: {
                        ...requiredSelect('Loại chính sách')
                    },

                    voucherIds: {
                        label: 'Voucher áp dụng'
                    },

                    doiTuongApDungIds: {
                        label: 'Đối tượng áp dụng'
                    },

                    mucDoUuTien: {
                        ...requiredField('Mức độ ưu tiên'),
                        min: 1,
                        minMessage: 'Mức độ ưu tiên phải lớn hơn 0.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    }
                },

                validate(formData) {
                    const errors = {};

                    const loaiChinhSach = toNullableNumber(formData.loaiChinhSach);

                    const mucDoUuTien = getNumberFieldValue('mucDoUuTien', formData.mucDoUuTien);

                    const voucherIds = getSelectedValues('voucherIds', dsVoucher);

                    const doiTuongIds = getSelectedValues('doiTuongApDungIds', dsPhamViHienTai);

                    if (loaiChinhSach !== null) {
                        const exists = dsLoaiChinhSach.some((item) => Number(item.value) === loaiChinhSach);

                        if (!exists) {
                            errors.loaiChinhSach = 'Loại chính sách không hợp lệ.';
                        }
                    }

                    if (voucherIds.length === 0) {
                        errors.voucherIds = 'Vui lòng chọn ít nhất một voucher.';
                    }

                    if (loaiChinhSach !== null && doiTuongIds.length === 0) {
                        errors.doiTuongApDungIds = 'Vui lòng chọn ít nhất một đối tượng áp dụng.';
                    }

                    if (mucDoUuTien !== null) {
                        if (!Number.isInteger(mucDoUuTien)) {
                            errors.mucDoUuTien = 'Mức độ ưu tiên phải là số nguyên.';
                        } else if (mucDoUuTien <= 0) {
                            errors.mucDoUuTien = 'Mức độ ưu tiên phải lớn hơn 0.';
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
                    const loaiChinhSach = toNullableNumber(record?.loaiChinhSach?.value ?? record?.loaiChinhSach);

                    const voucherIds = getRecordVoucherIds(record);

                    const doiTuongIds = getRecordDoiTuongIds(record, loaiChinhSach);

                    return {
                        id: record?.id ?? '',

                        maChinhSach: record?.maChinhSach || '',

                        tenChinhSach: record?.tenChinhSach || '',

                        loaiChinhSach: loaiChinhSach ?? '',

                        voucherIds,

                        doiTuongApDungIds: doiTuongIds,

                        mucDoUuTien: record?.mucDoUuTien ?? '',

                        moTa: record?.moTa || '',

                        active: record?.active === true
                    };
                },

                async onRecordLoaded(record, mode) {
                    const loaiChinhSach = toNullableNumber(record?.loaiChinhSach?.value ?? record?.loaiChinhSach);

                    const voucherIds = getRecordVoucherIds(record);

                    const doiTuongIds = getRecordDoiTuongIds(record, loaiChinhSach);

                    /*
                     * Loại chính sách
                     */
                    renderLoaiChinhSach(loaiChinhSach ?? '');

                    /*
                     * Voucher đã gắn với chính sách
                     */
                    renderVoucher(voucherIds);

                    /*
                     * Vai trò / chức vụ / tài khoản
                     */
                    await syncPhamViTheoLoai(loaiChinhSach, doiTuongIds);

                    /*
                     * Number component
                     */
                    syncNumberField('mucDoUuTien', record?.mucDoUuTien ?? '');
                },

                transformPayload(formData) {
                    const loaiChinhSach = toNullableNumber(formData.loaiChinhSach);

                    const voucherIds = getSelectedValues('voucherIds', dsVoucher);

                    const doiTuongIds = getSelectedValues('doiTuongApDungIds', dsPhamViHienTai);

                    const payload = {
                        maChinhSach: String(formData.maChinhSach || '')
                            .trim()
                            .toUpperCase(),

                        tenChinhSach: String(formData.tenChinhSach || '').trim(),

                        loaiChinhSach,

                        dsVoucherId: voucherIds,

                        mucDoUuTien: Math.trunc(getNumberFieldValue('mucDoUuTien', formData.mucDoUuTien) ?? 0),

                        moTa: normalizeNullableText(formData.moTa),

                        dsVaiTroId: [],
                        dsChucVuId: [],
                        dsTaiKhoanId: [],

                        active: formData.active === true
                    };

                    switch (loaiChinhSach) {
                        case LOAI_CHINH_SACH.VAI_TRO:
                            payload.dsVaiTroId = doiTuongIds;
                            break;

                        case LOAI_CHINH_SACH.CHUC_VU:
                            payload.dsChucVuId = doiTuongIds;
                            break;

                        case LOAI_CHINH_SACH.TAI_KHOAN:
                            payload.dsTaiKhoanId = doiTuongIds;
                            break;
                    }

                    return payload;
                },

                getRecordSubtitle(record) {
                    return record?.maChinhSach || '';
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
            console.error('Không thể khởi tạo danh mục chính sách.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục chính sách.');
        }
    }

    async function loadLoaiChinhSach() {
        try {
            const response = await window.MCS.api.request(API_LOAI_CHINH_SACH);

            dsLoaiChinhSach = normalizeEnumData(response?.data ?? response);
        } catch (error) {
            dsLoaiChinhSach = [];

            console.error('Không thể tải loại chính sách.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải loại chính sách.');
        }
    }

    async function loadVoucher() {
        try {
            const response = await window.MCS.api.request(API_VOUCHER);

            dsVoucher = normalizeList(response?.data ?? response).filter((item) => item?.active !== false);
        } catch (error) {
            dsVoucher = [];

            console.error('Không thể tải voucher.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách voucher.');
        }
    }

    function bindEvents() {
        const loaiChinhSach = document.getElementById('loaiChinhSach');

        loaiChinhSach?.addEventListener('change', async (event) => {
            await syncPhamViTheoLoai(event.target.value, []);
        });
    }

    async function syncPhamViTheoLoai(loaiValue, selectedValues = []) {
        const loai = toNullableNumber(loaiValue);

        const select = document.getElementById('doiTuongApDungIds');

        if (!select) {
            return;
        }

        if (loai === null) {
            dsPhamViHienTai = [];

            renderMultipleSelect(
                'doiTuongApDungIds',
                [],
                (item) => item.id,
                (item) => String(item.id),
                []
            );

            setSelectState('doiTuongApDungIds', true, 'Chọn loại chính sách trước');

            return;
        }

        const config = PHAM_VI_CONFIG[loai];

        if (!config) {
            dsPhamViHienTai = [];

            renderMultipleSelect(
                'doiTuongApDungIds',
                [],
                (item) => item.id,
                (item) => String(item.id),
                []
            );

            setSelectState('doiTuongApDungIds', true, 'Loại chính sách không hợp lệ');

            return;
        }

        setSelectState('doiTuongApDungIds', true, 'Đang tải dữ liệu...');

        try {
            const items = await loadPhamVi(loai, config.api);

            dsPhamViHienTai = items;

            /*
             * Enable trước.
             */
            setSelectState('doiTuongApDungIds', false, 'Chọn đối tượng áp dụng...');

            /*
             * Sau đó render danh sách
             * và selected values.
             */
            renderMultipleSelect('doiTuongApDungIds', items, (item) => item.id, config.getLabel, selectedValues);
        } catch (error) {
            dsPhamViHienTai = [];

            renderMultipleSelect(
                'doiTuongApDungIds',
                [],
                (item) => item.id,
                (item) => String(item.id),
                []
            );

            setSelectState('doiTuongApDungIds', true, 'Không thể tải dữ liệu');

            console.error('Không thể tải phạm vi áp dụng.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải phạm vi áp dụng.');
        }
    }

    async function loadPhamVi(loai, api) {
        if (phamViCache.has(loai)) {
            return phamViCache.get(loai);
        }

        const response = await window.MCS.api.request(api);

        const items = normalizeList(response?.data ?? response).filter((item) => item?.active !== false);

        phamViCache.set(loai, items);

        return items;
    }

    function renderLoaiChinhSach(selectedValue = '') {
        renderSingleSelect(
            'loaiChinhSach',
            dsLoaiChinhSach,
            (item) => item.value,
            (item) => item.label,
            selectedValue
        );
    }

    function renderVoucher(selectedValues = []) {
        renderMultipleSelect('voucherIds', dsVoucher, (item) => item.id, buildVoucherLabel, selectedValues);
    }

    function renderSingleSelect(selectId, items, getValue, getLabel, selectedValue = '') {
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

            const value = String(getValue(item));

            option.value = value;

            option.textContent = getLabel(item);

            option.selected = value === selected;

            select.appendChild(option);
        });

        select.value = selected;

        refreshSmartSelect(select);
    }

    function renderMultipleSelect(selectId, items, getValue, getLabel, selectedValues = []) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        /*
         * Danh sách ID BE trả về.
         */
        const selectedSet = new Set(normalizeIdArray(selectedValues).map((value) => String(value)));

        /*
         * Toàn bộ ID hiện có trong dropdown.
         */
        const allItemValues = items.map((item) => String(getValue(item)));

        /*
         * Nếu BE trả về đúng toàn bộ ID
         * đang có trong danh sách
         * => coi là chọn "Tất cả".
         */
        const isAllSelected =
            allItemValues.length > 0 &&
            selectedSet.size === allItemValues.length &&
            allItemValues.every((value) => selectedSet.has(value));

        select.innerHTML = '';

        /*
         * =========================================
         * OPTION TẤT CẢ
         * =========================================
         */
        const allOption = document.createElement('option');

        allOption.value = '__ALL__';

        allOption.textContent = 'Tất cả';

        /*
         * Nếu toàn bộ ID đều được chọn
         * thì chỉ select "__ALL__".
         */
        allOption.selected = isAllSelected;

        select.appendChild(allOption);

        /*
         * =========================================
         * OPTION THẬT
         * =========================================
         */
        items.forEach((item) => {
            const value = String(getValue(item));

            const option = document.createElement('option');

            option.value = value;

            option.textContent = getLabel(item);

            /*
             * Nếu là Tất cả:
             * KHÔNG select từng item.
             *
             * Nếu không phải Tất cả:
             * select từng ID BE trả về.
             */
            option.selected = !isAllSelected && selectedSet.has(value);

            select.appendChild(option);
        });

        /*
         * SmartSelect đọc lại trạng thái
         * từ option.selected.
         */
        refreshSmartSelect(select);
    }

    function setSelectState(selectId, disabled, placeholder) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.disabled = disabled;

        const root = select.closest('[data-smart-select]');

        if (placeholder !== undefined) {
            select.dataset.placeholder = placeholder;

            if (root) {
                root.dataset.placeholder = placeholder;
            }
        }

        const smartSelect = root?.smartSelect || window.MCS?.smartSelect?.initialize?.(root);

        smartSelect?.setDisabled?.(disabled);

        smartSelect?.setPlaceholder?.(placeholder);

        smartSelect?.refresh?.();
    }

    function refreshSmartSelect(select) {
        const root = select?.closest('[data-smart-select]');

        if (!root) {
            return null;
        }

        const smartSelect = root.smartSelect || window.MCS?.smartSelect?.initialize?.(root);

        smartSelect?.refresh?.();

        return smartSelect;
    }

    function bindMucDoUuTienRules() {
        const input = document.getElementById('mucDoUuTien');

        if (!input || input.dataset.mucDoUuTienBound === 'true') {
            return;
        }

        input.dataset.mucDoUuTienBound = 'true';

        input.inputMode = 'numeric';

        input.addEventListener('keydown', (event) => {
            if (['.', ',', '-', '+', 'e', 'E'].includes(event.key)) {
                event.preventDefault();
            }
        });

        let syncing = false;

        input.addEventListener('input', () => {
            if (syncing) {
                return;
            }

            const value = getNumberFieldValue('mucDoUuTien');

            if (value === null) {
                return;
            }

            const number = Math.max(0, Math.trunc(value));

            const raw = String(input.value ?? '')
                .replace(/\./g, '')
                .trim();

            const leadingZero = /^0\d+/.test(raw);

            const needSync = !Number.isInteger(value) || value < 0 || leadingZero;

            if (!needSync) {
                return;
            }

            syncing = true;

            setNumberInputValue(input, number);

            syncing = false;
        });

        input.addEventListener('blur', () => {
            const value = getNumberFieldValue('mucDoUuTien');

            if (value === null) {
                return;
            }

            setNumberInputValue(input, Math.max(0, Math.trunc(value)));
        });
    }

    function getNumberInput(input) {
        if (!input) {
            return null;
        }

        return input.numberInput || window.MCS?.numberInput?.initialize?.(input) || null;
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

    function syncNumberField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        setNumberInputValue(input, value);
    }

    function getSelectedValues(selectId, items = []) {
        const select = document.getElementById(selectId);

        if (!select) {
            return [];
        }

        const selectedOptions = Array.from(select.selectedOptions || []);

        const selectedAll = selectedOptions.some((option) => option.value === '__ALL__');

        if (selectedAll) {
            return items.map((item) => Number(item.id)).filter((value) => Number.isInteger(value) && value > 0);
        }

        return selectedOptions
            .map((option) => Number(option.value))
            .filter((value) => Number.isInteger(value) && value > 0);
    }

    function buildVoucherLabel(item) {
        return buildLabel(item?.maVoucher, item?.tenVoucher);
    }

    function buildVaiTroLabel(item) {
        return buildLabel(item?.maVaiTro, item?.tenVaiTro ?? item?.ten);
    }

    function buildChucVuLabel(item) {
        return buildLabel(item?.maChucVu, item?.tenChucVu ?? item?.ten);
    }

    function buildTaiKhoanLabel(item) {
        return buildLabel(
            item?.tenDangNhap,
            item?.nhanVien?.hoTen ?? item?.hoTenNhanVien ?? item?.hoTen ?? item?.tenNhanVien
        );
    }

    function buildLabel(ma, ten) {
        return [ma, ten].filter(Boolean).join(' - ') || '-';
    }

    function normalizeEnumData(value) {
        return normalizeList(value).map((item) => ({
            value: item?.value,

            label: item?.label ?? item?.name ?? item?.ten ?? String(item?.value ?? '')
        }));
    }

    function getLoaiChinhSachLabel(value) {
        const giaTri = value?.value ?? value;

        const item = dsLoaiChinhSach.find((current) => Number(current.value) === Number(giaTri));

        return item?.label || value?.name || '-';
    }

    function getRecordVoucherIds(record) {
        return normalizeRecordIds(
            record?.dsVoucherId ??
                record?.voucherIds ??
                record?.dsVoucher ??
                record?.vouchers ??
                (record?.voucherId ? [record.voucherId] : []),
            ['voucherId', 'id']
        );
    }

    function getRecordDoiTuongIds(record, loai) {
        const doiTuongApDung = record?.doiTuongApDung ?? [];

        switch (loai) {
            case LOAI_CHINH_SACH.VAI_TRO:
                return normalizeRecordIds(record?.dsVaiTroId ?? record?.dsVaiTro ?? record?.vaiTro ?? doiTuongApDung, [
                    'vaiTroId',
                    'id'
                ]);

            case LOAI_CHINH_SACH.CHUC_VU:
                return normalizeRecordIds(record?.dsChucVuId ?? record?.dsChucVu ?? record?.chucVu ?? doiTuongApDung, [
                    'chucVuId',
                    'id'
                ]);

            case LOAI_CHINH_SACH.TAI_KHOAN:
                return normalizeRecordIds(
                    record?.dsTaiKhoanId ?? record?.dsTaiKhoan ?? record?.taiKhoan ?? doiTuongApDung,
                    ['taiKhoanId', 'id']
                );

            default:
                return [];
        }
    }

    function normalizeRecordIds(value, idKeys = ['id']) {
        const list = Array.isArray(value)
            ? value
            : value === null || value === undefined || value === ''
              ? []
              : [value];

        return list
            .map((item) => {
                if (typeof item !== 'object') {
                    return Number(item);
                }

                for (const key of idKeys) {
                    if (item?.[key] !== undefined) {
                        return Number(item[key]);
                    }
                }

                return null;
            })
            .filter((value) => Number.isInteger(value) && value > 0);
    }

    function normalizeIdArray(value) {
        return normalizeRecordIds(value, ['id']);
    }

    function normalizeList(value) {
        if (Array.isArray(value)) {
            return value;
        }

        if (Array.isArray(value?.items)) {
            return value.items;
        }

        if (Array.isArray(value?.rows)) {
            return value.rows;
        }

        if (Array.isArray(value?.data)) {
            return value.data;
        }

        if (Array.isArray(value?.danhSach)) {
            return value.danhSach;
        }

        return [];
    }

    function toNullableNumber(value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return null;
        }

        const normalized = String(value).trim().replace(/\./g, '').replace(/,/g, '.');

        const number = Number(normalized);

        return Number.isFinite(number) ? number : null;
    }

    function normalizeNullableText(value) {
        const text = String(value ?? '').trim();

        return text || null;
    }
});

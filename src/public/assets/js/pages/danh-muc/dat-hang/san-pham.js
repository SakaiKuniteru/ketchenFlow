'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-san-pham';
    const FILE_NAME = 'dm_san_pham.xlsx';
    const MAX_EXCEL_SIZE = 10 * 1024 * 1024;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const NUMBER_RULES = {
        giaBan: {
            label: 'Giá bán',
            integer: false,
            defaultValue: '0'
        },
        soLuongToiThieu: {
            label: 'Số lượng tối thiểu',
            integer: true,
            min: 1,
            max: 999999999999,
            defaultValue: 1
        },
        soLuongToiDa: {
            label: 'Số lượng tối đa',
            integer: true,
            min: 1,
            max: 999999999999,
            nullable: true,
            defaultValue: ''
        },
        buocSoLuong: {
            label: 'Bước số lượng',
            integer: true,
            min: 1,
            max: 999999999999,
            defaultValue: 1
        },
        thoiGianChuanBiPhut: {
            label: 'Thời gian chuẩn bị',
            integer: true,
            min: 0,
            max: 2147483647,
            defaultValue: 0
        },
        thuTuHienThi: {
            label: 'Thứ tự hiển thị',
            integer: true,
            min: 0,
            max: 2147483647,
            defaultValue: 0
        }
    };
    const DEFAULT_VALUES = {
        maSanPham: '',
        tenSanPham: '',
        nhomSanPhamId: '',
        donViTinhId: '',
        giaBan: '',
        hinhAnh: '',
        moTa: '',
        choPhepDat: true,
        laSanPhamMoi: false,
        laSanPhamNoiBat: false,
        soLuongToiThieu: '',
        soLuongToiDa: '',
        buocSoLuong: '',
        thoiGianChuanBiPhut: '',
        thuTuHienThi: '',
        active: true
    };
    let catalog = null;
    let dsNhomSanPham = [];
    let dsDonViTinh = [];
    let currentRecord = {
        ...DEFAULT_VALUES
    };
    let currentMode = 'create';
    let exporting = false;
    let importing = false;
    initialize();
    async function initialize() {
        try {
            await loadSelectData();
            bindNumberFields();
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'san-pham',
                apiBase: API_BASE,
                permissionCodes: {
                    view: 'Q002021',
                    create: 'Q002022',
                    update: 'Q002023'
                },
                columns: [
                    textColumn('maSanPham', 'Mã sản phẩm', '160px'),
                    textColumn('tenSanPham', 'Tên sản phẩm', '240px'),
                    textColumn('tenNhomSanPham', 'Nhóm sản phẩm', '200px'),
                    textColumn('tenDonViTinh', 'Đơn vị tính', '140px'),
                    {
                        key: 'giaBan',
                        label: 'Giá bán',
                        width: '180px',
                        sortable: true,
                        filterable: true,
                        type: 'number',
                        className: 'catalog-table__cell--right',
                        render: formatPrice
                    },
                    booleanColumn('choPhepDat', 'Cho phép đặt'),
                    booleanColumn('active', 'Trạng thái')
                ],
                defaultValues: {
                    ...DEFAULT_VALUES
                },
                validation: {
                    maSanPham: {
                        label: 'Mã sản phẩm',
                        required: true,
                        unique: true,
                        maxLength: 50,
                        requiredMessage: 'Vui lòng nhập mã sản phẩm.',
                        uniqueMessage: 'Mã sản phẩm đã tồn tại.',
                        maxLengthMessage: 'Mã sản phẩm tối đa 50 ký tự.'
                    },
                    tenSanPham: {
                        label: 'Tên sản phẩm',
                        required: true,
                        maxLength: 255,
                        requiredMessage: 'Vui lòng nhập tên sản phẩm.',
                        maxLengthMessage: 'Tên sản phẩm tối đa 255 ký tự.'
                    },
                    nhomSanPhamId: {
                        label: 'Nhóm sản phẩm',
                        required: true,
                        requiredMessage: 'Vui lòng chọn nhóm sản phẩm.'
                    },
                    giaBan: {
                        label: 'Giá bán',
                        required: true,
                        requiredMessage: 'Vui lòng nhập giá bán.'
                    },
                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả tối đa 500 ký tự.'
                    }
                },
                detailTitle: 'Thông tin sản phẩm',
                createTitle: 'Thêm sản phẩm',
                updateTitle: 'Cập nhật sản phẩm',
                getRecordSubtitle(record) {
                    return record?.maSanPham || '';
                },
                mapListResponse: getRows,
                mapDetailResponse(result) {
                    return result?.data || null;
                },
                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maSanPham: record?.maSanPham ?? '',
                        tenSanPham: record?.tenSanPham ?? '',
                        nhomSanPhamId: record?.nhomSanPhamId ?? '',
                        donViTinhId: record?.donViTinhId ?? '',
                        giaBan: trimBackendDecimal(record?.giaBan ?? '0'),
                        hinhAnh: record?.hinhAnh ?? '',
                        moTa: record?.moTa ?? '',
                        soLuongToiThieu: trimBackendDecimal(record?.soLuongToiThieu ?? 1),
                        soLuongToiDa: trimBackendDecimal(record?.soLuongToiDa),
                        buocSoLuong: trimBackendDecimal(record?.buocSoLuong ?? 1),
                        thoiGianChuanBiPhut: record?.thoiGianChuanBiPhut ?? 0,
                        thuTuHienThi: record?.thuTuHienThi ?? 0,
                        choPhepDat: record?.choPhepDat === true,
                        laSanPhamMoi: record?.laSanPhamMoi === true,
                        laSanPhamNoiBat: record?.laSanPhamNoiBat === true,
                        active: record?.active === true
                    };
                },
                transformPayload,
                validate: validateForm,
                onRecordLoaded(record, mode) {
                    currentRecord = record
                        ? {
                              ...record
                          }
                        : {
                              ...DEFAULT_VALUES
                          };
                    currentMode = mode;
                    syncFormComponents();
                },
                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-san-pham',
                        label: 'Xuất danh mục sản phẩm',
                        icon: 'download',
                        permission: 'Q100001'
                    },
                    {
                        action: 'import-san-pham',
                        label: 'Nhập danh mục sản phẩm',
                        icon: 'upload',
                        permission: 'Q100002'
                    }
                ],
                onAction(action, id, catalogInstance) {
                    if (action === 'export-san-pham') {
                        void exportData();
                    }
                    if (action === 'import-san-pham') {
                        importData(catalogInstance);
                    }
                }
            });
            bindResetButton();
        } catch (error) {
            showError('Không thể khởi tạo danh mục sản phẩm.', error);
        }
    }

    function textColumn(key, label, width) {
        return {
            key,
            label,
            width,
            sortable: true,
            filterable: true
        };
    }

    function booleanColumn(key, label) {
        return {
            key,
            label,
            width: '140px',
            sortable: true,
            filterable: true,
            searchable: false,
            className: 'catalog-table__cell--center',
            isBoolean: true,
            trueLabel: 'TRUE',
            falseLabel: 'FALSE'
        };
    }

    function getRows(result) {
        if (Array.isArray(result?.data)) {
            return result.data;
        }
        return Array.isArray(result?.data?.items) ? result.data.items : [];
    }

    function showError(message, error) {
        console.error(message, error);
        window.MCS.toast?.error(error?.message || message);
    }
    // --------------------------------------------------
    // DANH MỤC SELECT
    // --------------------------------------------------
    async function loadSelectData() {
        const [nhomResult, donViResult] = await Promise.all([
            window.MCS.api.request('/api/mcs/v1/dm-nhom-san-pham/tong-hop?active=true'),
            window.MCS.api.request('/api/mcs/v1/dm-don-vi-tinh/tong-hop?active=true')
        ]);
        dsNhomSanPham = getRows(nhomResult).filter((item) => item.active === true);
        dsDonViTinh = getRows(donViResult).filter((item) => item.active === true);
        renderSelect('nhomSanPhamId', dsNhomSanPham, 'tenNhomSanPham', '');
        renderSelect('donViTinhId', dsDonViTinh, 'tenDonViTinh', '');
    }

    function renderSelect(id, items, labelKey, selectedValue) {
        const select = document.getElementById(id);
        if (!select) {
            return;
        }
        const selected = String(selectedValue ?? '');
        select.replaceChildren();
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        select.appendChild(emptyOption);
        for (const item of items) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = String(item[labelKey] ?? item.ten ?? item.name ?? '');
            select.appendChild(option);
        }
        select.value = selected;
        const root = select.closest('[data-smart-select]');
        const instance = window.MCS.smartSelect.initialize(root);
        instance?.refresh();
        instance?.setDisabled(currentMode === 'view');
    }
    // --------------------------------------------------
    // SỐ: HIỂN THỊ VI-VN / PAYLOAD CHUẨN
    // --------------------------------------------------

    function trimBackendDecimal(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        return String(value)
            .trim()
            .replace(/^0+(?=\d)/, '')
            .replace(/(\.\d*?)0+$/, '$1')
            .replace(/\.$/, '');
    }

    function normalizeDisplayNumber(value) {
        return window.MCS.numberInput.normalizeValue(value);
    }

    function readInteger(value, fallback = null) {
        const normalized = normalizeDisplayNumber(value);
        return normalized === '' ? fallback : Number(normalized);
    }

    function readId(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        return Number(value);
    }

    function formatPrice(value) {
        if (value === null || value === undefined || value === '') {
            return '—';
        }
        return window.MCS.numberInput.formatValue(trimBackendDecimal(value), false);
    }

    function bindNumberFields() {
        for (const [id, rule] of Object.entries(NUMBER_RULES)) {
            const input = document.getElementById(id);
            if (!input || input.dataset.productNumberBound === 'true') {
                continue;
            }
            window.MCS.numberInput.initialize(input);
            input.dataset.productNumberBound = 'true';
            input.addEventListener('beforeinput', (event) => {
                if (!event.data) {
                    return;
                }
                const invalid = rule.integer ? /[^\d.]/ : /[^\d.,]/;
                if (invalid.test(event.data)) {
                    event.preventDefault();
                }
            });
            input.addEventListener('paste', (event) => {
                const text = event.clipboardData?.getData('text').trim() ?? '';
                const pattern = rule.integer
                    ? /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/
                    : /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d*)?$/;
                if (!pattern.test(text)) {
                    event.preventDefault();
                    window.MCS.toast?.error(
                        rule.integer
                            ? `${rule.label} chỉ nhận số nguyên.`
                            : 'Dùng dấu chấm hàng nghìn và dấu phẩy thập phân.'
                    );
                }
            });
            // Capture: xử lý trước listener input của component chung.
            input.addEventListener('input', () => formatEnteredNumber(input, rule), true);
        }
    }

    function formatEnteredNumber(input, rule) {
        const raw = input.value.replace(/\s/g, '');
        if (!raw) {
            input.value = '';
            return;
        }
        const commaIndex = raw.indexOf(',');
        let whole = (commaIndex < 0 ? raw : raw.slice(0, commaIndex))
            .replace(/\D/g, '')
            .replace(/^0+(?=\d)/, '')
            .slice(0, 12);
        let value;
        if (rule.integer) {
            if (whole && Number(whole) > rule.max) {
                whole = String(rule.max);
            }
            value = whole;
        } else {
            const fraction =
                commaIndex < 0
                    ? null
                    : raw
                          .slice(commaIndex + 1)
                          .replace(/\D/g, '')
                          .slice(0, 5);
            value = fraction === null ? whole : `${whole || '0'},${fraction}`;
        }
        const formatted = window.MCS.numberInput.formatInputValue(value, rule.integer, false);
        if (formatted !== input.value) {
            const oldLength = input.value.length;
            const oldCursor = input.selectionStart ?? oldLength;
            input.value = formatted;
            const cursor = Math.max(0, Math.min(formatted.length, oldCursor + formatted.length - oldLength));
            input.setSelectionRange(cursor, cursor);
        }
    }
    // --------------------------------------------------
    // ẢNH
    // --------------------------------------------------

    function getImagePicker() {
        const root = document.querySelector('#sanPhamForm [data-image-picker]');
        return root ? window.MCS.imagePicker.initialize(root) : null;
    }

    function syncImageField(value, mode) {
        const root = document.querySelector('#sanPhamForm [data-image-picker]');
        if (!root) {
            return;
        }
        root.style.setProperty('--image-picker-width', '100px');
        root.style.setProperty('--image-picker-height', '100px');
        const preview = root.querySelector('[data-image-picker-preview]');
        for (const element of [root, preview]) {
            if (!element) {
                continue;
            }
            Object.assign(element.style, {
                width: '100px',
                minWidth: '100px',
                maxWidth: '100px',
                height: '100px',
                minHeight: '100px',
                maxHeight: '100px',
                flex: '0 0 100px'
            });
        }
        if (preview) {
            preview.style.overflow = 'hidden';
        }
        const image = root.querySelector('[data-image-picker-image]');
        if (image) {
            Object.assign(image.style, {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            });
        }
        const picker = getImagePicker();
        picker?.setValue(value || '');
        picker?.setDisabled(mode === 'view');
    }
    // --------------------------------------------------
    // FORM / PAYLOAD / VALIDATION
    // --------------------------------------------------

    function transformPayload(f) {
        const picker = getImagePicker();
        const file = picker?.getFile() || null;
        // FormData chung bỏ qua null:
        // dùng "" khi có file để BE nhận được yêu cầu xóa field.
        const emptyValue = file ? '' : null;
        return {
            maSanPham: String(f.maSanPham || '')
                .trim()
                .toUpperCase(),
            tenSanPham: String(f.tenSanPham || '').trim(),
            nhomSanPhamId: readId(f.nhomSanPhamId),
            donViTinhId: readId(f.donViTinhId) ?? emptyValue,
            // Giữ chuỗi để không mất độ chính xác numeric(18,6).
            giaBan: normalizeDisplayNumber(f.giaBan),
            soLuongToiThieu: readInteger(f.soLuongToiThieu, 1),
            soLuongToiDa: readInteger(f.soLuongToiDa) ?? emptyValue,
            buocSoLuong: readInteger(f.buocSoLuong, 1),
            thoiGianChuanBiPhut: readInteger(f.thoiGianChuanBiPhut, 0),
            thuTuHienThi: readInteger(f.thuTuHienThi, 0),
            moTa: String(f.moTa || '').trim() || emptyValue,
            hinhAnh: file || (picker?.isRemoved() ? emptyValue : picker?.getExistingUrl() || emptyValue),
            choPhepDat: f.choPhepDat === true,
            laSanPhamMoi: f.laSanPhamMoi === true,
            laSanPhamNoiBat: f.laSanPhamNoiBat === true,
            active: f.active === true
        };
    }

    function validateForm(f) {
        const errors = {};
        if (
            !Number.isSafeInteger(f.nhomSanPhamId) ||
            f.nhomSanPhamId <= 0 ||
            !dsNhomSanPham.some((item) => String(item.id) === String(f.nhomSanPhamId))
        ) {
            errors.nhomSanPhamId = 'Vui lòng chọn nhóm sản phẩm đang hoạt động.';
        }
        if (
            f.donViTinhId !== null &&
            f.donViTinhId !== '' &&
            (!Number.isSafeInteger(f.donViTinhId) ||
                f.donViTinhId <= 0 ||
                !dsDonViTinh.some((item) => String(item.id) === String(f.donViTinhId)))
        ) {
            errors.donViTinhId = 'Đơn vị tính không hợp lệ hoặc đã ngừng hoạt động.';
        }
        if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,5})?$/.test(f.giaBan)) {
            errors.giaBan = 'Giá bán phải không âm, tối đa 12 chữ số phần nguyên ' + 'và 5 chữ số sau dấu phẩy.';
        }
        for (const [id, rule] of Object.entries(NUMBER_RULES)) {
            if (!rule.integer) {
                continue;
            }
            const value = f[id];
            if (rule.nullable && (value === null || value === '')) {
                continue;
            }
            if (!Number.isSafeInteger(value) || value < rule.min || value > rule.max) {
                errors[id] = `${rule.label} phải là số nguyên từ ` + `${rule.min} đến ${rule.max}.`;
            }
        }
        if (f.soLuongToiDa !== null && f.soLuongToiDa !== '' && f.soLuongToiDa < f.soLuongToiThieu) {
            errors.soLuongToiDa = 'Số lượng tối đa phải lớn hơn hoặc bằng số lượng tối thiểu.';
        }
        const file = getImagePicker()?.getFile();
        if (file) {
            if (!IMAGE_TYPES.includes(file.type)) {
                errors.hinhAnh = 'Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.';
            } else if (file.size > MAX_IMAGE_SIZE) {
                errors.hinhAnh = 'Dung lượng ảnh không được vượt quá 5 MB.';
            }
        }
        return errors;
    }

    function syncFormComponents() {
        const record = currentRecord || DEFAULT_VALUES;
        renderSelect('nhomSanPhamId', dsNhomSanPham, 'tenNhomSanPham', record.nhomSanPhamId);
        renderSelect('donViTinhId', dsDonViTinh, 'tenDonViTinh', record.donViTinhId);
        for (const [id, rule] of Object.entries(NUMBER_RULES)) {
            const input = document.getElementById(id);
            if (!input) {
                continue;
            }
            const value = trimBackendDecimal(record[id] ?? rule.defaultValue);
            // Format từ giá trị BE, không parse ngược chuỗi hiển thị.
            // Dùng false để không nối nhầm phần lẻ của dữ liệu cũ.
            input.value = value === '' ? '' : window.MCS.numberInput.formatValue(value, false);
        }
        syncImageField(record.hinhAnh, currentMode);
    }

    function bindResetButton() {
        const form = document.getElementById('sanPhamForm');
        const resetButton = form?.querySelector('[data-form-reset]');
        resetButton?.addEventListener('click', () => {
            window.setTimeout(syncFormComponents, 0);
        });
    }
    // --------------------------------------------------
    // EXPORT
    // --------------------------------------------------
    async function exportData() {
        if (exporting) {
            return;
        }
        exporting = true;
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });
            window.MCS.api.downloadBlob(result.blob, result.fileName || FILE_NAME);
            window.MCS.toast?.success('Xuất danh mục sản phẩm thành công.');
        } catch (error) {
            showError('Không thể xuất danh mục sản phẩm.', error);
        } finally {
            exporting = false;
        }
    }
    // --------------------------------------------------
    // IMPORT
    // --------------------------------------------------

    function importData(catalogInstance) {
        if (importing) {
            return;
        }
        importing = true;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';
        input.hidden = true;
        document.body.appendChild(input);

        function cleanup() {
            importing = false;
            input.remove();
        }
        input.addEventListener('cancel', cleanup, {
            once: true
        });
        input.addEventListener(
            'change',
            async () => {
                const file = input.files?.[0];
                if (!file) {
                    cleanup();
                    return;
                }
                try {
                    if (!/\.xlsx$/i.test(file.name)) {
                        throw new Error('Chỉ hỗ trợ file Excel .xlsx.');
                    }
                    if (file.size > MAX_EXCEL_SIZE) {
                        throw new Error('File import không được vượt quá 10 MB.');
                    }
                    const body = new FormData();
                    body.append('file', file);
                    const result = await window.MCS.api.requestFile(`${API_BASE}/import-du-lieu`, {
                        method: 'POST',
                        body
                    });
                    window.MCS.api.downloadBlob(result.blob, result.fileName || FILE_NAME);
                    window.MCS.toast?.success(
                        'Đã xử lý import. Vui lòng xem file kết quả ' + 'để biết các dòng thành công hoặc lỗi.'
                    );
                    try {
                        await (catalogInstance || catalog)?.load();
                    } catch (error) {
                        showError('Import đã xử lý nhưng chưa tải lại được bảng.', error);
                    }
                } catch (error) {
                    showError('Không thể nhập danh mục sản phẩm.', error);
                } finally {
                    cleanup();
                }
            },
            {
                once: true
            }
        );
        input.click();
    }
});

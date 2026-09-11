'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = '/api/mcs/v1/dm-voucher-don-hang';

    const LOAI_GIAM = {
        PHAN_TRAM: 10,
        SO_TIEN: 20
    };

    const PHAM_VI = {
        TOAN_BO: 10,
        NHOM_SAN_PHAM: 20,
        SAN_PHAM: 30
    };

    const DECIMAL_SCALE = 5;

    const API = {
        loaiGiam: '/api/mcs/v1/enums?name=loaiGiamVoucherDonHang',

        phamViApDung: '/api/mcs/v1/enums?name=phamViApDungVoucherDonHang',

        nhomSanPham: '/api/mcs/v1/dm-nhom-san-pham/tong-hop?active=true',

        sanPham: '/api/mcs/v1/dm-san-pham/tong-hop?active=true',

        coSo: '/api/mcs/v1/dm-co-so/tong-hop?active=true',

        nhaAn: '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

        chucVu: '/api/mcs/v1/dm-chuc-vu/tong-hop?active=true',

        nhanVien: '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true'
    };

    let dsLoaiGiam = [];
    let dsPhamViApDung = [];

    const doiTuongOptions = {
        coSo: [],
        nhaAn: [],
        chucVu: [],
        nhanVien: []
    };

    let dangLocDoiTuong = false;

    const FALLBACK_LOAI_GIAM = [
        {
            value: LOAI_GIAM.PHAN_TRAM,
            label: 'Phần trăm'
        },
        {
            value: LOAI_GIAM.SO_TIEN,
            label: 'Số tiền cố định'
        }
    ];

    const FALLBACK_PHAM_VI_AP_DUNG = [
        {
            value: PHAM_VI.TOAN_BO,
            label: 'Toàn bộ đơn hàng'
        },
        {
            value: PHAM_VI.NHOM_SAN_PHAM,
            label: 'Nhóm sản phẩm'
        },
        {
            value: PHAM_VI.SAN_PHAM,
            label: 'Sản phẩm cụ thể'
        }
    ];

    initialize();

    async function initialize() {
        try {
            await Promise.all([
                loadEnums(),
                loadSelectOptions(
                    'nhomSanPhamId',
                    API.nhomSanPham,
                    (item) => `${item.maNhomSanPham || ''} - ${item.tenNhomSanPham || ''}`
                ),
                loadSelectOptions(
                    'sanPhamId',
                    API.sanPham,
                    (item) => `${item.maSanPham || ''} - ${item.tenSanPham || ''}`
                ),
                loadSelectOptions(
                    'coSoIds',
                    API.coSo,
                    (item) => `${item.maCoSo || ''} - ${item.tenCoSo || ''}`,
                    'coSo'
                ),
                loadSelectOptions(
                    'nhaAnIds',
                    API.nhaAn,
                    (item) => `${item.maNhaAn || ''} - ${item.tenNhaAn || ''}`,
                    'nhaAn'
                ),
                loadSelectOptions(
                    'chucVuIds',
                    API.chucVu,
                    (item) => `${item.maChucVu || ''} - ${item.tenChucVu || ''}`,
                    'chucVu'
                ),
                loadSelectOptions(
                    'nhanVienIds',
                    API.nhanVien,
                    (item) => `${item.maNhanVien || ''} - ${item.hoTen || ''}`,
                    'nhanVien'
                )
            ]);

            await initializeCatalog();

            bindEvents();
            syncGiaTriField();
            syncPhamViApDung();
            applyDoiTuongFilters();
        } catch (error) {
            console.error('Không thể khởi tạo voucher đơn hàng.', error);

            window.MCS?.toast?.error?.(error?.message || 'Không thể tải dữ liệu voucher đơn hàng.');
        }
    }

    async function loadEnums() {
        const [loaiGiamResult, phamViResult] = await Promise.allSettled([
            window.MCS.api.request(API.loaiGiam),
            window.MCS.api.request(API.phamViApDung)
        ]);

        if (loaiGiamResult.status === 'rejected') {
            console.error(`Không thể tải enum ${API.loaiGiam}.`, loaiGiamResult.reason);
        }

        if (phamViResult.status === 'rejected') {
            console.error(`Không thể tải enum ${API.phamViApDung}.`, phamViResult.reason);
        }

        dsLoaiGiam = normalizeEnumData(loaiGiamResult.status === 'fulfilled' ? loaiGiamResult.value?.data : []).filter(
            (item) => [LOAI_GIAM.PHAN_TRAM, LOAI_GIAM.SO_TIEN].includes(Number(item.value))
        );

        dsPhamViApDung = normalizeEnumData(phamViResult.status === 'fulfilled' ? phamViResult.value?.data : []).filter(
            (item) => [PHAM_VI.TOAN_BO, PHAM_VI.NHOM_SAN_PHAM, PHAM_VI.SAN_PHAM].includes(Number(item.value))
        );

        if (dsLoaiGiam.length === 0) {
            dsLoaiGiam = [...FALLBACK_LOAI_GIAM];
        }

        if (dsPhamViApDung.length === 0) {
            dsPhamViApDung = [...FALLBACK_PHAM_VI_AP_DUNG];
        }

        renderSelect(
            'loaiGiam',
            dsLoaiGiam.map((item) => ({
                ...item,
                label: Number(item.value) === LOAI_GIAM.PHAN_TRAM ? 'Phần trăm' : 'Số tiền'
            }))
        );

        renderSelect('phamViApDung', dsPhamViApDung);
    }

    async function loadSelectOptions(selectId, url, getLabel, optionKey = null) {
        try {
            const response = await window.MCS.api.request(url);

            const records = normalizeRecords(response?.data).filter((item) => item?.active === true);

            if (optionKey) {
                doiTuongOptions[optionKey] = records;
            }

            renderOptions(selectId, records, getLabel);
        } catch (error) {
            console.error(`Không thể tải dữ liệu select ${selectId}.`, error);

            renderOptions(selectId, [], () => '');

            if (optionKey) {
                doiTuongOptions[optionKey] = [];
            }
        }
    }

    function normalizeRecords(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.items)) {
            return data.items;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    }

    function normalizeEnumData(data) {
        return normalizeRecords(data).map((item) => ({
            value: item.value,
            label: item.label ?? item.name ?? item.ten ?? String(item.value)
        }));
    }

    function renderSelect(selectId, items) {
        renderOptions(selectId, items, (item) => item.label);
    }

    function renderOptions(selectId, items, getLabel) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.innerHTML = '';

        if (select.multiple) {
            const allOption = document.createElement('option');

            allOption.value = '__ALL__';
            allOption.textContent = select.closest('[data-smart-select]')?.dataset.selectAllLabel || 'Tất cả';
            allOption.dataset.optionAll = 'true';

            select.appendChild(allOption);
        } else {
            const emptyOption = document.createElement('option');

            emptyOption.value = '';
            emptyOption.textContent = '';

            select.appendChild(emptyOption);
        }

        items.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value ?? item.id);

            option.textContent = String(getLabel(item) || '').trim();

            select.appendChild(option);
        });

        const root = select.closest('[data-smart-select]');

        const smartSelect = window.MCS.smartSelect.initialize(root);

        smartSelect?.refresh?.();
    }

    async function initializeCatalog() {
        await window.MCS.pages.createCatalogPage({
            moduleName: 'voucher-don-hang',

            permissionCodes: {
                view: ['Q000034', 'Q002031'],
                create: 'Q002032',
                update: 'Q002033'
            },

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
                    key: 'loaiGiam',
                    label: 'Loại giảm',
                    sortable: true,
                    filterable: true,
                    render: (value) => getEnumLabel(dsLoaiGiam, value)
                },
                {
                    key: 'giaTri',
                    label: 'Giá trị',
                    sortable: true,
                    filterable: true,
                    render: (value, record) => formatGiaTri(value, record?.loaiGiam)
                },
                {
                    key: 'phamViApDung',
                    label: 'Phạm vi áp dụng',
                    sortable: true,
                    filterable: true,
                    render: (value) => getEnumLabel(dsPhamViApDung, value)
                },
                {
                    key: 'thoiGianBatDau',
                    label: 'Bắt đầu',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    filterable: true,
                    render: formatDateTime
                },
                {
                    key: 'thoiGianKetThuc',
                    label: 'Kết thúc',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    filterable: true,
                    render: formatDateTime
                },
                {
                    key: 'choPhepDungChung',
                    label: 'Cho phép SD chung',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    render: window.createStatusBadge
                },
                {
                    key: 'tuDongApDung',
                    label: 'Tự động áp dụng',
                    sortable: true,
                    className: 'catalog-table__cell--center',
                    render: window.createStatusBadge
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
                loaiGiam: '',
                giaTri: '',
                giamToiDa: '',
                giaTriDonHangToiThieu: '',
                soLuongPhatHanh: '',
                soLuotMoiNhanVien: '',
                phamViApDung: PHAM_VI.TOAN_BO,

                nhomSanPhamId: '',
                sanPhamId: '',

                nhomSanPhamIds: [],
                sanPhamIds: [],
                coSoIds: [],
                nhaAnIds: [],
                chucVuIds: [],
                nhanVienIds: [],

                choPhepDungChung: true,
                tuDongApDung: true,
                thoiGianBatDau: '',
                thoiGianKetThuc: '',
                moTa: '',
                active: true
            },

            validation: {
                maVoucher: {
                    label: 'Mã voucher',
                    required: true,
                    maxLength: 50,
                    unique: true,
                    uniqueMessage: 'Mã voucher đã tồn tại.'
                },

                tenVoucher: {
                    label: 'Tên voucher',
                    required: true,
                    maxLength: 255,
                    unique: true,
                    uniqueMessage: 'Tên voucher đã tồn tại.'
                },

                loaiGiam: {
                    label: 'Loại giảm',
                    required: true
                },

                giaTri: {
                    label: 'Giá trị',
                    required: true
                },

                phamViApDung: {
                    label: 'Phạm vi áp dụng',
                    required: true
                },

                thoiGianBatDau: {
                    label: 'Thời gian bắt đầu',
                    required: true
                },

                thoiGianKetThuc: {
                    label: 'Thời gian kết thúc',
                    required: true
                }
            },

            validate(formData) {
                return validateFormData(formData);
            },

            detailTitle: 'Thông tin voucher đơn hàng',

            createTitle: 'Thêm voucher đơn hàng',

            updateTitle: 'Cập nhật voucher đơn hàng',

            mapListResponse(result) {
                return Array.isArray(result?.data) ? result.data : normalizeRecords(result?.data);
            },

            mapDetailResponse(result) {
                return result?.data || null;
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? '',
                    maVoucher: record?.maVoucher || '',
                    tenVoucher: record?.tenVoucher || '',
                    loaiGiam: record?.loaiGiam ?? '',
                    giaTri: record?.giaTri ?? '',
                    giamToiDa: record?.giamToiDa ?? '',
                    giaTriDonHangToiThieu: record?.giaTriDonHangToiThieu ?? '',
                    soLuongPhatHanh: record?.soLuongPhatHanh ?? '',
                    soLuotMoiNhanVien: record?.soLuotMoiNhanVien ?? '',
                    phamViApDung: record?.phamViApDung ?? PHAM_VI.TOAN_BO,

                    nhomSanPhamId: firstId(record?.nhomSanPhamIds),

                    sanPhamId: firstId(record?.sanPhamIds),

                    nhomSanPhamIds: normalizeIds(record?.nhomSanPhamIds),

                    sanPhamIds: normalizeIds(record?.sanPhamIds),

                    coSoIds: normalizeIds(record?.coSoIds),

                    nhaAnIds: normalizeIds(record?.nhaAnIds),

                    chucVuIds: normalizeIds(record?.chucVuIds),

                    nhanVienIds: normalizeIds(record?.nhanVienIds),

                    choPhepDungChung: record?.choPhepDungChung === true,

                    tuDongApDung: record?.tuDongApDung === true,

                    thoiGianBatDau: record?.thoiGianBatDau || '',

                    thoiGianKetThuc: record?.thoiGianKetThuc || '',

                    moTa: record?.moTa || '',

                    active: record?.active === true
                };
            },

            onRecordLoaded(record) {
                syncSelectValue('loaiGiam', record?.loaiGiam);

                syncSelectValue('phamViApDung', record?.phamViApDung);

                syncSelectValue('nhomSanPhamId', firstId(record?.nhomSanPhamIds));

                syncSelectValue('sanPhamId', firstId(record?.sanPhamIds));

                syncSelectValues('coSoIds', record?.coSoIds);

                syncSelectValues('nhaAnIds', record?.nhaAnIds);

                syncSelectValues('chucVuIds', record?.chucVuIds);

                syncSelectValues('nhanVienIds', record?.nhanVienIds);

                syncNumberField('giaTri', record?.giaTri);

                syncNumberField('giamToiDa', record?.giamToiDa);

                syncNumberField('giaTriDonHangToiThieu', record?.giaTriDonHangToiThieu);

                syncNumberField('soLuongPhatHanh', record?.soLuongPhatHanh);

                syncNumberField('soLuotMoiNhanVien', record?.soLuotMoiNhanVien);

                syncDateField('thoiGianBatDau', record?.thoiGianBatDau);

                syncDateField('thoiGianKetThuc', record?.thoiGianKetThuc);

                syncGiaTriField(record?.loaiGiam ?? '');
                syncPhamViApDung();
                applyDoiTuongFilters();
            },

            transformPayload(formData) {
                const phamViApDung = toNullableNumber(formData.phamViApDung);

                return {
                    maVoucher: String(formData.maVoucher || '')
                        .trim()
                        .toUpperCase(),

                    tenVoucher: String(formData.tenVoucher || '').trim(),

                    loaiGiam: toNullableNumber(formData.loaiGiam),

                    giaTri: toApiDecimal(formData.giaTri),

                    giamToiDa: toApiDecimal(formData.giamToiDa),

                    giaTriDonHangToiThieu: toApiDecimal(formData.giaTriDonHangToiThieu) ?? '0',

                    soLuongPhatHanh: parseOptionalInteger(formData.soLuongPhatHanh),

                    soLuotMoiNhanVien: parseOptionalInteger(formData.soLuotMoiNhanVien),

                    phamViApDung,

                    nhomSanPhamIds: phamViApDung === PHAM_VI.NHOM_SAN_PHAM ? toIds(formData.nhomSanPhamId) : [],

                    sanPhamIds: phamViApDung === PHAM_VI.SAN_PHAM ? toIds(formData.sanPhamId) : [],

                    coSoIds: normalizeIds(getSmartSelectValues('coSoIds')),

                    nhaAnIds: normalizeIds(getSmartSelectValues('nhaAnIds')),

                    chucVuIds: normalizeIds(getSmartSelectValues('chucVuIds')),

                    nhanVienIds: normalizeIds(getSmartSelectValues('nhanVienIds')),

                    choPhepDungChung: formData.choPhepDungChung === true,

                    tuDongApDung: formData.tuDongApDung === true,

                    thoiGianBatDau: toApiDateTime(formData.thoiGianBatDau, '00:00:00'),

                    thoiGianKetThuc: toApiDateTime(formData.thoiGianKetThuc, '23:59:59'),

                    moTa: normalizeNullableText(formData.moTa),

                    active: formData.active === true
                };
            },

            getRecordSubtitle(record) {
                return record?.maVoucher || '';
            },

            toolbarActions: [
                {
                    action: 'filter',
                    label: 'Tìm kiếm chi tiết',
                    icon: 'search'
                },
                {
                    action: 'export-voucher-don-hang',
                    label: 'Xuất danh mục voucher đơn hàng',
                    icon: 'download',
                    permission: 'Q100001'
                },
                {
                    action: 'import-voucher-don-hang',
                    label: 'Nhập danh mục voucher đơn hàng',
                    icon: 'upload',
                    permission: 'Q100002'
                }
            ],

            onAction(action, id, catalogInstance) {
                if (action === 'export-voucher-don-hang') {
                    return exportData();
                }

                if (action === 'import-voucher-don-hang') {
                    return importData(catalogInstance);
                }
            }
        });
    }

    function bindEvents() {
        const loaiGiam = document.getElementById('loaiGiam');

        loaiGiam?.addEventListener('change', (event) => {
            syncGiaTriField(event.target.value);
        });

        bindSmartSelectChange('phamViApDung', syncPhamViApDung);

        ['coSoIds', 'nhaAnIds', 'chucVuIds', 'nhanVienIds'].forEach((id) => {
            bindSmartSelectChange(id, applyDoiTuongFilters);
        });

        bindGiaTriRules();
    }

    function bindSmartSelectChange(selectId, callback) {
        const select = document.getElementById(selectId);

        const root = select?.closest('[data-smart-select]');

        if (!select || !root) {
            return;
        }

        root.addEventListener('smart-select:change', callback);

        select.addEventListener('change', (event) => {
            if (!event.detail) {
                callback();
            }
        });
    }

    function bindGiaTriRules() {
        ['giaTri', 'giamToiDa', 'giaTriDonHangToiThieu', 'soLuongPhatHanh', 'soLuotMoiNhanVien'].forEach((id) => {
            const input = document.getElementById(id);

            if (!input || input.dataset.voucherNumberBound === 'true') {
                return;
            }

            window.MCS.numberInput.initialize(input);
            input.dataset.voucherNumberBound = 'true';

            const applyRules = () => {
                if (!input.disabled && !input.readOnly) {
                    normalizeNumberInput(input);
                }
            };

            // Giới hạn dữ liệu trước khi bộ nhập số chung định dạng.
            input.addEventListener('input', applyRules, true);
            input.addEventListener('blur', applyRules, true);
        });
    }

    function syncGiaTriField(explicitLoaiGiam) {
        const input = document.getElementById('giaTri');
        if (!input) return;

        const field = input.closest('[data-form-field]');
        if (!field) return;

        const selectedValue =
            explicitLoaiGiam === undefined ? document.getElementById('loaiGiam')?.value : explicitLoaiGiam;

        const loaiGiam = toNullableNumber(selectedValue);
        const isPercent = loaiGiam === LOAI_GIAM.PHAN_TRAM;
        const isMoney = loaiGiam === LOAI_GIAM.SO_TIEN;

        let suffix = field.querySelector('.form-field__suffix');

        if (!suffix) {
            const control = field.querySelector('.form-field__control');

            if (control) {
                suffix = document.createElement('span');
                suffix.className = 'form-field__suffix';
                control.appendChild(suffix);
            }
        }

        // Chưa chọn hoặc giá trị không hợp lệ: luôn khóa và xóa giá trị.
        if (!isPercent && !isMoney) {
            input.disabled = true;
            input.placeholder = 'Chọn loại miễn giảm trước';
            input.min = '0';
            input.step = 'any';
            input.removeAttribute('max');

            if (suffix) {
                suffix.textContent = '';
            }

            setNumberValue(input, '');
            refreshNumberField(field);
            return;
        }

        // Chỉ mở khi thêm/sửa; xem chi tiết vẫn giữ khóa.
        const isView = input.closest('[data-detail-panel]')?.dataset.mode === 'view';

        input.disabled = isView;
        input.readOnly = isView;
        input.placeholder = 'Nhập giá trị';

        if (isPercent) {
            input.min = '0.00001';
            input.max = '100';
            input.step = '0.00001';

            if (suffix) {
                suffix.textContent = '%';
            }

            const value = getInputNumber(input);

            if (value !== null && value > 100) {
                setNumberValue(input, 100);
            }
        } else {
            input.min = '0';
            input.step = 'any';
            input.removeAttribute('max');

            if (suffix) {
                suffix.textContent = 'VND';
            }
        }

        refreshNumberField(field);
    }

    function syncPhamViApDung() {
        let scope = toNullableNumber(getSmartSelectValue('phamViApDung'));

        if (scope === null) {
            scope = PHAM_VI.TOAN_BO;
            syncSelectValue('phamViApDung', scope);
        }

        const visibleField =
            scope === PHAM_VI.NHOM_SAN_PHAM ? 'nhomSanPhamId' : scope === PHAM_VI.SAN_PHAM ? 'sanPhamId' : null;

        document.querySelectorAll('[data-voucher-scope-wrapper]').forEach((wrapper) => {
            const key = wrapper.dataset.voucherScopeWrapper;

            const visible = key === 'all' ? scope === PHAM_VI.TOAN_BO : key === visibleField;

            wrapper.hidden = !visible;

            if (key === 'all') {
                return;
            }

            const smartSelect = getSmartSelect(key);

            smartSelect?.setDisabled(!visible);

            if (!visible) {
                smartSelect?.clear?.(false);
            }

            if (visible) {
                smartSelect?.refresh?.();
            }
        });
    }

    function applyDoiTuongFilters() {
        if (dangLocDoiTuong) {
            return;
        }

        dangLocDoiTuong = true;

        try {
            const selected = {
                coSoIds: getSmartSelectValues('coSoIds'),
                nhaAnIds: getSmartSelectValues('nhaAnIds'),
                chucVuIds: getSmartSelectValues('chucVuIds'),
                nhanVienIds: getSmartSelectValues('nhanVienIds')
            };

            const coSoSet = new Set(selected.coSoIds);
            const nhaAnSet = new Set(selected.nhaAnIds);
            const chucVuSet = new Set(selected.chucVuIds);
            const nhanVienSet = new Set(selected.nhanVienIds);

            const nhanVienTheoNhaAn = new Set(
                doiTuongOptions.nhaAn
                    .filter((item) => nhaAnSet.has(Number(item.id)))
                    .flatMap((item) => getNhaAnNhanVienIds(item))
            );

            const nhaAnTheoNhanVien = new Set(
                doiTuongOptions.nhaAn
                    .filter((item) => getNhaAnNhanVienIds(item).some((id) => nhanVienSet.has(id)))
                    .map((item) => Number(item.id))
            );

            const coSoTheoNhanVien = new Set(
                doiTuongOptions.nhanVien
                    .filter((item) => nhanVienSet.has(Number(item.id)))
                    .map((item) => Number(item.coSoId))
                    .filter(Number.isInteger)
            );

            const chucVuTheoNhanVien = new Set(
                doiTuongOptions.nhanVien
                    .filter((item) => nhanVienSet.has(Number(item.id)))
                    .map((item) => Number(item.chucVuId))
                    .filter(Number.isInteger)
            );

            const filtered = {
                coSo: doiTuongOptions.coSo.filter(
                    (item) =>
                        (!nhaAnSet.size ||
                            doiTuongOptions.nhaAn.some(
                                (nhaAn) => nhaAnSet.has(Number(nhaAn.id)) && Number(nhaAn.coSoId) === Number(item.id)
                            )) &&
                        (!nhanVienSet.size || coSoTheoNhanVien.has(Number(item.id)))
                ),

                nhaAn: doiTuongOptions.nhaAn.filter(
                    (item) =>
                        (!coSoSet.size || coSoSet.has(Number(item.coSoId))) &&
                        (!nhanVienSet.size || nhaAnTheoNhanVien.has(Number(item.id)))
                ),

                chucVu: doiTuongOptions.chucVu.filter(
                    (item) => !nhanVienSet.size || chucVuTheoNhanVien.has(Number(item.id))
                ),

                nhanVien: doiTuongOptions.nhanVien.filter(
                    (item) =>
                        (!coSoSet.size || coSoSet.has(Number(item.coSoId))) &&
                        (!nhaAnSet.size || nhanVienTheoNhaAn.has(Number(item.id))) &&
                        (!chucVuSet.size || chucVuSet.has(Number(item.chucVuId))) &&
                        (!nhanVienSet.size || nhanVienSet.has(Number(item.id)))
                )
            };

            const selectedByField = {
                coSoIds: selected.coSoIds,
                nhaAnIds: selected.nhaAnIds,
                chucVuIds: selected.chucVuIds,
                nhanVienIds: selected.nhanVienIds
            };

            renderFilteredDoiTuong(
                'coSoIds',
                filtered.coSo,
                (item) => `${item.maCoSo || ''} - ${item.tenCoSo || ''}`,
                selectedByField.coSoIds
            );

            renderFilteredDoiTuong(
                'nhaAnIds',
                filtered.nhaAn,
                (item) => `${item.maNhaAn || ''} - ${item.tenNhaAn || ''}`,
                selectedByField.nhaAnIds
            );

            renderFilteredDoiTuong(
                'chucVuIds',
                filtered.chucVu,
                (item) => `${item.maChucVu || ''} - ${item.tenChucVu || ''}`,
                selectedByField.chucVuIds
            );

            renderFilteredDoiTuong(
                'nhanVienIds',
                filtered.nhanVien,
                (item) => `${item.maNhanVien || ''} - ${item.hoTen || ''}`,
                selectedByField.nhanVienIds
            );
        } finally {
            dangLocDoiTuong = false;
        }
    }

    function renderFilteredDoiTuong(selectId, records, getLabel, selectedValues) {
        const validIds = new Set(records.map((item) => Number(item.id)));

        const values = normalizeIds(selectedValues).filter((id) => validIds.has(id));

        renderOptions(selectId, records, getLabel);

        syncSelectValues(selectId, values);
    }

    function getNhaAnNhanVienIds(item) {
        if (Array.isArray(item?.dsNvQuanLyId)) {
            return normalizeIds(item.dsNvQuanLyId);
        }

        if (Array.isArray(item?.dsNvQuanLy)) {
            return normalizeIds(item.dsNvQuanLy.map((nhanVien) => nhanVien?.id));
        }

        return [];
    }

    function validateFormData(data) {
        const errors = {};

        const loaiGiam = toNullableNumber(data.loaiGiam);

        const giaTri = getInputNumber(document.getElementById('giaTri'));

        if (loaiGiam !== LOAI_GIAM.PHAN_TRAM && loaiGiam !== LOAI_GIAM.SO_TIEN) {
            errors.loaiGiam = 'Chỉ được chọn Phần trăm hoặc Số tiền cố định.';
        }

        if (giaTri === null || giaTri <= 0) {
            errors.giaTri = 'Giá trị phải lớn hơn 0.';
        }

        if (loaiGiam === LOAI_GIAM.PHAN_TRAM && giaTri > 100) {
            errors.giaTri = 'Giá trị phần trăm không được vượt quá 100.';
        }

        const decimalLength = getInputDecimalLength('giaTri');

        if (decimalLength > DECIMAL_SCALE) {
            errors.giaTri = 'Giá trị chỉ được nhập tối đa 5 chữ số sau dấu phẩy.';
        }

        const scope = toNullableNumber(data.phamViApDung);

        if (!scope) {
            errors.phamViApDung = 'Vui lòng chọn phạm vi áp dụng.';
        }

        if (scope === PHAM_VI.NHOM_SAN_PHAM && !toIds(data.nhomSanPhamId).length) {
            errors.nhomSanPhamId = 'Vui lòng chọn nhóm sản phẩm.';
        }

        if (scope === PHAM_VI.SAN_PHAM && !toIds(data.sanPhamId).length) {
            errors.sanPhamId = 'Vui lòng chọn sản phẩm.';
        }

        const start = parseDateValue(data.thoiGianBatDau);

        const end = parseDateValue(data.thoiGianKetThuc);

        if (!start) {
            errors.thoiGianBatDau = 'Vui lòng chọn thời gian bắt đầu.';
        }

        if (!end) {
            errors.thoiGianKetThuc = 'Vui lòng chọn thời gian kết thúc.';
        }

        if (start && end && end <= start) {
            errors.thoiGianKetThuc = 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.';
        }

        return errors;
    }

    function syncSelectValue(id, value) {
        const smartSelect = getSmartSelect(id);

        smartSelect?.setValue?.(value ?? '', false);
    }

    function syncSelectValues(id, values) {
        const select = document.getElementById(id);

        const smartSelect = getSmartSelect(id);

        if (!select?.multiple) {
            smartSelect?.setValue?.(firstId(values), false);

            return;
        }

        smartSelect?.setValues?.(normalizeIds(values), false);
    }

    function getSmartSelect(id) {
        const select = document.getElementById(id);

        const root = select?.closest('[data-smart-select]');

        return root?.smartSelect || window.MCS.smartSelect.initialize(root);
    }

    function syncNumberField(id, value) {
        const input = document.getElementById(id);

        if (!input) {
            return;
        }

        setNumberValue(input, value ?? '');
    }

    function setNumberValue(input, value) {
        const instance = window.MCS.numberInput.initialize(input);

        instance?.setValue?.(value);
    }

    function refreshNumberField(field) {
        window.MCS.numberInput.refresh(field);
    }

    function syncDateField(id, value) {
        const field = document.querySelector(`[data-form-field="${id}"]`);

        if (!field) {
            return;
        }

        const datePicker = field.datePicker || field.querySelector('.date-picker')?.datePicker;

        if (datePicker?.setValue) {
            datePicker.setValue(value || '', false);

            return;
        }

        const hiddenInput = field.querySelector('[data-date-value]');

        if (hiddenInput) {
            hiddenInput.value = value || '';
        }
    }

    function normalizeNumberInput(input) {
        const isInteger = ['soLuongPhatHanh', 'soLuotMoiNhanVien'].includes(input.id);

        const cursor = input.selectionStart ?? input.value.length;

        const logicalCursor = input.value.slice(0, cursor).replace(/\./g, '').length;

        const raw = String(input.value ?? '').replace(/\./g, '');

        let hasComma = !isInteger && raw.includes(',');
        let [whole, fraction = ''] = raw.split(',');

        whole = whole.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

        fraction = fraction.replace(/\D/g, '').slice(0, DECIMAL_SCALE);

        if (!whole && hasComma) {
            whole = '0';
        }

        // numeric(18,6): tối đa 12 chữ số nguyên.
        // INTEGER: tối đa 10 chữ số, kèm giới hạn giá trị bên dưới.
        whole = whole.slice(0, isInteger ? 10 : 12);

        if (isInteger && whole && Number(whole) > 2147483647) {
            whole = '2147483647';
        }

        const isPercent =
            input.id === 'giaTri' && Number(document.getElementById('loaiGiam')?.value) === LOAI_GIAM.PHAN_TRAM;

        if (isPercent && (Number(whole) > 100 || (Number(whole) === 100 && /[1-9]/.test(fraction)))) {
            whole = '100';
            fraction = '';
            hasComma = false;
        }

        const display = whole + (hasComma ? ',' + fraction : '');

        input.value = window.MCS.numberInput.formatInputValue(display, isInteger, false);

        // Giữ vị trí con trỏ khi dấu phân nhóm thay đổi.
        let position = 0;
        let characters = 0;

        while (position < input.value.length && characters < logicalCursor) {
            if (input.value[position] !== '.') {
                characters++;
            }

            position++;
        }

        input.setSelectionRange(position, position);
    }

    function toApiDecimal(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (typeof value === 'number') {
            return Number.isFinite(value) ? String(value) : null;
        }

        const raw = String(value).trim().replace(/\s/g, '').replace(/\./g, '');

        if (!/^\d+(?:,\d*)?$/.test(raw)) {
            return null;
        }

        let [whole, fraction = ''] = raw.split(',');

        whole = whole.replace(/^0+(?=\d)/, '');
        fraction = fraction.replace(/0+$/, '');

        return whole + (fraction ? '.' + fraction : '');
    }

    function parseFormNumber(value) {
        const decimal = toApiDecimal(value);

        if (decimal === null) {
            return null;
        }

        const number = Number(decimal);

        return Number.isFinite(number) ? number : null;
    }

    function parseOptionalInteger(value) {
        const number = parseFormNumber(value);

        return Number.isInteger(number) ? number : null;
    }

    function getInputNumber(input) {
        const value = input?.numberInput?.getValue?.();

        if (value !== null && value !== undefined) {
            return Number(value);
        }

        return parseFormNumber(input?.value);
    }

    function parseOptionalNumber(value) {
        const number = parseFormNumber(value);

        return number === null ? null : number;
    }

    function getInputDecimalLength(id) {
        const input = document.getElementById(id);

        if (!input) {
            return 0;
        }

        const raw = String(input.value || '').replace(/\./g, '');

        const index = raw.indexOf(',');

        return index < 0 ? 0 : raw.slice(index + 1).replace(/\D/g, '').length;
    }

    function toIds(value) {
        if (Array.isArray(value)) {
            return value.map(Number).filter(Number.isInteger);
        }

        const number = Number(value);

        return Number.isInteger(number) ? [number] : [];
    }

    function normalizeIds(value) {
        return [...new Set(toIds(value))];
    }

    function firstId(value) {
        return normalizeIds(value)[0] ?? '';
    }

    function toNullableNumber(value) {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function normalizeNullableText(value) {
        const text = String(value ?? '').trim();

        return text || null;
    }

    function toApiDateTime(value, defaultTime) {
        const text = String(value || '').trim();

        if (!text) {
            return null;
        }

        const match = text.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);

        if (!match) {
            return null;
        }

        return `${match[1]}T${match[2] || defaultTime.slice(0, 2)}:${
            match[3] || defaultTime.slice(3, 5)
        }:${match[4] || defaultTime.slice(6, 8)}+07:00`;
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getEnumLabel(items, value) {
        return items.find((item) => Number(item.value) === Number(value))?.label || '-';
    }

    function formatGiaTri(value, loaiGiam) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return '-';
        }

        const formatted = new Intl.NumberFormat('vi-VN', {
            maximumFractionDigits: DECIMAL_SCALE
        }).format(number);

        return Number(loaiGiam) === LOAI_GIAM.PHAN_TRAM ? `${formatted} %` : `${formatted} đ`;
    }

    function formatDateTime(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        const parts = new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(date);

        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return `${values.day}/${values.month}/${values.year} ` + `${values.hour}:${values.minute}:${values.second}`;
    }

    function getSmartSelectValue(selectId) {
        const select = document.getElementById(selectId);

        const root = select?.closest('[data-smart-select]');

        const smartSelect = root?.smartSelect || window.MCS.smartSelect.initialize(root);

        return smartSelect?.getValue?.() ?? select?.value ?? '';
    }

    function getSmartSelectValues(selectId) {
        const select = document.getElementById(selectId);

        const smartSelect = getSmartSelect(selectId);

        if (select?.multiple) {
            return normalizeIds(
                smartSelect?.getValues?.() || Array.from(select.selectedOptions || []).map((option) => option.value)
            );
        }

        return toIds(smartSelect?.getValue?.() ?? select?.value);
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_voucher_don_hang.xlsx');

            window.MCS?.toast?.success?.('Xuất dữ liệu voucher đơn hàng thành công.');
        } catch (error) {
            console.error('Xuất voucher đơn hàng thất bại:', error);

            window.MCS?.toast?.error?.(error?.message || 'Không thể xuất dữ liệu voucher đơn hàng.');
        }
    }

    function importData(catalogInstance) {
        const input = document.createElement('input');

        input.type = 'file';
        input.accept = '.xlsx';
        input.hidden = true;

        document.body.appendChild(input);

        input.addEventListener('cancel', () => input.remove(), { once: true });

        input.addEventListener(
            'change',
            async () => {
                const file = input.files?.[0];

                if (!file) {
                    input.remove();
                    return;
                }

                try {
                    if (!/\.xlsx$/i.test(file.name)) {
                        throw new Error('Vui lòng chọn file Excel .xlsx.');
                    }

                    if (file.size > 10 * 1024 * 1024) {
                        throw new Error('File import không được vượt quá 10 MB.');
                    }

                    const body = new FormData();
                    body.append('file', file);

                    const result = await window.MCS.api.requestFile(`${API_BASE}/import-du-lieu`, {
                        method: 'POST',
                        body
                    });

                    // Backend trả file kết quả, không phải JSON.
                    window.MCS.api.downloadBlob(
                        result.blob,
                        result.fileName || `dm_voucher_don_hang_import_${Date.now()}.xlsx`
                    );

                    window.MCS?.toast?.success?.('Đã xử lý import. Mở file kết quả để xem cột ketQua và baoLoi.');

                    // Tách lỗi tải lại bảng khỏi lỗi import,
                    // tránh báo import thất bại khi DB đã xử lý.
                    try {
                        await catalogInstance?.load?.();
                    } catch (error) {
                        console.error('Không thể tải lại bảng sau import:', error);

                        window.MCS?.toast?.error?.(
                            'Import đã được xử lý nhưng bảng chưa tải lại. Vui lòng tải lại trang.'
                        );
                    }
                } catch (error) {
                    console.error('Import voucher đơn hàng thất bại:', error);

                    window.MCS?.toast?.error?.(error?.message || 'Không thể import dữ liệu voucher đơn hàng.');
                } finally {
                    input.remove();
                }
            },
            { once: true }
        );

        input.click();
    }
});

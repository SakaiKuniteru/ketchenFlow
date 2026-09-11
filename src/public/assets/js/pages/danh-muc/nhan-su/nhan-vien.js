'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-nhan-vien';
    const API_GIOI_TINH = '/api/mcs/v1/enums?name=gioiTinh';
    const API_CHUC_VU = '/api/mcs/v1/dm-chuc-vu/tong-hop?active=true';
    const API_CO_SO = '/api/mcs/v1/dm-co-so/tong-hop?active=true';
    const API_PHONG_BAN = '/api/mcs/v1/dm-phong-ban/tong-hop?active=true';
    const API_QUOC_GIA = '/api/mcs/v1/dm-quoc-gia/tong-hop?active=true';
    const API_TINH_THANH = '/api/mcs/v1/dm-tinh-thanh/tong-hop?active=true';
    const API_XA_PHUONG = '/api/mcs/v1/dm-xa-phuong/tong-hop?active=true';

    let catalog = null;
    let dsGioiTinh = [];
    let dsChucVu = [];
    let dsCoSo = [];
    let dsPhongBan = [];
    let dsQuocGia = [];
    let dsTinhThanh = [];
    let dsXaPhuong = [];

    initialize();

    async function initialize() {
        await Promise.all([
            loadGioiTinh(),
            loadChucVu(),
            loadCoSo(),
            loadPhongBan(),
            loadQuocGia(),
            loadTinhThanh(),
            loadXaPhuong()
        ]);
        await initializeCatalog();
        renderAllSelects();
        bindDependentSelects();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'nhan-vien',
                permissionCodes: {
                    view: 'Q000562',
                    create: 'Q000563',
                    update: 'Q000564'
                },
                columns: [
                    {
                        key: 'maNhanVien',
                        label: 'Mã nhân viên',
                        width: '150px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenDangNhap',
                        label: 'Tên tài khoản',
                        width: '170px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'hoTen',
                        label: 'Họ tên',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'email',
                        label: 'Email',
                        width: '220px',
                        filterable: true,
                        render: renderHiddenEmail
                    },
                    {
                        key: 'soDienThoai',
                        label: 'Số điện thoại',
                        width: '150px',
                        filterable: true,
                        render: renderHiddenPhone
                    },
                    {
                        key: 'ngaySinh',
                        label: 'Ngày sinh',
                        width: '130px',
                        sortable: true,
                        filterable: true,
                        render: (value) => formatDisplayDate(value)
                    },
                    {
                        key: 'gioiTinhText',
                        label: 'Giới tính',
                        width: '120px',
                        filterable: true
                    },
                    {
                        key: 'tenChucVu',
                        label: 'Chức vụ',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'tenPhongBan',
                        label: 'Phòng ban',
                        width: '190px',
                        filterable: true
                    },
                    {
                        key: 'tenCoSo',
                        label: 'Cơ sở',
                        width: '190px',
                        filterable: true
                    },
                    {
                        key: 'diaChi',
                        label: 'Địa chỉ',
                        width: '260px',
                        filterable: true
                    },
                    {
                        key: 'tenQuocGia',
                        label: 'Quốc gia',
                        width: '160px',
                        filterable: true
                    },
                    {
                        key: 'tenTinhThanh',
                        label: 'Tỉnh/Thành',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'tenXaPhuong',
                        label: 'Xã/Phường',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'maThe',
                        label: 'Mã thẻ',
                        width: '150px',
                        filterable: true
                    },
                    {
                        key: 'ghiChu',
                        label: 'Ghi chú',
                        width: '220px',
                        filterable: true
                    },
                    {
                        key: 'active',
                        label: 'Hiệu lực',
                        width: '130px',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: window.createStatusBadge
                    }
                ],

                defaultValues: {
                    maNhanVien: '',
                    tenDangNhap: '',
                    hoTen: '',
                    email: '',
                    soDienThoai: '',
                    ngaySinh: '',
                    gioiTinh: '',
                    anhDaiDien: '',
                    chucVuId: '',
                    coSoId: '',
                    phongBanId: '',
                    quocGiaId: '',
                    tinhThanhId: '',
                    xaPhuongId: '',
                    diaChi: '',
                    maThe: '',
                    ghiChu: '',
                    active: true
                },

                validation: {
                    maNhanVien: {
                        label: 'Mã nhân viên',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã nhân viên không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã nhân viên đã tồn tại.'
                    },

                    hoTen: {
                        label: 'Họ và tên',
                        required: true,
                        maxLength: 150,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Họ và tên không được vượt quá 150 ký tự.'
                    },

                    email: {
                        label: 'Email',
                        maxLength: 150,
                        unique: true,
                        maxLengthMessage: 'Email không được vượt quá 150 ký tự.',
                        uniqueMessage: 'Email đã tồn tại.'
                    },

                    soDienThoai: {
                        label: 'Số điện thoại',
                        maxLength: 20,
                        unique: true,
                        maxLengthMessage: 'Số điện thoại không được vượt quá 20 ký tự.',
                        uniqueMessage: 'Số điện thoại đã tồn tại.'
                    },

                    maThe: {
                        label: 'Mã thẻ',
                        maxLength: 100,
                        unique: true,
                        maxLengthMessage: 'Mã thẻ không được vượt quá 100 ký tự.',
                        uniqueMessage: 'Mã thẻ đã tồn tại.'
                    },

                    coSoId: {
                        label: 'Cơ sở',
                        required: true,
                        requiredMessage: 'Vui lòng chọn cơ sở.'
                    },

                    quocGiaId: {
                        label: 'Quốc gia',
                        required: true,
                        requiredMessage: 'Vui lòng chọn quốc gia.'
                    },

                    diaChi: {
                        label: 'Địa chỉ',
                        maxLength: 500,
                        maxLengthMessage: 'Địa chỉ không được vượt quá 500 ký tự.'
                    },

                    ghiChu: {
                        label: 'Ghi chú',
                        maxLength: 500,
                        maxLengthMessage: 'Ghi chú không được vượt quá 500 ký tự.'
                    }
                },

                detailTitle: 'Thông tin nhân viên',
                createTitle: 'Thêm nhân viên',
                updateTitle: 'Cập nhật nhân viên',

                getRecordSubtitle(record) {
                    return record?.maNhanVien || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data)
                        ? result.data
                        : result?.data?.items || result?.data?.data || [];

                    return records.map((record) => mapListRecord(record));
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maNhanVien: record?.maNhanVien || '',
                        tenDangNhap: record?.tenDangNhap || record?.taiKhoan?.tenDangNhap || '',
                        hoTen: record?.hoTen || '',
                        email: record?.email || '',
                        soDienThoai: record?.soDienThoai || '',
                        ngaySinh: normalizeDate(record?.ngaySinh),
                        gioiTinh: record?.gioiTinh ?? '',
                        anhDaiDien: record?.anhDaiDien || '',
                        chucVuId: record?.chucVuId ?? record?.chucVu?.id ?? '',
                        coSoId: record?.coSoId ?? record?.coSo?.id ?? '',
                        phongBanId: record?.phongBanId ?? record?.phongBan?.id ?? '',
                        quocGiaId: record?.quocGiaId ?? record?.quocGia?.id ?? '',
                        tinhThanhId: record?.tinhThanhId ?? record?.tinhThanh?.id ?? '',
                        xaPhuongId: record?.xaPhuongId ?? record?.xaPhuong?.id ?? '',
                        diaChi: record?.diaChi || '',
                        maThe: record?.maThe || '',
                        ghiChu: record?.ghiChu || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    return {
                        maNhanVien: String(formData.maNhanVien || '')
                            .trim()
                            .toUpperCase(),
                        hoTen: String(formData.hoTen || '').trim(),
                        email: normalizeNullableText(formData.email),
                        soDienThoai: normalizeNullableText(formData.soDienThoai),
                        ngaySinh: buildDateTimeWithTimezone(formData.ngaySinh),
                        gioiTinh: normalizeNullableNumber(formData.gioiTinh),
                        anhDaiDien: formData.anhDaiDien,
                        chucVuId: normalizeNullableNumber(formData.chucVuId),
                        coSoId: normalizeNullableNumber(formData.coSoId),
                        phongBanId: normalizeNullableNumber(formData.phongBanId),
                        quocGiaId: normalizeNullableNumber(formData.quocGiaId),
                        tinhThanhId: normalizeNullableNumber(formData.tinhThanhId),
                        xaPhuongId: normalizeNullableNumber(formData.xaPhuongId),
                        diaChi: buildAddress(formData),
                        maThe: normalizeNullableText(formData.maThe),
                        ghiChu: normalizeNullableText(formData.ghiChu),
                        active: formData.active === true
                    };
                },

                onRecordLoaded(record, mode) {
                    syncDateField('ngaySinh', record?.ngaySinh);
                    syncImageField('anhDaiDien', record?.anhDaiDien, mode);
                    syncAllSelects(record, mode);
                    syncOrganizationHierarchy(record, mode);
                    syncAddressHierarchy(record, mode);
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-nhan-vien',
                        label: 'Xuất danh mục nhân viên',
                        icon: 'download'
                    },
                    {
                        action: 'import-nhan-vien',
                        label: 'Nhập danh mục nhân viên',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-nhan-vien') {
                        exportData();
                        return;
                    }

                    if (action === 'import-nhan-vien') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục nhân viên.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục nhân viên.');
        }
    }

    function buildAddress(formData) {
        const diaChi = String(formData.diaChi || '').trim();

        if (diaChi) {
            return diaChi;
        }

        const tenXaPhuong = getSelectedLabel('xaPhuongId');
        const tenTinhThanh = getSelectedLabel('tinhThanhId');
        const tenQuocGia = getSelectedLabel('quocGiaId');

        const danhSach = [
            removeCodeFromLabel(tenXaPhuong),
            removeCodeFromLabel(tenTinhThanh),
            removeCodeFromLabel(tenQuocGia)
        ].filter(Boolean);

        return danhSach.length ? danhSach.join(', ') : null;
    }

    function getSelectedLabel(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return '';
        }

        const option = select.options[select.selectedIndex];

        return (option?.textContent || '').trim();
    }

    function removeCodeFromLabel(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        const index = text.indexOf(' - ');

        if (index === -1) {
            return text;
        }

        return text.substring(index + 3).trim();
    }

    function mapListRecord(record) {
        const gioiTinh = dsGioiTinh.find((item) => Number(item.value) === Number(record?.gioiTinh));

        return {
            ...record,
            tenDangNhap: record?.tenDangNhap || record?.taiKhoan?.tenDangNhap || '',
            gioiTinhText: gioiTinh?.label || record?.gioiTinhText || '',
            tenChucVu: record?.tenChucVu || record?.chucVu?.tenChucVu || record?.chucVu?.ten || '',
            tenPhongBan: record?.tenPhongBan || record?.phongBan?.tenPhongBan || record?.phongBan?.ten || '',
            tenCoSo: record?.tenCoSo || record?.coSo?.tenCoSo || record?.coSo?.ten || '',
            tenQuocGia: record?.tenQuocGia || record?.quocGia?.tenQuocGia || record?.quocGia?.ten || '',
            tenTinhThanh: record?.tenTinhThanh || record?.tinhThanh?.tenTinhThanh || record?.tinhThanh?.ten || '',
            tenXaPhuong: record?.tenXaPhuong || record?.xaPhuong?.tenXaPhuong || record?.xaPhuong?.ten || ''
        };
    }

    async function loadGioiTinh() {
        try {
            const response = await window.MCS.api.request(API_GIOI_TINH);
            dsGioiTinh = normalizeEnumData(response?.data);
        } catch (error) {
            dsGioiTinh = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách giới tính.');
        }
    }

    async function loadChucVu() {
        dsChucVu = await loadLookup(API_CHUC_VU, 'chức vụ');
    }

    async function loadCoSo() {
        dsCoSo = await loadLookup(API_CO_SO, 'cơ sở');
    }

    async function loadPhongBan() {
        dsPhongBan = await loadLookup(API_PHONG_BAN, 'phòng ban');
    }

    async function loadQuocGia() {
        dsQuocGia = await loadLookup(API_QUOC_GIA, 'quốc gia');
    }

    async function loadTinhThanh() {
        dsTinhThanh = await loadLookup(API_TINH_THANH, 'tỉnh thành');
    }

    async function loadXaPhuong() {
        dsXaPhuong = await loadLookup(API_XA_PHUONG, 'xã phường');
    }

    async function loadLookup(url, label) {
        try {
            const response = await window.MCS.api.request(url);
            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            return records.filter((item) => item?.active !== false);
        } catch (error) {
            console.error(`Không thể tải ${label}.`, error);

            window.MCS?.toast?.error(error?.message || `Không thể tải danh sách ${label}.`);

            return [];
        }
    }

    function normalizeEnumData(data) {
        const records = Array.isArray(data) ? data : [];

        return records
            .map((item) => {
                if (item && typeof item === 'object') {
                    return {
                        value: item.value ?? item.id ?? item.ma,
                        label: item.label ?? item.ten ?? item.name ?? String(item.value ?? '')
                    };
                }

                return {
                    value: item,
                    label: String(item)
                };
            })
            .filter((item) => item.value !== undefined && item.value !== null);
    }

    function renderAllSelects() {
        renderSelect(
            'gioiTinh',
            dsGioiTinh,
            (item) => item.value,
            (item) => item.label,
            ''
        );

        renderSelect(
            'chucVuId',
            dsChucVu,
            (item) => item.id,
            (item) => buildLabel(item.maChucVu, item.tenChucVu),
            ''
        );

        renderSelect(
            'coSoId',
            dsCoSo,
            (item) => item.id,
            (item) => buildLabel(item.maCoSo, item.tenCoSo),
            ''
        );

        renderPhongBanSelect(null, '');

        renderSelect(
            'quocGiaId',
            dsQuocGia,
            (item) => item.id,
            (item) => buildLabel(item.maQuocGia || item.ma, item.tenQuocGia || item.ten),
            ''
        );

        renderTinhThanhSelect(null, '');
        renderXaPhuongSelect(null, '');
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
            option.selected = selected !== '' && value === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = select.closest('[data-smart-select]')?.smartSelect;

        smartSelect?.refresh?.();

        if (selected === '') {
            smartSelect?.clear?.();
        }
    }

    function renderPhongBanSelect(coSoId = null, selectedValue = '') {
        const id = normalizeNullableNumber(coSoId);

        const records = id === null ? [] : dsPhongBan.filter((item) => Number(item.coSoId ?? item.coSo?.id) === id);

        renderSelect(
            'phongBanId',
            records,
            (item) => item.id,
            (item) => buildLabel(item.maPhongBan || item.ma, item.tenPhongBan || item.ten),
            selectedValue
        );

        setSelectPlaceholder('phongBanId', id === null ? 'Chọn cơ sở trước' : 'Chọn phòng ban...');

        setSelectDisabled('phongBanId', id === null);
    }

    function setSelectPlaceholder(selectId, placeholder) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        if (!root) {
            return;
        }

        root.dataset.selectPlaceholder = placeholder;

        const placeholderElement = root.querySelector('.smart-select__placeholder');

        if (placeholderElement) {
            placeholderElement.textContent = placeholder;
        }
    }

    function renderTinhThanhSelect(quocGiaId = null, selectedValue = '') {
        const id = normalizeNullableNumber(quocGiaId);

        const records =
            id === null ? [] : dsTinhThanh.filter((item) => Number(item.quocGiaId ?? item.quocGia?.id) === id);

        renderSelect(
            'tinhThanhId',
            records,
            (item) => item.id,
            (item) => buildLabel(item.maTinhThanh || item.ma, item.tenTinhThanh || item.ten),
            selectedValue
        );

        setSelectDisabled('tinhThanhId', id === null);
    }

    function renderXaPhuongSelect(tinhThanhId = null, selectedValue = '') {
        const id = normalizeNullableNumber(tinhThanhId);

        const records =
            id === null ? [] : dsXaPhuong.filter((item) => Number(item.tinhThanhId ?? item.tinhThanh?.id) === id);

        renderSelect(
            'xaPhuongId',
            records,
            (item) => item.id,
            (item) => buildLabel(item.maXaPhuong || item.ma, item.tenXaPhuong || item.ten),
            selectedValue
        );

        setSelectDisabled('xaPhuongId', id === null);
    }

    function bindDependentSelects() {
        document.getElementById('coSoId')?.addEventListener('change', (event) => {
            renderPhongBanSelect(event.target.value, '');
        });

        document.getElementById('quocGiaId')?.addEventListener('change', (event) => {
            const quocGiaId = event.target.value;

            renderTinhThanhSelect(quocGiaId, '');

            renderXaPhuongSelect(null, '');
        });

        document.getElementById('tinhThanhId')?.addEventListener('change', (event) => {
            renderXaPhuongSelect(event.target.value, '');
        });
    }

    function syncDateField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const root = input.closest('[data-date-picker]');

        if (!root) {
            return;
        }

        const normalizedValue = normalizeDate(value);

        if (root.datePicker?.setValue) {
            root.datePicker.setValue(normalizedValue, false);

            return;
        }

        input.value = normalizedValue;
    }

    function syncImageField(inputId, value, mode) {
        const field = document.querySelector(`[data-form-field="${inputId}"]`);

        const root = field?.querySelector('[data-image-picker]');

        if (!root) {
            return;
        }

        const imagePicker = window.MCS.imagePicker?.initialize(root);

        if (!imagePicker) {
            return;
        }

        imagePicker.setValue(value || '');

        imagePicker.setDisabled(mode === 'view');
    }

    function normalizeImageUrl(value) {
        const path = String(value || '').trim();

        if (!path) {
            return '';
        }

        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }

        return `/${path}`;
    }

    function syncAllSelects(record, mode) {
        renderSelect(
            'gioiTinh',
            dsGioiTinh,
            (item) => item.value,
            (item) => item.label,
            record?.gioiTinh ?? ''
        );

        renderSelect(
            'chucVuId',
            dsChucVu,
            (item) => item.id,
            (item) => buildLabel(item.maChucVu, item.tenChucVu),
            record?.chucVuId ?? record?.chucVu?.id ?? ''
        );

        renderSelect(
            'coSoId',
            dsCoSo,
            (item) => item.id,
            (item) => buildLabel(item.maCoSo, item.tenCoSo),
            record?.coSoId ?? record?.coSo?.id ?? ''
        );

        renderSelect(
            'quocGiaId',
            dsQuocGia,
            (item) => item.id,
            (item) => buildLabel(item.maQuocGia || item.ma, item.tenQuocGia || item.ten),
            record?.quocGiaId ?? record?.quocGia?.id ?? ''
        );

        setSelectMode('gioiTinh', mode);
        setSelectMode('chucVuId', mode);
        setSelectMode('coSoId', mode);
        setSelectMode('quocGiaId', mode);
    }

    function syncAddressHierarchy(record, mode) {
        const quocGiaId = record?.quocGiaId ?? record?.quocGia?.id ?? null;

        const tinhThanhId = record?.tinhThanhId ?? record?.tinhThanh?.id ?? null;

        const xaPhuongId = record?.xaPhuongId ?? record?.xaPhuong?.id ?? null;

        renderTinhThanhSelect(quocGiaId, tinhThanhId);

        renderXaPhuongSelect(tinhThanhId, xaPhuongId);

        setSelectMode('tinhThanhId', mode, !quocGiaId);

        setSelectMode('xaPhuongId', mode, !tinhThanhId);
    }

    function setSelectMode(selectId, mode, forceDisabled = false) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        root?.smartSelect?.setDisabled?.(mode === 'view' || forceDisabled);
    }

    function setSelectDisabled(selectId, disabled) {
        document
            .getElementById(selectId)
            ?.closest('[data-smart-select]')
            ?.smartSelect?.setDisabled?.(Boolean(disabled));
    }

    function syncOrganizationHierarchy(record, mode) {
        const coSoId = record?.coSoId ?? record?.coSo?.id ?? null;

        const phongBanId = record?.phongBanId ?? record?.phongBan?.id ?? null;

        renderPhongBanSelect(coSoId, phongBanId);

        setSelectMode('phongBanId', mode, !coSoId);
    }

    function buildLabel(code, name) {
        const ma = String(code || '').trim();
        const ten = String(name || '').trim();

        if (ma && ten) {
            return `${ma} - ${ten}`;
        }

        return ten || ma;
    }

    function normalizeNullableText(value) {
        const text = String(value ?? '').trim();

        return text || null;
    }

    function normalizeNullableNumber(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function normalizeDate(value) {
        if (value === undefined || value === null || value === '') {
            return '';
        }

        const text = String(value).trim();

        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }

        const displayMatch = text.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);

        if (displayMatch) {
            return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
        }

        return '';
    }

    function buildDateTimeWithTimezone(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const date = normalizeDate(value);

        if (!date) {
            return null;
        }

        return `${date}T00:00:00+07:00`;
    }

    function maskPhone(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        if (text.length <= 4) {
            return '*'.repeat(text.length);
        }

        const first = text.substring(0, 2);
        const last = text.substring(text.length - 2);
        const hiddenLength = Math.max(4, text.length - 4);

        return first + 'x'.repeat(hiddenLength) + last;
    }

    function renderHiddenPhone(value) {
        return createPrivateValue(value, maskPhone(value), 'số điện thoại');
    }

    function maskEmail(value) {
        const text = String(value || '').trim();

        if (!text) {
            return '';
        }

        const atIndex = text.indexOf('@');

        if (atIndex <= 0) {
            return text;
        }

        const local = text.substring(0, atIndex);
        const domain = text.substring(atIndex);

        if (local.length <= 2) {
            return local.substring(0, 1) + 'xxxx' + domain;
        }

        const firstLength = Math.min(2, local.length);

        const lastLength = local.length >= 5 ? 2 : 1;

        const first = local.substring(0, firstLength);

        const last = local.substring(local.length - lastLength);

        return first + 'xxxxx' + last + domain;
    }

    function renderHiddenEmail(value) {
        return createPrivateValue(value, maskEmail(value), 'email');
    }

    function createPrivateValue(value, maskedValue, label) {
        const fullValue = String(value || '').trim();

        if (!fullValue) {
            return document.createTextNode('—');
        }

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'nhan-vien-private-value';
        button.textContent = maskedValue;
        button.dataset.visible = 'false';
        button.title = `Nhấn để xem ${label}`;

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const visible = button.dataset.visible === 'true';

            button.dataset.visible = visible ? 'false' : 'true';

            button.textContent = visible ? maskedValue : fullValue;

            button.title = visible ? `Nhấn để xem ${label}` : `Nhấn để ẩn ${label}`;
        });

        return button;
    }

    function formatDisplayDate(value) {
        if (!value) {
            return '';
        }

        const text = String(value).substring(0, 10);
        const parts = text.split('-');

        if (parts.length !== 3) {
            return text;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_nhan_vien.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu nhân viên thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_nhan_vien_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu nhân viên thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

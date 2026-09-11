'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-kho';
    const API_NHA_AN = '/api/mcs/v1/dm-nha-an/tong-hop?active=true';
    const API_LOAI_KHO = '/api/mcs/v1/enums?name=loaiKho';
    const API_QUY_TAC_LAM_TRON = '/api/mcs/v1/thiet-lap/gia-tri?QUY_TAC_LAM_TRON';
    const API_SO_CHU_SO = '/api/mcs/v1/thiet-lap/gia-tri?SO_CHU_SO_SAU_DAU_PHAY';

    let catalog = null;
    let dsNhaAn = [];
    let dsLoaiKho = [];
    let dsNhanVienNhaAn = [];
    let dsNvQuanLyDaChon = [];
    let dsNvQuanLyTamChon = [];
    let currentMode = 'view';
    let currentKhoId = null;
    let currentNhaAnId = null;
    let popupSearchText = '';
    let soChuSoSauDauPhay = 2;
    let quyTacLamTron = null;

    initialize();

    async function initialize() {
        await Promise.all([loadNhaAn(), loadLoaiKho(), loadCauHinhSo()]);

        await initializeCatalog();
        bindKhoNumberRules();
        renderNhaAnSelect();
        renderLoaiKhoSelect();
        bindManagerEvents();
        bindNhaAnChange();
        syncManagerUI();
        renderManagerDetail();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'kho',
                permissionCodes: {
                    view: 'Q000559',
                    create: 'Q000560',
                    update: 'Q000561'
                },
                columns: [
                    {
                        key: 'maKho',
                        label: 'Mã kho',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenKho',
                        label: 'Tên kho',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'nhaAn.ten',
                        label: 'Nhà ăn',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'loaiKho',
                        label: 'Loại kho',
                        sortable: true,
                        filterable: true,
                        render: (value) => getLoaiKhoLabel(value)
                    },
                    {
                        key: 'diaDiem',
                        label: 'Địa điểm',
                        filterable: true
                    },
                    {
                        key: 'dienTich',
                        label: 'Diện tích',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: (value) => formatNumber(value)
                    },
                    {
                        key: 'nhietDoToiThieu',
                        label: 'Nhiệt độ tối thiểu',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: (value) =>
                            value === null || value === undefined ? '—' : `${formatNumber(value, 4)} °C`
                    },
                    {
                        key: 'nhietDoToiDa',
                        label: 'Nhiệt độ tối đa',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: (value) =>
                            value === null || value === undefined ? '—' : `${formatNumber(value, 4)} °C`
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
                    maKho: '',
                    tenKho: '',
                    nhaAnId: '',
                    loaiKho: '',
                    diaDiem: '',
                    dienTich: null,
                    nhietDoToiThieu: null,
                    nhietDoToiDa: null,
                    moTa: '',
                    ghiChu: '',
                    dsNvQuanLyId: [],
                    active: true
                },

                validation: {
                    maKho: {
                        label: 'Mã kho',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        uniqueMessage: 'Mã kho đã tồn tại.'
                    },

                    tenKho: {
                        label: 'Tên kho',
                        required: true,
                        maxLength: 150,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        uniqueMessage: 'Tên kho đã tồn tại.'
                    },

                    nhaAnId: {
                        label: 'Nhà ăn',
                        required: true,
                        requiredMessage: 'Vui lòng chọn nhà ăn.'
                    },

                    loaiKho: {
                        label: 'Loại kho',
                        required: true,
                        requiredMessage: 'Vui lòng chọn loại kho.'
                    },

                    diaDiem: {
                        label: 'Địa điểm',
                        maxLength: 255
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500
                    },

                    ghiChu: {
                        label: 'Ghi chú',
                        maxLength: 500
                    }
                },

                validate(data) {
                    const errors = {};

                    const min = getTemperatureValue(document.getElementById('nhietDoToiThieu'));

                    const max = getTemperatureValue(document.getElementById('nhietDoToiDa'));

                    if (min !== null && max !== null && max < min) {
                        errors.nhietDoToiThieu = 'Nhiệt độ tối thiểu không được lớn hơn nhiệt độ tối đa.';

                        errors.nhietDoToiDa = 'Nhiệt độ tối đa không được nhỏ hơn nhiệt độ tối thiểu.';
                    }

                    return errors;
                },

                detailTitle: 'Thông tin kho',
                createTitle: 'Thêm kho',
                updateTitle: 'Cập nhật kho',

                getRecordSubtitle(record) {
                    return record?.maKho || '';
                },

                mapRecordToForm(record) {
                    return {
                        id: record?.id ?? '',
                        maKho: record?.maKho || '',
                        tenKho: record?.tenKho || '',
                        nhaAnId: record?.nhaAnId ?? record?.nhaAn?.id ?? '',
                        loaiKho: record?.loaiKho ?? '',
                        diaDiem: record?.diaDiem || '',
                        dienTich: record?.dienTich ?? null,
                        nhietDoToiThieu: record?.nhietDoToiThieu ?? null,
                        nhietDoToiDa: record?.nhietDoToiDa ?? null,
                        moTa: record?.moTa || '',
                        ghiChu: record?.ghiChu || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    const dienTich = getNumberFieldValue('dienTich', formData.dienTich);

                    const nhietDoToiThieu = getTemperatureValue(document.getElementById('nhietDoToiThieu'));

                    const nhietDoToiDa = getTemperatureValue(document.getElementById('nhietDoToiDa'));

                    const payload = {
                        maKho: String(formData.maKho || '')
                            .trim()
                            .toUpperCase(),
                        tenKho: String(formData.tenKho || '').trim(),
                        nhaAnId: normalizeRequiredNumber(formData.nhaAnId),
                        loaiKho: normalizeRequiredNumber(formData.loaiKho),
                        diaDiem: String(formData.diaDiem || '').trim() || null,
                        dienTich: lamTronTheoQuyTac(dienTich, soChuSoSauDauPhay),
                        nhietDoToiThieu: lamTronTheoQuyTac(nhietDoToiThieu, 4),
                        nhietDoToiDa: lamTronTheoQuyTac(nhietDoToiDa, 4),
                        moTa: String(formData.moTa || '').trim() || null,
                        ghiChu: String(formData.ghiChu || '').trim() || null,
                        active: formData.active === true
                    };

                    if (currentMode === 'update') {
                        payload.dsNvQuanLyId = dsNvQuanLyDaChon.map((item) => Number(item.nhanVienId));
                    }

                    return payload;
                },

                async onRecordLoaded(record, mode) {
                    currentMode = mode || 'view';

                    syncKhoNumberField('dienTich', record?.dienTich ?? '');

                    setTemperatureValue(document.getElementById('nhietDoToiThieu'), record?.nhietDoToiThieu);

                    setTemperatureValue(document.getElementById('nhietDoToiDa'), record?.nhietDoToiDa);

                    const khoIdMoi = record?.id !== undefined && record?.id !== null ? Number(record.id) : null;

                    if (currentKhoId !== khoIdMoi) {
                        dsNvQuanLyDaChon = [];
                        dsNvQuanLyTamChon = [];
                    }

                    currentKhoId = khoIdMoi;

                    currentNhaAnId = Number(record?.nhaAnId ?? record?.nhaAn?.id ?? 0) || null;

                    renderNhaAnSelect(currentNhaAnId || '');

                    renderLoaiKhoSelect(record?.loaiKho ?? '');

                    setSelectMode('nhaAnId', mode);

                    setSelectMode('loaiKho', mode);

                    await loadNhanVienTheoNhaAn(currentNhaAnId);

                    dsNvQuanLyDaChon = normalizeManagers(record);

                    dsNvQuanLyTamChon = cloneManagers(dsNvQuanLyDaChon);

                    popupSearchText = '';

                    syncManagerUI();
                    renderManagerDetail();
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-kho',
                        label: 'Xuất danh mục kho',
                        icon: 'download'
                    },
                    {
                        action: 'import-kho',
                        label: 'Nhập danh mục kho',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-kho') {
                        exportData();
                        return;
                    }

                    if (action === 'import-kho') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục kho.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục kho.');
        }
    }

    async function loadNhaAn() {
        try {
            const response = await window.MCS.api.request(API_NHA_AN);

            const data = response?.data;

            dsNhaAn = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsNhaAn = dsNhaAn.filter((item) => item?.active !== false);
        } catch (error) {
            dsNhaAn = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách nhà ăn.');
        }
    }

    async function loadLoaiKho() {
        try {
            const response = await window.MCS.api.request(API_LOAI_KHO);

            dsLoaiKho = Array.isArray(response?.data) ? response.data : response?.data?.items || [];
        } catch (error) {
            dsLoaiKho = [];
        }
    }

    async function loadCauHinhSo() {
        try {
            const [quyTacResponse, soChuSoResponse] = await Promise.all([
                window.MCS.api.request(API_QUY_TAC_LAM_TRON),
                window.MCS.api.request(API_SO_CHU_SO)
            ]);

            const quyTac = Number(layGiaTriThietLap(quyTacResponse));

            quyTacLamTron = [0, 1, 2].includes(quyTac) ? quyTac : 0;

            const soChuSo = Number(layGiaTriThietLap(soChuSoResponse));

            if (Number.isInteger(soChuSo) && soChuSo >= 0 && soChuSo <= 5) {
                soChuSoSauDauPhay = soChuSo;
            } else {
                soChuSoSauDauPhay = 2;
            }
        } catch (error) {
            console.error('Không thể tải thiết lập số.', error);
        }
    }

    async function loadNhanVienTheoNhaAn(nhaAnId) {
        dsNhanVienNhaAn = [];

        if (!nhaAnId) {
            return;
        }

        try {
            const responseNhaAn = await window.MCS.api.request(`/api/mcs/v1/dm-nha-an/${nhaAnId}`);

            const record = responseNhaAn?.data;

            const ids = Array.isArray(record?.dsNvQuanLyId)
                ? record.dsNvQuanLyId.map(Number)
                : Array.isArray(record?.dsNvQuanLy)
                  ? record.dsNvQuanLy.map((item) => Number(item.id ?? item.nhanVienId)).filter(Number.isInteger)
                  : [];

            if (ids.length === 0) {
                return;
            }

            const responseNhanVien = await window.MCS.api.request('/api/mcs/v1/dm-nhan-vien/tong-hop?active=true');

            const data = Array.isArray(responseNhanVien?.data)
                ? responseNhanVien.data
                : responseNhanVien?.data?.items || responseNhanVien?.data?.data || [];

            dsNhanVienNhaAn = data.filter((item) => ids.includes(Number(item.id)));
        } catch (error) {
            console.error('Không thể tải danh sách nhân viên theo nhà ăn.', error);

            dsNhanVienNhaAn = [];
        }
    }

    function getNumberFieldValue(inputId, fallbackValue = null) {
        const input = document.getElementById(inputId);

        if (!input) {
            return normalizeOptionalNumber(fallbackValue);
        }

        const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

        if (numberInput?.getValue) {
            return numberInput.getValue();
        }

        return normalizeOptionalNumber(input.value);
    }

    function getTemperatureValue(input) {
        if (!input) {
            return null;
        }

        const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

        if (numberInput?.getValue) {
            const value = numberInput.getValue();

            return Number.isFinite(Number(value)) ? Number(value) : null;
        }

        return normalizeOptionalNumber(input.value);
    }

    function setTemperatureValue(input, value) {
        if (!input) {
            return;
        }

        if (value === null || value === undefined || !Number.isFinite(Number(value))) {
            input.value = '';
            return;
        }

        input.value = new Intl.NumberFormat('vi-VN', {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        }).format(Number(value));
    }

    function lamTronTheoQuyTac(value, decimalPlaces) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return null;
        }

        const digits = Number.isInteger(Number(decimalPlaces)) ? Math.max(0, Number(decimalPlaces)) : 0;

        const factor = Math.pow(10, digits);

        const sign = number < 0 ? -1 : 1;

        const absolute = Math.abs(number);

        const scaled = absolute * factor;

        let rounded;

        switch (Number(quyTacLamTron)) {
            case 1:
                rounded = Math.ceil(scaled - Number.EPSILON);
                break;

            case 2:
                rounded = Math.floor(scaled + Number.EPSILON);
                break;

            case 0:
            default:
                rounded = Math.floor(scaled + 0.5);
                break;
        }

        return Number(((sign * rounded) / factor).toFixed(digits));
    }

    function toNullableNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function syncKhoNumberField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

        numberInput?.setValue?.(value ?? '');
    }

    function bindKhoNumberRules() {
        bindDienTichInput(document.getElementById('dienTich'));

        bindTemperatureInput(document.getElementById('nhietDoToiThieu'));

        bindTemperatureInput(document.getElementById('nhietDoToiDa'));
    }

    function bindDienTichInput(input) {
        if (!input || input.dataset.khoDienTichBound === 'true') {
            return;
        }

        input.dataset.khoDienTichBound = 'true';

        input.addEventListener('input', () => {
            const value = getNumberFieldValue('dienTich');

            if (value === null) {
                return;
            }

            if (value < 0) {
                input.numberInput?.setValue(Math.abs(value));

                return;
            }

            const decimalLength = getDecimalLength(input.value);

            if (decimalLength <= soChuSoSauDauPhay) {
                return;
            }

            const rounded = lamTronTheoQuyTac(value, soChuSoSauDauPhay);

            input.numberInput?.setValue(rounded);
        });

        input.addEventListener('blur', () => {
            const value = getNumberFieldValue('dienTich');

            if (value === null) {
                return;
            }

            input.numberInput?.setValue(lamTronTheoQuyTac(value, soChuSoSauDauPhay));
        });
    }

    function bindTemperatureInput(input) {
        if (!input || input.dataset.khoTemperatureBound === 'true') {
            return;
        }

        input.dataset.khoTemperatureBound = 'true';

        let previousValue = input.value || '';

        input.addEventListener('beforeinput', (event) => {
            if (event.inputType?.startsWith('delete')) {
                return;
            }

            if (event.data === null) {
                return;
            }

            const start = input.selectionStart ?? input.value.length;

            const end = input.selectionEnd ?? start;

            let next = input.value.slice(0, start) + event.data + input.value.slice(end);

            next = normalizeTemperatureTyping(next);

            if (!isValidTemperatureTyping(next)) {
                event.preventDefault();
            }
        });

        input.addEventListener('input', () => {
            const value = normalizeTemperatureTyping(input.value);

            if (isValidTemperatureTyping(value)) {
                previousValue = value;
                return;
            }

            input.value = previousValue;
        });

        input.addEventListener('blur', () => {
            const value = getTemperatureValue(input);

            if (value === null) {
                if (input.value === '+' || input.value === '-') {
                    input.value = '';
                }

                return;
            }

            const rounded = lamTronTheoQuyTac(value, 4);

            input.numberInput?.setValue(rounded);
        });
    }

    function normalizeTemperatureTyping(value) {
        let raw = String(value ?? '')
            .trim()
            .replace(/\s/g, '');

        const sign = raw.startsWith('-') ? '-' : raw.startsWith('+') ? '+' : '';

        raw = raw.replace(/^[+-]/, '');

        raw = raw.replace(/[+-]/g, '');

        return sign + raw;
    }

    function isValidTemperatureTyping(value) {
        const raw = String(value ?? '').trim();

        if (raw === '' || raw === '+' || raw === '-') {
            return true;
        }

        if (!/^[+-]?\d*(?:[.,]\d*)?$/.test(raw.replace(/\./g, ''))) {
            return false;
        }

        const unsigned = raw.replace(/^[+-]/, '');

        const normalized = unsigned.replace(/\./g, '');

        const parts = normalized.split(',');

        const integerPart = parts[0] || '';
        const decimalPart = parts[1] || '';

        const totalDigits = integerPart.length + decimalPart.length;

        if (totalDigits > 10) {
            return false;
        }

        return true;
    }

    function getDecimalLength(value) {
        const raw = String(value ?? '').trim();
        const commaIndex = raw.indexOf(',');
        if (commaIndex < 0) {
            return 0;
        }
        return raw.slice(commaIndex + 1).replace(/\D/g, '').length;
    }

    function bindNhaAnChange() {
        const select = document.getElementById('nhaAnId');
        select?.addEventListener('change', async (event) => {
            const nhaAnIdMoi = normalizeRequiredNumber(event.target.value);
            if (Number(currentNhaAnId) === Number(nhaAnIdMoi)) {
                return;
            }
            currentNhaAnId = nhaAnIdMoi;
            dsNvQuanLyDaChon = [];
            dsNvQuanLyTamChon = [];
            await loadNhanVienTheoNhaAn(currentNhaAnId);
            renderManagerDetail();
        });
    }

    function bindManagerEvents() {
        document.querySelector('[data-kho-open-manager]')?.addEventListener('click', openManagerPopup);
        document.querySelector('[data-kho-manager-add]')?.addEventListener('click', addManagerRow);
        document.querySelector('[data-kho-manager-save]')?.addEventListener('click', saveManagerPopup);
        document.querySelector('[data-kho-manager-cancel]')?.addEventListener('click', cancelManagerPopup);
        document.querySelector('[data-kho-manager-close]')?.addEventListener('click', cancelManagerPopup);

        document.getElementById('khoManagerSearch')?.addEventListener('input', (event) => {
            popupSearchText = normalizeSearchText(event.target.value);
            renderManagerPopup();
        });

        document.querySelector('[data-catalog-create]')?.addEventListener('click', () => {
            currentMode = 'create';
            currentKhoId = null;
            currentNhaAnId = null;
            dsNhanVienNhaAn = [];
            dsNvQuanLyDaChon = [];
            dsNvQuanLyTamChon = [];
            popupSearchText = '';
            closeManagerPopup();
            syncManagerUI();
            renderManagerDetail();
        });
    }

    function openManagerPopup() {
        if (currentMode !== 'update') {
            return;
        }

        if (!currentNhaAnId) {
            window.MCS?.toast?.error('Vui lòng chọn nhà ăn trước.');
            return;
        }

        dsNvQuanLyTamChon = cloneManagers(dsNvQuanLyDaChon);
        popupSearchText = '';

        const modal = document.querySelector('[data-kho-manager-modal]');
        if (!modal) {
            return;
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.hidden = false;
        document.body.classList.add('kho-manager-open');
        renderManagerPopup();
    }

    function closeManagerPopup() {
        const modal = document.querySelector('[data-kho-manager-modal]');
        if (modal) {
            modal.hidden = true;
        }
        document.body.classList.remove('kho-manager-open');
    }

    function cancelManagerPopup() {
        dsNvQuanLyTamChon = cloneManagers(dsNvQuanLyDaChon);
        closeManagerPopup();
    }

    function saveManagerPopup() {
        const danhSach = dsNvQuanLyTamChon.filter((item) => item.selected !== false);

        for (const item of danhSach) {
            if (!item.nhanVienId) {
                window.MCS?.toast?.error('Vui lòng chọn nhân viên.');
                return;
            }

            if (!nhanVienThuocNhaAn(item.nhanVienId)) {
                window.MCS?.toast?.error('Nhân viên quản lý phải thuộc nhà ăn của kho.');
                return;
            }
        }

        dsNvQuanLyDaChon = cloneManagers(danhSach);
        renderManagerDetail();
        closeManagerPopup();
    }

    function addManagerRow() {
        dsNvQuanLyTamChon.unshift({
            uid: createManagerUid(),
            nhanVienId: '',
            selected: true
        });
        renderManagerPopup();
    }

    function renderManagerPopup() {
        const tbody = document.querySelector('[data-kho-manager-popup-list]');
        const template = document.getElementById('khoManagerRowTemplate');

        if (!tbody || !template) {
            return;
        }

        tbody.innerHTML = '';

        getVisibleManagerRows().forEach((item, index) => {
            const fragment = template.content.cloneNode(true);
            const row = fragment.querySelector('[data-kho-manager-row]');

            if (!row) {
                return;
            }

            tbody.appendChild(row);
            prepareManagerRow(row, item, index);
        });

        syncManagerPopupSummary();
    }

    function prepareManagerRow(row, item, index) {
        const nhanVien = findNhanVien(item.nhanVienId);

        row.querySelector('[data-kho-manager-index]').textContent = String(index + 1);

        const employee = row.querySelector("select[name='khoManagerEmployeeTemplate']");
        const canteen = row.querySelector("input[name='khoManagerCanteenTemplate']");
        const position = row.querySelector("input[name='khoManagerPositionTemplate']");
        const department = row.querySelector("input[name='khoManagerDepartmentTemplate']");
        const selected = row.querySelector("input[name='khoManagerSelectedTemplate']");
        const uid = item.uid;

        employee.id = `khoManagerEmployee_${uid}`;
        employee.name = `khoManagerEmployee_${uid}`;

        renderManagerEmployeeSelect(employee, item.nhanVienId);

        if (canteen) {
            canteen.value = getNhaAnLabel();
        }

        if (position) {
            position.value = getChucVuLabel(nhanVien);
        }

        if (department) {
            department.value = getPhongBanLabel(nhanVien);
        }

        if (selected) {
            const oldId = selected.id;
            const newId = `khoManagerSelected_${uid}`;

            selected.id = newId;
            selected.name = newId;
            selected.checked = item.selected !== false;

            row.querySelector(`label[for="${oldId}"]`)?.setAttribute('for', newId);
        }

        employee?.addEventListener('change', (event) => {
            item.nhanVienId = event.target.value ? Number(event.target.value) : '';
            renderManagerPopup();
        });

        selected?.addEventListener('change', (event) => {
            item.selected = event.target.checked;
            syncManagerPopupSummary();
        });
    }

    function renderManagerEmployeeSelect(select, selectedId) {
        const selected = String(selectedId || '');

        const idsDaDung = new Set(
            dsNvQuanLyTamChon
                .filter((item) => item.nhanVienId && String(item.nhanVienId) !== selected)
                .map((item) => Number(item.nhanVienId))
        );

        select.innerHTML = '<option value=""></option>';

        dsNhanVienNhaAn
            .filter((item) => !idsDaDung.has(Number(item.id)))
            .forEach((item) => {
                const option = document.createElement('option');
                option.value = String(item.id);
                option.textContent = buildLabel(item.maNhanVien ?? item.ma, item.hoTen ?? item.tenNhanVien ?? item.ten);
                select.appendChild(option);
            });

        select.value = selected;

        const wrapper = select.closest('[data-smart-select]');
        const smartSelect = wrapper?.smartSelect || window.MCS?.smartSelect?.initialize?.(wrapper);

        smartSelect?.refresh?.();
        smartSelect?.setValue?.(selected, false);
    }

    function getVisibleManagerRows() {
        return dsNvQuanLyTamChon.filter((item) => {
            if (!item.nhanVienId) {
                return true;
            }

            const nhanVien = findNhanVien(item.nhanVienId);

            if (!nhanVien) {
                return false;
            }

            if (popupSearchText) {
                const text = normalizeSearchText(`${nhanVien.maNhanVien || ''} ${nhanVien.hoTen || ''}`);

                if (!text.includes(popupSearchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    function syncManagerUI() {
        const section = document.querySelector('[data-kho-manager-section]');
        const button = document.querySelector('[data-kho-open-manager]');
        const summary = document.querySelector('[data-kho-manager-summary]');
        const list = document.querySelector('[data-kho-manager-list]');
        const isCreate = currentMode === 'create';

        if (section) {
            section.hidden = isCreate;
        }

        if (button) {
            button.hidden = currentMode !== 'update';
        }

        if (summary) {
            summary.hidden = isCreate;
        }

        if (list) {
            list.hidden = isCreate;
        }
    }

    function renderManagerDetail() {
        const container = document.querySelector('[data-kho-manager-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (currentMode === 'create') {
            return;
        }

        dsNvQuanLyDaChon.forEach((item, index) => {
            const nhanVien = findNhanVien(item.nhanVienId) || item;
            const row = document.createElement('div');

            row.className = 'kho-quan-ly__item';

            row.innerHTML = `
                <div class="kho-quan-ly__item-index">
                    ${index + 1}
                </div>

                <div class="kho-quan-ly__item-name">
                    <strong>
                        ${escapeHtml(nhanVien.hoTen || nhanVien.tenNhanVien || 'Nhân viên')}
                    </strong>

                    <small>
                        ${escapeHtml(nhanVien.maNhanVien || '')}
                    </small>
                </div>

                <div>
                    ${escapeHtml(getNhaAnLabel())}
                </div>

                <div>
                    ${escapeHtml(getChucVuLabel(nhanVien))}
                </div>

                <div>
                    ${escapeHtml(getPhongBanLabel(nhanVien))}
                </div>
            `;

            container.appendChild(row);
        });

        if (dsNvQuanLyDaChon.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'kho-quan-ly__empty';
            empty.textContent = 'Chưa có nhân viên quản lý.';
            container.appendChild(empty);
        }

        syncManagerSummary();
    }

    function syncManagerSummary() {
        const count = document.querySelector('[data-kho-manager-count]');

        if (count) {
            count.textContent = `${dsNvQuanLyDaChon.length} nhân viên`;
        }
    }

    function syncManagerPopupSummary() {
        const summary = document.querySelector('[data-kho-manager-popup-summary]');

        if (!summary) {
            return;
        }

        const count = dsNvQuanLyTamChon.filter((item) => item.selected !== false).length;
        summary.textContent = `Đã chọn ${count} nhân viên`;
    }

    function normalizeManagers(record) {
        const source = Array.isArray(record?.dsNvQuanLy) ? record.dsNvQuanLy : [];

        if (source.length) {
            return source
                .map((item) => ({
                    uid: createManagerUid(),
                    nhanVienId: Number(item.id ?? item.nhanVienId),
                    ...item,
                    selected: true
                }))
                .filter((item) => Number.isInteger(item.nhanVienId) && item.nhanVienId > 0);
        }

        return Array.isArray(record?.dsNvQuanLyId)
            ? record.dsNvQuanLyId
                  .map((id) => ({
                      uid: createManagerUid(),
                      nhanVienId: Number(id),
                      selected: true
                  }))
                  .filter((item) => Number.isInteger(item.nhanVienId) && item.nhanVienId > 0)
            : [];
    }

    function nhanVienThuocNhaAn(id) {
        return dsNhanVienNhaAn.some((item) => Number(item.id) === Number(id));
    }

    function findNhanVien(id) {
        return dsNhanVienNhaAn.find((item) => Number(item.id) === Number(id));
    }

    function getNhaAnLabel() {
        const item = dsNhaAn.find((item) => Number(item.id) === Number(currentNhaAnId));

        return buildLabel(item?.maNhaAn ?? item?.ma, item?.tenNhaAn ?? item?.ten);
    }

    function getChucVuLabel(item) {
        return item?.chucVu?.ten || item?.chucVu?.tenChucVu || item?.tenChucVu || '';
    }

    function getPhongBanLabel(item) {
        return item?.phongBan?.ten || item?.phongBan?.tenPhongBan || item?.tenPhongBan || '';
    }

    function renderNhaAnSelect(selectedValue = '') {
        renderSelect('nhaAnId', dsNhaAn, selectedValue, (item) =>
            buildLabel(item.maNhaAn ?? item.ma, item.tenNhaAn ?? item.ten)
        );
    }

    function renderLoaiKhoSelect(selectedValue = '') {
        renderSelect(
            'loaiKho',
            dsLoaiKho,
            selectedValue,
            (item) => item.label ?? item.ten ?? item.name ?? item.moTa ?? String(item.value ?? item.id ?? ''),
            (item) => item.value ?? item.id ?? item.ma
        );
    }

    function renderSelect(id, data, selectedValue, getLabel, getValue = (item) => item.id) {
        const select = document.getElementById(id);

        if (!select) {
            return;
        }

        const selected = selectedValue === null || selectedValue === undefined ? '' : String(selectedValue);

        select.innerHTML = '<option value=""></option>';

        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = String(getValue(item) ?? '');
            option.textContent = getLabel(item);
            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = select.closest('[data-smart-select]')?.smartSelect;

        smartSelect?.refresh?.();
        smartSelect?.setValue?.(selected, false);
    }

    function formatNumber(value, maxDigits = soChuSoSauDauPhay) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return '—';
        }

        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: maxDigits
        }).format(number);
    }

    function getLoaiKhoLabel(value) {
        const item = dsLoaiKho.find((item) => String(item.value ?? item.id ?? item.ma) === String(value));

        return item?.label ?? item?.ten ?? item?.name ?? value;
    }

    function layGiaTriThietLap(response) {
        return response?.data?.giaTri ?? response?.data?.value ?? response?.data ?? null;
    }

    function setSelectMode(selectId, mode) {
        document
            .getElementById(selectId)
            ?.closest('[data-smart-select]')
            ?.smartSelect?.setDisabled?.(mode === 'view');
    }

    function normalizeOptionalNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }

        let raw = String(value).trim().replace(/\s/g, '');

        if (!raw || raw === '+' || raw === '-' || raw === ',' || raw === '+,' || raw === '-,') {
            return null;
        }

        if (raw.includes(',')) {
            raw = raw.replace(/\./g, '').replace(',', '.');
        }

        const number = Number(raw);

        return Number.isFinite(number) ? number : null;
    }

    function normalizeRequiredNumber(value) {
        const number = normalizeOptionalNumber(value);
        return number;
    }

    function cloneManagers(items) {
        return items.map((item) => ({
            ...item
        }));
    }

    function createManagerUid() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function buildLabel(code, name) {
        const ma = String(code || '').trim();
        const ten = String(name || '').trim();

        if (ma && ten) {
            return `${ma} - ${ten}`;
        }

        return ten || ma;
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_kho.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_kho_import_${Date.now()}.xlsx`);

                await catalogInstance?.load?.();

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-mon-an';
    const API_NHOM_MON_AN = '/api/mcs/v1/dm-nhom-mon-an/tong-hop?active=true';
    const API_THUC_PHAM = '/api/mcs/v1/dm-thuc-pham/tong-hop?active=true';
    const API_LOAI_BAO_QUAN = '/api/mcs/v1/enums?name=loaiBaoQuan';
    const API_QUY_TAC_LAM_TRON = '/api/mcs/v1/thiet-lap/gia-tri?ma=QUY_TAC_LAM_TRON';
    const API_SO_CHU_SO_SAU_DAU_PHAY = '/api/mcs/v1/thiet-lap/gia-tri?ma=SO_CHU_SO_SAU_DAU_PHAY';

    let catalog = null;
    let dsNhomMonAn = [];
    let dsThucPham = [];
    let dsLoaiBaoQuan = [];
    let dsThucPhamDaChon = [];
    let dsThucPhamTamChon = [];
    let currentMode = 'view';
    let popupSearchText = '';
    let popupBaoQuan = [];
    let quyTacLamTron = [];
    let soChuSoSauDauPhay = [];

    initialize();

    async function initialize() {
        await Promise.all([
            loadNhomMonAn(),
            loadThucPham(),
            loadLoaiBaoQuan(),
            loadQuyTacLamTron(),
            loadSoChuSoSauDauPhay()
        ]);

        await initializeCatalog();

        renderNhomMonAnSelect();
        initializePopupFilters();
        bindEvents();
        bindNumberDecimalRules();
        syncChooseButton();
        renderIngredientDetail();
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: 'mon-an',
            permissionCodes: {
                view: 'Q000553',
                create: 'Q000554',
                update: 'Q000555'
            },
            detailTitle: 'Thông tin món ăn',
            createTitle: 'Thêm món ăn',
            updateTitle: 'Cập nhật món ăn',

            headerAction: {
                action: 'cap-nhat-gia',
                label: 'Cập nhật giá',
                icon: 'fa-solid fa-arrows-rotate',
                modes: ['view', 'update']
            },

            toolbarActions: [
                {
                    action: 'filter',
                    label: 'Tìm kiếm chi tiết',
                    icon: 'search'
                },
                {
                    action: 'export-mon-an',
                    label: 'Xuất danh mục món ăn',
                    icon: 'download'
                },
                {
                    action: 'import-mon-an',
                    label: 'Nhập danh mục món ăn',
                    icon: 'upload'
                },
                {
                    action: 'export-cong-thuc',
                    label: 'Xuất danh sách thực phẩm trong món ăn',
                    icon: 'download'
                },
                {
                    action: 'import-cong-thuc',
                    label: 'Nhập danh sách thực phẩm trong món ăn',
                    icon: 'upload'
                }
            ],

            columns: [
                {
                    key: 'maMonAn',
                    label: 'Mã món ăn',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'tenMonAn',
                    label: 'Tên món ăn',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'nhomMonAn.ten',
                    label: 'Nhóm món ăn',
                    filterable: true
                },
                {
                    key: 'giaTien',
                    label: 'Giá món ăn',
                    type: 'currency',
                    sortable: true,
                    render(value) {
                        return formatCurrencyTable(value);
                    }
                },
                {
                    key: 'giaDuKien',
                    label: 'Giá dự kiến',
                    type: 'currency',
                    sortable: true,
                    render(value) {
                        return formatCurrencyTable(value);
                    }
                },
                {
                    key: 'calories',
                    label: 'Calories',
                    type: 'number',
                    sortable: true
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
                maMonAn: '',
                tenMonAn: '',
                nhomMonAnId: '',
                giaTien: '',
                giaDuKien: 0,
                calories: '',
                moTa: '',
                hinhAnh: '',
                dsThucPham: [],
                active: true
            },

            validation: {
                maMonAn: {
                    label: 'Mã món ăn',
                    required: true,
                    maxLength: 50,
                    unique: true,
                    requiredMessage: 'Vui lòng điền vào trường này.',
                    maxLengthMessage: 'Mã món ăn không được vượt quá 50 ký tự.',
                    uniqueMessage: 'Mã món ăn đã tồn tại.'
                },
                tenMonAn: {
                    label: 'Tên món ăn',
                    required: true,
                    maxLength: 150,
                    requiredMessage: 'Vui lòng điền vào trường này.',
                    maxLengthMessage: 'Tên món ăn không được vượt quá 150 ký tự.'
                },
                nhomMonAnId: {
                    label: 'Nhóm món ăn',
                    required: true,
                    requiredMessage: 'Vui lòng chọn nhóm món ăn.'
                },
                moTa: {
                    label: 'Mô tả',
                    maxLength: 500,
                    maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                }
            },

            validate(formData) {
                const errors = {};

                const giaTien = getNumberFieldValue('giaTien', formData.giaTien);

                const giaDuKien = lamTronTheoThietLap(tinhGiaDuKien(dsThucPhamDaChon));

                if (giaTien !== null && giaTien < giaDuKien) {
                    errors.giaTien = 'Giá món ăn phải lớn hơn hoặc bằng giá dự kiến.';
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
                    maMonAn: record?.maMonAn || '',
                    tenMonAn: record?.tenMonAn || '',
                    nhomMonAnId: record?.nhomMonAnId ?? record?.nhomMonAn?.id ?? '',
                    giaTien: record?.giaTien ?? '',
                    giaDuKien: record?.giaDuKien ?? 0,
                    calories: record?.calories ?? '',
                    moTa: record?.moTa || '',
                    hinhAnh: record?.hinhAnh || '',
                    active: record?.active === true
                };
            },

            transformPayload(formData) {
                return {
                    maMonAn: String(formData.maMonAn || '')
                        .trim()
                        .toUpperCase(),

                    tenMonAn: String(formData.tenMonAn || '').trim(),

                    nhomMonAnId: toNullableNumber(formData.nhomMonAnId),

                    giaTien: getNumberFieldValue('giaTien', formData.giaTien),

                    giaDuKien: lamTronTheoThietLap(tinhGiaDuKien(dsThucPhamDaChon)),

                    calories: toNullableNumber(formData.calories),

                    moTa: normalizeNullableText(formData.moTa),

                    hinhAnh: formData.hinhAnh,

                    dsThucPham: dsThucPhamDaChon.map((item) => ({
                        thucPhamId: Number(item.thucPhamId),
                        dinhLuong: lamTronTheoThietLap(item.dinhLuong),
                        ghiChu: item.ghiChu || null
                    })),

                    active: formData.active === true
                };
            },

            onRecordLoaded(record, mode) {
                currentMode = mode || 'view';

                renderNhomMonAnSelect(record?.nhomMonAnId ?? record?.nhomMonAn?.id ?? '');

                syncNumberField('giaTien', record?.giaTien ?? '');

                syncNumberField('giaDuKien', record?.giaDuKien ?? 0);

                syncNumberField('calories', record?.calories ?? '');

                syncImageField(record?.hinhAnh, mode);

                dsThucPhamDaChon = normalizeCongThuc(record);

                dsThucPhamTamChon = cloneIngredients(dsThucPhamDaChon);

                syncChooseButton();
                renderIngredientDetail();
            },

            onHeaderAction: async (context, catalogInstance) => {
                if (context.action?.action !== 'cap-nhat-gia') {
                    return;
                }

                await capNhatGiaMonAn(context.record, catalogInstance);
            },

            onAction(action, id, catalogInstance) {
                switch (action) {
                    case 'export-mon-an':
                        exportData();
                        break;

                    case 'import-mon-an':
                        importData(catalogInstance);
                        break;

                    case 'export-cong-thuc':
                        exportCongThuc();
                        break;

                    case 'import-cong-thuc':
                        importCongThuc(catalogInstance);
                        break;
                }
            }
        });
    }

    async function loadNhomMonAn() {
        dsNhomMonAn = await loadLookup(API_NHOM_MON_AN, 'nhóm món ăn');
    }

    async function loadThucPham() {
        dsThucPham = await loadLookup(API_THUC_PHAM, 'thực phẩm');
    }

    async function loadLoaiBaoQuan() {
        try {
            const response = await window.MCS.api.request(API_LOAI_BAO_QUAN);

            dsLoaiBaoQuan = normalizeEnumData(response?.data);
        } catch (error) {
            dsLoaiBaoQuan = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải điều kiện bảo quản.');
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

    function bindNumberDecimalRules() {
        const giaTienInput = document.getElementById('giaTien');

        bindDecimalLimit(giaTienInput);
    }

    function bindDecimalLimit(input) {
        if (!input || input.dataset.decimalLimitBound === 'true') {
            return;
        }

        input.dataset.decimalLimitBound = 'true';

        input.addEventListener('input', () => {
            const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

            const value = numberInput?.getValue?.();

            if (value === null || value === undefined || value === '') {
                return;
            }

            const raw = String(value);

            const parts = raw.split('.');

            if (parts.length < 2) {
                return;
            }

            if (parts[1].length <= soChuSoSauDauPhay) {
                return;
            }

            const integerPart = parts[0];

            const decimalPart = parts[1].slice(0, soChuSoSauDauPhay);

            const newValue = soChuSoSauDauPhay > 0 ? `${integerPart}.${decimalPart}` : integerPart;

            numberInput?.setValue?.(Number(newValue));
        });
    }

    async function loadLookup(url, label) {
        try {
            const response = await window.MCS.api.request(url);

            const data = response?.data;

            const records = Array.isArray(data) ? data : data?.items || data?.data || [];

            return records.filter((item) => item?.active !== false);
        } catch (error) {
            window.MCS?.toast?.error(error?.message || `Không thể tải danh sách ${label}.`);

            return [];
        }
    }

    function renderNhomMonAnSelect(selectedId = '') {
        renderSelect(
            'nhomMonAnId',
            dsNhomMonAn,
            (item) => item.id,
            (item) => buildLabel(item.maNhomMonAn || item.ma, item.tenNhomMonAn || item.ten),
            selectedId
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

        select.appendChild(emptyOption);

        items.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(getValue(item));

            option.textContent = getLabel(item);

            select.appendChild(option);
        });

        select.value = selected;

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function renderIngredientDetail() {
        const container = document.querySelector('[data-mon-an-ingredient-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        dsThucPhamDaChon.forEach((item, index) => {
            const thucPham = findThucPham(item.thucPhamId);

            const row = document.createElement('div');

            row.className = 'mon-an-cong-thuc__item';

            const ten = thucPham?.tenThucPham || item.tenThucPham || 'Thực phẩm';

            const ma = thucPham?.maThucPham || item.maThucPham || '';

            const donVi = getDonViSuDungLabel(thucPham || item);

            const gia = getThanhTien(item, thucPham);

            row.innerHTML = `
                    <div class="mon-an-cong-thuc__item-index">
                        ${index + 1}
                    </div>

                    <div class="mon-an-cong-thuc__item-name">

                        <strong>
                            ${escapeHtml(ten)}
                        </strong>

                        ${
                            ma
                                ? `
                                    <small>
                                        ${escapeHtml(ma)}
                                    </small>
                                `
                                : ''
                        }

                    </div>

                    <div class="mon-an-cong-thuc__item-value">
                        ${formatNumber(item.dinhLuong)}
                        ${escapeHtml(donVi)}
                    </div>

                    <div class="mon-an-cong-thuc__item-price">
                        ${formatCurrency(gia)}
                    </div>
                `;

            container.appendChild(row);
        });

        if (dsThucPhamDaChon.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'mon-an-cong-thuc__empty';

            empty.textContent = 'Chưa có thực phẩm trong công thức.';

            container.appendChild(empty);
        }

        syncIngredientSummary();
    }

    function addIngredientRow() {
        dsThucPhamTamChon.unshift({
            uid: createUid(),
            thucPhamId: '',
            dinhLuong: '',
            ghiChu: null,
            selected: true
        });

        renderIngredientPopup();
    }

    function renderIngredientPopup() {
        const tbody = document.querySelector('[data-mon-an-ingredient-popup-list]');

        const template = document.getElementById('monAnIngredientRowTemplate');

        if (!tbody || !template) {
            return;
        }

        tbody.innerHTML = '';

        const danhSach = getVisiblePopupRows();

        danhSach.forEach((item, index) => {
            const fragment = template.content.cloneNode(true);

            const row = fragment.querySelector('[data-mon-an-ingredient-row]');

            if (!row) {
                return;
            }

            row.dataset.uid = item.uid;

            tbody.appendChild(row);

            prepareIngredientRow(row, item, index);
        });

        syncIngredientPopupSummary();
    }

    function prepareIngredientRow(row, item, index) {
        const thucPham = findThucPham(item.thucPhamId);

        const indexElement = row.querySelector('[data-mon-an-ingredient-index]');

        if (indexElement) {
            indexElement.textContent = String(index + 1);
        }

        const foodSelect = row.querySelector("select[name='monAnIngredientFoodTemplate']");

        const quantityInput = row.querySelector("input[name='monAnIngredientQuantityTemplate']");

        const priceInput = row.querySelector("input[name='monAnIngredientPriceTemplate']");

        const selectedInput = row.querySelector("input[name='monAnIngredientSelectedTemplate']");

        const uid = item.uid;

        if (foodSelect) {
            foodSelect.id = `monAnIngredientFood_${uid}`;

            foodSelect.name = `monAnIngredientFood_${uid}`;
        }

        if (quantityInput) {
            quantityInput.id = `monAnIngredientQuantity_${uid}`;

            quantityInput.name = `monAnIngredientQuantity_${uid}`;
        }

        if (priceInput) {
            priceInput.id = `monAnIngredientPrice_${uid}`;

            priceInput.name = `monAnIngredientPrice_${uid}`;
        }

        if (selectedInput) {
            const oldId = selectedInput.id;

            const newId = `monAnIngredientSelected_${uid}`;

            selectedInput.id = newId;

            selectedInput.name = newId;

            const label = row.querySelector(`label[for="${oldId}"]`);

            if (label) {
                label.setAttribute('for', newId);
            }
        }

        renderIngredientFoodSelect(foodSelect, item.thucPhamId);

        if (quantityInput) {
            const numberInput = quantityInput.numberInput || window.MCS?.numberInput?.initialize?.(quantityInput);

            numberInput?.setValue?.(item.dinhLuong ?? '');

            bindDecimalLimit(quantityInput);
        }

        syncIngredientQuantityUnit(row, thucPham);

        if (priceInput) {
            priceInput.value = formatCurrency(getGiaDonViSuDung(thucPham));
        }

        if (selectedInput) {
            selectedInput.checked = item.selected !== false;
        }

        bindIngredientRow(row, item);
    }

    function renderIngredientFoodSelect(select, selectedId) {
        if (!select) {
            return;
        }

        const selected = String(selectedId || '');

        const selectedIds = new Set(
            dsThucPhamTamChon
                .filter((item) => item.thucPhamId && String(item.thucPhamId) !== selected)
                .map((item) => Number(item.thucPhamId))
        );

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        dsThucPham
            .filter((item) => !selectedIds.has(Number(item.id)))
            .forEach((item) => {
                const option = document.createElement('option');

                option.value = String(item.id);

                option.textContent = buildLabel(item.maThucPham, item.tenThucPham);

                select.appendChild(option);
            });

        select.value = selected;

        const wrapper = select.closest('[data-smart-select]');

        if (!wrapper) {
            return;
        }

        const smartSelect = wrapper.smartSelect || window.MCS?.smartSelect?.initialize?.(wrapper);

        smartSelect?.refresh?.();

        smartSelect?.setValue?.(selected, false);
    }

    function syncIngredientQuantityUnit(row, thucPham) {
        const field = row.querySelector("input[name^='monAnIngredientQuantity_']")?.closest('[data-form-field]');

        if (!field) {
            return;
        }

        let suffix = field.querySelector('.form-field__suffix');

        if (!suffix) {
            const control = field.querySelector('.form-field__control');

            if (!control) {
                return;
            }

            suffix = document.createElement('span');

            suffix.className = 'form-field__suffix';

            control.appendChild(suffix);
        }

        suffix.textContent = getDonViSuDungLabel(thucPham) || '';
    }

    function bindIngredientRow(row, item) {
        const foodSelect = row.querySelector("select[name^='monAnIngredientFood_']");

        const quantityInput = row.querySelector("input[name^='monAnIngredientQuantity_']");

        const selectedInput = row.querySelector("input[name^='monAnIngredientSelected_']");

        foodSelect?.addEventListener('change', (event) => {
            item.thucPhamId = event.target.value ? Number(event.target.value) : '';

            item.thanhTien = null;

            renderIngredientPopup();
        });

        quantityInput?.addEventListener('input', () => {
            const numberInput = quantityInput.numberInput || window.MCS?.numberInput?.initialize?.(quantityInput);

            item.dinhLuong = numberInput?.getValue?.() ?? null;

            item.thanhTien = null;

            syncIngredientPopupSummary();
        });

        selectedInput?.addEventListener('change', (event) => {
            item.selected = event.target.checked;

            syncIngredientPopupSummary();
        });
    }

    function getDonViSuDungLabel(thucPham) {
        if (!thucPham) {
            return '';
        }

        return (
            thucPham?.donViSuDung?.kyHieu ||
            thucPham?.donViSuDung?.tenDonViTinh ||
            thucPham?.kyHieuDonViSuDung ||
            thucPham?.tenDonViSuDung ||
            ''
        );
    }

    function getGiaDonViSuDung(thucPham) {
        if (!thucPham) {
            return 0;
        }

        const giaNhap = Number(thucPham.giaNhap) || 0;

        const heSo = Number(thucPham.heSoQuyDoi) || 1;

        const tyLe = (Number(thucPham.tyLeHaoHutDuKien) || 0) / 100;

        if (tyLe >= 1) {
            return 0;
        }

        const giaSauHaoHutDvsc = giaNhap / (1 - tyLe);

        return lamTronTheoThietLap(giaSauHaoHutDvsc / heSo);
    }

    function getThanhTien(item, thucPham) {
        const dinhLuong = Number(item?.dinhLuong) || 0;

        const giaDonViSuDung = getGiaDonViSuDung(thucPham);

        return lamTronTheoThietLap(dinhLuong * giaDonViSuDung);
    }

    function getVisiblePopupRows() {
        return dsThucPhamTamChon.filter((row) => {
            if (!row.thucPhamId) {
                return true;
            }

            const thucPham = findThucPham(row.thucPhamId);

            if (!thucPham) {
                return false;
            }

            if (popupBaoQuan.length) {
                const baoQuan = String(thucPham.dieuKienBaoQuan ?? '');

                if (!popupBaoQuan.includes(baoQuan)) {
                    return false;
                }
            }

            if (popupSearchText) {
                const text = normalizeSearchText(`${thucPham.maThucPham || ''} ${thucPham.tenThucPham || ''}`);

                if (!text.includes(popupSearchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    function initializePopupFilters() {
        renderMultipleSelectOptions('monAnIngredientBaoQuan', dsLoaiBaoQuan);
    }

    function renderMultipleSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.innerHTML = '';

        const allOption = document.createElement('option');

        allOption.value = '__ALL__';

        allOption.textContent = 'Tất cả';

        select.appendChild(allOption);

        options.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);

            option.textContent = item.label;

            select.appendChild(option);
        });

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function normalizeEnumData(data) {
        const records = Array.isArray(data) ? data : [];

        return records.map((item) => ({
            value: item.value,

            label: item.label ?? item.name ?? item.ten ?? String(item.value)
        }));
    }

    function bindEvents() {
        document.querySelector('[data-mon-an-open-ingredient]')?.addEventListener('click', openIngredientPopup);

        document.querySelector('[data-mon-an-ingredient-add]')?.addEventListener('click', addIngredientRow);

        document.querySelector('[data-mon-an-ingredient-save]')?.addEventListener('click', saveIngredientPopup);

        document.querySelector('[data-mon-an-ingredient-cancel]')?.addEventListener('click', cancelIngredientPopup);

        document.querySelector('[data-mon-an-ingredient-close]')?.addEventListener('click', cancelIngredientPopup);

        document.getElementById('giaTien')?.addEventListener('input', validateGiaMonAn);

        document.getElementById('monAnIngredientSearch')?.addEventListener('input', (event) => {
            popupSearchText = normalizeSearchText(event.target.value);

            renderIngredientPopup();
        });

        document.getElementById('monAnIngredientBaoQuan')?.addEventListener('change', () => {
            popupBaoQuan = getMultiSelectValues('monAnIngredientBaoQuan');

            renderIngredientPopup();
        });

        document.querySelector('[data-catalog-create]')?.addEventListener('click', () => {
            currentMode = 'create';
            dsThucPhamDaChon = [];
            dsThucPhamTamChon = [];

            syncChooseButton();
            renderIngredientDetail();

            syncImageField('', 'create');
        });
    }

    function openIngredientPopup() {
        if (currentMode === 'view') {
            return;
        }

        dsThucPhamTamChon = cloneIngredients(dsThucPhamDaChon);

        popupSearchText = '';
        popupBaoQuan = [];

        const search = document.getElementById('monAnIngredientSearch');

        if (search) {
            search.value = '';
        }

        clearSmartSelect('monAnIngredientBaoQuan');

        const modal = document.querySelector('[data-mon-an-ingredient-modal]');

        if (!modal) {
            return;
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.hidden = false;

        document.body.classList.add('mon-an-ingredient-open');

        renderIngredientPopup();
    }

    function saveIngredientPopup() {
        const danhSach = dsThucPhamTamChon.filter((item) => item.selected !== false);

        for (const item of danhSach) {
            if (!item.thucPhamId) {
                window.MCS?.toast?.error('Vui lòng chọn thực phẩm.');

                return;
            }

            const dinhLuong = Number(item.dinhLuong);

            if (!Number.isFinite(dinhLuong) || dinhLuong <= 0) {
                window.MCS?.toast?.error('Định lượng thực phẩm phải lớn hơn 0.');

                return;
            }

            item.dinhLuong = lamTronTheoThietLap(dinhLuong);
        }

        dsThucPhamDaChon = cloneIngredients(danhSach);

        renderIngredientDetail();
        closeIngredientPopup();
    }

    function cancelIngredientPopup() {
        dsThucPhamTamChon = cloneIngredients(dsThucPhamDaChon);

        closeIngredientPopup();
    }

    function closeIngredientPopup() {
        const modal = document.querySelector('[data-mon-an-ingredient-modal]');

        if (modal) {
            modal.hidden = true;
        }

        document.body.classList.remove('mon-an-ingredient-open');
    }

    function normalizeCongThuc(record) {
        const source = Array.isArray(record?.dsThucPham) ? record.dsThucPham : [];

        return source.map((item) => ({
            uid: createUid(),

            thucPhamId: Number(item.thucPhamId ?? item.id),

            dinhLuong: Number(item.dinhLuong ?? item.dinhLuongDvsd ?? 0),

            ghiChu: item.ghiChu ?? null,

            maThucPham: item.maThucPham,

            tenThucPham: item.tenThucPham,

            thanhTien: null,

            selected: true
        }));
    }

    function findThucPham(id) {
        return dsThucPham.find((item) => Number(item.id) === Number(id));
    }

    function cloneIngredients(items) {
        return items.map((item) => ({
            ...item
        }));
    }

    function createUid() {
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

    function normalizeNullableText(value) {
        const text = String(value ?? '').trim();

        return text || null;
    }

    function toNullableNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function getNumberFieldValue(inputId, fallbackValue = null) {
        const input = document.getElementById(inputId);

        if (!input) {
            return toNullableNumber(fallbackValue);
        }

        const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

        const value = numberInput?.getValue ? numberInput.getValue() : input.value;

        return toNullableNumber(value);
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

    function formatNumber(value) {
        const number = lamTronTheoThietLap(value);

        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: soChuSoSauDauPhay
        }).format(number);
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

        let result;

        switch (quyTacLamTron) {
            case 1:
                result = Math.ceil(scaled);

                break;

            case 2:
                result = Math.floor(scaled);

                break;

            case 0:
            default:
                result = Math.floor(scaled + 0.5);

                break;
        }

        return Number((result / factor).toFixed(decimalPlaces));
    }

    function formatCurrency(value) {
        const number = lamTronTheoThietLap(value);

        const hasDecimal = !Number.isInteger(number);

        return `${new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: hasDecimal ? soChuSoSauDauPhay : 0,

            maximumFractionDigits: soChuSoSauDauPhay
        }).format(number)} VNĐ`;
    }

    function formatCurrencyTable(value) {
        const number = lamTronTheoThietLap(value);

        const hasDecimal = !Number.isInteger(number);

        const element = document.createElement('span');

        element.textContent = `${new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: hasDecimal ? soChuSoSauDauPhay : 0,

            maximumFractionDigits: soChuSoSauDauPhay
        }).format(number)} đ`;

        return element;
    }

    function getMultiSelectValues(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => String(option.value))
            .filter((value) => value !== '__ALL__');
    }

    function clearSmartSelect(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.selected = false;
        });

        select.closest('[data-smart-select]')?.smartSelect?.refresh?.();
    }

    function syncChooseButton() {
        const button = document.querySelector('[data-mon-an-open-ingredient]');

        if (button) {
            button.hidden = currentMode === 'view';
        }
    }

    function tinhGiaDuKien(danhSach = dsThucPhamDaChon) {
        const total = danhSach.reduce((tongTien, item) => {
            if (item.selected === false) {
                return tongTien;
            }

            const thucPham = findThucPham(item.thucPhamId);

            const thanhTien = getThanhTien(item, thucPham);

            return tongTien + thanhTien;
        }, 0);

        return lamTronTheoThietLap(total);
    }

    function syncGiaDuKien(danhSach = dsThucPhamDaChon) {
        const giaDuKien = lamTronTheoThietLap(tinhGiaDuKien(danhSach));

        syncNumberField('giaDuKien', giaDuKien);

        return giaDuKien;
    }

    function syncIngredientSummary() {
        const count = document.querySelector('[data-mon-an-ingredient-count]');

        if (count) {
            count.textContent = `${dsThucPhamDaChon.length} thực phẩm`;
        }

        const total = tinhGiaDuKien(dsThucPhamDaChon);

        const price = document.querySelector('[data-mon-an-estimated-price]');

        if (price) {
            price.textContent = formatCurrency(total);
        }

        syncGiaDuKien(dsThucPhamDaChon);

        validateGiaMonAn();
    }

    function validateGiaMonAn() {
        const giaTienInput = document.getElementById('giaTien');

        if (!giaTienInput) {
            return true;
        }

        const giaTien = getNumberFieldValue('giaTien');

        const giaDuKien = lamTronTheoThietLap(tinhGiaDuKien(dsThucPhamDaChon));

        const field = giaTienInput.closest('[data-form-field]');

        const errorElement = field?.querySelector('[data-field-error], .form-field__error');

        const coGiaTien = giaTien !== null;

        const invalid = coGiaTien && giaTien < giaDuKien;

        field?.classList.toggle('is-invalid', invalid);

        giaTienInput.setAttribute('aria-invalid', invalid ? 'true' : 'false');

        if (errorElement) {
            errorElement.textContent = invalid ? 'Giá món ăn phải lớn hơn hoặc bằng giá dự kiến.' : '';
        }

        return !invalid;
    }

    function syncIngredientPopupSummary() {
        const summary = document.querySelector('[data-mon-an-ingredient-popup-summary]');

        if (!summary) {
            return;
        }

        const danhSach = dsThucPhamTamChon.filter((item) => item.selected !== false);

        const count = danhSach.length;

        const total = tinhGiaDuKien(danhSach);

        summary.textContent = `Đã chọn ${count} thực phẩm - ${formatCurrency(total)}`;
    }

    function syncNumberField(inputId, value) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const numberInput = input.numberInput || window.MCS?.numberInput?.initialize?.(input);

        if (numberInput?.setValue) {
            numberInput.setValue(value ?? '');

            return;
        }

        input.value = value ?? '';
    }

    function syncImageField(value, mode) {
        const root = document.querySelector('[data-form-field="hinhAnh"]')?.querySelector('[data-image-picker]');

        const imagePicker = root?.imagePicker || window.MCS?.imagePicker?.initialize?.(root);

        if (!imagePicker) {
            return;
        }

        imagePicker.setValue?.(value || '');

        imagePicker.setDisabled?.(mode === 'view');
    }

    function escapeHtml(value) {
        const div = document.createElement('div');

        div.textContent = String(value ?? '');

        return div.innerHTML;
    }

    async function capNhatGiaMonAn(record, catalogInstance) {
        const monAnId = Number(record?.id);

        if (!Number.isInteger(monAnId) || monAnId <= 0) {
            window.MCS?.toast?.error('Không xác định được món ăn cần cập nhật giá.');

            return;
        }

        try {
            const result = await window.MCS.api.request(`${API_BASE}/cap-nhat-gia`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    dsMonAnId: [monAnId]
                })
            });

            window.MCS?.toast?.success(result?.message || 'Cập nhật giá món ăn thành công.');

            await catalogInstance?.load?.();

            await catalogInstance?.openUpdate?.(monAnId);
        } catch (error) {
            console.error('Cập nhật giá món ăn thất bại:', error);

            window.MCS?.toast?.error(error?.message || 'Cập nhật giá món ăn thất bại.');
        }
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_mon_an.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu món ăn thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu món ăn thất bại:', error);

            window.MCS?.toast?.error(error?.message || 'Xuất dữ liệu món ăn thất bại.');
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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_mon_an_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import món ăn. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import món ăn thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu món ăn thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }

    async function exportCongThuc() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-cong-thuc`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'ct_mon_an_thuc_pham.xlsx');

            window.MCS?.toast?.success('Xuất công thức món ăn thành công.');
        } catch (error) {
            console.error('Xuất công thức món ăn thất bại:', error);

            window.MCS?.toast?.error(error?.message || 'Xuất công thức món ăn thất bại.');
        }
    }

    function importCongThuc(catalogInstance) {
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

                const result = await window.MCS.api.requestFile(`${API_BASE}/import-cong-thuc`, {
                    method: 'POST',
                    body
                });

                window.MCS.api.downloadBlob(
                    result.blob,
                    result.fileName || `ct_mon_an_thuc_pham_import_${Date.now()}.xlsx`
                );

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import công thức món ăn.');
            } catch (error) {
                console.error('Import công thức món ăn thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import công thức món ăn thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

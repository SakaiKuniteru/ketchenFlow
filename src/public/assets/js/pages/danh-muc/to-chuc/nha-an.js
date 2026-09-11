'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-nha-an';
    const API_CO_SO = '/api/mcs/v1/dm-co-so/tong-hop?active=true';
    const API_NHAN_VIEN = '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true';

    let catalog = null;
    let dsCoSo = [];
    let dsNhanVien = [];
    let dsNvQuanLyDaChon = [];
    let dsNvQuanLyTamChon = [];
    let currentMode = 'view';
    let popupSearchText = '';
    let currentNhaAnId = null;

    initialize();

    async function initialize() {
        await Promise.all([loadCoSo(), loadNhanVien()]);

        await initializeCatalog();

        renderCoSoSelect();
        bindManagerEvents();
        syncManagerUI();
        renderManagerDetail();
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'nha-an',
                permissionCodes: {
                    view: 'Q000544',
                    create: 'Q000545',
                    update: 'Q000546'
                },
                columns: [
                    {
                        key: 'maNhaAn',
                        label: 'Mã nhà ăn',
                        width: '180px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenNhaAn',
                        label: 'Tên nhà ăn',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'coSo.ten',
                        label: 'Cơ sở',
                        width: '240px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'active',
                        label: 'Trạng thái',
                        width: '130px',
                        sortable: true,
                        className: 'catalog-table__cell--center',
                        render: window.createStatusBadge
                    }
                ],

                defaultValues: {
                    maNhaAn: '',
                    tenNhaAn: '',
                    coSoId: '',
                    dsNvQuanLyId: [],
                    active: true
                },

                validation: {
                    maNhaAn: {
                        label: 'Mã nhà ăn',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã nhà ăn không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã nhà ăn đã tồn tại.'
                    },

                    tenNhaAn: {
                        label: 'Tên nhà ăn',
                        required: true,
                        maxLength: 150,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên nhà ăn không được vượt quá 150 ký tự.',
                        uniqueMessage: 'Tên nhà ăn đã tồn tại.'
                    },

                    coSoId: {
                        label: 'Cơ sở',
                        required: true,
                        requiredMessage: 'Vui lòng chọn cơ sở.'
                    }
                },

                detailTitle: 'Thông tin nhà ăn',
                createTitle: 'Thêm nhà ăn',
                updateTitle: 'Cập nhật nhà ăn',

                getRecordSubtitle(record) {
                    return record?.maNhaAn || '';
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
                        maNhaAn: record?.maNhaAn || '',
                        tenNhaAn: record?.tenNhaAn || '',
                        coSoId: record?.coSoId ?? record?.coSo?.id ?? '',
                        dsNvQuanLyId: Array.isArray(record?.dsNvQuanLyId) ? record.dsNvQuanLyId : [],
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    const payload = {
                        maNhaAn: String(formData.maNhaAn || '')
                            .trim()
                            .toUpperCase(),

                        tenNhaAn: String(formData.tenNhaAn || '').trim(),

                        coSoId: normalizeRequiredNumber(formData.coSoId),

                        active: formData.active === true
                    };

                    if (currentMode === 'update') {
                        payload.dsNvQuanLyId = dsNvQuanLyDaChon.map((item) => Number(item.nhanVienId));
                    }

                    return payload;
                },

                onRecordLoaded(record, mode) {
                    currentMode = mode || 'view';

                    const nhaAnIdMoi = record?.id !== undefined && record?.id !== null ? Number(record.id) : null;

                    if (currentNhaAnId !== nhaAnIdMoi) {
                        dsNvQuanLyDaChon = [];
                        dsNvQuanLyTamChon = [];
                    }

                    currentNhaAnId = nhaAnIdMoi;

                    renderCoSoSelect(record?.coSoId ?? record?.coSo?.id ?? '');

                    setSelectMode('coSoId', mode);

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
                        action: 'export-nha-an',
                        label: 'Xuất danh mục nhà ăn',
                        icon: 'download'
                    },
                    {
                        action: 'import-nha-an',
                        label: 'Nhập danh mục nhà ăn',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-nha-an') {
                        exportData();
                        return;
                    }

                    if (action === 'import-nha-an') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục nhà ăn.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục nhà ăn.');
        }
    }

    async function loadCoSo() {
        try {
            const response = await window.MCS.api.request(API_CO_SO);

            const data = response?.data;

            dsCoSo = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsCoSo = dsCoSo.filter((item) => item?.active !== false);
        } catch (error) {
            console.error('Không thể tải danh sách cơ sở.', error);

            dsCoSo = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách cơ sở.');
        }
    }

    async function loadNhanVien() {
        try {
            const response = await window.MCS.api.request(API_NHAN_VIEN);

            const data = response?.data;

            dsNhanVien = Array.isArray(data) ? data : data?.items || data?.data || [];

            dsNhanVien = dsNhanVien.filter((item) => item?.active !== false);
        } catch (error) {
            console.error('Không thể tải danh sách nhân viên.', error);

            dsNhanVien = [];

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách nhân viên.');
        }
    }

    function bindManagerEvents() {
        document.querySelector('[data-nha-an-open-manager]')?.addEventListener('click', openManagerPopup);

        document.querySelector('[data-nha-an-manager-add]')?.addEventListener('click', addManagerRow);

        document.querySelector('[data-nha-an-manager-save]')?.addEventListener('click', saveManagerPopup);

        document.querySelector('[data-nha-an-manager-cancel]')?.addEventListener('click', cancelManagerPopup);

        document.querySelector('[data-nha-an-manager-close]')?.addEventListener('click', cancelManagerPopup);

        document.getElementById('nhaAnManagerSearch')?.addEventListener('input', (event) => {
            popupSearchText = normalizeSearchText(event.target.value);

            renderManagerPopup();
        });

        document.querySelector('[data-catalog-create]')?.addEventListener('click', () => {
            currentMode = 'create';
            currentNhaAnId = null;
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

        dsNvQuanLyTamChon = cloneManagers(dsNvQuanLyDaChon);

        popupSearchText = '';

        const search = document.getElementById('nhaAnManagerSearch');

        if (search) {
            search.value = '';
        }

        const modal = document.querySelector('[data-nha-an-manager-modal]');

        if (!modal) {
            return;
        }

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        modal.hidden = false;

        document.body.classList.add('nha-an-manager-open');

        renderManagerPopup();
    }

    function closeManagerPopup() {
        const modal = document.querySelector('[data-nha-an-manager-modal]');

        if (modal) {
            modal.hidden = true;
        }

        document.body.classList.remove('nha-an-manager-open');
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
        const tbody = document.querySelector('[data-nha-an-manager-popup-list]');

        const template = document.getElementById('nhaAnManagerRowTemplate');

        if (!tbody || !template) {
            return;
        }

        tbody.innerHTML = '';

        const danhSach = getVisibleManagerRows();

        danhSach.forEach((item, index) => {
            const fragment = template.content.cloneNode(true);

            const row = fragment.querySelector('[data-nha-an-manager-row]');

            if (!row) {
                return;
            }

            row.dataset.uid = item.uid;

            tbody.appendChild(row);

            prepareManagerRow(row, item, index);
        });

        syncManagerPopupSummary();
    }

    function prepareManagerRow(row, item, index) {
        const nhanVien = findNhanVien(item.nhanVienId);

        const indexElement = row.querySelector('[data-nha-an-manager-index]');

        if (indexElement) {
            indexElement.textContent = String(index + 1);
        }

        const employeeSelect = row.querySelector("select[name='nhaAnManagerEmployeeTemplate']");

        const positionInput = row.querySelector("input[name='nhaAnManagerPositionTemplate']");

        const departmentInput = row.querySelector("input[name='nhaAnManagerDepartmentTemplate']");

        const selectedInput = row.querySelector("input[name='nhaAnManagerSelectedTemplate']");

        const uid = item.uid;

        if (employeeSelect) {
            employeeSelect.id = `nhaAnManagerEmployee_${uid}`;
            employeeSelect.name = `nhaAnManagerEmployee_${uid}`;
        }

        if (positionInput) {
            positionInput.id = `nhaAnManagerPosition_${uid}`;
            positionInput.name = `nhaAnManagerPosition_${uid}`;
        }

        if (departmentInput) {
            departmentInput.id = `nhaAnManagerDepartment_${uid}`;
            departmentInput.name = `nhaAnManagerDepartment_${uid}`;
        }

        if (selectedInput) {
            const oldId = selectedInput.id;
            const newId = `nhaAnManagerSelected_${uid}`;

            selectedInput.id = newId;
            selectedInput.name = newId;

            const label = row.querySelector(`label[for="${oldId}"]`);

            if (label) {
                label.setAttribute('for', newId);
            }
        }

        renderManagerEmployeeSelect(employeeSelect, item.nhanVienId);

        syncManagerInformation(positionInput, departmentInput, nhanVien);

        if (selectedInput) {
            selectedInput.checked = item.selected !== false;
        }

        bindManagerRow(row, item);
    }

    function renderManagerEmployeeSelect(select, selectedId) {
        if (!select) {
            return;
        }

        const selected = String(selectedId || '');

        const selectedIds = new Set(
            dsNvQuanLyTamChon
                .filter((item) => item.nhanVienId && String(item.nhanVienId) !== selected)
                .map((item) => Number(item.nhanVienId))
        );

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        dsNhanVien
            .filter((item) => !selectedIds.has(Number(item.id)))
            .forEach((item) => {
                const option = document.createElement('option');

                option.value = String(item.id);

                option.textContent = buildLabel(
                    item.maNhanVien || item.ma,

                    item.hoTen || item.tenNhanVien || item.ten
                );

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

    function syncManagerInformation(positionInput, departmentInput, nhanVien) {
        if (positionInput) {
            positionInput.value = getChucVuLabel(nhanVien);
        }

        if (departmentInput) {
            departmentInput.value = getPhongBanLabel(nhanVien);
        }
    }

    function getChucVuLabel(nhanVien) {
        if (!nhanVien) {
            return '';
        }

        return nhanVien?.chucVu?.ten || nhanVien?.chucVu?.tenChucVu || nhanVien?.tenChucVu || '';
    }

    function getPhongBanLabel(nhanVien) {
        if (!nhanVien) {
            return '';
        }

        return nhanVien?.phongBan?.ten || nhanVien?.phongBan?.tenPhongBan || nhanVien?.tenPhongBan || '';
    }

    function bindManagerRow(row, item) {
        const employeeSelect = row.querySelector("select[name^='nhaAnManagerEmployee_']");

        const selectedInput = row.querySelector("input[name^='nhaAnManagerSelected_']");

        employeeSelect?.addEventListener('change', (event) => {
            item.nhanVienId = event.target.value ? Number(event.target.value) : '';

            renderManagerPopup();
        });

        selectedInput?.addEventListener('change', (event) => {
            item.selected = event.target.checked;

            syncManagerPopupSummary();
        });
    }

    function getVisibleManagerRows() {
        return dsNvQuanLyTamChon.filter((row) => {
            if (!row.nhanVienId) {
                return true;
            }

            const nhanVien = findNhanVien(row.nhanVienId);

            if (!nhanVien) {
                return false;
            }

            if (popupSearchText) {
                const text = normalizeSearchText(
                    `${nhanVien.maNhanVien || ''} ${nhanVien.hoTen || nhanVien.tenNhanVien || ''}`
                );

                if (!text.includes(popupSearchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    function syncManagerUI() {
        const section = document.querySelector('[data-nha-an-manager-section]');

        const button = document.querySelector('[data-nha-an-open-manager]');

        const summary = document.querySelector('[data-nha-an-manager-summary]');

        const list = document.querySelector('[data-nha-an-manager-list]');

        const isCreate = currentMode === 'create';

        const isUpdate = currentMode === 'update';

        if (section) {
            section.hidden = isCreate;
        }

        if (button) {
            button.hidden = !isUpdate;
        }

        if (summary) {
            summary.hidden = isCreate;
        }

        if (list) {
            list.hidden = isCreate;
        }
    }

    function renderManagerDetail() {
        const container = document.querySelector('[data-nha-an-manager-list]');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (currentMode === 'create') {
            return;
        }

        dsNvQuanLyDaChon.forEach((item, index) => {
            const nhanVien = findNhanVien(item.nhanVienId);

            const row = document.createElement('div');

            row.className = 'nha-an-quan-ly__item';

            row.innerHTML = `
                    <div class="nha-an-quan-ly__item-index">
                        ${index + 1}
                    </div>

                    <div class="nha-an-quan-ly__item-name">
                        <strong>
                            ${escapeHtml(nhanVien?.hoTen || nhanVien?.tenNhanVien || item.hoTen || 'Nhân viên')}
                        </strong>

                        <small>
                            ${escapeHtml(nhanVien?.maNhanVien || item.maNhanVien || '')}
                        </small>
                    </div>

                    <div class="nha-an-quan-ly__item-position">
                        ${escapeHtml(getChucVuLabel(nhanVien || item))}
                    </div>

                    <div class="nha-an-quan-ly__item-department">
                        ${escapeHtml(getPhongBanLabel(nhanVien || item))}
                    </div>
                `;

            container.appendChild(row);
        });

        if (dsNvQuanLyDaChon.length === 0) {
            const empty = document.createElement('div');

            empty.className = 'nha-an-quan-ly__empty';

            empty.textContent = 'Chưa có nhân viên quản lý.';

            container.appendChild(empty);
        }

        syncManagerSummary();
    }

    function syncManagerSummary() {
        const count = document.querySelector('[data-nha-an-manager-count]');

        if (count) {
            count.textContent = `${dsNvQuanLyDaChon.length} nhân viên`;
        }
    }

    function syncManagerPopupSummary() {
        const summary = document.querySelector('[data-nha-an-manager-popup-summary]');

        if (!summary) {
            return;
        }

        const count = dsNvQuanLyTamChon.filter((item) => item.selected !== false).length;

        summary.textContent = `Đã chọn ${count} nhân viên`;
    }

    function normalizeManagers(record) {
        if (Array.isArray(record?.dsNvQuanLy)) {
            return record.dsNvQuanLy
                .map((item) => {
                    const nhanVienId = Number(item.id ?? item.nhanVienId);

                    if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
                        return null;
                    }

                    return {
                        uid: createManagerUid(),
                        nhanVienId,
                        maNhanVien: item.maNhanVien,
                        hoTen: item.hoTen,
                        chucVu: item.chucVu,
                        phongBan: item.phongBan,
                        selected: true
                    };
                })
                .filter(Boolean);
        }

        if (Array.isArray(record?.dsNvQuanLyId)) {
            return record.dsNvQuanLyId
                .map((id) => {
                    const nhanVienId = Number(id);

                    if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
                        return null;
                    }

                    return {
                        uid: createManagerUid(),
                        nhanVienId,
                        selected: true
                    };
                })
                .filter(Boolean);
        }

        return [];
    }

    function cloneManagers(items) {
        return items.map((item) => ({
            ...item
        }));
    }

    function createManagerUid() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function findNhanVien(id) {
        return dsNhanVien.find((item) => Number(item.id) === Number(id));
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

    function renderCoSoSelect(selectedValue = '') {
        const select = document.getElementById('coSoId');

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

        dsCoSo.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);

            option.textContent = buildLabel(item.maCoSo || item.ma, item.tenCoSo || item.ten);

            option.selected = selected !== '' && String(item.id) === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = select.closest('[data-smart-select]')?.smartSelect;

        smartSelect?.refresh?.();

        if (selected === '') {
            smartSelect?.clear?.();
        }
    }

    function setSelectMode(selectId, mode) {
        const root = document.getElementById(selectId)?.closest('[data-smart-select]');

        root?.smartSelect?.setDisabled?.(mode === 'view');
    }

    function buildLabel(code, name) {
        const ma = String(code || '').trim();

        const ten = String(name || '').trim();

        if (ma && ten) {
            return `${ma} - ${ten}`;
        }

        return ten || ma;
    }

    function normalizeRequiredNumber(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_nha_an.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu nhà ăn thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_nha_an_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import dữ liệu nhà ăn thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

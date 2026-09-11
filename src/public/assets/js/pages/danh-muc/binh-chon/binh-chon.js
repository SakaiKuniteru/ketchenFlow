'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/binh-chon';
    const API_TRANG_THAI = '/api/mcs/v1/enums?name=trangThaiTaoBinhChon';
    const API_THUC_DON_NGAY_HOP_LE = `${API_BASE}/thuc-don-ngay-hop-le`;

    let catalog = null;
    let dsTrangThai = [];
    let dsThucDonNgay = [];
    let permissionSet = new Set();

    initialize();

    async function initialize() {
        try {
            await loadDanhMucPhu();
            await initializeCatalog();

            permissionSet = getCurrentPermissionSet();

            catalog?.table?.render();

            applyRecordUpdatePermission();
            bindEvents();
        } catch (error) {
            console.error('Không thể khởi tạo quản lý bình chọn.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải quản lý bình chọn.');
        }
    }

    async function loadDanhMucPhu() {
        const result = await window.MCS.api.request(API_TRANG_THAI);

        dsTrangThai = Array.isArray(result?.data) ? result.data : [];
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: 'binh-chon',

            permissionCodes: {
                view: ['Q001018', 'Q001019', 'Q001020'],
                create: ['Q001019'],
                update: ['Q001020']
            },

            detailTitle: 'Thông tin đợt bình chọn',
            createTitle: 'Thêm đợt bình chọn',
            updateTitle: 'Cập nhật đợt bình chọn',

            columns: [
                {
                    key: 'ngayHienThi',
                    label: 'Ngày',
                    width: '120px',
                    sortable: true,
                    filterable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'tenThucDon',
                    label: 'Thực đơn',
                    width: '240px',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'tenNhaAn',
                    label: 'Nhà ăn',
                    width: '180px',
                    sortable: true,
                    filterable: true
                },
                {
                    key: 'tenCaAn',
                    label: 'Ca ăn',
                    width: '140px',
                    sortable: true,
                    filterable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'batDauHienThi',
                    label: 'Bắt đầu',
                    width: '170px',
                    sortable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'hanHienThi',
                    label: 'Hạn bình chọn',
                    width: '170px',
                    sortable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'trangThaiHienThi',
                    label: 'Trạng thái',
                    width: '130px',
                    sortable: true,
                    filterable: true,
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'tongBinhChon',
                    label: 'Đã bình chọn',
                    width: '120px',
                    sortable: true,
                    type: 'number',
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'coThamGia',
                    label: 'Tham gia',
                    width: '100px',
                    sortable: true,
                    type: 'number',
                    className: 'catalog-table__cell--center'
                },
                {
                    key: 'xoa',
                    label: 'Xóa',
                    width: '70px',
                    sortable: false,
                    filterable: false,
                    title: false,
                    className: 'catalog-table__cell--center catalog-table__cell--actions',

                    render(value, record) {
                        const coQuyenXoa = hasDeletePermission();

                        const button = document.createElement('button');

                        button.type = 'button';
                        button.className = ['binh-chon-delete-button', coQuyenXoa ? 'is-enabled' : 'is-disabled'].join(
                            ' '
                        );

                        button.title = coQuyenXoa ? 'Xóa đợt bình chọn' : 'Bạn không có quyền xóa đợt bình chọn';

                        button.setAttribute('aria-label', button.title);

                        button.disabled = !coQuyenXoa;

                        const icon = document.createElement('i');

                        icon.className = 'fa-solid fa-trash-can';

                        icon.setAttribute('aria-hidden', 'true');

                        button.appendChild(icon);

                        button.addEventListener('click', async (event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            if (!coQuyenXoa) {
                                return;
                            }

                            await handleXoa(record, catalog);
                        });

                        return button;
                    }
                }
            ],

            defaultValues: {
                thucDonNgayId: '',
                batDauBinhChon: '',
                hanBinhChon: '',
                choPhepThayDoi: true,
                trangThai: '',
                trangThaiThoiGian: '',
                nguoiTao: '',
                nguoiGui: '',
                thoiGianGui: '',
                nguoiHuy: '',
                thoiGianHuy: '',
                lyDoHuy: ''
            },

            validation: {
                thucDonNgayId: {
                    label: 'Ngày thực đơn',
                    required: true,
                    requiredMessage: 'Vui lòng chọn ngày thực đơn.'
                },

                batDauBinhChon: {
                    label: 'Bắt đầu bình chọn',
                    required: true,
                    requiredMessage: 'Vui lòng chọn thời gian bắt đầu bình chọn.'
                },

                hanBinhChon: {
                    label: 'Hạn bình chọn',
                    required: true,
                    requiredMessage: 'Vui lòng chọn hạn bình chọn.'
                }
            },

            validate(formData) {
                const errors = {};

                const batDau = parseDate(formData.batDauBinhChon);

                const han = parseDate(formData.hanBinhChon);

                if (batDau && han && batDau >= han) {
                    errors.hanBinhChon = 'Hạn bình chọn phải lớn hơn thời gian bắt đầu.';
                }

                const thucDonNgay = dsThucDonNgay.find((item) => String(item?.id) === String(formData.thucDonNgayId));

                const hanToiDa = parseDate(thucDonNgay?.hanBinhChonToiDa);

                if (han && hanToiDa && han > hanToiDa) {
                    errors.hanBinhChon =
                        'Hạn bình chọn phải trước thời gian bắt đầu ca ăn ít nhất 3 giờ. ' +
                        `Hạn tối đa là ${formatDateTime(hanToiDa)}.`;
                }

                return errors;
            },

            mapListResponse(result) {
                const records = Array.isArray(result?.data) ? result.data : [];

                return records.map(mapBinhChonHienThi);
            },

            mapDetailResponse(result) {
                return mapBinhChonHienThi(result?.data || null);
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? '',
                    thucDonNgayId: record?.thucDonNgayId ?? '',
                    batDauBinhChon: toDatePickerValue(record?.batDauBinhChon),
                    hanBinhChon: toDatePickerValue(record?.hanBinhChon),
                    choPhepThayDoi: record?.choPhepThayDoi !== false,
                    trangThai: getTrangThaiLabel(record),
                    trangThaiThoiGian: record?.trangThaiThoiGian?.name || '',
                    nguoiTao: getNguoiLabel(record?.nguoiTao),
                    nguoiGui: getNguoiLabel(record?.nguoiGui),
                    thoiGianGui: toDatePickerValue(record?.thoiGianGui),
                    nguoiHuy: getNguoiLabel(record?.nguoiHuy),
                    thoiGianHuy: toDatePickerValue(record?.thoiGianHuy),
                    lyDoHuy: record?.lyDoHuy || ''
                };
            },

            async onRecordLoaded(record, mode) {
                const dotBinhChonId = record?.id || null;

                await loadThucDonNgayHopLe(dotBinhChonId);

                renderThucDonNgayOptions(record?.thucDonNgayId ?? '');

                renderThongTinThucDon(record?.thucDonNgayId);

                setDatePickerValue('batDauBinhChon', toDatePickerValue(record?.batDauBinhChon));

                setDatePickerValue('hanBinhChon', toDatePickerValue(record?.hanBinhChon));

                setDatePickerValue('thoiGianGui', toDatePickerValue(record?.thoiGianGui));

                setDatePickerValue('thoiGianHuy', toDatePickerValue(record?.thoiGianHuy));

                renderThongKe(record);
                syncLyDoHuyField(record);

                syncHanBinhChonMoLaiField(record, mode);
            },

            transformPayload(formData) {
                return {
                    thucDonNgayId: Number(formData.thucDonNgayId),
                    batDauBinhChon: formData.batDauBinhChon,
                    hanBinhChon: formData.hanBinhChon,
                    choPhepThayDoi: formData.choPhepThayDoi === true
                };
            },

            getRecordSubtitle(record) {
                return [record?.ngayHienThi, record?.tenCaAn].filter(Boolean).join(' - ');
            },

            headerActions: [
                {
                    action: 'gui-binh-chon',
                    label: 'Gửi',
                    icon: 'fa-solid fa-paper-plane',
                    variant: 'primary',
                    modes: ['view', 'update'],
                    permission: 'Q001021',

                    when({ record }) {
                        return [10, 30].includes(getTrangThaiValue(record));
                    }
                },
                {
                    action: 'huy-binh-chon',
                    label: 'Hủy',
                    icon: 'fa-solid fa-ban',
                    variant: 'danger',
                    modes: ['view'],
                    permission: 'Q001022',

                    when({ record }) {
                        return getTrangThaiValue(record) === 20 && !isBinhChonHetHan(record);
                    }
                },
                {
                    action: 'mo-lai-binh-chon',
                    label: 'Mở lại',
                    icon: 'fa-solid fa-rotate-right',
                    variant: 'primary',
                    modes: ['view'],
                    permission: 'Q001031',

                    when({ record }) {
                        return isBinhChonHetHan(record);
                    }
                }
            ],

            onHeaderAction({ action, record }, catalogInstance) {
                if (action === 'gui-binh-chon') {
                    handleGui(record, catalogInstance);

                    return;
                }

                if (action === 'huy-binh-chon') {
                    handleHuy(record, catalogInstance);
                }

                if (action === 'mo-lai-binh-chon') {
                    handleMoLai(record, catalogInstance);

                    return;
                }
            },

            toolbarActions: [
                {
                    action: 'filter',
                    label: 'Tìm kiếm chi tiết',
                    icon: 'search'
                }
            ]
        });
    }

    function isBinhChonHetHan(record) {
        if (getTrangThaiValue(record) !== 20) {
            return false;
        }

        const han = parseDate(record?.hanBinhChon);

        if (!han) {
            return false;
        }

        return Date.now() > han.getTime();
    }

    function syncLyDoHuyField(record) {
        const field = document.getElementById('lyDoHuy');

        const container = document.querySelector('[data-form-field="lyDoHuy"]');

        if (!field || !container) {
            return;
        }

        const trangThai = getTrangThaiValue(record);

        const requiredMark = container.querySelector('.form-field__required');

        if (trangThai === 20 && !isBinhChonHetHan(record)) {
            field.disabled = false;
            field.readOnly = false;
            field.required = true;
            field.tabIndex = 0;

            field.setAttribute('aria-required', 'true');

            if (requiredMark) {
                requiredMark.hidden = false;
            }

            catalog?.form?.clearFieldError('lyDoHuy');

            return;
        }

        field.disabled = true;
        field.readOnly = true;
        field.required = false;
        field.tabIndex = -1;

        field.removeAttribute('aria-required');

        if (requiredMark) {
            requiredMark.hidden = true;
        }

        catalog?.form?.clearFieldError('lyDoHuy');
    }

    function syncHanBinhChonMoLaiField(record, mode) {
        const container = document.querySelector('[data-binh-chon-mo-lai-field]');

        const fieldContainer = document.querySelector('[data-form-field="hanBinhChon"]');

        if (!container || !fieldContainer) {
            return;
        }

        const datePicker = fieldContainer.matches('[data-date-picker]')
            ? fieldContainer
            : fieldContainer.querySelector('[data-date-picker]');

        const hiddenInput = fieldContainer.querySelector('[data-date-value]') || document.getElementById('hanBinhChon');

        const input = fieldContainer.querySelector('[data-date-input]');
        const toggle = fieldContainer.querySelector('[data-date-toggle]');
        const dropdown = fieldContainer.querySelector('[data-date-dropdown]');

        const coTheMoLai = mode === 'view' && isBinhChonHetHan(record) && permissionSet.has('Q001031');

        const choPhepNhap = mode !== 'view' || coTheMoLai;

        container.classList.toggle('is-editable', coTheMoLai);

        if (hiddenInput) {
            hiddenInput.disabled = false;
            hiddenInput.required = choPhepNhap;
        }

        if (input) {
            input.disabled = !choPhepNhap;
            input.readOnly = !choPhepNhap;
            input.tabIndex = choPhepNhap ? 0 : -1;

            if (choPhepNhap) {
                input.removeAttribute('aria-disabled');
            } else {
                input.setAttribute('aria-disabled', 'true');
            }
        }

        if (toggle) {
            toggle.disabled = !choPhepNhap;
            toggle.tabIndex = choPhepNhap ? 0 : -1;
        }

        if (datePicker) {
            datePicker.classList.toggle('is-editable-in-view', coTheMoLai);

            datePicker.setAttribute('aria-disabled', String(!choPhepNhap));
        }

        if (!choPhepNhap && dropdown) {
            dropdown.hidden = true;

            datePicker?.classList?.remove('is-open');
        }

        catalog?.form?.clearFieldError('hanBinhChon');
    }

    function getCurrentPermissionSet() {
        return new Set(
            String(catalog?.root?.dataset?.permissions || '')
                .split(',')
                .map((item) => item.trim().toUpperCase())
                .filter(Boolean)
        );
    }

    function applyRecordUpdatePermission() {
        if (!catalog || catalog._binhChonUpdateWrapped === true) {
            return;
        }

        const openUpdate = catalog.openUpdate.bind(catalog);

        catalog.openUpdate = async (id) => {
            const record = catalog.state.allData.find((item) => String(item?.id) === String(id));

            if (!record || !canUpdateRecord(record)) {
                return catalog.openDetail(id);
            }

            return openUpdate(id);
        };

        catalog._binhChonUpdateWrapped = true;
    }

    function canUpdateRecord(record) {
        if (!record) {
            return false;
        }

        const trangThai = getTrangThaiValue(record);

        if (![10, 30].includes(trangThai)) {
            return false;
        }

        return permissionSet.has('Q001020');
    }

    function hasDeletePermission() {
        return permissionSet.has('Q001030');
    }

    function canDeleteByStatus(record) {
        if (!record) {
            return false;
        }

        return [10, 30].includes(getTrangThaiValue(record));
    }

    function bindEvents() {
        const select = document.getElementById('thucDonNgayId');

        if (select && select.dataset.binhChonBound !== 'true') {
            select.dataset.binhChonBound = 'true';

            select.addEventListener('change', (event) => {
                renderThongTinThucDon(event.target.value);

                catalog?.form?.clearFieldError('hanBinhChon');
            });
        }

        catalog?.elements?.create?.addEventListener('click', () => {
            window.setTimeout(async () => {
                await loadThucDonNgayHopLe();

                renderThucDonNgayOptions('');
                renderThongTinThucDon(null);
                renderThongKe(null);

                syncHanBinhChonMoLaiField(null, 'create');
            }, 0);
        });
    }

    function toDatePickerValue(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        const hour = String(date.getHours()).padStart(2, '0');

        const minute = String(date.getMinutes()).padStart(2, '0');

        const second = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ` + `${hour}:${minute}:${second}`;
    }

    function setDatePickerValue(id, value) {
        const hiddenInput = document.getElementById(id);

        if (!hiddenInput) {
            return;
        }

        const root = hiddenInput.closest('[data-date-picker]');

        if (!root) {
            return;
        }

        const datePicker = root.datePicker;

        if (datePicker && typeof datePicker.setValue === 'function') {
            datePicker.setValue(value || '', false);

            return;
        }

        hiddenInput.value = value || '';

        hiddenInput.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    async function loadThucDonNgayHopLe(dotBinhChonId = null) {
        let url = API_THUC_DON_NGAY_HOP_LE;

        if (dotBinhChonId) {
            url += `?dotBinhChonId=${encodeURIComponent(dotBinhChonId)}`;
        }

        const result = await window.MCS.api.request(url);

        dsThucDonNgay = Array.isArray(result?.data) ? result.data : [];
    }

    function renderThucDonNgayOptions(selectedValue = '') {
        const select = document.getElementById('thucDonNgayId');

        if (!select) {
            return;
        }

        const selected = selectedValue === null || selectedValue === undefined ? '' : String(selectedValue);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';
        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        dsThucDonNgay.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.id);
            option.textContent = buildThucDonNgayLabel(item);
            option.selected = String(item.id) === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = getSmartSelect(select);

        smartSelect?.refresh?.();

        smartSelect?.setValue?.(selected, false);
    }

    function buildThucDonNgayLabel(item) {
        return [formatDate(item?.ngay), item?.tenThucDon, item?.tenNhaAn, item?.tenCaAn].filter(Boolean).join(' - ');
    }

    function renderThongTinThucDon(thucDonNgayId) {
        const root = document.querySelector('[data-binh-chon-thuc-don-info]');

        if (!root) {
            return;
        }

        const record = dsThucDonNgay.find((item) => String(item?.id) === String(thucDonNgayId));

        root.hidden = !record;

        setText('[data-binh-chon-ten-thuc-don]', record ? buildCodeName(record.maThucDon, record.tenThucDon) : '-');

        setText('[data-binh-chon-nha-an]', record ? buildCodeName(record.maNhaAn, record.tenNhaAn) : '-');

        setText('[data-binh-chon-ca-an]', record ? buildCodeName(record.maCaAn, record.tenCaAn) : '-');

        setText('[data-binh-chon-ngay]', record ? formatDate(record.ngay) : '-');
    }

    function renderThongKe(record) {
        const root = document.querySelector('[data-binh-chon-thong-ke]');

        if (!root) {
            return;
        }

        root.hidden = !record?.id;

        setText('[data-binh-chon-tong]', Number(record?.thongKe?.tongBinhChon ?? record?.tongBinhChon ?? 0));

        setText('[data-binh-chon-co]', Number(record?.thongKe?.coThamGia ?? record?.coThamGia ?? 0));

        setText('[data-binh-chon-khong]', Number(record?.thongKe?.khongThamGia ?? record?.khongThamGia ?? 0));
    }

    function mapBinhChonHienThi(record) {
        if (!record) {
            return null;
        }

        return {
            ...record,
            ngayHienThi: formatDate(record.ngay),
            batDauHienThi: formatDateTime(record.batDauBinhChon),
            hanHienThi: formatDateTime(record.hanBinhChon),
            trangThaiHienThi: getTrangThaiLabel(record)
        };
    }

    function getTrangThaiValue(record) {
        const value = record?.trangThai?.value ?? record?.trangThai;

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    function getTrangThaiLabel(record) {
        if (record?.trangThai?.name) {
            return record.trangThai.name;
        }

        const value = getTrangThaiValue(record);

        const item = dsTrangThai.find((current) => Number(current?.value) === value);

        return item?.name || '-';
    }

    async function handleXoa(record, catalogInstance) {
        if (!record?.id) {
            return;
        }

        if (!hasDeletePermission()) {
            return;
        }

        const trangThai = getTrangThaiValue(record);

        if (!canDeleteByStatus(record)) {
            const message =
                trangThai === 20
                    ? 'Không thể xóa đợt bình chọn ở trạng thái Đã gửi. Vui lòng hủy gửi trước.'
                    : 'Chỉ được xóa đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy.';

            window.MCS?.toast?.error(message);

            return;
        }

        const executeDelete = async () => {
            try {
                const result = await window.MCS.api.request(`${API_BASE}/xoa/${record.id}`, {
                    method: 'DELETE'
                });

                window.MCS?.toast?.success(result?.message || 'Xóa đợt bình chọn thành công.');

                catalogInstance?.table?.clearSelection();

                await catalogInstance?.load();
            } catch (error) {
                console.error('Không thể xóa đợt bình chọn:', error);

                window.MCS?.toast?.error(error?.message || 'Không thể xóa đợt bình chọn.');
            }
        };

        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title: 'Xóa đợt bình chọn',
                message: 'Bạn có chắc chắn muốn xóa đợt bình chọn này không?',
                confirmLabel: 'Xóa',
                type: 'danger',
                onConfirm: executeDelete
            });

            return;
        }

        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa đợt bình chọn này không?');

        if (confirmed) {
            await executeDelete();
        }
    }

    async function handleGui(record, catalogInstance) {
        if (!record?.id) {
            return;
        }

        const trangThai = getTrangThaiValue(record);

        if (![10, 30].includes(trangThai)) {
            window.MCS?.toast?.error('Chỉ được gửi đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy.');

            return;
        }

        window.MCS.confirm?.show({
            title: 'Gửi đợt bình chọn',
            message: 'Bạn có chắc chắn muốn gửi đợt bình chọn này không?',
            confirmLabel: 'Gửi',
            type: 'primary',

            onConfirm: async () => {
                try {
                    const result = await window.MCS.api.request(`${API_BASE}/gui/${record.id}`, {
                        method: 'PATCH'
                    });

                    window.MCS?.toast?.success(result?.message || 'Gửi đợt bình chọn thành công.');

                    await catalogInstance.load();

                    await catalogInstance.openDetail(record.id);
                } catch (error) {
                    console.error('Không thể gửi đợt bình chọn:', error);

                    window.MCS?.toast?.error(error?.message || 'Không thể gửi đợt bình chọn.');
                }
            }
        });
    }

    async function handleMoLai(record, catalogInstance) {
        if (!record?.id) {
            return;
        }

        if (!permissionSet.has('Q001031')) {
            return;
        }

        if (!isBinhChonHetHan(record)) {
            window.MCS?.toast?.error('Chỉ được mở lại đợt bình chọn đã hết hạn.');

            return;
        }

        const field = document.getElementById('hanBinhChon');

        const hanMoi = String(field?.value || '').trim();

        const hanMoiDate = parseDate(hanMoi);

        if (!hanMoiDate) {
            catalogInstance?.form?.setFieldError('hanBinhChon', 'Vui lòng chọn hạn bình chọn mới.');

            return;
        }

        const now = new Date();

        if (hanMoiDate <= now) {
            catalogInstance?.form?.setFieldError('hanBinhChon', 'Hạn bình chọn mới phải lớn hơn thời gian hiện tại.');

            return;
        }

        const hanToiDa = parseDate(record?.hanBinhChonToiDa);

        if (hanToiDa && hanMoiDate > hanToiDa) {
            catalogInstance?.form?.setFieldError(
                'hanBinhChon',
                'Hạn bình chọn phải trước thời gian bắt đầu ca ăn ít nhất 3 giờ. ' +
                    `Hạn tối đa là ${formatDateTime(hanToiDa)}.`
            );

            return;
        }

        catalogInstance?.form?.clearFieldError('hanBinhChon');

        window.MCS.confirm?.show({
            title: 'Mở lại đợt bình chọn',

            message: 'Bạn có chắc chắn muốn mở lại đợt bình chọn đến ' + `${formatDateTime(hanMoiDate)} không?`,

            confirmLabel: 'Mở lại',
            type: 'primary',

            onConfirm: async () => {
                try {
                    const result = await window.MCS.api.request(`${API_BASE}/mo-lai/${record.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            hanBinhChon: hanMoi
                        })
                    });

                    window.MCS?.toast?.success(result?.message || 'Mở lại đợt bình chọn thành công.');

                    await catalogInstance.load();

                    await catalogInstance.openDetail(record.id);
                } catch (error) {
                    console.error('Không thể mở lại đợt bình chọn:', error);

                    window.MCS?.toast?.error(error?.message || 'Không thể mở lại đợt bình chọn.');
                }
            }
        });
    }

    async function handleHuy(record, catalogInstance) {
        if (!record?.id) {
            return;
        }

        if (getTrangThaiValue(record) !== 20) {
            window.MCS?.toast?.error('Chỉ được hủy đợt bình chọn đã gửi.');

            return;
        }

        const field = document.getElementById('lyDoHuy');

        const lyDo = String(field?.value || '').trim();

        if (!lyDo) {
            catalogInstance?.form?.setFieldError('lyDoHuy', 'Vui lòng nhập lý do trước khi hủy.');

            field?.focus();

            return;
        }

        if (lyDo.length > 500) {
            catalogInstance?.form?.setFieldError('lyDoHuy', 'Lý do hủy không được vượt quá 500 ký tự.');

            field?.focus();

            return;
        }

        catalogInstance?.form?.clearFieldError('lyDoHuy');

        window.MCS.confirm?.show({
            title: 'Hủy gửi đợt bình chọn',
            message: 'Bạn có chắc chắn muốn hủy gửi đợt bình chọn này không?',
            confirmLabel: 'Hủy',
            type: 'danger',

            onConfirm: async () => {
                try {
                    const result = await window.MCS.api.request(`${API_BASE}/huy/${record.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            lyDoHuy: lyDo
                        })
                    });

                    window.MCS?.toast?.success(result?.message || 'Hủy gửi đợt bình chọn thành công.');

                    await catalogInstance.load();

                    await catalogInstance.openUpdate(record.id);
                } catch (error) {
                    console.error('Không thể hủy gửi đợt bình chọn:', error);

                    if (error?.data?.errors) {
                        catalogInstance?.form?.setErrors(error.data.errors);

                        return;
                    }

                    window.MCS?.toast?.error(error?.message || 'Không thể hủy gửi đợt bình chọn.');
                }
            }
        });
    }

    function getNguoiLabel(value) {
        if (!value) {
            return '';
        }

        return value?.hoTen || value?.nhanVien?.hoTen || value?.tenDangNhap || '';
    }

    function getSmartSelect(select) {
        if (!select) {
            return null;
        }

        const root = select.closest('[data-smart-select]');

        if (!root) {
            return null;
        }

        return root.smartSelect || window.MCS?.smartSelect?.initialize?.(root) || null;
    }

    function buildCodeName(code, name) {
        return [code, name].filter(Boolean).join(' - ') || '-';
    }

    function setText(selector, value) {
        const element = document.querySelector(selector);

        if (!element) {
            return;
        }

        element.textContent = value === null || value === undefined || value === '' ? '-' : String(value);
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(value) {
        const date = parseDate(value);

        if (!date) {
            return '';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function formatDateTime(value) {
        const date = parseDate(value);

        if (!date) {
            return '';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    }

    function toDateTimeLocal(value) {
        const date = parseDate(value);

        if (!date) {
            return '';
        }

        const pad = (number) => String(number).padStart(2, '0');

        return (
            `${date.getFullYear()}-` +
            `${pad(date.getMonth() + 1)}-` +
            `${pad(date.getDate())}T` +
            `${pad(date.getHours())}:` +
            `${pad(date.getMinutes())}`
        );
    }

    function toIsoValue(value) {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toISOString();
    }
});

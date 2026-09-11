'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/thong-bao';

    const API_TRANG_THAI = '/api/mcs/v1/enums?name=trangThaiThongBao';

    const API_LOAI_DOI_TUONG = '/api/mcs/v1/enums?name=loaiDoiTuong';

    const API_VAI_TRO = '/api/mcs/v1/dm-vai-tro/tong-hop?active=true';

    const API_CHUC_VU = '/api/mcs/v1/dm-chuc-vu/tong-hop?active=true';

    const API_TAI_KHOAN = '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true';

    const DOI_TUONG_CONFIG = {
        10: {
            api: API_VAI_TRO,

            getLabel: buildVaiTroLabel
        },

        20: {
            api: API_CHUC_VU,

            getLabel: buildChucVuLabel
        },

        30: {
            api: API_TAI_KHOAN,

            getLabel: buildTaiKhoanLabel
        }
    };

    let catalog = null;

    let dsTrangThai = [];

    let dsLoaiDoiTuong = [];

    const doiTuongCache = new Map();

    let permissionSet = new Set();

    initialize();

    async function initialize() {
        try {
            await loadDanhMucPhu();

            await initializeCatalog();

            permissionSet = getCurrentPermissionSet();

            applyRecordUpdatePermission();

            renderLoaiDoiTuong();

            bindEvents();

            await syncPhamViNhan(true, null, []);
        } catch (error) {
            console.error('Không thể khởi tạo quản lý thông báo.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải quản lý thông báo.');
        }
    }

    async function loadDanhMucPhu() {
        const [trangThaiResult, loaiDoiTuongResult] = await Promise.all([
            window.MCS.api.request(API_TRANG_THAI),

            window.MCS.api.request(API_LOAI_DOI_TUONG)
        ]);

        dsTrangThai = Array.isArray(trangThaiResult?.data) ? trangThaiResult.data : [];

        dsLoaiDoiTuong = Array.isArray(loaiDoiTuongResult?.data) ? loaiDoiTuongResult.data : [];
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: 'thong-bao',

            permissionCodes: {
                view: ['Q001010', 'Q001011', 'Q001012', 'Q001013'],

                create: ['Q001011', 'Q001012', 'Q001013'],

                update: ['Q001012', 'Q001013']
            },

            detailTitle: 'Thông tin thông báo',

            createTitle: 'Thêm thông báo',

            updateTitle: 'Cập nhật thông báo',

            columns: [
                {
                    key: 'tieuDe',

                    label: 'Tiêu đề',

                    width: '260px',

                    sortable: true,

                    filterable: true
                },

                {
                    key: 'noiDung',

                    label: 'Nội dung',

                    width: '360px',

                    filterable: true
                },

                {
                    key: 'nguonThongBao',

                    label: 'Nguồn',

                    width: '120px',

                    sortable: true,

                    filterable: true,

                    className: 'catalog-table__cell--center'
                },

                {
                    key: 'phamViGui',

                    label: 'Phạm vi',

                    width: '150px',

                    sortable: true,

                    filterable: true,

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
                    key: 'soLuongNguoiNhan',

                    label: 'Người nhận',

                    width: '120px',

                    sortable: true,

                    type: 'number',

                    className: 'catalog-table__cell--center'
                },

                {
                    key: 'soLuongDaDoc',

                    label: 'Đã đọc',

                    width: '100px',

                    sortable: true,

                    type: 'number',

                    className: 'catalog-table__cell--center'
                },

                {
                    key: 'thoiGianGui',

                    label: 'Thời gian gửi',

                    width: '170px',

                    sortable: true,

                    type: 'date',

                    className: 'catalog-table__cell--center'
                }
            ],

            defaultValues: {
                tieuDe: '',

                noiDung: '',

                loaiThamChieu: '',

                duongDan: '',

                tuDong: false,

                trangThai: '',

                guiTatCa: true,

                loaiDoiTuong: '',

                doiTuongIds: [],

                nguoiTao: '',

                thoiGianGui: '',

                thamChieuId: null
            },

            validation: {
                tieuDe: {
                    label: 'Tiêu đề',

                    required: true,

                    maxLength: 255,

                    requiredMessage: 'Vui lòng điền vào trường này.',

                    maxLengthMessage: 'Tiêu đề không được vượt quá 255 ký tự.'
                },

                noiDung: {
                    label: 'Nội dung',

                    required: true,

                    requiredMessage: 'Vui lòng điền vào trường này.'
                },

                loaiDoiTuong: {
                    label: 'Loại đối tượng'
                },

                doiTuongIds: {
                    label: 'Đối tượng'
                },

                loaiThamChieu: {
                    label: 'Loại tham chiếu',

                    maxLength: 100,

                    maxLengthMessage: 'Loại tham chiếu không được vượt quá 100 ký tự.'
                },

                duongDan: {
                    label: 'Đường dẫn',

                    maxLength: 500,

                    maxLengthMessage: 'Đường dẫn không được vượt quá 500 ký tự.'
                }
            },

            validate(formData) {
                const errors = {};

                const guiTatCa = formData.guiTatCa === true;

                const doiTuong = Array.isArray(formData.doiTuong) ? formData.doiTuong : [];

                if (!guiTatCa) {
                    if (doiTuong.length === 0) {
                        errors.doiTuongIds = 'Vui lòng chọn ít nhất một đối tượng.';

                        return errors;
                    }

                    const loaiDoiTuong = toNullableNumber(doiTuong[0]?.loaiDoiTuong);

                    if (loaiDoiTuong === null) {
                        errors.loaiDoiTuong = 'Vui lòng chọn loại đối tượng.';

                        return errors;
                    }

                    const hopLe = dsLoaiDoiTuong.some((item) => Number(item.value) === loaiDoiTuong);

                    if (!hopLe) {
                        errors.loaiDoiTuong = 'Loại đối tượng không hợp lệ.';
                    }
                }

                return errors;
            },

            mapListResponse(result) {
                const records = Array.isArray(result?.data) ? result.data : [];

                return records.map(mapThongBaoHienThi);
            },

            mapDetailResponse(result) {
                return mapThongBaoHienThi(result?.data || null);
            },

            mapRecordToForm(record) {
                const guiTatCa = record?.guiTatCa === true;

                const { loaiDoiTuong, doiTuongIds } = getRecordDoiTuong(record);

                return {
                    id: record?.id ?? '',

                    tieuDe: record?.tieuDe || '',

                    noiDung: record?.noiDung || '',

                    loaiThamChieu: record?.loaiThamChieu || '',

                    thamChieuId: record?.thamChieuId ?? null,

                    duongDan: record?.duongDan || '',

                    tuDong: record?.tuDong === true,

                    trangThai: record?.trangThai?.name || '',

                    guiTatCa,

                    loaiDoiTuong: guiTatCa ? '' : (loaiDoiTuong ?? ''),

                    doiTuongIds: guiTatCa ? [] : doiTuongIds,

                    nguoiTao: getNguoiGui(record),

                    thoiGianGui: record?.thoiGianGui ? formatDateTime(record.thoiGianGui) : ''
                };
            },

            async onRecordLoaded(record, mode) {
                if (mode === 'create') {
                    renderLoaiDoiTuong('');

                    await syncPhamViNhan(true, null, []);

                    return;
                }

                const guiTatCa = record?.guiTatCa === true;

                const { loaiDoiTuong, doiTuongIds } = getRecordDoiTuong(record);

                renderLoaiDoiTuong(guiTatCa ? '' : loaiDoiTuong);

                await syncPhamViNhan(guiTatCa, loaiDoiTuong, doiTuongIds);
            },

            transformPayload(formData) {
                const guiTatCa = formData.guiTatCa === true;

                const loaiDoiTuong = toNullableNumber(formData.loaiDoiTuong);

                const doiTuongIds = getSelectedValues('doiTuongIds');

                const doiTuong = guiTatCa
                    ? []
                    : doiTuongIds.map((doiTuongId) => ({
                          loaiDoiTuong,
                          doiTuongId
                      }));

                const currentRecord = catalog?.detailPanel?.record || getSelectedRecord(catalog);

                return {
                    tieuDe: String(formData.tieuDe || '').trim(),

                    noiDung: String(formData.noiDung || '').trim(),

                    guiTatCa,

                    doiTuong,

                    loaiThamChieu: String(formData.loaiThamChieu || '').trim() || null,

                    thamChieuId: currentRecord?.thamChieuId ?? null,

                    duongDan: String(formData.duongDan || '').trim() || null
                };
            },

            getRecordSubtitle(record) {
                return record?.trangThaiHienThi || '';
            },

            headerActions: [
                {
                    action: 'gui-thong-bao',

                    label: 'Gửi',

                    icon: 'fa-solid fa-paper-plane',

                    variant: 'primary',

                    modes: ['view', 'update'],

                    permission: 'Q001014',

                    when({ record }) {
                        const trangThai = getTrangThaiValue(record);

                        return trangThai === 10 || trangThai === 30;
                    }
                },

                {
                    action: 'huy-gui-thong-bao',

                    label: 'Huỷ gửi',

                    icon: 'fa-solid fa-ban',

                    variant: 'danger',

                    modes: ['view', 'update'],

                    permission: 'Q001015',

                    when({ record }) {
                        return getTrangThaiValue(record) === 20;
                    }
                }
            ],

            onHeaderAction({ action, record }, catalogInstance) {
                if (action === 'gui-thong-bao' || action === 'huy-gui-thong-bao') {
                    handleTrangThaiAction(action, record, catalogInstance);
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

    function getNguoiGui(record) {
        if (record?.nguoiTao?.nhanVien?.hoTen) {
            return record.nguoiTao.nhanVien.hoTen;
        }

        if (record?.nguoiTao?.tenDangNhap) {
            return record.nguoiTao.tenDangNhap;
        }

        return 'Hệ thống';
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
        if (!catalog || catalog._thongBaoUpdateWrapped === true) {
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

        catalog._thongBaoUpdateWrapped = true;
    }

    function canUpdateRecord(record) {
        if (!record) {
            return false;
        }

        const trangThai = getTrangThaiValue(record);

        if (![10, 30].includes(trangThai)) {
            return false;
        }

        if (record.tuDong === true) {
            return permissionSet.has('Q001013');
        }

        return permissionSet.has('Q001012') || permissionSet.has('Q001013');
    }

    function bindEvents() {
        const guiTatCa = document.getElementById('guiTatCa');

        const loaiDoiTuong = document.getElementById('loaiDoiTuong');

        if (guiTatCa && guiTatCa.dataset.thongBaoBound !== 'true') {
            guiTatCa.dataset.thongBaoBound = 'true';

            guiTatCa.addEventListener('change', async () => {
                await syncPhamViNhan(guiTatCa.checked === true, loaiDoiTuong?.value, []);
            });
        }

        if (loaiDoiTuong && loaiDoiTuong.dataset.thongBaoBound !== 'true') {
            loaiDoiTuong.dataset.thongBaoBound = 'true';

            loaiDoiTuong.addEventListener('change', async (event) => {
                await syncPhamViNhan(false, event.target.value, []);
            });
        }

        catalog?.elements?.create?.addEventListener('click', () => {
            window.setTimeout(async () => {
                renderLoaiDoiTuong('');

                await syncPhamViNhan(true, null, []);
            }, 0);
        });
    }

    async function syncPhamViNhan(guiTatCa, loaiValue, selectedValues = []) {
        const fields = document.querySelectorAll('[data-thong-bao-doi-tuong]');

        fields.forEach((element) => {
            element.hidden = guiTatCa;
        });

        const loaiDoiTuong = toNullableNumber(loaiValue);

        if (guiTatCa) {
            renderLoaiDoiTuong('');

            setSelectState('loaiDoiTuong', true, 'Chọn loại đối tượng');

            renderDoiTuong([], []);

            setSelectState('doiTuongIds', true, 'Chọn loại đối tượng trước');

            return;
        }

        setSelectState('loaiDoiTuong', false, 'Chọn loại đối tượng');

        if (loaiDoiTuong === null) {
            renderDoiTuong([], []);

            setSelectState('doiTuongIds', true, 'Chọn loại đối tượng trước');

            return;
        }

        const config = DOI_TUONG_CONFIG[loaiDoiTuong];

        if (!config) {
            renderDoiTuong([], []);

            setSelectState('doiTuongIds', true, 'Loại đối tượng không hợp lệ');

            return;
        }

        setSelectState('doiTuongIds', true, 'Đang tải dữ liệu...');

        try {
            const items = await loadDoiTuong(loaiDoiTuong, config.api);

            setSelectState('doiTuongIds', false, 'Chọn đối tượng');

            renderDoiTuong(items, selectedValues, config.getLabel);
        } catch (error) {
            renderDoiTuong([], []);

            setSelectState('doiTuongIds', true, 'Không thể tải dữ liệu');

            console.error('Không thể tải danh sách đối tượng.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh sách đối tượng.');
        }
    }

    async function loadDoiTuong(loaiDoiTuong, api) {
        if (doiTuongCache.has(loaiDoiTuong)) {
            return doiTuongCache.get(loaiDoiTuong);
        }

        const response = await window.MCS.api.request(api);

        const data = response?.data ?? response;

        const items = (
            Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                  ? data.items
                  : Array.isArray(data?.data)
                    ? data.data
                    : []
        ).filter((item) => item?.active !== false);

        doiTuongCache.set(loaiDoiTuong, items);

        return items;
    }

    function toNullableNumber(value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
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

    function renderLoaiDoiTuong(selectedValue = '') {
        const select = document.getElementById('loaiDoiTuong');

        if (!select) {
            return;
        }

        const selected = selectedValue === null || selectedValue === undefined ? '' : String(selectedValue);

        select.innerHTML = '';

        const emptyOption = document.createElement('option');

        emptyOption.value = '';

        emptyOption.textContent = '';

        select.appendChild(emptyOption);

        dsLoaiDoiTuong.forEach((item) => {
            const option = document.createElement('option');

            option.value = String(item.value);

            option.textContent = item.name || '';

            option.selected = String(item.value) === selected;

            select.appendChild(option);
        });

        select.value = selected;

        const smartSelect = getSmartSelect(select);

        smartSelect?.refresh?.();

        smartSelect?.setValue?.(selected, false);
    }

    function renderDoiTuong(items, selectedValues = [], getLabel = (item) => String(item?.id ?? '')) {
        const select = document.getElementById('doiTuongIds');

        if (!select) {
            return;
        }

        const selectedSet = new Set(
            (Array.isArray(selectedValues) ? selectedValues : [])
                .map(Number)
                .filter((value) => Number.isInteger(value) && value > 0)
                .map(String)
        );

        select.innerHTML = '';

        items.forEach((item) => {
            const value = String(item.id);

            const option = document.createElement('option');

            option.value = value;

            option.textContent = getLabel(item);

            option.selected = selectedSet.has(value);

            select.appendChild(option);
        });

        const smartSelect = getSmartSelect(select);

        smartSelect?.refresh?.();

        smartSelect?.setValues?.([...selectedSet], false);
    }

    function getSelectedValues(selectId) {
        const select = document.getElementById(selectId);

        if (!select) {
            return [];
        }

        return Array.from(select.selectedOptions || [])
            .map((option) => Number(option.value))
            .filter((value) => Number.isInteger(value) && value > 0);
    }

    function setSelectState(selectId, disabled, placeholder) {
        const select = document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.disabled = disabled;

        const root = select.closest('[data-smart-select]');

        if (placeholder !== undefined && root) {
            root.dataset.selectPlaceholder = placeholder;
        }

        const smartSelect = getSmartSelect(select);

        smartSelect?.setDisabled?.(disabled);

        smartSelect?.refresh?.();
    }

    function getRecordDoiTuong(record) {
        const doiTuong = Array.isArray(record?.doiTuong) ? record.doiTuong : [];

        if (doiTuong.length === 0) {
            return {
                loaiDoiTuong: null,

                doiTuongIds: []
            };
        }

        const loaiDoiTuong = toNullableNumber(doiTuong[0]?.loaiDoiTuong?.value ?? doiTuong[0]?.loaiDoiTuong);

        const doiTuongIds = doiTuong
            .filter((item) => Number(item?.loaiDoiTuong?.value ?? item?.loaiDoiTuong) === loaiDoiTuong)
            .map((item) => Number(item.doiTuongId))
            .filter((value) => Number.isInteger(value) && value > 0);

        return {
            loaiDoiTuong,
            doiTuongIds
        };
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

    function formatDateTime(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',

            minute: '2-digit',

            second: '2-digit',

            day: '2-digit',

            month: '2-digit',

            year: 'numeric'
        }).format(date);
    }

    function mapThongBaoHienThi(record) {
        if (!record) {
            return null;
        }

        return {
            ...record,

            nguonThongBao: record.tuDong === true ? 'Tự động' : 'Thủ công',

            phamViGui: record.guiTatCa === true ? 'Tất cả' : 'Theo đối tượng',

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

    async function handleTrangThaiAction(action, record, catalogInstance) {
        if (!record || !record.id) {
            return;
        }

        const laGui = action === 'gui-thong-bao';

        const trangThai = getTrangThaiValue(record);

        if (laGui && ![10, 30].includes(trangThai)) {
            window.MCS?.toast?.error('Chỉ được gửi thông báo ở trạng thái Tạo mới hoặc Đã huỷ.');

            return;
        }

        if (!laGui && trangThai !== 20) {
            window.MCS?.toast?.error('Chỉ được huỷ gửi thông báo ở trạng thái Đã gửi.');

            return;
        }

        const config = laGui
            ? {
                  endpoint: 'gui',

                  title: 'Gửi thông báo',

                  message:
                      trangThai === 30
                          ? 'Bạn có chắc chắn muốn gửi lại thông báo này không?'
                          : 'Bạn có chắc chắn muốn gửi thông báo này không?',

                  confirmLabel: trangThai === 30 ? 'Gửi lại' : 'Gửi',

                  type: 'primary'
              }
            : {
                  endpoint: 'huy-gui',

                  title: 'Huỷ gửi thông báo',

                  message: 'Bạn có chắc chắn muốn huỷ gửi thông báo này không?',

                  confirmLabel: 'Huỷ gửi',

                  type: 'danger'
              };

        window.MCS.confirm?.show({
            title: config.title,

            message: config.message,

            confirmLabel: config.confirmLabel,

            type: config.type,

            onConfirm: async () => {
                const result = await window.MCS.api.request(`${API_BASE}/${config.endpoint}/${record.id}`, {
                    method: 'PATCH'
                });

                window.MCS?.toast?.success(
                    result?.message || (laGui ? 'Gửi thông báo thành công.' : 'Huỷ gửi thông báo thành công.')
                );

                await catalogInstance.load();

                await catalogInstance.openDetail(record.id);
            }
        });
    }

    function getSelectedRecord(catalogInstance) {
        const selectedId = catalogInstance?.state?.selectedId;

        if (selectedId === null || selectedId === undefined) {
            return null;
        }

        return catalogInstance?.state?.allData?.find((item) => String(item?.id) === String(selectedId)) || null;
    }
});

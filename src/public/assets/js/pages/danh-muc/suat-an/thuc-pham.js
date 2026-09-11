'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/mcs/v1/dm-thuc-pham';
    const DON_VI_API = '/api/mcs/v1/dm-don-vi-tinh/tong-hop?active=true';
    const QUY_TAC_API = '/api/mcs/v1/thiet-lap/gia-tri?ma=QUY_TAC_CHON_DON_VI_QUY_DOI';
    const QUOC_GIA_API = '/api/mcs/v1/dm-quoc-gia/tong-hop?active=true';
    const LOAI_BAO_QUAN_API = '/api/mcs/v1/enums?name=loaiBaoQuan';

    const LOAI_DON_VI = {
        KHOI_LUONG: 10,
        THE_TICH: 20,
        DEM: 30
    };

    let catalog = null;
    let dsDonViTinh = [];
    let dsQuocGia = [];
    let dsLoaiBaoQuan = [];
    let quyTacDonVi = 4;

    initialize();

    async function initialize() {
        await loadDanhMucPhu();
        await initializeCatalog();
        bindDonViEvents();
        bindTyLeHaoHut();
    }

    function bindTyLeHaoHut() {
        const input = document.getElementById('tyLeHaoHutDuKien');

        if (!input) {
            return;
        }

        if (input.dataset.tyLeHaoHutBound === 'true') {
            return;
        }

        input.dataset.tyLeHaoHutBound = 'true';

        input.addEventListener('input', () => {
            const value = normalizeNumber(input.value);

            if (value === null) {
                return;
            }

            let newValue = null;

            if (value > 100) {
                newValue = 100;
            } else if (value < 0) {
                newValue = 0;
            }

            if (newValue === null) {
                return;
            }

            const numberInput = window.MCS?.numberInput?.initialize?.(input);

            if (numberInput?.setValue) {
                numberInput.setValue(newValue);
            } else {
                input.value = String(newValue);
            }

            input.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );
        });
    }

    async function loadDanhMucPhu() {
        try {
            const [donViResponse, quyTacResponse, quocGiaResponse, loaiBaoQuanResponse] = await Promise.all([
                window.MCS.api.request(DON_VI_API),
                window.MCS.api.request(QUY_TAC_API),
                window.MCS.api.request(QUOC_GIA_API),
                window.MCS.api.request(LOAI_BAO_QUAN_API)
            ]);

            dsDonViTinh = normalizeList(donViResponse?.data ?? donViResponse).filter((item) => item?.active === true);

            dsQuocGia = normalizeList(quocGiaResponse?.data ?? quocGiaResponse).filter((item) => item?.active === true);

            dsLoaiBaoQuan = normalizeList(loaiBaoQuanResponse?.data ?? loaiBaoQuanResponse);

            const giaTriQuyTac = Number(quyTacResponse?.data?.giaTri ?? quyTacResponse?.giaTri);

            quyTacDonVi = [1, 2, 3, 4].includes(giaTriQuyTac) ? giaTriQuyTac : 4;

            renderDonViSoCap();

            renderDonViSuDung(null, '');

            renderQuocGia();
            renderLoaiBaoQuan();
        } catch (error) {
            console.error('Không thể tải danh mục đơn vị tính.', error);

            quyTacDonVi = 4;

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục đơn vị tính.');
        }
    }

    async function initializeCatalog() {
        try {
            catalog = await window.MCS.pages.createCatalogPage({
                moduleName: 'thuc-pham',
                permissionCodes: {
                    view: 'Q000556',
                    create: 'Q000557',
                    update: 'Q000558'
                },
                columns: [
                    {
                        key: 'maThucPham',
                        label: 'Mã thực phẩm',
                        width: '150px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenThucPham',
                        label: 'Tên thực phẩm',
                        width: '220px',
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: 'tenDonViSoCap',
                        label: 'Đơn vị sơ cấp',
                        width: '160px',
                        filterable: true
                    },
                    {
                        key: 'tenDonViSuDung',
                        label: 'Đơn vị sử dụng',
                        width: '160px',
                        filterable: true
                    },
                    {
                        key: 'heSoQuyDoi',
                        label: 'Hệ số quy đổi',
                        width: '140px',
                        sortable: true,
                        type: 'number'
                    },
                    {
                        key: 'quyCach',
                        label: 'Quy cách',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'giaNhap',
                        label: 'Giá nhập',
                        width: '140px',
                        sortable: true,
                        type: 'number'
                    },
                    {
                        key: 'tyLeHaoHutDuKien',
                        label: 'Tỷ lệ hao hụt',
                        width: '150px',
                        sortable: true,
                        type: 'number'
                    },
                    {
                        key: 'tenXuatXu',
                        label: 'Xuất xứ',
                        width: '180px',
                        filterable: true
                    },
                    {
                        key: 'tenDieuKienBaoQuan',
                        label: 'Điều kiện bảo quản',
                        width: '220px',
                        filterable: true
                    },
                    {
                        key: 'moTa',
                        label: 'Mô tả',
                        width: '250px',
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
                        isBoolean: true,
                        trueLabel: 'TRUE',
                        falseLabel: 'FALSE'
                    }
                ],

                defaultValues: {
                    maThucPham: '',
                    tenThucPham: '',
                    giaNhap: null,
                    tyLeHaoHutDuKien: '',
                    xuatXuId: '',
                    dieuKienBaoQuan: '',
                    donViSoCapId: '',
                    donViSuDungId: '',
                    heSoQuyDoi: '',
                    quyCach: '',
                    moTa: '',
                    ghiChu: '',
                    hinhAnh: '',
                    active: true
                },

                validation: {
                    maThucPham: {
                        label: 'Mã thực phẩm',
                        required: true,
                        maxLength: 50,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Mã thực phẩm không được vượt quá 50 ký tự.',
                        uniqueMessage: 'Mã thực phẩm đã tồn tại.'
                    },

                    tenThucPham: {
                        label: 'Tên thực phẩm',
                        required: true,
                        maxLength: 150,
                        unique: true,
                        requiredMessage: 'Vui lòng điền vào trường này.',
                        maxLengthMessage: 'Tên thực phẩm không được vượt quá 150 ký tự.',
                        uniqueMessage: 'Tên thực phẩm đã tồn tại.'
                    },

                    donViSoCapId: {
                        label: 'Đơn vị sơ cấp',
                        required: true,
                        requiredMessage: 'Vui lòng chọn một mục trong danh sách.'
                    },

                    donViSuDungId: {
                        label: 'Đơn vị sử dụng',
                        required: true,
                        requiredMessage: 'Vui lòng chọn một mục trong danh sách.'
                    },

                    heSoQuyDoi: {
                        label: 'Hệ số quy đổi',
                        required: true,
                        requiredMessage: 'Vui lòng điền vào trường này.'
                    },

                    giaNhap: {
                        label: 'Giá nhập'
                    },

                    tyLeHaoHutDuKien: {
                        label: 'Tỷ lệ hao hụt dự kiến'
                    },

                    quyCach: {
                        label: 'Quy cách',
                        maxLength: 255,
                        maxLengthMessage: 'Quy cách không được vượt quá 255 ký tự.'
                    },

                    moTa: {
                        label: 'Mô tả',
                        maxLength: 500,
                        maxLengthMessage: 'Mô tả không được vượt quá 500 ký tự.'
                    },

                    ghiChu: {
                        label: 'Ghi chú',
                        maxLength: 500,
                        maxLengthMessage: 'Ghi chú không được vượt quá 500 ký tự.'
                    }
                },

                validate(formData, form, catalogInstance) {
                    const errors = {};

                    const donViSoCapId = normalizeNumber(formData.donViSoCapId);

                    const donViSuDungId = normalizeNumber(formData.donViSuDungId);

                    const heSoQuyDoi = normalizeNumber(formData.heSoQuyDoi);

                    const giaNhap = normalizeNumber(formData.giaNhap);

                    const tyLeHaoHutDuKien = normalizeNumber(formData.tyLeHaoHutDuKien);

                    if (heSoQuyDoi !== null && heSoQuyDoi <= 0) {
                        errors.heSoQuyDoi = 'Hệ số quy đổi phải lớn hơn 0.';
                    }

                    if (giaNhap !== null && giaNhap < 0) {
                        errors.giaNhap = 'Giá nhập phải lớn hơn hoặc bằng 0.';
                    }

                    if (tyLeHaoHutDuKien !== null && (tyLeHaoHutDuKien < 0 || tyLeHaoHutDuKien > 100)) {
                        errors.tyLeHaoHutDuKien = 'Tỷ lệ hao hụt phải nằm trong khoảng từ 0 đến 100.';
                    }

                    if (donViSoCapId && donViSuDungId) {
                        const donViSoCap = dsDonViTinh.find((item) => Number(item.id) === Number(donViSoCapId));

                        const donViSuDung = dsDonViTinh.find((item) => Number(item.id) === Number(donViSuDungId));

                        if (donViSoCap && donViSuDung && !isDonViHopLe(donViSoCap, donViSuDung)) {
                            errors.donViSuDungId = getQuyTacDonViMessage(donViSoCap, donViSuDung);
                        }

                        if (Number(donViSoCapId) === Number(donViSuDungId) && heSoQuyDoi !== null && heSoQuyDoi !== 1) {
                            errors.heSoQuyDoi =
                                'Khi đơn vị sơ cấp và đơn vị sử dụng giống nhau, hệ số quy đổi phải bằng 1.';
                        }
                    }

                    return errors;
                },

                detailTitle: 'Thông tin thực phẩm',
                createTitle: 'Thêm thực phẩm',
                updateTitle: 'Cập nhật thực phẩm',

                getRecordSubtitle(record) {
                    return record?.maThucPham || '';
                },

                mapListResponse(result) {
                    const records = Array.isArray(result?.data) ? result.data : [];

                    return records.map(mapRecordForTable);
                },

                mapDetailResponse(result) {
                    return result?.data || null;
                },

                mapRecordToForm(record) {
                    window.setTimeout(() => {
                        renderDonViSoCap(record?.donViSoCapId);

                        renderDonViSuDung(record?.donViSoCapId, record?.donViSuDungId);

                        renderQuocGia(record?.xuatXuId);

                        renderLoaiBaoQuan(record?.dieuKienBaoQuan);

                        setImageValue(record?.hinhAnh);

                        window.MCS?.numberInput?.refresh?.(document.getElementById('thucPhamDetailPanel'));
                    }, 0);

                    return {
                        id: record?.id ?? '',
                        maThucPham: record?.maThucPham || '',
                        tenThucPham: record?.tenThucPham || '',
                        giaNhap: record?.giaNhap ?? '',
                        tyLeHaoHutDuKien: record?.tyLeHaoHutDuKien ?? '',
                        xuatXuId: record?.xuatXuId ?? '',
                        dieuKienBaoQuan: record?.dieuKienBaoQuan ?? '',
                        donViSoCapId: record?.donViSoCapId ?? '',
                        donViSuDungId: record?.donViSuDungId ?? '',
                        heSoQuyDoi: record?.heSoQuyDoi ?? '',
                        quyCach: record?.quyCach || '',
                        moTa: record?.moTa || '',
                        ghiChu: record?.ghiChu || '',
                        hinhAnh: record?.hinhAnh || '',
                        active: record?.active === true
                    };
                },

                transformPayload(formData) {
                    const donViSoCapId = normalizeNumber(formData.donViSoCapId);

                    const donViSuDungId = normalizeNumber(formData.donViSuDungId);

                    const heSoQuyDoi = normalizeNumber(formData.heSoQuyDoi);

                    let quyCach = normalizeNullableString(formData.quyCach);

                    if (!quyCach) {
                        quyCach = buildQuyCach(donViSoCapId, donViSuDungId, heSoQuyDoi);
                    }

                    const hinhAnhInput = document.querySelector('[data-form-field="hinhAnh"] input[type="file"]');

                    const hinhAnh = hinhAnhInput?.files?.[0] || null;

                    const payload = {
                        maThucPham: String(formData.maThucPham || '')
                            .trim()
                            .toUpperCase(),

                        tenThucPham: String(formData.tenThucPham || '').trim(),

                        donViSoCapId,
                        donViSuDungId,
                        heSoQuyDoi,

                        giaNhap: normalizeNumber(formData.giaNhap),

                        tyLeHaoHutDuKien: normalizeNumber(formData.tyLeHaoHutDuKien) ?? 0,

                        xuatXuId: normalizeNumber(formData.xuatXuId),

                        dieuKienBaoQuan: normalizeNumber(formData.dieuKienBaoQuan),

                        quyCach,

                        moTa: normalizeNullableString(formData.moTa),

                        ghiChu: normalizeNullableString(formData.ghiChu),

                        active: formData.active === true
                    };

                    if (hinhAnh instanceof File) {
                        payload.hinhAnh = hinhAnh;
                    }

                    return payload;
                },

                toolbarActions: [
                    {
                        action: 'filter',
                        label: 'Tìm kiếm chi tiết',
                        icon: 'search'
                    },
                    {
                        action: 'export-thuc-pham',
                        label: 'Xuất danh mục thực phẩm',
                        icon: 'download'
                    },
                    {
                        action: 'import-thuc-pham',
                        label: 'Nhập danh mục thực phẩm',
                        icon: 'upload'
                    }
                ],

                onAction(action, id, catalogInstance) {
                    if (action === 'export-thuc-pham') {
                        exportData();
                        return;
                    }

                    if (action === 'import-thuc-pham') {
                        importData(catalogInstance);
                    }
                }
            });
        } catch (error) {
            console.error('Không thể khởi tạo danh mục thực phẩm.', error);

            window.MCS?.toast?.error(error?.message || 'Không thể tải danh mục thực phẩm.');
        }
    }

    function bindDonViEvents() {
        const donViSoCapSelect = document.getElementById('donViSoCapId');

        if (!donViSoCapSelect) {
            return;
        }

        donViSoCapSelect.addEventListener('change', () => {
            const donViSoCapId = normalizeNumber(donViSoCapSelect.value);

            renderDonViSuDung(donViSoCapId, '');
        });
    }

    function renderDonViSoCap(selectedValue = '') {
        renderSelect(
            'donViSoCapId',
            dsDonViTinh,
            (item) => item.id,
            (item) => buildDonViLabel(item),
            selectedValue
        );
    }

    function renderDonViSuDung(donViSoCapId, selectedValue = '') {
        const donViSoCap = dsDonViTinh.find((item) => Number(item.id) === Number(donViSoCapId));

        const danhSach = !donViSoCap
            ? dsDonViTinh
            : dsDonViTinh.filter((donViSuDung) => isDonViHopLe(donViSoCap, donViSuDung));

        const selectedStillExists = danhSach.some((item) => String(item.id) === String(selectedValue));

        renderSelect(
            'donViSuDungId',
            danhSach,
            (item) => item.id,
            (item) => buildDonViLabel(item),
            selectedStillExists ? selectedValue : ''
        );
    }

    function renderQuocGia(selectedValue = '') {
        renderSelect(
            'xuatXuId',
            dsQuocGia,
            (item) => item.id,
            (item) => buildQuocGiaLabel(item),
            selectedValue
        );
    }

    function buildQuocGiaLabel(item) {
        const ma = item?.maQuocGia ?? item?.ma ?? '';

        const ten = item?.tenQuocGia ?? item?.ten ?? '';

        return [ma, ten].filter(Boolean).join(' - ');
    }

    function renderLoaiBaoQuan(selectedValue = '') {
        renderSelect(
            'dieuKienBaoQuan',
            dsLoaiBaoQuan,
            (item) => item.value,
            (item) => item.name,
            selectedValue
        );
    }

    function isDonViHopLe(donViSoCap, donViSuDung) {
        const loaiSoCap = Number(donViSoCap?.loaiDonVi);

        const loaiSuDung = Number(donViSuDung?.loaiDonVi);

        if (quyTacDonVi === 1) {
            return true;
        }

        if (quyTacDonVi === 2) {
            return loaiSoCap === loaiSuDung;
        }

        if (quyTacDonVi === 3) {
            if (loaiSoCap === LOAI_DON_VI.DEM) {
                return true;
            }

            if (loaiSoCap === LOAI_DON_VI.KHOI_LUONG) {
                return loaiSuDung === LOAI_DON_VI.KHOI_LUONG || loaiSuDung === LOAI_DON_VI.DEM;
            }

            if (loaiSoCap === LOAI_DON_VI.THE_TICH) {
                return loaiSuDung === LOAI_DON_VI.THE_TICH || loaiSuDung === LOAI_DON_VI.DEM;
            }

            return false;
        }

        if (loaiSoCap === LOAI_DON_VI.DEM) {
            return true;
        }

        return loaiSoCap === loaiSuDung;
    }

    function getQuyTacDonViMessage(donViSoCap, donViSuDung) {
        if (quyTacDonVi === 2) {
            return 'Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị.';
        }

        return (
            `Không thể quy đổi từ "${buildDonViLabel(donViSoCap)}"` +
            ` sang "${buildDonViLabel(donViSuDung)}"` +
            ' theo quy tắc đơn vị hiện tại.'
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

    function mapRecordForTable(record) {
        const baoQuan = dsLoaiBaoQuan.find((item) => Number(item.value) === Number(record?.dieuKienBaoQuan));

        return {
            ...record,

            tenDonViSoCap: record?.donViSoCap?.ten || record?.donViSoCap?.tenDonViTinh || '',

            tenDonViSuDung: record?.donViSuDung?.ten || record?.donViSuDung?.tenDonViTinh || '',

            tenDieuKienBaoQuan: baoQuan?.name || ''
        };
    }

    function buildDonViLabel(item) {
        const ma = item?.maDonViTinh ?? item?.ma ?? '';

        const ten = item?.tenDonViTinh ?? item?.ten ?? '';

        const kyHieu = item?.kyHieu ?? '';

        let label = [ma, ten].filter(Boolean).join(' - ');

        if (kyHieu) {
            label += ` (${kyHieu})`;
        }

        return label || '-';
    }

    function buildQuyCach(donViSoCapId, donViSuDungId, heSoQuyDoi) {
        if (!donViSoCapId || !donViSuDungId || heSoQuyDoi === null || heSoQuyDoi === undefined) {
            return null;
        }

        const donViSoCap = dsDonViTinh.find((item) => Number(item.id) === Number(donViSoCapId));

        const donViSuDung = dsDonViTinh.find((item) => Number(item.id) === Number(donViSuDungId));

        if (!donViSoCap || !donViSuDung) {
            return null;
        }

        const tenSoCap = donViSoCap.kyHieu || donViSoCap.tenDonViTinh || donViSoCap.ten || donViSoCap.maDonViTinh || '';

        const tenSuDung =
            donViSuDung.kyHieu || donViSuDung.tenDonViTinh || donViSuDung.ten || donViSuDung.maDonViTinh || '';

        if (!tenSoCap || !tenSuDung) {
            return null;
        }

        const heSoHienThi = window.MCS?.numberInput?.formatValue?.(heSoQuyDoi) ?? String(heSoQuyDoi);

        return `1 ${tenSoCap} = ` + `${heSoHienThi} ${tenSuDung}`;
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

        if (Array.isArray(value?.danhSach)) {
            return value.danhSach;
        }

        return [];
    }

    function normalizeNumber(value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return null;
        }

        const normalized = String(value).trim().replace(/\./g, '').replace(/,/g, '.');

        const number = Number(normalized);

        return Number.isFinite(number) ? number : null;
    }

    function normalizeNullableString(value) {
        if (value === null || value === undefined) {
            return null;
        }

        const text = String(value).trim();

        return text || null;
    }

    function setImageValue(value) {
        const root = document.querySelector('[data-form-field="hinhAnh"] [data-image-picker]');

        if (!root) {
            return;
        }

        const imagePicker = window.MCS?.imagePicker?.initialize(root);

        imagePicker?.setValue?.(value || '');
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'dm_thuc_pham.xlsx');

            window.MCS?.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu thực phẩm thất bại:', error);

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

                window.MCS.api.downloadBlob(result.blob, result.fileName || `dm_thuc_pham_import_${Date.now()}.xlsx`);

                if (catalogInstance?.load) {
                    await catalogInstance.load();
                }

                window.MCS?.toast?.success('Đã xử lý import. Vui lòng kiểm tra file kết quả.');
            } catch (error) {
                console.error('Import thực phẩm thất bại:', error);

                window.MCS?.toast?.error(error?.message || 'Import dữ liệu thất bại.');
            } finally {
                input.remove();
            }
        });

        input.click();
    }
});

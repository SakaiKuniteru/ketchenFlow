"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE =
        "/api/mcs/v1/dm-voucher-don-hang";

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
        loaiGiam:
            "/api/mcs/v1/enums?name=loaiGiamVoucherDonHang",

        phamViApDung:
            "/api/mcs/v1/enums?name=phamViApDungVoucherDonHang",

        nhomSanPham:
            "/api/mcs/v1/dm-nhom-san-pham/tong-hop?active=true",

        sanPham:
            "/api/mcs/v1/dm-san-pham/tong-hop?active=true",

        coSo:
            "/api/mcs/v1/dm-co-so/tong-hop?active=true",

        phongBan:
            "/api/mcs/v1/dm-phong-ban/tong-hop?active=true",

        chucVu:
            "/api/mcs/v1/dm-chuc-vu/tong-hop?active=true",

        nhanVien:
            "/api/mcs/v1/dm-nhan-vien/tong-hop?active=true"
    };

    let dsLoaiGiam = [];
    let dsPhamViApDung = [];

    const FALLBACK_LOAI_GIAM = [
        {
            value: LOAI_GIAM.PHAN_TRAM,
            label: "Phần trăm"
        },
        {
            value: LOAI_GIAM.SO_TIEN,
            label: "Số tiền cố định"
        }
    ];

    const FALLBACK_PHAM_VI_AP_DUNG = [
        {
            value: PHAM_VI.TOAN_BO,
            label: "Toàn bộ đơn hàng"
        },
        {
            value: PHAM_VI.NHOM_SAN_PHAM,
            label: "Nhóm sản phẩm"
        },
        {
            value: PHAM_VI.SAN_PHAM,
            label: "Sản phẩm cụ thể"
        }
    ];

    initialize();

    async function initialize() {
        try {
            await Promise.all([
                loadEnums(),
                loadSelectOptions(
                    "nhomSanPhamId",
                    API.nhomSanPham,
                    item =>
                        `${item.maNhomSanPham || ""} - ${
                            item.tenNhomSanPham || ""
                        }`
                ),
                loadSelectOptions(
                    "sanPhamId",
                    API.sanPham,
                    item =>
                        `${item.maSanPham || ""} - ${
                            item.tenSanPham || ""
                        }`
                ),
                loadSelectOptions(
                    "coSoIds",
                    API.coSo,
                    item =>
                        `${item.maCoSo || ""} - ${
                            item.tenCoSo || ""
                        }`
                ),
                loadSelectOptions(
                    "phongBanIds",
                    API.phongBan,
                    item =>
                        `${item.maPhongBan || ""} - ${
                            item.tenPhongBan || ""
                        }`
                ),
                loadSelectOptions(
                    "chucVuIds",
                    API.chucVu,
                    item =>
                        `${item.maChucVu || ""} - ${
                            item.tenChucVu || ""
                        }`
                ),
                loadSelectOptions(
                    "nhanVienIds",
                    API.nhanVien,
                    item =>
                        `${item.maNhanVien || ""} - ${
                            item.hoTen || ""
                        }`
                )
            ]);

            await initializeCatalog();

            bindEvents();
            syncGiaTriField();
            syncPhamViApDung();
        } catch (error) {
            console.error(
                "Không thể khởi tạo voucher đơn hàng.",
                error
            );

            window.MCS?.toast?.error?.(
                error?.message ||
                "Không thể tải dữ liệu voucher đơn hàng."
            );
        }
    }

    async function loadEnums() {
        const [loaiGiamResult, phamViResult] =
            await Promise.allSettled([
                window.MCS.api.request(API.loaiGiam),
                window.MCS.api.request(API.phamViApDung)
            ]);

        if (loaiGiamResult.status === "rejected") {
            console.error(
                `Không thể tải enum ${API.loaiGiam}.`,
                loaiGiamResult.reason
            );
        }

        if (phamViResult.status === "rejected") {
            console.error(
                `Không thể tải enum ${API.phamViApDung}.`,
                phamViResult.reason
            );
        }

        dsLoaiGiam =
            normalizeEnumData(
                loaiGiamResult.status === "fulfilled"
                    ? loaiGiamResult.value?.data
                    : []
            ).filter(item =>
                [
                    LOAI_GIAM.PHAN_TRAM,
                    LOAI_GIAM.SO_TIEN
                ].includes(Number(item.value))
            );

        dsPhamViApDung = normalizeEnumData(
            phamViResult.status === "fulfilled"
                ? phamViResult.value?.data
                : []
        ).filter(item =>
            [
                PHAM_VI.TOAN_BO,
                PHAM_VI.NHOM_SAN_PHAM,
                PHAM_VI.SAN_PHAM
            ].includes(Number(item.value))
        );

        if (dsLoaiGiam.length === 0) {
            dsLoaiGiam = [...FALLBACK_LOAI_GIAM];
        }

        if (dsPhamViApDung.length === 0) {
            dsPhamViApDung = [...FALLBACK_PHAM_VI_AP_DUNG];
        }

        renderSelect(
            "loaiGiam",
            dsLoaiGiam
        );

        renderSelect(
            "phamViApDung",
            dsPhamViApDung
        );
    }

    async function loadSelectOptions(
        selectId,
        url,
        getLabel
    ) {
        try {
            const response =
                await window.MCS.api.request(url);

            const records =
                normalizeRecords(response?.data)
                    .filter(item =>
                        item?.active === true
                    );

            renderOptions(
                selectId,
                records,
                getLabel
            );
        } catch (error) {
            console.error(
                `Không thể tải dữ liệu select ${selectId}.`,
                error
            );

            renderOptions(
                selectId,
                [],
                () => ""
            );
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
        return normalizeRecords(data).map(item => ({
            value: item.value,
            label:
                item.label ??
                item.name ??
                item.ten ??
                String(item.value)
        }));
    }

    function renderSelect(
        selectId,
        items
    ) {
        renderOptions(
            selectId,
            items,
            item => item.label
        );
    }

    function renderOptions(
        selectId,
        items,
        getLabel
    ) {
        const select =
            document.getElementById(selectId);

        if (!select) {
            return;
        }

        select.innerHTML = "";

        if (!select.multiple) {
            const emptyOption =
                document.createElement("option");

            emptyOption.value = "";
            emptyOption.textContent = "";

            select.appendChild(emptyOption);
        }

        items.forEach(item => {
            const option =
                document.createElement("option");

            option.value = String(
                item.value ?? item.id
            );

            option.textContent =
                String(getLabel(item) || "").trim();

            select.appendChild(option);
        });

        const root =
            select.closest("[data-smart-select]");

        const smartSelect =
            window.MCS.smartSelect.initialize(root);

        smartSelect?.refresh?.();
    }

    async function initializeCatalog() {
        await window.MCS.pages.createCatalogPage({
            moduleName: "voucher-don-hang",

            permissionCodes: {
                view: [
                    "Q000034",
                    "Q002031"
                ],
                create: "Q002032",
                update: "Q002033"
            },

            columns: [
                {
                    key: "maVoucher",
                    label: "Mã voucher",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "tenVoucher",
                    label: "Tên voucher",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "loaiGiam",
                    label: "Loại giảm",
                    sortable: true,
                    filterable: true,
                    render: value =>
                        getEnumLabel(
                            dsLoaiGiam,
                            value
                        )
                },
                {
                    key: "giaTri",
                    label: "Giá trị",
                    sortable: true,
                    filterable: true,
                    render: (value, record) =>
                        formatGiaTri(
                            value,
                            record?.loaiGiam
                        )
                },
                {
                    key: "phamViApDung",
                    label: "Phạm vi áp dụng",
                    sortable: true,
                    filterable: true,
                    render: value =>
                        getEnumLabel(
                            dsPhamViApDung,
                            value
                        )
                },
                {
                    key: "thoiGianBatDau",
                    label: "Bắt đầu",
                    sortable: true,
                    filterable: true,
                    render: formatDateTime
                },
                {
                    key: "thoiGianKetThuc",
                    label: "Kết thúc",
                    sortable: true,
                    filterable: true,
                    render: formatDateTime
                },
                {
                    key: "active",
                    label: "Trạng thái",
                    sortable: true,
                    className:
                        "catalog-table__cell--center",
                    render:
                        window.createStatusBadge
                }
            ],

            defaultValues: {
                maVoucher: "",
                tenVoucher: "",
                loaiGiam: "",
                giaTri: "",
                giamToiDa: "",
                giaTriDonHangToiThieu: "",
                soLuongPhatHanh: "",
                soLuotMoiNhanVien: "",
                phamViApDung: "",

                nhomSanPhamId: "",
                sanPhamId: "",

                nhomSanPhamIds: [],
                sanPhamIds: [],
                coSoIds: [],
                phongBanIds: [],
                chucVuIds: [],
                nhanVienIds: [],

                choPhepDungChung: true,
                tuDongApDung: true,
                thoiGianBatDau: "",
                thoiGianKetThuc: "",
                moTa: "",
                active: true
            },

            validation: {
                maVoucher: {
                    label: "Mã voucher",
                    required: true,
                    maxLength: 50,
                    unique: true,
                    uniqueMessage:
                        "Mã voucher đã tồn tại."
                },

                tenVoucher: {
                    label: "Tên voucher",
                    required: true,
                    maxLength: 255,
                    unique: true,
                    uniqueMessage:
                        "Tên voucher đã tồn tại."
                },

                loaiGiam: {
                    label: "Loại giảm",
                    required: true
                },

                giaTri: {
                    label: "Giá trị",
                    required: true
                },

                phamViApDung: {
                    label: "Phạm vi áp dụng",
                    required: true
                },

                thoiGianBatDau: {
                    label: "Thời gian bắt đầu",
                    required: true
                },

                thoiGianKetThuc: {
                    label: "Thời gian kết thúc",
                    required: true
                }
            },

            validate(formData) {
                return validateFormData(formData);
            },

            detailTitle:
                "Thông tin voucher đơn hàng",

            createTitle:
                "Thêm voucher đơn hàng",

            updateTitle:
                "Cập nhật voucher đơn hàng",

            mapListResponse(result) {
                return Array.isArray(result?.data)
                    ? result.data
                    : normalizeRecords(result?.data);
            },

            mapDetailResponse(result) {
                return result?.data || null;
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? "",
                    maVoucher:
                        record?.maVoucher || "",
                    tenVoucher:
                        record?.tenVoucher || "",
                    loaiGiam:
                        record?.loaiGiam ?? "",
                    giaTri:
                        record?.giaTri ?? "",
                    giamToiDa:
                        record?.giamToiDa ?? "",
                    giaTriDonHangToiThieu:
                        record?.giaTriDonHangToiThieu ?? "",
                    soLuongPhatHanh:
                        record?.soLuongPhatHanh ?? "",
                    soLuotMoiNhanVien:
                        record?.soLuotMoiNhanVien ?? "",
                    phamViApDung:
                        record?.phamViApDung ?? "",

                    nhomSanPhamId:
                        firstId(
                            record?.nhomSanPhamIds
                        ),

                    sanPhamId:
                        firstId(
                            record?.sanPhamIds
                        ),

                    nhomSanPhamIds:
                        normalizeIds(
                            record?.nhomSanPhamIds
                        ),

                    sanPhamIds:
                        normalizeIds(
                            record?.sanPhamIds
                        ),

                    coSoIds:
                        normalizeIds(
                            record?.coSoIds
                        ),

                    phongBanIds:
                        normalizeIds(
                            record?.phongBanIds
                        ),

                    chucVuIds:
                        normalizeIds(
                            record?.chucVuIds
                        ),

                    nhanVienIds:
                        normalizeIds(
                            record?.nhanVienIds
                        ),

                    choPhepDungChung:
                        record?.choPhepDungChung === true,

                    tuDongApDung:
                        record?.tuDongApDung === true,

                    thoiGianBatDau:
                        record?.thoiGianBatDau || "",

                    thoiGianKetThuc:
                        record?.thoiGianKetThuc || "",

                    moTa:
                        record?.moTa || "",

                    active:
                        record?.active === true
                };
            },

            onRecordLoaded(record) {
                syncSelectValue(
                    "loaiGiam",
                    record?.loaiGiam
                );

                syncSelectValue(
                    "phamViApDung",
                    record?.phamViApDung
                );

                syncSelectValue(
                    "nhomSanPhamId",
                    firstId(record?.nhomSanPhamIds)
                );

                syncSelectValue(
                    "sanPhamId",
                    firstId(record?.sanPhamIds)
                );

                syncSelectValues(
                    "coSoIds",
                    record?.coSoIds
                );

                syncSelectValues(
                    "phongBanIds",
                    record?.phongBanIds
                );

                syncSelectValues(
                    "chucVuIds",
                    record?.chucVuIds
                );

                syncSelectValues(
                    "nhanVienIds",
                    record?.nhanVienIds
                );

                syncNumberField(
                    "giaTri",
                    record?.giaTri
                );

                syncNumberField(
                    "giamToiDa",
                    record?.giamToiDa
                );

                syncNumberField(
                    "giaTriDonHangToiThieu",
                    record?.giaTriDonHangToiThieu
                );

                syncNumberField(
                    "soLuongPhatHanh",
                    record?.soLuongPhatHanh
                );

                syncNumberField(
                    "soLuotMoiNhanVien",
                    record?.soLuotMoiNhanVien
                );

                syncDateField(
                    "thoiGianBatDau",
                    record?.thoiGianBatDau
                );

                syncDateField(
                    "thoiGianKetThuc",
                    record?.thoiGianKetThuc
                );

                syncGiaTriField();
                syncPhamViApDung();
            },

            transformPayload(formData) {
                const phamViApDung =
                    toNullableNumber(
                        formData.phamViApDung
                    );

                return {
                    maVoucher:
                        String(
                            formData.maVoucher || ""
                        )
                            .trim()
                            .toUpperCase(),

                    tenVoucher:
                        String(
                            formData.tenVoucher || ""
                        ).trim(),

                    loaiGiam:
                        toNullableNumber(
                            formData.loaiGiam
                        ),

                    giaTri:
                        parseFormNumber(
                            formData.giaTri
                        ),

                    giamToiDa:
                        parseOptionalNumber(
                            formData.giamToiDa
                        ),

                    giaTriDonHangToiThieu:
                        parseOptionalNumber(
                            formData.giaTriDonHangToiThieu
                        ) ?? 0,

                    soLuongPhatHanh:
                        parseOptionalInteger(
                            formData.soLuongPhatHanh
                        ),

                    soLuotMoiNhanVien:
                        parseOptionalInteger(
                            formData.soLuotMoiNhanVien
                        ),

                    phamViApDung,

                    nhomSanPhamIds:
                        phamViApDung ===
                        PHAM_VI.NHOM_SAN_PHAM
                            ? toIds(
                                formData.nhomSanPhamId
                            )
                            : [],

                    sanPhamIds:
                        phamViApDung ===
                        PHAM_VI.SAN_PHAM
                            ? toIds(
                                formData.sanPhamId
                            )
                            : [],

                    coSoIds:
                        normalizeIds(
                            formData.coSoIds
                        ),

                    phongBanIds:
                        normalizeIds(
                            formData.phongBanIds
                        ),

                    chucVuIds:
                        normalizeIds(
                            formData.chucVuIds
                        ),

                    nhanVienIds:
                        normalizeIds(
                            formData.nhanVienIds
                        ),

                    choPhepDungChung:
                        formData.choPhepDungChung === true,

                    tuDongApDung:
                        formData.tuDongApDung === true,

                    thoiGianBatDau:
                        toApiDateTime(
                            formData.thoiGianBatDau,
                            "00:00:00"
                        ),

                    thoiGianKetThuc:
                        toApiDateTime(
                            formData.thoiGianKetThuc,
                            "23:59:59"
                        ),

                    moTa:
                        normalizeNullableText(
                            formData.moTa
                        ),

                    active:
                        formData.active === true
                };
            },

            getRecordSubtitle(record) {
                return record?.maVoucher || "";
            },

            toolbarActions: [
                {
                    action: "filter",
                    label: "Tìm kiếm chi tiết",
                    icon: "search"
                }
            ]
        });
    }

    function bindEvents() {
        bindSmartSelectChange(
            "loaiGiam",
            syncGiaTriField
        );

        bindSmartSelectChange(
            "phamViApDung",
            syncPhamViApDung
        );

        bindGiaTriRules();
    }

    function bindSmartSelectChange(
        selectId,
        callback
    ) {
        const select =
            document.getElementById(selectId);

        const root =
            select?.closest("[data-smart-select]");

        if (!select || !root) {
            return;
        }

        root.addEventListener(
            "smart-select:change",
            callback
        );

        select.addEventListener(
            "change",
            event => {
                if (!event.detail) {
                    callback();
                }
            }
        );
    }

    function bindGiaTriRules() {
        const input =
            document.getElementById("giaTri");

        if (!input) {
            return;
        }

        input.addEventListener("input", () => {
            if (input.disabled) {
                return;
            }

            normalizeNumberInput(input);

            const loaiGiam =
                toNullableNumber(
                    getSmartSelectValue("loaiGiam")
                );

            const value =
                getInputNumber(input);

            if (
                loaiGiam === LOAI_GIAM.PHAN_TRAM &&
                value !== null &&
                value > 100
            ) {
                setNumberValue(input, 100);
            }
        });

        input.addEventListener("blur", () => {
            normalizeNumberInput(input);

            const loaiGiam =
                toNullableNumber(
                    document.getElementById(
                        "loaiGiam"
                    )?.value
                );

            const value =
                getInputNumber(input);

            if (
                loaiGiam === LOAI_GIAM.PHAN_TRAM &&
                value !== null &&
                value > 100
            ) {
                setNumberValue(input, 100);
            }
        });
    }

    function syncGiaTriField() {
        const input =
            document.getElementById("giaTri");

        if (!input) {
            return;
        }

        const loaiGiam =
            toNullableNumber(
                getSmartSelectValue("loaiGiam")
            );

        const field =
            input.closest("[data-form-field]");

        const control =
            field?.querySelector(
                ".form-field__control"
            );

        let suffix =
            field?.querySelector(
                ".form-field__suffix"
            );

        if (!suffix && control) {
            suffix =
                document.createElement("span");

            suffix.className =
                "form-field__suffix";

            control.appendChild(suffix);
        }

        if (loaiGiam === null) {
            input.disabled = true;
            input.setAttribute("disabled", "disabled");
            input.value = "";

            input.min = "0";
            input.step = "any";
            input.removeAttribute("max");

            if (suffix) {
                suffix.textContent = "";
            }

            refreshNumberField(field);
            return;
        }

        input.disabled = false;
        input.removeAttribute("disabled");

        input.placeholder = "";
        input.min = "0";
        input.step = "0.00001";

        input.dataset.numberMin = "0";
        input.dataset.numberStep = "0.00001";
        input.dataset.numberInteger = "false";

        if (
            loaiGiam === LOAI_GIAM.PHAN_TRAM
        ) {
            input.max = "100";
            input.dataset.numberMax = "100";

            if (suffix) {
                suffix.textContent = "%";
            }

            const value =
                getInputNumber(input);

            if (
                value !== null &&
                value > 100
            ) {
                setNumberValue(input, 100);
            }
        }

        if (
            loaiGiam === LOAI_GIAM.SO_TIEN
        ) {
            input.removeAttribute("max");
            delete input.dataset.numberMax;

            if (suffix) {
                suffix.textContent = "đ";
            }
        }

        refreshNumberField(field);
    }

    function syncPhamViApDung() {
        const scope =
            toNullableNumber(
                getSmartSelectValue("phamViApDung")
            );

        const visibleField =
            scope === PHAM_VI.NHOM_SAN_PHAM
                ? "nhomSanPhamId"
                : scope === PHAM_VI.SAN_PHAM
                    ? "sanPhamId"
                    : null;

        document
            .querySelectorAll(
                "[data-voucher-scope-wrapper]"
            )
            .forEach(wrapper => {
                const key =
                    wrapper.dataset
                        .voucherScopeWrapper;

                const visible =
                    key === "all"
                        ? scope === PHAM_VI.TOAN_BO
                        : key === visibleField;

                wrapper.hidden = !visible;

                if (key === "all") {
                    return;
                }

                const smartSelect =
                    getSmartSelect(key);

                smartSelect?.setDisabled(
                    !visible
                );

                if (!visible) {
                    smartSelect?.clear?.(false);
                }

                if (visible) {
                    smartSelect?.refresh?.();
                }
            });
    }

    function validateFormData(data) {
        const errors = {};

        const loaiGiam =
            toNullableNumber(data.loaiGiam);

        const giaTri =
            parseFormNumber(data.giaTri);

        if (
            loaiGiam !== LOAI_GIAM.PHAN_TRAM &&
            loaiGiam !== LOAI_GIAM.SO_TIEN
        ) {
            errors.loaiGiam =
                "Chỉ được chọn Phần trăm hoặc Số tiền cố định.";
        }

        if (giaTri === null || giaTri <= 0) {
            errors.giaTri =
                "Giá trị phải lớn hơn 0.";
        }

        if (
            loaiGiam === LOAI_GIAM.PHAN_TRAM &&
            giaTri > 100
        ) {
            errors.giaTri =
                "Giá trị phần trăm không được vượt quá 100.";
        }

        const decimalLength =
            getInputDecimalLength("giaTri");

        if (decimalLength > DECIMAL_SCALE) {
            errors.giaTri =
                "Giá trị chỉ được nhập tối đa 5 chữ số sau dấu phẩy.";
        }

        const scope =
            toNullableNumber(data.phamViApDung);

        if (!scope) {
            errors.phamViApDung =
                "Vui lòng chọn phạm vi áp dụng.";
        }

        if (
            scope === PHAM_VI.NHOM_SAN_PHAM &&
            !toIds(data.nhomSanPhamId).length
        ) {
            errors.nhomSanPhamId =
                "Vui lòng chọn nhóm sản phẩm.";
        }

        if (
            scope === PHAM_VI.SAN_PHAM &&
            !toIds(data.sanPhamId).length
        ) {
            errors.sanPhamId =
                "Vui lòng chọn sản phẩm.";
        }

        const start =
            parseDateValue(data.thoiGianBatDau);

        const end =
            parseDateValue(data.thoiGianKetThuc);

        if (!start) {
            errors.thoiGianBatDau =
                "Vui lòng chọn thời gian bắt đầu.";
        }

        if (!end) {
            errors.thoiGianKetThuc =
                "Vui lòng chọn thời gian kết thúc.";
        }

        if (start && end && end <= start) {
            errors.thoiGianKetThuc =
                "Thời gian kết thúc phải lớn hơn thời gian bắt đầu.";
        }

        return errors;
    }

    function syncSelectValue(
        id,
        value
    ) {
        const smartSelect =
            getSmartSelect(id);

        smartSelect?.setValue?.(
            value ?? "",
            false
        );
    }

    function syncSelectValues(
        id,
        values
    ) {
        const select =
            document.getElementById(id);

        const smartSelect =
            getSmartSelect(id);

        if (!select?.multiple) {
            smartSelect?.setValue?.(
                firstId(values),
                false
            );

            return;
        }

        smartSelect?.setValues?.(
            normalizeIds(values),
            false
        );
    }

    function getSmartSelect(id) {
        const select =
            document.getElementById(id);

        const root =
            select?.closest(
                "[data-smart-select]"
            );

        return root?.smartSelect ||
            window.MCS.smartSelect.initialize(
                root
            );
    }

    function syncNumberField(
        id,
        value
    ) {
        const input =
            document.getElementById(id);

        if (!input) {
            return;
        }

        setNumberValue(
            input,
            value ?? ""
        );
    }

    function setNumberValue(
        input,
        value
    ) {
        const instance =
            window.MCS.numberInput.initialize(
                input
            );

        instance?.setValue?.(value);
    }

    function refreshNumberField(field) {
        window.MCS.numberInput.refresh(
            field
        );
    }

    function syncDateField(
        id,
        value
    ) {
        const field = document.querySelector(
            `[data-form-field="${id}"]`
        );

        if (!field) {
            return;
        }

        const datePicker =
            field.datePicker ||
            field.querySelector(
                ".date-picker"
            )?.datePicker;

        if (datePicker?.setValue) {
            datePicker.setValue(
                value || "",
                false
            );

            return;
        }

        const hiddenInput = field.querySelector(
            "[data-date-value]"
        );

        if (hiddenInput) {
            hiddenInput.value = value || "";
        }
    }

    function normalizeNumberInput(input) {
        let raw =
            String(input.value || "")
                .replace(/\./g, "");

        const hasComma =
            raw.includes(",");

        let [
            integerPart,
            decimalPart = ""
        ] = raw.split(",");

        integerPart =
            integerPart
                .replace(/\D/g, "")
                .replace(/^0+(?=\d)/, "");

        if (!integerPart && hasComma) {
            integerPart = "0";
        }

        decimalPart =
            decimalPart
                .replace(/\D/g, "")
                .slice(0, 5);

        input.value =
            integerPart +
            (
                hasComma
                    ? `,${decimalPart}`
                    : ""
            );
    }

    function getInputNumber(input) {
        const value =
            input?.numberInput?.getValue?.();

        if (value !== null && value !== undefined) {
            return Number(value);
        }

        return parseFormNumber(input?.value);
    }

    function parseFormNumber(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        if (typeof value === "number") {
            return Number.isFinite(value)
                ? value
                : null;
        }

        const text =
            String(value)
                .trim()
                .replace(/\s/g, "");

        if (!text) {
            return null;
        }

        const normalized =
            text.includes(",")
                ? text
                    .replace(/\./g, "")
                    .replace(",", ".")
                : text;

        const number =
            Number(normalized);

        return Number.isFinite(number)
            ? number
            : null;
    }

    function parseOptionalNumber(value) {
        const number =
            parseFormNumber(value);

        return number === null
            ? null
            : number;
    }

    function parseOptionalInteger(value) {
        const number =
            parseFormNumber(value);

        return number === null
            ? null
            : Math.trunc(number);
    }

    function getInputDecimalLength(id) {
        const input =
            document.getElementById(id);

        if (!input) {
            return 0;
        }

        const raw =
            String(input.value || "")
                .replace(/\./g, "");

        const index =
            raw.indexOf(",");

        return index < 0
            ? 0
            : raw
                .slice(index + 1)
                .replace(/\D/g, "")
                .length;
    }

    function toIds(value) {
        if (Array.isArray(value)) {
            return value
                .map(Number)
                .filter(Number.isInteger);
        }

        const number =
            Number(value);

        return Number.isInteger(number)
            ? [number]
            : [];
    }

    function normalizeIds(value) {
        return [
            ...new Set(
                toIds(value)
            )
        ];
    }

    function firstId(value) {
        return normalizeIds(value)[0] ?? "";
    }

    function toNullableNumber(value) {
        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }

    function normalizeNullableText(value) {
        const text =
            String(value ?? "").trim();

        return text || null;
    }

    function toApiDateTime(
        value,
        defaultTime
    ) {
        const text =
            String(value || "").trim();

        if (!text) {
            return null;
        }

        const match =
            text.match(
                /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
            );

        if (!match) {
            return null;
        }

        return `${
            match[1]
        }T${
            match[2] || defaultTime.slice(0, 2)
        }:${
            match[3] || defaultTime.slice(3, 5)
        }:${
            match[4] || defaultTime.slice(6, 8)
        }+07:00`;
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }

        const date =
            new Date(value);

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    function getEnumLabel(items, value) {
        return (
            items.find(
                item =>
                    Number(item.value) ===
                    Number(value)
            )?.label || "-"
        );
    }

    function formatGiaTri(value, loaiGiam) {
        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "-";
        }

        const formatted =
            new Intl.NumberFormat(
                "vi-VN",
                {
                    maximumFractionDigits:
                        DECIMAL_SCALE
                }
            ).format(number);

        return Number(loaiGiam) ===
            LOAI_GIAM.PHAN_TRAM
            ? `${formatted} %`
            : `${formatted} đ`;
    }

    function formatDateTime(value) {
        const date =
            new Date(value);

        if (
            !value ||
            Number.isNaN(date.getTime())
        ) {
            return "-";
        }

        return date.toLocaleString(
            "vi-VN",
            {
                hour12: false
            }
        );
    }

    function getSmartSelectValue(selectId) {
        const select =
            document.getElementById(selectId);

        const root =
            select?.closest("[data-smart-select]");

        const smartSelect =
            root?.smartSelect ||
            window.MCS.smartSelect.initialize(root);

        return (
            smartSelect?.getValue?.() ??
            select?.value ??
            ""
        );
    }
});

"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        let catalog = null;
        let dsLoaiDiaDiem = [];

        initialize();

        async function initialize() {
            await loadLoaiDiaDiem();
            await initializeCatalog();
        }

        async function initializeCatalog() {
            try {
                catalog =
                    await window.MCS.pages
                        .createCatalogPage({
                            moduleName:
                                "dia-diem-nhan-hang",

                            permissionCodes: {
                                view:
                                    "Q002051",
                                create:
                                    "Q002052",
                                update:
                                    "Q002053"
                            },

                            columns: [
                                {
                                    key:
                                        "maDiaDiem",
                                    label:
                                        "Mã địa điểm",
                                    width:
                                        "160px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "tenDiaDiem",
                                    label:
                                        "Tên địa điểm",
                                    width:
                                        "220px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "diaChiChiTiet",
                                    label:
                                        "Địa chỉ chi tiết",
                                    width:
                                        "300px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "thongTinLoaiDiaDiem.name",
                                    label:
                                        "Loại địa điểm",
                                    width:
                                        "180px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "laMacDinh",
                                    label:
                                        "Mặc định",
                                    width:
                                        "130px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    className:
                                        "catalog-table__cell--center",
                                    isBoolean:
                                        true,
                                    trueLabel:
                                        "Có",
                                    falseLabel:
                                        "Không"
                                },
                                {
                                    key:
                                        "thuTuHienThi",
                                    label:
                                        "Thứ tự",
                                    width:
                                        "110px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    type:
                                        "number",
                                    className:
                                        "catalog-table__cell--right"
                                },
                                {
                                    key:
                                        "active",
                                    label:
                                        "Trạng thái",
                                    width:
                                        "130px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    className:
                                        "catalog-table__cell--center",
                                    isBoolean:
                                        true,
                                    trueLabel:
                                        "TRUE",
                                    falseLabel:
                                        "FALSE"
                                }
                            ],

                            defaultValues: {
                                maDiaDiem:
                                    "",
                                tenDiaDiem:
                                    "",
                                diaChiChiTiet:
                                    "",
                                loaiDiaDiem:
                                    20,
                                laMacDinh:
                                    false,
                                ghiChu:
                                    "",
                                thuTuHienThi:
                                    0,
                                active:
                                    true
                            },

                            validation: {
                                maDiaDiem: {
                                    label:
                                        "Mã địa điểm",
                                    required:
                                        true,
                                    maxLength:
                                        50,
                                    unique:
                                        true,
                                    requiredMessage:
                                        "Vui lòng nhập mã địa điểm.",
                                    maxLengthMessage:
                                        "Mã địa điểm không được vượt quá 50 ký tự.",
                                    uniqueMessage:
                                        "Mã địa điểm đã tồn tại trong danh sách của bạn."
                                },

                                tenDiaDiem: {
                                    label:
                                        "Tên địa điểm",
                                    required:
                                        true,
                                    maxLength:
                                        255,
                                    unique:
                                        true,
                                    requiredMessage:
                                        "Vui lòng nhập tên địa điểm.",
                                    maxLengthMessage:
                                        "Tên địa điểm không được vượt quá 255 ký tự.",
                                    uniqueMessage:
                                        "Tên địa điểm đã tồn tại trong danh sách của bạn."
                                },

                                diaChiChiTiet: {
                                    label:
                                        "Địa chỉ chi tiết",
                                    required:
                                        true,
                                    maxLength:
                                        500,
                                    requiredMessage:
                                        "Vui lòng nhập địa chỉ chi tiết.",
                                    maxLengthMessage:
                                        "Địa chỉ chi tiết không được vượt quá 500 ký tự."
                                },

                                loaiDiaDiem: {
                                    label:
                                        "Loại địa điểm",
                                    required:
                                        true,
                                    requiredMessage:
                                        "Vui lòng chọn loại địa điểm."
                                },

                                ghiChu: {
                                    label:
                                        "Ghi chú",
                                    maxLength:
                                        500,
                                    maxLengthMessage:
                                        "Ghi chú không được vượt quá 500 ký tự."
                                }
                            },

                            detailTitle:
                                "Thông tin địa điểm nhận hàng",

                            createTitle:
                                "Thêm địa điểm nhận hàng",

                            updateTitle:
                                "Cập nhật địa điểm nhận hàng",

                            getRecordSubtitle(record) {
                                return record
                                    ?.maDiaDiem ||
                                    "";
                            },

                            mapListResponse(result) {
                                return Array.isArray(
                                    result?.data
                                )
                                    ? result.data
                                    : [];
                            },

                            mapDetailResponse(result) {
                                return result?.data ||
                                    null;
                            },

                            mapRecordToForm(record) {
                                return {
                                    id:
                                        record?.id ??
                                        "",

                                    maDiaDiem:
                                        record?.maDiaDiem ||
                                        "",

                                    tenDiaDiem:
                                        record?.tenDiaDiem ||
                                        "",

                                    diaChiChiTiet:
                                        record
                                            ?.diaChiChiTiet ||
                                        "",

                                    loaiDiaDiem:
                                        record
                                            ?.loaiDiaDiem ??
                                        20,

                                    laMacDinh:
                                        record
                                            ?.laMacDinh ===
                                        true,

                                    ghiChu:
                                        record?.ghiChu ||
                                        "",

                                    thuTuHienThi:
                                        record
                                            ?.thuTuHienThi ??
                                        0,

                                    active:
                                        record?.active ===
                                        true
                                };
                            },

                            transformPayload(
                                formData
                            ) {
                                const active =
                                    formData.active ===
                                    true;

                                return {
                                    maDiaDiem:
                                        String(
                                            formData
                                                .maDiaDiem ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenDiaDiem:
                                        String(
                                            formData
                                                .tenDiaDiem ||
                                            ""
                                        )
                                            .trim(),

                                    diaChiChiTiet:
                                        String(
                                            formData
                                                .diaChiChiTiet ||
                                            ""
                                        )
                                            .trim(),

                                    loaiDiaDiem:
                                        formData
                                            .loaiDiaDiem ===
                                        ""
                                            ? null
                                            : Number(
                                                formData
                                                    .loaiDiaDiem
                                            ),

                                    laMacDinh:
                                        active &&
                                        formData
                                            .laMacDinh ===
                                        true,

                                    ghiChu:
                                        String(
                                            formData
                                                .ghiChu ||
                                            ""
                                        )
                                            .trim() ||
                                        null,

                                    thuTuHienThi:
                                        getNumberValue(
                                            "thuTuHienThi"
                                        ) ?? 0,

                                    active
                                };
                            },

                            validate(formData) {
                                const errors = {};

                                if (
                                    !Number.isInteger(
                                        formData
                                            .thuTuHienThi
                                    ) ||
                                    formData
                                        .thuTuHienThi < 0
                                ) {
                                    errors
                                        .thuTuHienThi =
                                        "Thứ tự hiển thị phải là số nguyên lớn hơn hoặc bằng 0.";
                                }

                                return errors;
                            },

                            onRecordLoaded(
                                record,
                                mode
                            ) {
                                renderLoaiDiaDiem(
                                    record
                                        ?.loaiDiaDiem ??
                                    20
                                );

                                setSmartSelectDisabled(
                                    "loaiDiaDiem",
                                    mode === "view"
                                );

                                setNumberValue(
                                    "thuTuHienThi",
                                    record
                                        ?.thuTuHienThi ??
                                    0
                                );
                            },

                            toolbarActions: [
                                {
                                    action:
                                        "filter",
                                    label:
                                        "Tìm kiếm chi tiết",
                                    icon:
                                        "search"
                                }
                            ]
                        });
            } catch (error) {
                console.error(
                    "Không thể khởi tạo danh mục địa điểm nhận hàng.",
                    error
                );

                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải danh mục địa điểm nhận hàng."
                );
            }
        }

        async function loadLoaiDiaDiem() {
            try {
                const result =
                    await window.MCS.api
                        .request(
                            "/api/mcs/v1/enums?name=loaiDiaDiemNhanHang"
                        );

                dsLoaiDiaDiem =
                    Array.isArray(
                        result?.data
                    )
                        ? result.data
                        : [];

                renderLoaiDiaDiem(20);
            } catch (error) {
                console.error(
                    "Không thể tải loại địa điểm nhận hàng.",
                    error
                );
            }
        }

        function renderLoaiDiaDiem(
            selectedValue = ""
        ) {
            const select =
                document.getElementById(
                    "loaiDiaDiem"
                );

            if (!select) {
                return;
            }

            const selected =
                selectedValue === null ||
                selectedValue === undefined
                    ? ""
                    : String(
                        selectedValue
                    );

            select.innerHTML = "";

            const emptyOption =
                document.createElement(
                    "option"
                );

            emptyOption.value = "";
            emptyOption.textContent = "";
            emptyOption.selected =
                selected === "";

            select.appendChild(
                emptyOption
            );

            dsLoaiDiaDiem.forEach(
                item => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(
                            item.value
                        );

                    option.textContent =
                        item.name;

                    option.selected =
                        String(
                            item.value
                        ) === selected;

                    select.appendChild(
                        option
                    );
                }
            );

            select.value = selected;

            const root =
                select.closest(
                    "[data-smart-select]"
                );

            const instance =
                window.MCS
                    ?.smartSelect
                    ?.initialize(root);

            instance?.refresh?.();
        }

        function setSmartSelectDisabled(
            id,
            disabled
        ) {
            const select =
                document.getElementById(id);

            const root =
                select?.closest(
                    "[data-smart-select]"
                );

            const instance =
                window.MCS
                    ?.smartSelect
                    ?.initialize(root);

            instance?.setDisabled?.(
                disabled
            );
        }

        function getNumberValue(id) {
            const input =
                document.getElementById(id);

            const instance =
                window.MCS
                    ?.numberInput
                    ?.initialize(input);

            return instance?.getValue?.() ??
                null;
        }

        function setNumberValue(
            id,
            value
        ) {
            const input =
                document.getElementById(id);

            const instance =
                window.MCS
                    ?.numberInput
                    ?.initialize(input);

            instance?.setValue?.(
                value ?? ""
            );
        }
    }
);

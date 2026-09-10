"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        let catalog = null;
        let dsCoSo = [];
        let soPhutDatTruoc = 20;

        initialize();

        async function initialize() {
            await Promise.all([
                loadCoSo(),
                loadSoPhutDatTruoc()
            ]);

            await initializeCatalog();
        }

        async function initializeCatalog() {
            try {
                catalog =
                    await window.MCS.pages
                        .createCatalogPage({
                            moduleName:
                                "khung-gio-nhan-hang",

                            permissionCodes: {
                                view:
                                    "Q002061",
                                create:
                                    "Q002062",
                                update:
                                    "Q002063"
                            },

                            columns: [
                                {
                                    key:
                                        "maKhungGio",
                                    label:
                                        "Mã khung giờ",
                                    width:
                                        "160px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "tenKhungGio",
                                    label:
                                        "Tên khung giờ",
                                    width:
                                        "210px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "tenCoSo",
                                    label:
                                        "Cơ sở",
                                    width:
                                        "220px",
                                    sortable:
                                        true,
                                    filterable:
                                        true
                                },
                                {
                                    key:
                                        "gioBatDau",
                                    label:
                                        "Giờ bắt đầu",
                                    width:
                                        "140px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    render:
                                        formatTime
                                },
                                {
                                    key:
                                        "gioKetThuc",
                                    label:
                                        "Giờ kết thúc",
                                    width:
                                        "140px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    render:
                                        formatTime
                                },
                                {
                                    key:
                                        "soPhutDatTruoc",
                                    label:
                                        "Đặt trước",
                                    width:
                                        "130px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    type:
                                        "number",
                                    className:
                                        "catalog-table__cell--right",
                                    render(value) {
                                        return value === null ||
                                            value === undefined
                                            ? "—"
                                            : `${value} phút`;
                                    }
                                },
                                {
                                    key:
                                        "soDonToiDa",
                                    label:
                                        "Số đơn tối đa",
                                    width:
                                        "150px",
                                    sortable:
                                        true,
                                    filterable:
                                        true,
                                    type:
                                        "number",
                                    className:
                                        "catalog-table__cell--right",
                                    render(value) {
                                        return value === null ||
                                            value === undefined
                                            ? "Không giới hạn"
                                            : value;
                                    }
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
                                maKhungGio:
                                    "",
                                tenKhungGio:
                                    "",
                                coSoId:
                                    "",
                                gioBatDau:
                                    "",
                                gioKetThuc:
                                    "",
                                soDonToiDa:
                                    null,
                                soPhutDatTruoc,
                                active:
                                    true
                            },

                            validation: {
                                maKhungGio: {
                                    label:
                                        "Mã khung giờ",
                                    required:
                                        true,
                                    maxLength:
                                        50,
                                    requiredMessage:
                                        "Vui lòng nhập mã khung giờ.",
                                    maxLengthMessage:
                                        "Mã khung giờ không được vượt quá 50 ký tự."
                                },

                                tenKhungGio: {
                                    label:
                                        "Tên khung giờ",
                                    required:
                                        true,
                                    maxLength:
                                        150,
                                    requiredMessage:
                                        "Vui lòng nhập tên khung giờ.",
                                    maxLengthMessage:
                                        "Tên khung giờ không được vượt quá 150 ký tự."
                                },

                                coSoId: {
                                    label:
                                        "Cơ sở",
                                    required:
                                        true,
                                    requiredMessage:
                                        "Vui lòng chọn cơ sở."
                                },

                                gioBatDau: {
                                    label:
                                        "Giờ bắt đầu",
                                    required:
                                        true,
                                    requiredMessage:
                                        "Vui lòng chọn giờ bắt đầu."
                                },

                                gioKetThuc: {
                                    label:
                                        "Giờ kết thúc",
                                    required:
                                        true,
                                    requiredMessage:
                                        "Vui lòng chọn giờ kết thúc."
                                }
                            },

                            detailTitle:
                                "Thông tin khung giờ nhận hàng",

                            createTitle:
                                "Thêm khung giờ nhận hàng",

                            updateTitle:
                                "Cập nhật khung giờ nhận hàng",

                            getRecordSubtitle(record) {
                                return record
                                    ?.maKhungGio ||
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

                                    maKhungGio:
                                        record
                                            ?.maKhungGio ||
                                        "",

                                    tenKhungGio:
                                        record
                                            ?.tenKhungGio ||
                                        "",

                                    coSoId:
                                        record?.coSoId ??
                                        "",

                                    gioBatDau:
                                        normalizeTime(
                                            record
                                                ?.gioBatDau
                                        ),

                                    gioKetThuc:
                                        normalizeTime(
                                            record
                                                ?.gioKetThuc
                                        ),

                                    soDonToiDa:
                                        record
                                            ?.soDonToiDa ??
                                        null,

                                    soPhutDatTruoc:
                                        record
                                            ?.soPhutDatTruoc ??
                                        soPhutDatTruoc,

                                    active:
                                        record?.active ===
                                        true
                                };
                            },

                            transformPayload(
                                formData
                            ) {
                                return {
                                    maKhungGio:
                                        String(
                                            formData
                                                .maKhungGio ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenKhungGio:
                                        String(
                                            formData
                                                .tenKhungGio ||
                                            ""
                                        )
                                            .trim(),

                                    coSoId:
                                        formData.coSoId ===
                                        ""
                                            ? null
                                            : Number(
                                                formData
                                                    .coSoId
                                            ),

                                    gioBatDau:
                                        normalizeTime(
                                            formData
                                                .gioBatDau
                                        ),

                                    gioKetThuc:
                                        normalizeTime(
                                            formData
                                                .gioKetThuc
                                        ),

                                    soDonToiDa:
                                        getNumberValue(
                                            "soDonToiDa"
                                        ),

                                    active:
                                        formData.active ===
                                        true
                                };
                            },

                            validate(
                                formData,
                                form,
                                catalogInstance
                            ) {
                                return validateForm(
                                    formData,
                                    catalogInstance
                                );
                            },

                            onRecordLoaded(
                                record,
                                mode
                            ) {
                                renderCoSo(
                                    record?.coSoId ??
                                    "",
                                    record?.tenCoSo
                                );

                                setSmartSelectDisabled(
                                    "coSoId",
                                    mode === "view"
                                );

                                setNumberValue(
                                    "soDonToiDa",
                                    record
                                        ?.soDonToiDa ??
                                    ""
                                );

                                setNumberValue(
                                    "soPhutDatTruoc",
                                    record
                                        ?.soPhutDatTruoc ??
                                    soPhutDatTruoc
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
                    "Không thể khởi tạo danh mục khung giờ nhận hàng.",
                    error
                );

                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải danh mục khung giờ nhận hàng."
                );
            }
        }

        function validateForm(
            formData,
            catalogInstance
        ) {
            const errors = {};

            const batDau =
                timeToSeconds(
                    formData.gioBatDau
                );

            const ketThuc =
                timeToSeconds(
                    formData.gioKetThuc
                );

            if (
                batDau !== null &&
                ketThuc !== null &&
                batDau >= ketThuc
            ) {
                errors.gioKetThuc =
                    "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
            }

            if (
                formData.soDonToiDa !==
                    null &&
                (
                    !Number.isInteger(
                        formData.soDonToiDa
                    ) ||
                    formData.soDonToiDa <= 0
                )
            ) {
                errors.soDonToiDa =
                    "Số đơn tối đa phải là số nguyên lớn hơn 0 hoặc để trống.";
            }

            const currentId =
                catalogInstance
                    ?.state
                    ?.selectedId;

            const records =
                catalogInstance
                    ?.state
                    ?.allData ||
                [];

            const sameCoSo =
                records.filter(
                    record =>
                        String(
                            record?.id
                        ) !==
                            String(
                                currentId
                            ) &&
                        Number(
                            record?.coSoId
                        ) ===
                            Number(
                                formData.coSoId
                            )
                );

            const normalizedCode =
                normalizeText(
                    formData.maKhungGio
                );

            const normalizedName =
                normalizeText(
                    formData.tenKhungGio
                );

            if (
                normalizedCode &&
                sameCoSo.some(
                    record =>
                        normalizeText(
                            record
                                ?.maKhungGio
                        ) ===
                        normalizedCode
                )
            ) {
                errors.maKhungGio =
                    "Mã khung giờ đã tồn tại trong cơ sở.";
            }

            if (
                normalizedName &&
                sameCoSo.some(
                    record =>
                        normalizeText(
                            record
                                ?.tenKhungGio
                        ) ===
                        normalizedName
                )
            ) {
                errors.tenKhungGio =
                    "Tên khung giờ đã tồn tại trong cơ sở.";
            }

            if (
                formData.active === true &&
                batDau !== null &&
                ketThuc !== null
            ) {
                const overlapping =
                    sameCoSo.some(
                        record => {
                            if (
                                record?.active !==
                                true
                            ) {
                                return false;
                            }

                            const otherStart =
                                timeToSeconds(
                                    record
                                        ?.gioBatDau
                                );

                            const otherEnd =
                                timeToSeconds(
                                    record
                                        ?.gioKetThuc
                                );

                            if (
                                otherStart ===
                                    null ||
                                otherEnd ===
                                    null
                            ) {
                                return false;
                            }

                            return (
                                batDau <
                                    otherEnd &&
                                ketThuc >
                                    otherStart
                            );
                        }
                    );

                if (overlapping) {
                    errors.gioKetThuc =
                        "Khung giờ đang giao với một khung giờ hoạt động khác trong cùng cơ sở.";
                }
            }

            return errors;
        }

        async function loadCoSo() {
            try {
                const result =
                    await window.MCS.api
                        .request(
                            "/api/mcs/v1/dm-co-so/tong-hop?active=true"
                        );

                dsCoSo =
                    Array.isArray(
                        result?.data
                    )
                        ? result.data
                            .filter(
                                item =>
                                    item.active ===
                                    true
                            )
                        : [];
            } catch (error) {
                console.error(
                    "Không thể tải danh sách cơ sở.",
                    error
                );

                dsCoSo = [];
            }
        }

        async function loadSoPhutDatTruoc() {
            try {
                const result =
                    await window.MCS.api
                        .request(
                            "/api/mcs/v1/thiet-lap/gia-tri?ma=SO_PHUT_DAT_HANG_TRUOC"
                        );

                const value =
                    Number(
                        result?.data?.giaTri
                    );

                if (
                    Number.isInteger(value) &&
                    value >= 0
                ) {
                    soPhutDatTruoc =
                        value;
                }
            } catch (error) {
                console.error(
                    "Không thể tải số phút đặt trước, sử dụng mặc định 20 phút.",
                    error
                );

                soPhutDatTruoc = 20;
            }
        }

        function renderCoSo(
            selectedValue = "",
            selectedLabel = ""
        ) {
            const select =
                document.getElementById(
                    "coSoId"
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

            const options = [
                ...dsCoSo
            ];

            if (
                selected &&
                !options.some(
                    item =>
                        String(
                            item.id
                        ) === selected
                )
            ) {
                options.push({
                    id:
                        selectedValue,
                    tenCoSo:
                        selectedLabel ||
                        `Cơ sở #${selectedValue}`
                });
            }

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

            options.forEach(
                item => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(item.id);

                    option.textContent =
                        item.tenCoSo;

                    option.selected =
                        String(item.id) ===
                        selected;

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

        function normalizeTime(value) {
            const text =
                String(value || "")
                    .trim();

            if (!text) {
                return "";
            }

            const match =
                text.match(
                    /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/
                );

            if (!match) {
                return text;
            }

            const hour =
                String(
                    Number(match[1])
                ).padStart(2, "0");

            const minute =
                String(
                    Number(match[2])
                ).padStart(2, "0");

            const second =
                String(
                    Number(match[3] || 0)
                ).padStart(2, "0");

            return `${hour}:${minute}:${second}`;
        }

        function formatTime(value) {
            return normalizeTime(value) ||
                "—";
        }

        function timeToSeconds(value) {
            const time =
                normalizeTime(value);

            if (
                !/^\d{2}:\d{2}:\d{2}$/
                    .test(time)
            ) {
                return null;
            }

            const [
                hour,
                minute,
                second
            ] = time
                .split(":")
                .map(Number);

            return (
                hour * 3600 +
                minute * 60 +
                second
            );
        }

        function normalizeText(value) {
            return String(value || "")
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .trim()
                .toLowerCase();
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
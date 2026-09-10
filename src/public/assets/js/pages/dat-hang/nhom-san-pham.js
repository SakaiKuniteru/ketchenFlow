"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "/api/mcs/v1/dm-nhom-san-pham";
    const FILE_NAME = "dm_nhom_san_pham.xlsx";
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    let catalog = null;
    let dsLoaiSanPham = [];

    initialize();

    async function initialize() {
        try {
            await loadLoaiSanPham();
            await initializeCatalog();

            bindFormEvents();
        } catch (error) {
            console.error(
                "Không thể khởi tạo danh mục nhóm sản phẩm.",
                error
            );

            window.MCS?.toast?.error(
                error?.message ||
                "Không thể tải danh mục nhóm sản phẩm."
            );
        }
    }

    async function initializeCatalog() {
        catalog = await window.MCS.pages.createCatalogPage({
            moduleName: "nhom-san-pham",

            permissionCodes: {
                view: "Q002021",
                create: "Q002022",
                update: "Q002023"
            },

            columns: [
                {
                    key: "maNhomSanPham",
                    label: "Mã nhóm sản phẩm",
                    width: "180px",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "tenNhomSanPham",
                    label: "Tên nhóm sản phẩm",
                    width: "240px",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "loaiSanPhamText",
                    label: "Loại sản phẩm",
                    width: "180px",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "moTa",
                    label: "Mô tả",
                    width: "300px",
                    sortable: true,
                    filterable: true
                },
                {
                    key: "thuTuHienThi",
                    label: "Thứ tự hiển thị",
                    width: "150px",
                    sortable: true,
                    filterable: true,
                    searchable: false,
                    type: "number",
                    className: "catalog-table__cell--right"
                },
                {
                    key: "active",
                    label: "Trạng thái",
                    width: "130px",
                    sortable: true,
                    filterable: true,
                    searchable: false,
                    className: "catalog-table__cell--center",
                    isBoolean: true,
                    trueLabel: "TRUE",
                    falseLabel: "FALSE"
                }
            ],

            defaultValues: {
                maNhomSanPham: "",
                tenNhomSanPham: "",
                loaiSanPham: "",
                moTa: "",
                thuTuHienThi: 0,
                active: true
            },

            validation: {
                maNhomSanPham: {
                    label: "Mã nhóm sản phẩm",
                    required: true,
                    maxLength: 50,
                    unique: true,
                    requiredMessage:
                        "Vui lòng nhập mã nhóm sản phẩm.",
                    maxLengthMessage:
                        "Mã nhóm sản phẩm không được vượt quá 50 ký tự.",
                    uniqueMessage:
                        "Mã nhóm sản phẩm đã tồn tại."
                },

                tenNhomSanPham: {
                    label: "Tên nhóm sản phẩm",
                    required: true,
                    maxLength: 150,
                    unique: true,
                    requiredMessage:
                        "Vui lòng nhập tên nhóm sản phẩm.",
                    maxLengthMessage:
                        "Tên nhóm sản phẩm không được vượt quá 150 ký tự.",
                    uniqueMessage:
                        "Tên nhóm sản phẩm đã tồn tại."
                },

                loaiSanPham: {
                    label: "Loại sản phẩm",
                    required: true,
                    requiredMessage:
                        "Vui lòng chọn loại sản phẩm."
                },

                moTa: {
                    label: "Mô tả",
                    maxLength: 500,
                    maxLengthMessage:
                        "Mô tả không được vượt quá 500 ký tự."
                }
            },

            detailTitle: "Thông tin nhóm sản phẩm",
            createTitle: "Thêm nhóm sản phẩm",
            updateTitle: "Cập nhật nhóm sản phẩm",

            getRecordSubtitle(record) {
                return record?.maNhomSanPham || "";
            },

            mapListResponse(result) {
                const danhSach = Array.isArray(result?.data)
                    ? result.data
                    : [];

                return danhSach.map(record => ({
                    ...record,
                    loaiSanPhamText:
                        getLoaiSanPhamLabel(record.loaiSanPham)
                }));
            },

            mapDetailResponse(result) {
                return result?.data || null;
            },

            mapRecordToForm(record) {
                return {
                    id: record?.id ?? "",
                    maNhomSanPham: record?.maNhomSanPham || "",
                    tenNhomSanPham: record?.tenNhomSanPham || "",
                    loaiSanPham: record?.loaiSanPham ?? "",
                    moTa: record?.moTa || "",
                    thuTuHienThi: record?.thuTuHienThi ?? 0,
                    active: record?.active === true
                };
            },

            transformPayload(formData) {
                return {
                    maNhomSanPham: String(
                        formData.maNhomSanPham || ""
                    )
                        .trim()
                        .toUpperCase(),

                    tenNhomSanPham: String(
                        formData.tenNhomSanPham || ""
                    ).trim(),

                    loaiSanPham:
                        formData.loaiSanPham === "" ||
                        formData.loaiSanPham === null ||
                        formData.loaiSanPham === undefined
                            ? null
                            : Number(formData.loaiSanPham),

                    moTa: String(
                        formData.moTa || ""
                    ).trim() || null,

                    thuTuHienThi:
                        parseThuTuHienThi(formData.thuTuHienThi),

                    active:
                        formData.active === true
                };
            },

            validate(formData) {
                const errors = {};

                const loaiHopLe = dsLoaiSanPham.some(
                    item =>
                        Number(item.value) ===
                        formData.loaiSanPham
                );

                if (
                    formData.loaiSanPham !== null &&
                    !loaiHopLe
                ) {
                    errors.loaiSanPham =
                        "Loại sản phẩm không hợp lệ.";
                }

                if (
                    !Number.isInteger(formData.thuTuHienThi) ||
                    formData.thuTuHienThi < 0 ||
                    formData.thuTuHienThi > 2147483647
                ) {
                    errors.thuTuHienThi =
                        "Thứ tự hiển thị phải là số nguyên từ 0 đến 2.147.483.647.";
                }

                return errors;
            },

            onRecordLoaded() {
                syncFormComponents();
            },

            toolbarActions: [
                {
                    action: "filter",
                    label: "Tìm kiếm chi tiết",
                    icon: "search"
                },
                {
                    action: "export-nhom-san-pham",
                    label: "Xuất danh mục nhóm sản phẩm",
                    icon: "download"
                },
                {
                    action: "import-nhom-san-pham",
                    label: "Nhập danh mục nhóm sản phẩm",
                    icon: "upload"
                }
            ],

            onAction(action, id, catalogInstance) {
                if (action === "export-nhom-san-pham") {
                    exportData();
                    return;
                }

                if (action === "import-nhom-san-pham") {
                    importData(catalogInstance);
                }
            }
        });
    }

    async function loadLoaiSanPham() {
        const result = await window.MCS.api.request(
            "/api/mcs/v1/enums?name=loaiSanPham"
        );

        dsLoaiSanPham = Array.isArray(result?.data)
            ? result.data
            : [];

        if (dsLoaiSanPham.length === 0) {
            throw new Error(
                "Chưa có dữ liệu loại sản phẩm."
            );
        }

        renderLoaiSanPham();
    }

    function renderLoaiSanPham(selectedValue = "") {
        const select = document.getElementById("loaiSanPham");

        if (!select) {
            return;
        }

        const selected = selectedValue === null ||
            selectedValue === undefined
                ? ""
                : String(selectedValue);

        select.replaceChildren();

        const emptyOption = document.createElement("option");

        emptyOption.value = "";
        emptyOption.textContent = "";

        select.appendChild(emptyOption);

        dsLoaiSanPham.forEach(item => {
            const option = document.createElement("option");

            option.value = String(item.value);
            option.textContent = item.name;

            select.appendChild(option);
        });

        select.value = selected;

        const root = select.closest("[data-smart-select]");
        const instance = window.MCS.smartSelect.initialize(root);

        instance?.refresh();
    }

    function getLoaiSanPhamLabel(value) {
        const item = dsLoaiSanPham.find(
            option =>
                Number(option.value) ===
                Number(value)
        );

        return item?.name || String(value ?? "—");
    }

    function parseThuTuHienThi(value) {
        const normalized = window.MCS.numberInput.normalizeValue(
            value
        );

        return normalized === ""
            ? 0
            : Number(normalized);
    }

    function syncFormComponents() {
        const form = document.getElementById("nhomSanPhamForm");

        if (!form) {
            return;
        }

        const select = form.querySelector("#loaiSanPham");
        const root = select?.closest("[data-smart-select]");

        if (root && select) {
            const instance =
                window.MCS.smartSelect.initialize(root);

            instance?.refresh();
            instance?.setDisabled(select.disabled);
        }

        window.MCS.numberInput.refresh(form);
    }

    function bindFormEvents() {
        const form = document.getElementById("nhomSanPhamForm");
        const resetButton = form?.querySelector("[data-form-reset]");

        // Form chung khôi phục dữ liệu trước, sau đó đồng bộ control.
        resetButton?.addEventListener("click", () => {
            window.setTimeout(syncFormComponents, 0);
        });
    }

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(
                `${API_BASE}/xuat-du-lieu`,
                {
                    method: "GET"
                }
            );

            window.MCS.api.downloadBlob(
                result.blob,
                result.fileName || FILE_NAME
            );

            window.MCS?.toast?.success(
                "Xuất dữ liệu nhóm sản phẩm thành công."
            );
        } catch (error) {
            console.error(
                "Xuất dữ liệu nhóm sản phẩm thất bại.",
                error
            );

            window.MCS?.toast?.error(
                error?.message ||
                "Xuất dữ liệu thất bại."
            );
        }
    }

    function importData(catalogInstance) {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = ".xlsx";
        input.hidden = true;

        document.body.appendChild(input);

        input.addEventListener(
            "cancel",
            () => input.remove(),
            {
                once: true
            }
        );

        input.addEventListener(
            "change",
            async () => {
                const file = input.files?.[0];

                if (!file) {
                    input.remove();
                    return;
                }

                try {
                    if (file.size > MAX_FILE_SIZE) {
                        throw new Error(
                            "File import không được vượt quá 10 MB."
                        );
                    }

                    const body = new FormData();

                    body.append("file", file);

                    const result =
                        await window.MCS.api.requestFile(
                            `${API_BASE}/import-du-lieu`,
                            {
                                method: "POST",
                                body
                            }
                        );

                    window.MCS.api.downloadBlob(
                        result.blob,
                        result.fileName || FILE_NAME
                    );

                    if (catalogInstance?.load) {
                        await catalogInstance.load();
                    }

                    window.MCS?.toast?.success(
                        "Đã xử lý import. Vui lòng kiểm tra file kết quả."
                    );
                } catch (error) {
                    console.error(
                        "Import nhóm sản phẩm thất bại.",
                        error
                    );

                    window.MCS?.toast?.error(
                        error?.message ||
                        "Import dữ liệu thất bại."
                    );
                } finally {
                    input.remove();
                }
            },
            {
                once: true
            }
        );

        input.click();
    }
});
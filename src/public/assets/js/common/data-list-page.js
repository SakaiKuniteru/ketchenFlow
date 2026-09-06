"use strict";

window.MCS = window.MCS || {};
window.MCS.pages = window.MCS.pages || {};

window.MCS.pages.createDataListPage = async function createDataListPage(options = {}) {
    const {
        moduleName,
        permission = null,
        canView = null,
        canCreate = null,
        pageSize = 12,
        searchKeys = [],
        getRowUrl = null,
        onCreate = null,
        onExport = null,
        formatCell = null,
        getSummary = null,
        mapListResponse = response => normalizeList(response?.data)
    } = options;

    const root = document.querySelector(
        `[data-data-list-page][data-module="${moduleName}"]`
    );

    if (!root) {
        return null;
    }

    const state = {
        permissions: new Set(),
        allData: [],
        visibleData: [],
        page: 1,
        pageSize,
        keyword: "",
        sort: {
            key: null,
            direction: "none"
        }
    };

    const el = {
        body: root.querySelector("[data-list-body]"),
        paginationRoot: root.querySelector("[data-catalog-pagination]"),
        filterPanel: root.querySelector("[data-list-filter-panel]"),
        filterApply: root.querySelector("[data-list-filter-apply]"),
        filterReset: root.querySelector("[data-list-filter-reset]"),
        search: root.querySelector("[data-list-search], .search-picker--data-list input, input[type='search']")
    };

    let pagination = null;

    state.permissions = permission?.load
        ? await permission.load()
        : new Set();

    if (
        typeof canView === "function" &&
        !canView(state.permissions)
    ) {
        root.innerHTML = `
            <div class="data-list-no-permission">
                <h2>Không đủ quyền truy cập</h2>
                <p>Bạn không có quyền xem danh sách này.</p>
            </div>
        `;
        return null;
    }

    bindActions();
    bindSearch();
    bindFilter();
    bindSort();
    initializePagination();
    await loadFilterOptions();
    await loadData();

    async function loadData() {
        setLoading(true);

        try {
            const endpoint = buildListEndpoint();
            const response = await window.MCS.api.request(endpoint);

            state.allData = mapListResponse(response) || [];
            state.page = 1;
            applySearch();
            renderSummary();
        } catch (error) {
            console.error(error);
            window.MCS.toast?.error(
                error?.message || "Không thể tải danh sách."
            );
            state.allData = [];
            state.visibleData = [];
            render();
        } finally {
            setLoading(false);
        }
    }

    function buildListEndpoint() {
        const base = root.dataset.listEndpoint || "";
        const params = new URLSearchParams();

        root.querySelectorAll("[data-list-filter-field]").forEach(field => {
            const name = field.dataset.filterName;
            const input = getFilterControl(field);
            const value = String(input?.value || "").trim();

            if (name && value) {
                params.set(name, value);
            }
        });

        const query = params.toString();
        return query ? `${base}?${query}` : base;
    }

    function bindActions() {
        const createButton = root.querySelector('[data-list-action="create"]');
        const exportButton = root.querySelector('[data-list-action="export"]');
        const filterButton = root.querySelector('[data-list-action="filter"]');

        if (createButton) {
            const allowed =
                typeof canCreate !== "function" ||
                canCreate(state.permissions);

            createButton.hidden = !allowed;
            createButton.addEventListener("click", () => {
                if (allowed) {
                    onCreate?.();
                }
            });
        }

        if (exportButton) {
            exportButton.hidden = typeof onExport !== "function";
            exportButton.addEventListener("click", () => {
                onExport?.(state.visibleData, state.allData);
            });
        }

        filterButton?.addEventListener("click", () => {
            if (!el.filterPanel) {
                return;
            }

            el.filterPanel.hidden = !el.filterPanel.hidden;
        });
    }

    function bindSearch() {
        const input =
            document.getElementById(options.searchId || "") ||
            root.querySelector(".search-picker--data-list input") ||
            el.search;

        if (!input) {
            return;
        }

        input.addEventListener("input", () => {
            state.keyword = normalizeText(input.value);
            state.page = 1;
            applySearch();
        });
    }

    function bindFilter() {
        el.filterApply?.addEventListener("click", async () => {
            if (el.filterPanel) {
                el.filterPanel.hidden = true;
            }

            await loadData();
        });

        el.filterReset?.addEventListener("click", async () => {
            root.querySelectorAll("[data-list-filter-field]").forEach(field => {
                field
                    .querySelectorAll("input, select, textarea")
                    .forEach(input => {
                        input.value = "";
                    });

                const input = getFilterControl(field);

                input?.dispatchEvent(
                    new Event("change", { bubbles: true })
                );

                const smartRoot = field.querySelector("[data-smart-select]");
                smartRoot?.smartSelect?.setValue?.("", false);
                smartRoot?.smartSelect?.refresh?.();

                const dateRoot = field.querySelector(
                    "[data-date-picker]"
                );

                if (
                    dateRoot?.dataset?.defaultToday ===
                    "true"
                ) {
                    const value = getTodayDateTime(
                        dateRoot.dataset.defaultTime ||
                        "00:00:00"
                    );

                    dateRoot?.datePicker?.setValue?.(
                        value,
                        false
                    );
                } else {
                    dateRoot?.datePicker?.setValue?.(
                        "",
                        false
                    );
                }
            });

            await loadData();
        });
    }

    function bindSort() {
        root
            .querySelectorAll("[data-list-sort]")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const key = button.dataset.listSort;

                        if (state.sort.key !== key) {
                            state.sort = {
                                key,
                                direction: "asc"
                            };
                        } else {
                            const next = {
                                none: "asc",
                                asc: "desc",
                                desc: "none"
                            };

                            state.sort.direction =
                                next[state.sort.direction];

                            if (
                                state.sort.direction ===
                                "none"
                            ) {
                                state.sort.key = null;
                            }
                        }

                        state.page = 1;

                        updateSortIcons();
                        applySearch();
                    }
                );
            });
    }

    function updateSortIcons() {
        root
            .querySelectorAll("[data-list-sort]")
            .forEach(button => {
                const icon = button.querySelector(
                    "[data-sort-icon]"
                );

                if (!icon) {
                    return;
                }

                const key = button.dataset.listSort;

                icon.dataset.sortDirection =
                    key === state.sort.key
                        ? state.sort.direction
                        : "none";
            });
    }

    function applySort(records) {
        const {
            key,
            direction
        } = state.sort;

        if (
            !key ||
            direction === "none"
        ) {
            return records;
        }

        const column = root.querySelector(
            `[data-list-column][data-column-key="${key}"]`
        );

        const type =
            column?.dataset?.columnType ||
            "text";

        return [
            ...records
        ].sort(
            (
                first,
                second
            ) => {
                const a = resolveValue(
                    first,
                    key
                );

                const b = resolveValue(
                    second,
                    key
                );

                let result;

                if (
                    type ===
                    "money"
                ) {
                    result =
                        Number(a || 0) -
                        Number(b || 0);
                } else if (
                    type === "date" ||
                    type === "datetime"
                ) {
                    result =
                        new Date(a).getTime() -
                        new Date(b).getTime();
                } else {
                    result = String(
                        a ??
                        ""
                    ).localeCompare(
                        String(
                            b ??
                            ""
                        ),
                        "vi",
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                }

                return direction === "asc"
                    ? result
                    : -result;
            }
        );
    }

    function getFilterControl(field) {
        if (!field) {
            return null;
        }

        if (field.dataset.filterType === "date") {
            return (
                field.querySelector("[data-date-value]") ||
                field.querySelector('input[type="date"]') ||
                field.querySelector("input")
            );
        }

        return (
            field.querySelector("select") ||
            field.querySelector("input") ||
            field.querySelector("textarea")
        );
    }

    function getTodayDateTime(time) {
        const now = new Date();

        const pad =
            value =>
                String(value).padStart(
                    2,
                    "0"
                );

        return (
            `${now.getFullYear()}-` +
            `${pad(now.getMonth() + 1)}-` +
            `${pad(now.getDate())}T` +
            time
        );
    }

    async function loadFilterOptions() {
        const fields = Array.from(
            root.querySelectorAll('[data-list-filter-field][data-filter-type="select"]')
        );

        await Promise.all(fields.map(async field => {
            const source = String(field.dataset.filterSource || "").trim();

            if (!source) {
                return;
            }

            try {
                const response = await window.MCS.api.request(source);
                const items = normalizeList(response?.data);
                const select = field.querySelector("select");

                fillSelect(
                    select,
                    items,
                    field.dataset.filterValueKey || "id",
                    field.dataset.filterLabelKey || "name"
                );
            } catch (error) {
                console.warn(`Không tải được dữ liệu bộ lọc ${field.dataset.filterName}.`, error);
            }
        }));
    }

    function applySearch() {
        let records = [
            ...state.allData
        ];

        if (state.keyword) {
            records = records.filter(
                record => {
                    const text = searchKeys
                        .map(
                            key =>
                                resolveValue(
                                    record,
                                    key
                                )
                        )
                        .filter(
                            value =>
                                value !== null &&
                                value !== undefined
                        )
                        .join(" ");

                    return normalizeText(
                        text
                    ).includes(
                        state.keyword
                    );
                }
            );
        }

        state.visibleData = applySort(records);

        render();
    }

    function render() {
        const total = state.visibleData.length;
        const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
        state.page = Math.min(state.page, totalPages);

        const startIndex = (state.page - 1) * state.pageSize;
        const rows = state.visibleData.slice(
            startIndex,
            startIndex + state.pageSize
        );

        syncPagination();
        renderRows(rows, startIndex);

        const from = total ? startIndex + 1 : 0;
        const to = total ? Math.min(startIndex + rows.length, total) : 0;

        if (el.range) {
            el.range.textContent = `Hiển thị ${from}–${to} trong ${total} bản ghi`;
        }
    }

    function renderRows(rows, startIndex) {
        if (!el.body) {
            return;
        }

        el.body.innerHTML = "";

        const columns = Array.from(
            root.querySelectorAll("[data-list-column]")
        ).map(column => ({
            key: column.dataset.columnKey,
            type: column.dataset.columnType || "text"
        }));

        if (!rows.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");

            td.className = "data-list-table__empty";
            td.colSpan = columns.length + (root.querySelector(".data-list-table__index") ? 1 : 0);
            td.textContent = "Không có dữ liệu.";

            tr.appendChild(td);
            el.body.appendChild(tr);
            return;
        }

        rows.forEach((record, rowIndex) => {
            const tr = document.createElement("tr");
            tr.dataset.recordId = record?.id ?? "";

            if (root.querySelector(".data-list-table__index")) {
                const indexCell = document.createElement("td");

                indexCell.textContent = String(startIndex + rowIndex + 1);
                indexCell.className = "data-list-table__index";

                tr.appendChild(indexCell);
            }

            columns.forEach(column => {
                const td = document.createElement("td");
                const value = resolveValue(record, column.key);

                const rendered = formatCell
                    ? formatCell(column, value, record)
                    : defaultFormat(column.type, value);

                if (
                    rendered &&
                    typeof rendered === "object" &&
                    rendered.html !== undefined
                ) {
                    td.innerHTML = rendered.html;
                } else {
                    td.textContent = rendered ?? "-";
                }

                tr.appendChild(td);
            });

            if (typeof getRowUrl === "function") {
                tr.classList.add("is-clickable");

                tr.addEventListener("click", event => {
                    if (event.target.closest("button, a, input, select, textarea")) {
                        return;
                    }

                    const url = getRowUrl(record);

                    if (url) {
                        window.location.href = url;
                    }
                });
            }

            el.body.appendChild(tr);
        });
    }

    function renderSummary() {
        if (typeof getSummary !== "function") {
            return;
        }

        const summary = getSummary(state.allData) || {};

        root.querySelectorAll("[data-summary-key]").forEach(card => {
            const key = card.dataset.summaryKey;
            const value = summary[key] ?? 0;
            const target = card.querySelector("[data-summary-value]");

            if (target) {
                target.textContent = Number(value).toLocaleString("vi-VN");
            }
        });
    }

    function initializePagination() {
        if (
            !el.paginationRoot ||
            !window.MCS?.catalog?.Pagination
        ) {
            return;
        }

        pagination = new window.MCS.catalog.Pagination(
            el.paginationRoot,
            {
                page: state.page,
                pageSize: state.pageSize,
                total: 0,

                onChange:
                    paginationState => {
                        state.page = paginationState.page;
                        state.pageSize = paginationState.pageSize;
                        render();
                    }
            }
        );
    }

    function syncPagination() {
        if (!pagination) {
            return;
        }

        pagination.setData({
            page: state.page,
            pageSize: state.pageSize,
            total: state.visibleData.length
        });
    }

    function setLoading(value) {
        root.classList.toggle("is-loading", Boolean(value));
    }

    return {
        state,
        reload: loadData,
        render
    };
};

function normalizeList(data) {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.items || data?.rows || data?.data || data?.danhSach || [];
}

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

function resolveValue(record, path) {
    return String(path || "")
        .split(".")
        .reduce(
            (value, key) => value?.[key],
            record
        );
}

function fillSelect(select, items, valueKey, labelKey) {
    if (!select) {
        return;
    }

    const placeholder = select.options?.[0]?.textContent || "Chọn...";
    select.innerHTML = "";

    const empty = document.createElement("option");

    empty.value = "";
    empty.textContent = placeholder;

    select.appendChild(empty);

    items.forEach(item => {
        const value = resolveValue(item, valueKey);

        const label =
            resolveValue(item, labelKey) ??
            item?.label ??
            item?.name ??
            item?.ten ??
            item?.hoTen ??
            item?.tenNhanVien ??
            value;

        if (value === undefined || value === null) {
            return;
        }

        const option = document.createElement("option");

        option.value = String(value);
        option.textContent = String(label ?? value);

        select.appendChild(option);
    });

    const smartRoot = select.closest("[data-smart-select]");

    const smartSelect =
        smartRoot?.smartSelect ||
        (smartRoot && window.MCS.smartSelect?.initialize?.(smartRoot));

    smartSelect?.refresh?.();
}

function defaultFormat(type, value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (type === "money") {
        const number = Number(value);

        return Number.isFinite(number)
            ? `${number.toLocaleString("vi-VN", { maximumFractionDigits: 5 })} đ`
            : "-";
    }

    if (type === "date") {
        return formatDate(value);
    }

    if (type === "datetime") {
        return formatDateTime(value);
    }

    return String(value);
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const text = String(value).slice(0, 10);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
}

function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const pad = number => String(number).padStart(2, "0");

    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
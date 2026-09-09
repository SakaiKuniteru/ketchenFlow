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
        selectable = false,
        isRowSelectable = null,
        getSelectionGroupKey = null,
        isRowClickable = null,
        getRowUrl = null,
        renderRowActions = null,
        onRowClick = null,
        onSelectionChange = null,
        onCreate = null,
        onExport = null,
        formatCell = null,
        getSummary = null,
        defaultFilters = {},
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
        selectedIds: new Set(),
        selectionGroupKey: null,
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
        selectAll: root.querySelector("[data-list-select-all] input[type='checkbox']") || root.querySelector("input[data-list-select-all]"),
        rowCheckboxTemplate: root.querySelector("[data-list-row-checkbox-template]"),
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
        window.MCS
                ?.noPermission
                ?.show(root);
            return null;

        }

        window.MCS
            ?.noPermission
            ?.hide(root);

    bindActions();
    bindSearch();
    bindFilter();
    bindSort();
    bindSelection();
    initializePagination();
    await loadFilterOptions();
    applyDefaultFilters();
    await loadData();

    async function loadData() {
        setLoading(true);

        try {
            const endpoint = buildListEndpoint();
            const response = await window.MCS.api.request(endpoint);

            state.allData = mapListResponse(response) || [];
            state.selectedIds.clear();
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

        const base =
            root.dataset
                .listEndpoint ||
            "";


        const params =
            new URLSearchParams();


        root
            .querySelectorAll(
                "[data-list-filter-field]"
            )
            .forEach(
                field => {

                    const name =
                        field.dataset
                            .filterName;


                    if (
                        !name
                    ) {
                        return;
                    }


                    const values =
                        getFilterValues(
                            field
                        );


                    values.forEach(
                        value => {

                            params.append(
                                name,
                                value
                            );

                        }
                    );

                }
            );


        const query =
            params.toString();


        return query
            ? `${base}?${query}`
            : base;

    }

    function getFilterValues(
        field
    ) {

        if (
            !field
        ) {
            return [];
        }


        const input =
            getFilterControl(
                field
            );


        if (
            !input
        ) {
            return [];
        }


        if (
            input.tagName ===
                "SELECT" &&
            input.multiple
        ) {

            const options =
                Array.from(
                    input.options ||
                    []
                );


            const allOption =
                options.find(
                    option =>
                        option.value ===
                        "__ALL__"
                );


            if (
                allOption
                    ?.selected
            ) {
                return [];
            }


            return options
                .filter(
                    option =>
                        option.selected &&
                        option.value &&
                        option.value !==
                            "__ALL__"
                )
                .map(
                    option =>
                        String(
                            option.value
                        )
                );

        }


        const value =
            String(
                input.value ||
                ""
            )
                .trim();


        return value
            ? [
                value
            ]
            : [];

    }

    function bindActions() {
        const createButton =
            root.querySelector(
                '[data-list-action="create"]'
            );

        const exportButton =
            root.querySelector(
                '[data-list-action="export"]'
            );

        const filterButton =
            root.querySelector(
                '[data-list-action="filter"]'
            );

        if (createButton) {
            const allowed =
                typeof canCreate !== "function" ||
                canCreate(
                    state.permissions
                );

            createButton.hidden =
                !allowed;

            createButton.addEventListener(
                "click",
                () => {
                    if (allowed) {
                        onCreate?.();
                    }
                }
            );
        }

        if (exportButton) {
            exportButton.hidden =
                typeof onExport !==
                "function";

            exportButton.addEventListener(
                "click",
                () => {
                    onExport?.(
                        state.visibleData,
                        state.allData
                    );
                }
            );
        }

        filterButton?.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                if (
                    !el.filterPanel
                ) {
                    return;
                }

                el.filterPanel.hidden =
                    !el.filterPanel.hidden;
            }
        );

        document.addEventListener(
            "pointerdown",
            event => {
                if (
                    !el.filterPanel ||
                    el.filterPanel.hidden
                ) {
                    return;
                }

                const target =
                    event.target;

                if (
                    el.filterPanel.contains(
                        target
                    ) ||
                    filterButton?.contains(
                        target
                    )
                ) {
                    return;
                }

                el.filterPanel.hidden =
                    true;
            }
        );
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

                const smartRoot =
                    field.querySelector(
                        "[data-smart-select]"
                    );


                const smartSelect =
                    smartRoot?.smartSelect ||
                    (
                        smartRoot &&
                        window.MCS
                            ?.smartSelect
                            ?.initialize?.(
                                smartRoot
                            )
                    );


                if (
                    input?.tagName ===
                        "SELECT" &&
                    input.multiple
                ) {

                    if (
                        field.dataset
                            .filterAllowAll ===
                        "true"
                    ) {

                        smartSelect
                            ?.setAll?.(
                                true,
                                false
                            );

                    } else {

                        smartSelect
                            ?.clear?.(
                                false
                            );

                    }

                } else {

                    smartSelect
                        ?.setValue?.(
                            "",
                            false
                        );

                }


                smartSelect
                    ?.refresh?.();

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
            applyDefaultFilters();
            await loadData();
        });
    }

    function getRecordId(
        record
    ) {

        const id =
            record?.id;

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {
            return "";
        }

        return String(
            id
        );

    }

    function getRecordById(
        id
    ) {

        const normalizedId =
            String(
                id ||
                ""
            );


        return state.allData
            .find(
                record =>
                    getRecordId(
                        record
                    ) ===
                    normalizedId
            ) ||
            null;

    }

    function getSelectedRecords() {

        return state.visibleData
            .filter(
                record =>
                    state.selectedIds
                        .has(
                            getRecordId(
                                record
                            )
                        )
            );

    }

    function clearSelection() {

        state.selectedIds
            .clear();

        state.selectionGroupKey =
            null;

        syncSelection();

    }

    function syncSelection() {

        if (
            !selectable
        ) {
            return;
        }


        const selectedRecords =
            getSelectedRecords();


        if (
            selectedRecords.length >
            0 &&
            typeof getSelectionGroupKey ===
                "function"
        ) {

            state.selectionGroupKey =
                String(
                    getSelectionGroupKey(
                        selectedRecords[0]
                    )
                );

        } else if (
            selectedRecords.length ===
            0
        ) {

            state.selectionGroupKey =
                null;

        }


        const checkboxes =
            Array.from(
                root.querySelectorAll(
                    "[data-list-row-select]"
                )
            );


        checkboxes.forEach(
            checkbox => {

                const id =
                    String(
                        checkbox.dataset
                            .recordId ||
                        ""
                    );


                const record =
                    getRecordById(
                        id
                    );


                if (
                    !record
                ) {
                    return;
                }


                const selected =
                    state.selectedIds
                        .has(
                            id
                        );


                let allowed =
                    typeof isRowSelectable !==
                        "function" ||
                    isRowSelectable(
                        record,
                        state.permissions,
                        state
                    );


                if (
                    allowed &&
                    state.selectionGroupKey !==
                        null &&
                    typeof getSelectionGroupKey ===
                        "function"
                ) {

                    const recordGroupKey =
                        String(
                            getSelectionGroupKey(
                                record
                            )
                        );


                    allowed =
                        recordGroupKey ===
                        state.selectionGroupKey;

                }


                checkbox.checked =
                    selected;

                checkbox.disabled =
                    !allowed;


                checkbox
                    .closest(
                        "tr"
                    )
                    ?.classList
                    .toggle(
                        "is-selected",
                        selected
                    );

            }
        );


        const enabled =
            checkboxes.filter(
                checkbox =>
                    !checkbox.disabled
            );


        const selectedCount =
            enabled.filter(
                checkbox =>
                    checkbox.checked
            ).length;


        if (
            el.selectAll
        ) {

            el.selectAll.checked =
                enabled.length >
                    0 &&
                selectedCount ===
                    enabled.length;

            el.selectAll.indeterminate =
                selectedCount >
                    0 &&
                selectedCount <
                    enabled.length;

            el.selectAll.disabled =
                enabled.length ===
                    0;

        }


        if (
            typeof onSelectionChange ===
            "function"
        ) {

            onSelectionChange(
                selectedRecords,
                state
            );

        }

    }

    function bindSelection() {

        if (
            !selectable
        ) {
            return;
        }


        el.selectAll
            ?.addEventListener(
                "change",
                () => {

                    const checked =
                        el.selectAll
                            .checked;


                    if (
                        !checked
                    ) {

                        state.selectedIds
                            .clear();

                        state.selectionGroupKey =
                            null;

                        syncSelection();

                        return;

                    }


                    const checkboxes =
                        Array.from(
                            root.querySelectorAll(
                                "[data-list-row-select]"
                            )
                        );


                    let groupKey =
                        state.selectionGroupKey;


                    /*
                    * Chưa chọn dòng nào.
                    * Lấy trạng thái của checkbox hợp lệ đầu tiên
                    * làm nhóm selection.
                    */
                    if (
                        groupKey ===
                            null &&
                        typeof getSelectionGroupKey ===
                            "function"
                    ) {

                        const first =
                            checkboxes.find(
                                checkbox =>
                                    !checkbox.disabled
                            );


                        const record =
                            first
                                ? getRecordById(
                                    first.dataset
                                        .recordId
                                )
                                : null;


                        if (
                            record
                        ) {

                            groupKey =
                                String(
                                    getSelectionGroupKey(
                                        record
                                    )
                                );

                            state.selectionGroupKey =
                                groupKey;

                        }

                    }


                    checkboxes.forEach(
                        checkbox => {

                            const id =
                                String(
                                    checkbox.dataset
                                        .recordId ||
                                    ""
                                );


                            const record =
                                getRecordById(
                                    id
                                );


                            if (
                                !record
                            ) {
                                return;
                            }


                            let allowed =
                                typeof isRowSelectable !==
                                    "function" ||
                                isRowSelectable(
                                    record,
                                    state.permissions,
                                    state
                                );


                            if (
                                allowed &&
                                groupKey !==
                                    null &&
                                typeof getSelectionGroupKey ===
                                    "function"
                            ) {

                                allowed =
                                    String(
                                        getSelectionGroupKey(
                                            record
                                        )
                                    ) ===
                                    groupKey;

                            }


                            if (
                                allowed
                            ) {

                                state.selectedIds
                                    .add(
                                        id
                                    );

                            }

                        }
                    );


                    syncSelection();

                }
            );


        el.body
            ?.addEventListener(
                "change",
                event => {

                    const checkbox =
                        event.target
                            .closest?.(
                                "[data-list-row-select]"
                            );


                    if (
                        !checkbox ||
                        checkbox.disabled
                    ) {
                        return;
                    }


                    const id =
                        String(
                            checkbox.dataset
                                .recordId ||
                            ""
                        );


                    const record =
                        getRecordById(
                            id
                        );


                    if (
                        !id ||
                        !record
                    ) {
                        return;
                    }


                    if (
                        checkbox.checked
                    ) {

                        if (
                            state.selectionGroupKey ===
                                null &&
                            typeof getSelectionGroupKey ===
                                "function"
                        ) {

                            state.selectionGroupKey =
                                String(
                                    getSelectionGroupKey(
                                        record
                                    )
                                );

                        }


                        state.selectedIds
                            .add(
                                id
                            );

                    } else {

                        state.selectedIds
                            .delete(
                                id
                            );


                        if (
                            state.selectedIds
                                .size ===
                            0
                        ) {

                            state.selectionGroupKey =
                                null;

                        }

                    }


                    syncSelection();

                }
            );

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
        const fields =
            Array.from(
                root.querySelectorAll(
                    '[data-list-filter-field][data-filter-type="select"]'
                )
            );

        await Promise.all(
            fields.map(
                async field => {
                    const source =
                        String(
                            field.dataset
                                .filterSource ||
                            ""
                        ).trim();

                    if (!source) {
                        return;
                    }

                    try {
                        const response =
                            await window.MCS
                                .api
                                .request(
                                    source
                                );

                        let items =
                            normalizeList(
                                response?.data
                            );

                        if (
                            isActiveOnlySource(
                                source
                            )
                        ) {
                            items =
                                items.filter(
                                    isActiveItem
                                );
                        }

                        const select =
                            field.querySelector(
                                "select"
                            );

                        fillSelect(
                            select,
                            items,
                            field.dataset
                                .filterValueKey ||
                                "id",
                            field.dataset
                                .filterLabelKey ||
                                "name",
                            field.dataset
                                .filterAllowAll ===
                                "true"
                        );

                        bindFilterSelectOverlay(
                            field
                        );
                    } catch (error) {
                        console.warn(
                            `Không tải được dữ liệu bộ lọc ${field.dataset.filterName}.`,
                            error
                        );
                    }
                }
            )
        );
    }

    function isActiveOnlySource(
        source
    ) {
        try {
            const url =
                new URL(
                    source,
                    window.location.origin
                );

            return (
                url.searchParams
                    .get(
                        "active"
                    ) ===
                "true"
            );
        } catch {
            return false;
        }
    }

    function isActiveItem(
        item
    ) {
        if (
            item?.active ===
                undefined ||
            item?.active ===
                null
        ) {
            return true;
        }

        return (
            item.active === true ||
            item.active === 1 ||
            item.active === "1" ||
            String(
                item.active
            ).toLowerCase() ===
                "true"
        );
    }

    function bindFilterSelectOverlay(
        field
    ) {
        const smartRoot =
            field.querySelector(
                "[data-smart-select]"
            );

        if (
            !smartRoot ||
            smartRoot.dataset
                .filterOverlayBound ===
                "true"
        ) {
            return;
        }

        const control =
            smartRoot.querySelector(
                ".smart-select__control"
            );

        const dropdown =
            smartRoot.querySelector(
                ".smart-select__dropdown"
            );

        if (
            !control ||
            !dropdown
        ) {
            return;
        }

        smartRoot.dataset
            .filterOverlayBound =
            "true";

        const updatePosition =
            () => {
                if (
                    !smartRoot.classList
                        .contains(
                            "is-open"
                        )
                ) {
                    return;
                }

                const rect =
                    control.getBoundingClientRect();

                const top =
                    rect.bottom +
                    6;

                const maxHeight =
                    Math.max(
                        120,
                        window.innerHeight -
                        top -
                        12
                    );

                dropdown.style.setProperty(
                    "position",
                    "fixed",
                    "important"
                );

                dropdown.style.setProperty(
                    "top",
                    `${top}px`,
                    "important"
                );

                dropdown.style.setProperty(
                    "bottom",
                    "auto",
                    "important"
                );

                dropdown.style.setProperty(
                    "left",
                    `${rect.left}px`,
                    "important"
                );

                dropdown.style.setProperty(
                    "width",
                    `${rect.width}px`,
                    "important"
                );

                dropdown.style.setProperty(
                    "max-height",
                    `${maxHeight}px`,
                    "important"
                );

                dropdown.style.setProperty(
                    "overflow-y",
                    "auto",
                    "important"
                );

                dropdown.style.setProperty(
                    "z-index",
                    "10000",
                    "important"
                );
            };

        const schedulePosition =
            () => {
                window.requestAnimationFrame(
                    () => {
                        window.requestAnimationFrame(
                            updatePosition
                        );
                    }
                );
            };

        const observer =
            new MutationObserver(
                () => {
                    if (
                        smartRoot.classList
                            .contains(
                                "is-open"
                            )
                    ) {
                        schedulePosition();
                    }
                }
            );

        observer.observe(
            smartRoot,
            {
                attributes:
                    true,

                attributeFilter:
                    [
                        "class"
                    ]
            }
        );

        smartRoot.addEventListener(
            "pointerdown",
            schedulePosition
        );

        el.filterPanel
            ?.querySelector(
                ".data-list-filter__body"
            )
            ?.addEventListener(
                "scroll",
                () => {
                    if (
                        smartRoot.classList
                            .contains(
                                "is-open"
                            )
                    ) {
                        schedulePosition();
                    }
                },
                {
                    passive:
                        true
                }
            );

        window.addEventListener(
            "resize",
            () => {
                if (
                    smartRoot.classList
                        .contains(
                            "is-open"
                        )
                ) {
                    schedulePosition();
                }
            },
            {
                passive:
                    true
            }
        );
    }

    function applyDefaultFilters() {

        Object
            .entries(
                defaultFilters ||
                {}
            )
            .forEach(
                (
                    [
                        name,
                        rawValues
                    ]
                ) => {

                    const field =
                        Array
                            .from(
                                root.querySelectorAll(
                                    "[data-list-filter-field]"
                                )
                            )
                            .find(
                                item =>
                                    item.dataset
                                        .filterName ===
                                    name
                            );


                    if (
                        !field
                    ) {
                        return;
                    }


                    const select =
                        field.querySelector(
                            "select"
                        );


                    if (
                        !select
                    ) {
                        return;
                    }


                    const values =
                        (
                            Array.isArray(
                                rawValues
                            )
                                ? rawValues
                                : [
                                    rawValues
                                ]
                        )
                            .filter(
                                value =>
                                    value !==
                                        null &&
                                    value !==
                                        undefined &&
                                    value !==
                                        ""
                            )
                            .map(
                                value =>
                                    String(
                                        value
                                    )
                            );


                    const smartRoot =
                        select.closest(
                            "[data-smart-select]"
                        );


                    const smartSelect =
                        smartRoot?.smartSelect ||
                        (
                            smartRoot &&
                            window.MCS
                                ?.smartSelect
                                ?.initialize?.(
                                    smartRoot
                                )
                        );


                    if (
                        select.multiple
                    ) {

                        smartSelect
                            ?.setValues?.(
                                values,
                                false
                            );

                    } else {

                        smartSelect
                            ?.setValue?.(
                                values[0] ||
                                "",
                                false
                            );

                    }

                }
            );

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

    function createRowCheckbox(
        record,
        allowed
    ) {

        if (
            !el.rowCheckboxTemplate
        ) {
            return null;
        }


        const fragment =
            el.rowCheckboxTemplate
                .content
                .cloneNode(
                    true
                );


        const wrapper =
            fragment.querySelector(
                ".data-list-selection-control"
            );


        const checkbox =
            fragment.querySelector(
                "input[type='checkbox']"
            );


        if (
            !wrapper ||
            !checkbox
        ) {
            return null;
        }


        const recordId =
            getRecordId(
                record
            );


        const inputId =
            `dataListRowCheckbox_${recordId}`;


        checkbox.id =
            inputId;

        checkbox.name =
            "dataListSelectedIds";

        checkbox.value =
            recordId;

        checkbox.dataset
            .listRowSelect =
            "";

        checkbox.dataset
            .recordId =
            recordId;

        checkbox.checked =
            state.selectedIds
                .has(
                    recordId
                );

        checkbox.disabled =
            !allowed;


        checkbox.setAttribute(
            "aria-label",
            `Chọn vé ${
                record?.maVe ||
                recordId
            }`
        );


        wrapper
            .querySelector(
                "label[for]"
            )
            ?.setAttribute(
                "for",
                inputId
            );


        return wrapper;

    }

    function renderRows(
        rows,
        startIndex
    ) {

        if (
            !el.body
        ) {
            return;
        }


        el.body.innerHTML =
            "";

        const columns =
            Array.from(
                root.querySelectorAll(
                    "[data-list-column]"
                )
            )
                .map(
                    column => ({
                        key:
                            column.dataset
                                .columnKey,

                        type:
                            column.dataset
                                .columnType ||
                            "text",

                        width:
                            column.style
                                .width ||
                            ""
                    })
                );
        const hasIndex =
            Boolean(
                root.querySelector(
                    ".data-list-table__index"
                )
            );


        const hasActions =
            Boolean(
                root.querySelector(
                    "[data-list-row-actions-column]"
                )
            );


        if (
            !rows.length
        ) {

            const tr =
                document.createElement(
                    "tr"
                );

            const td =
                document.createElement(
                    "td"
                );


            td.className =
                "data-list-table__empty";


            td.colSpan =
                columns.length +
                (
                    selectable
                        ? 1
                        : 0
                ) +
                (
                    hasIndex
                        ? 1
                        : 0
                ) +
                (
                    hasActions
                        ? 1
                        : 0
                );


            td.textContent =
                "Không có dữ liệu.";


            tr.appendChild(
                td
            );

            el.body.appendChild(
                tr
            );


            syncSelection();

            return;

        }


        rows.forEach(
            (
                record,
                rowIndex
            ) => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const recordId =
                    getRecordId(
                        record
                    );


                tr.dataset.recordId =
                    recordId;

                if (
                    selectable
                ) {

                    const selectCell =
                        document.createElement(
                            "td"
                        );

                    selectCell.className = "catalog-table__cell catalog-table__cell--center data-list-table__selection";

                    const allowed =
                        typeof isRowSelectable !==
                            "function" ||
                        isRowSelectable(
                            record,
                            state.permissions,
                            state
                        );


                    const checkbox =
                        createRowCheckbox(
                            record,
                            allowed
                        );


                    if (
                        checkbox
                    ) {

                        selectCell.appendChild(
                            checkbox
                        );

                    }


                    tr.appendChild(
                        selectCell
                    );

                }

                if (
                    hasIndex
                ) {

                    const indexCell =
                        document.createElement(
                            "td"
                        );


                    indexCell.textContent =
                        String(
                            startIndex +
                            rowIndex +
                            1
                        );

                    indexCell.className = "catalog-table__cell catalog-table__cell--index catalog-table__cell--center data-list-table__index";

                    tr.appendChild(
                        indexCell
                    );

                }


                /*
                * CỘT DỮ LIỆU
                */
                columns.forEach(
                    column => {

                        const td =
                            document.createElement(
                                "td"
                            );

                        td.className = "catalog-table__cell catalog-table__cell--center";

                        if (
                            column.width
                        ) {

                            td.style.width =
                                column.width;

                            td.style.minWidth =
                                column.width;

                        }

                        const value =
                            resolveValue(
                                record,
                                column.key
                            );


                        const rendered =
                            formatCell
                                ? formatCell(
                                    column,
                                    value,
                                    record
                                )
                                : defaultFormat(
                                    column.type,
                                    value
                                );


                        if (
                            rendered &&
                            typeof rendered ===
                                "object" &&
                            rendered.html !==
                                undefined
                        ) {

                            td.innerHTML =
                                rendered.html;

                        } else {

                            td.textContent =
                                rendered ??
                                "-";

                        }


                        tr.appendChild(
                            td
                        );

                    }
                );


                /*
                * CỘT THAO TÁC CUỐI
                */
                if (
                    hasActions
                ) {

                    const actionCell =
                        document.createElement(
                            "td"
                        );


                    actionCell.className = "catalog-table__cell catalog-table__cell--center data-list-table__actions-sticky";


                    if (
                        typeof renderRowActions ===
                        "function"
                    ) {

                        actionCell.innerHTML =
                            renderRowActions(
                                record,
                                state.permissions
                            ) ||
                            "";

                    }


                    tr.appendChild(
                        actionCell
                    );

                }


                /*
                * CLICK DÒNG
                */
                const rowClickable =
                    typeof onRowClick ===
                        "function" &&
                    (
                        typeof isRowClickable !==
                            "function" ||
                        isRowClickable(
                            record,
                            state.permissions
                        )
                    );


                if (
                    rowClickable ||
                    typeof getRowUrl ===
                        "function"
                ) {

                    tr.classList.add(
                        "is-clickable"
                    );


                    tr.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target.closest(
                                    "button, a, input, select, textarea, label"
                                )
                            ) {
                                return;
                            }


                            if (
                                rowClickable
                            ) {

                                onRowClick(
                                    record
                                );

                                return;

                            }


                            if (
                                typeof getRowUrl !==
                                "function"
                            ) {
                                return;
                            }


                            const url =
                                getRowUrl(
                                    record
                                );


                            if (
                                url
                            ) {

                                window.location.href =
                                    url;

                            }

                        }
                    );

                }


                el.body.appendChild(
                    tr
                );

            }
        );


        syncSelection();

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

        reload:
            loadData,

        render,

        setLoading,

        getSelectedRecords,

        clearSelection,

        getVisibleRecords() {
            return [
                ...state.visibleData
            ];
        }
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

function fillSelect(
    select,
    items,
    valueKey,
    labelKey,
    allowAll = false
) {

    if (
        !select
    ) {
        return;
    }


    const placeholder =
        select.options?.[0]
            ?.textContent ||
        "Chọn...";


    select.innerHTML =
        "";


    const empty =
        document.createElement(
            "option"
        );


    empty.value =
        "";

    empty.textContent =
        placeholder;


    select.appendChild(
        empty
    );


    if (
        allowAll
    ) {

        const all =
            document.createElement(
                "option"
            );


        all.value =
            "__ALL__";

        all.textContent =
            "Tất cả";


        select.appendChild(
            all
        );

    }


    items.forEach(
        item => {

            const value =
                resolveValue(
                    item,
                    valueKey
                );


            const label =
                resolveValue(
                    item,
                    labelKey
                ) ??
                item?.label ??
                item?.name ??
                item?.ten ??
                item?.hoTen ??
                item?.tenNhanVien ??
                value;


            if (
                value ===
                    undefined ||
                value ===
                    null
            ) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    value
                );

            option.textContent =
                String(
                    label ??
                    value
                );


            select.appendChild(
                option
            );

        }
    );


    const smartRoot =
        select.closest(
            "[data-smart-select]"
        );


    const smartSelect =
        smartRoot?.smartSelect ||
        (
            smartRoot &&
            window.MCS
                .smartSelect
                ?.initialize?.(
                    smartRoot
                )
        );


    smartSelect
        ?.refresh?.();

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
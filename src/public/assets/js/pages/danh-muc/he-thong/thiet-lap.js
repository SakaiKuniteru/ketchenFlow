'use strict';

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const API_BASE =
            '/api/mcs/v1/dm-thiet-lap';

        const API_NHOM_TINH_NANG =
            '/api/mcs/v1/dm-nhom-tinh-nang/tong-hop?active=true';

        const API_CO_SO =
            '/api/mcs/v1/dm-co-so/tong-hop?active=true';


        /*
         * Chỉ dùng để đọc response BE.
         *
         * Không chứa danh sách mã thiết lập.
         * Danh sách mã nào thuộc rule nào
         * vẫn hoàn toàn nằm ở BE.
         */
        const QUY_TAC_CO_SO =
            Object.freeze({
                KHONG_CHO_CHON:
                    'KHONG_CHO_CHON',

                BAT_BUOC:
                    'BAT_BUOC',

                TUY_CHON:
                    'TUY_CHON'
            });


        const DEFAULT_CAU_HINH =
            Object.freeze({
                maThietLap:
                    '',

                quyTacCoSo:
                    QUY_TAC_CO_SO
                        .TUY_CHON,

                batBuocCoSo:
                    false,

                choPhepCoSo:
                    true,

                mocThoiGian:
                    null
            });


        let catalog =
            null;

        let dsNhomTinhNang =
            [];

        let dsCoSo =
            [];

        let currentMode =
            'view';

        let valueRowSequence =
            0;

        const VALUE_COLLAPSED_LIMIT =
            2;

        let valuesExpanded =
            false;
            
        /*
         * Cache response cấu hình BE
         * theo mã thiết lập.
         */
        const cauHinhCache =
            new Map();


        /*
         * =========================================
         * MULTI SELECT CƠ SỞ
         * =========================================
         *
         * KHÔNG dùng __ALL__.
         *
         * [] = không giới hạn cơ sở
         * đúng logic BE.
         */
        const coSoSelect =
            createMultiSelectManager({
                selectId:
                    'dsCoSoId',

                items:
                    () => dsCoSo,

                getLabel:
                    item =>
                        `${item.maCoSo} - ${item.tenCoSo}`,

                includeAllOption:
                    false
            });


        /*
         * =========================================
         * MULTI SELECT NHÓM TÍNH NĂNG
         * =========================================
         *
         * Nhóm vẫn được phép dùng "Tất cả".
         */
        const nhomTinhNangSelect =
            createMultiSelectManager({
                selectId:
                    'dsNhomTinhNangId',

                items:
                    () =>
                        dsNhomTinhNang,

                getLabel:
                    item =>
                        `${item.maNhomTinhNang} - ${item.tenNhomTinhNang}`,

                includeAllOption:
                    true
            });


        initialize();


        /*
         * =========================================
         * KHỞI TẠO
         * =========================================
         */
        async function initialize() {

            await Promise.all([
                loadCoSo(),
                loadNhomTinhNang()
            ]);
            renderCapNhatTatCaButton();

            await initializeCatalog();


            /*
             * Populate option ban đầu.
             */
            syncCurrentCoSo();

            syncCurrentNhomTinhNang();


            bindPageEvents();

        }


        /*
         * =========================================
         * MULTI SELECT MANAGER
         * =========================================
         */
        function createMultiSelectManager(
            config
        ) {

            const {
                selectId,
                items,
                getLabel,
                includeAllOption = false
            } =
                config;


            function getSelect() {

                return document
                    .getElementById(
                        selectId
                    );

            }


            function getRoot() {

                return getSelect()
                    ?.closest(
                        '[data-smart-select]'
                    ) ||
                    null;

            }


            function getSmartSelect() {

                const root =
                    getRoot();


                if (!root) {
                    return null;
                }


                return (
                    root.smartSelect ||

                    window.MCS
                        ?.smartSelect
                        ?.initialize?.(
                            root
                        ) ||

                    null
                );

            }


            function render(
                selectedIds = []
            ) {

                const select =
                    getSelect();


                if (!select) {
                    return;
                }


                const selected =
                    new Set(
                        (
                            Array.isArray(
                                selectedIds
                            )
                                ? selectedIds
                                : []
                        )
                            .map(
                                String
                            )
                    );


                select.innerHTML =
                    '';


                /*
                 * Chỉ nhóm tính năng
                 * mới có option Tất cả.
                 */
                if (
                    includeAllOption
                ) {

                    const allOption =
                        document
                            .createElement(
                                'option'
                            );


                    allOption.value =
                        '__ALL__';

                    allOption.textContent =
                        'Tất cả';


                    select.appendChild(
                        allOption
                    );

                }


                items().forEach(
                    item => {

                        const option =
                            document
                                .createElement(
                                    'option'
                                );


                        option.value =
                            String(
                                item.id
                            );


                        option.textContent =
                            getLabel(
                                item
                            );


                        option.selected =
                            selected.has(
                                String(
                                    item.id
                                )
                            );


                        select.appendChild(
                            option
                        );

                    }
                );


                getSmartSelect()
                    ?.refresh
                    ?.();

            }


            function getValues() {

                const select =
                    getSelect();


                if (!select) {
                    return [];
                }


                const options =
                    Array.from(
                        select
                            .selectedOptions ||
                        []
                    );


                if (
                    includeAllOption &&
                    options.some(
                        item =>
                            item.value ===
                            '__ALL__'
                    )
                ) {

                    return items()
                        .map(
                            item =>
                                Number(
                                    item.id
                                )
                        )
                        .filter(
                            Number.isInteger
                        );

                }


                return options
                    .map(
                        item =>
                            Number(
                                item.value
                            )
                    )
                    .filter(
                        value =>
                            Number.isInteger(
                                value
                            ) &&
                            value > 0
                    );

            }


            function clear() {

                const select =
                    getSelect();


                if (!select) {
                    return;
                }


                Array
                    .from(
                        select.options
                    )
                    .forEach(
                        option => {

                            option.selected =
                                false;

                        }
                    );


                getSmartSelect()
                    ?.refresh
                    ?.();

            }


            function setDisabled(
                disabled
            ) {

                const select =
                    getSelect();


                if (select) {
                    select.disabled =
                        disabled === true;
                }


                getSmartSelect()
                    ?.setDisabled
                    ?.(
                        disabled === true
                    );

            }


            function setRequired(
                required
            ) {

                const select =
                    getSelect();


                if (!select) {
                    return;
                }


                select.required =
                    required === true;

            }


            return {
                render,
                getValues,
                clear,
                setDisabled,
                setRequired,
                getSelect,
                getRoot,
                getSmartSelect
            };

        }


        /*
         * =========================================
         * CẤU HÌNH BE THEO MÃ
         * =========================================
         */
        async function getCauHinhFromBackend(
            maThietLap
        ) {

            const ma =
                String(
                    maThietLap ||
                    ''
                )
                    .trim()
                    .toUpperCase();


            if (!ma) {

                return {
                    ...DEFAULT_CAU_HINH
                };

            }


            if (
                cauHinhCache.has(
                    ma
                )
            ) {

                return cauHinhCache
                    .get(
                        ma
                    );

            }


            const response =
                await window.MCS
                    .api
                    .request(
                        `${API_BASE}/cau-hinh/${encodeURIComponent(
                            ma
                        )}`
                    );


            const cauHinh = {
                ...DEFAULT_CAU_HINH,
                ...(response?.data || {}),
                maThietLap:
                    response
                        ?.data
                        ?.maThietLap ||
                    ma
            };


            cauHinhCache.set(
                ma,
                cauHinh
            );


            return cauHinh;

        }


        /*
         * =========================================
         * ÁP DỤNG RULE CƠ SỞ
         * =========================================
         */
        function applyCauHinhCoSo(
            cauHinh,
            mode = currentMode
        ) {

            const rule =
                cauHinh
                    ?.quyTacCoSo ||
                QUY_TAC_CO_SO
                    .TUY_CHON;


            const readonly =
                mode ===
                'view';


            const message =
                document
                    .querySelector(
                        '[data-co-so-rule-message]'
                    );


            /*
             * Không cho chọn cơ sở.
             */
            if (
                rule ===
                QUY_TAC_CO_SO
                    .KHONG_CHO_CHON
            ) {

                coSoSelect.clear();

                coSoSelect
                    .setRequired(
                        false
                    );

                coSoSelect
                    .setDisabled(
                        true
                    );


                if (message) {

                    message.textContent =
                        'Thiết lập này không áp dụng theo cơ sở.';

                }


                return;

            }


            /*
             * Bắt buộc chọn cơ sở.
             */
            if (
                rule ===
                QUY_TAC_CO_SO
                    .BAT_BUOC
            ) {

                coSoSelect
                    .setRequired(
                        true
                    );

                coSoSelect
                    .setDisabled(
                        readonly
                    );


                if (message) {

                    message.textContent =
                        'Thiết lập này bắt buộc phải chọn ít nhất một cơ sở.';

                }


                return;

            }


            /*
             * Tùy chọn.
             *
             * [] = toàn hệ thống.
             */
            coSoSelect
                .setRequired(
                    false
                );

            coSoSelect
                .setDisabled(
                    readonly
                );


            if (message) {

                message.textContent =
                    'Không chọn cơ sở = áp dụng cho tất cả cơ sở.';

            }

        }


        /*
         * =========================================
         * VALUE ROW
         * =========================================
         */
        function getValueContainer() {

            return document
                .querySelector(
                    '[data-thiet-lap-values]'
                );

        }


        function getValueTemplate() {

            return document
                .querySelector(
                    '[data-thiet-lap-value-template]'
                );

        }


        function getValueRows() {

            return Array.from(
                getValueContainer()
                    ?.querySelectorAll(
                        '[data-thiet-lap-value-row]'
                    ) ||
                []
            );

        }

        function getValueField(
            row,
            fieldName
        ) {
            return row?.querySelector(
                `input[name$=".${fieldName}"]`
            ) || null;
        }

        function getRowDateValue(
            row,
            fieldName
        ) {
            return normalizeDateValue(
                getValueField(
                    row,
                    fieldName
                )?.value
            );
        }

        function addDateDays(
            value,
            amount
        ) {
            const normalized =
                normalizeDateValue(
                    value
                );

            if (!normalized) {
                return '';
            }

            const [
                year,
                month,
                day
            ] =
                normalized
                    .split('-')
                    .map(Number);

            const date =
                new Date(
                    year,
                    month - 1,
                    day
                );

            date.setDate(
                date.getDate() +
                amount
            );

            const nextYear =
                date.getFullYear();

            const nextMonth =
                String(
                    date.getMonth() + 1
                ).padStart(2, '0');

            const nextDay =
                String(
                    date.getDate()
                ).padStart(2, '0');

            return (
                `${nextYear}-${nextMonth}-${nextDay}`
            );
        }

        function getRowsByStartAscending() {
            return getValueRows()
                .filter(
                    row =>
                        !!getRowDateValue(
                            row,
                            'tuNgay'
                        )
                )
                .sort(
                    (a, b) =>
                        getRowDateValue(
                            a,
                            'tuNgay'
                        ).localeCompare(
                            getRowDateValue(
                                b,
                                'tuNgay'
                            )
                        )
                );
        }

        function sortValueRowsForDisplay() {
            const container =
                getValueContainer();

            if (!container) {
                return;
            }

            const rows =
                getValueRows();

            rows.sort(
                (a, b) => {
                    const aStart =
                        getRowDateValue(
                            a,
                            'tuNgay'
                        );

                    const bStart =
                        getRowDateValue(
                            b,
                            'tuNgay'
                        );

                    /*
                    * Row chưa nhập ngày:
                    * giữ phía trên khi đang tạo mới
                    * để user không bị mất row vừa thêm.
                    */
                    if (!aStart && !bStart) {
                        return 0;
                    }

                    if (!aStart) {
                        return -1;
                    }

                    if (!bStart) {
                        return 1;
                    }

                    return bStart.localeCompare(
                        aStart
                    );
                }
            );

            rows.forEach(
                row =>
                    container.appendChild(
                        row
                    )
            );
        }

        function syncAutomaticEndDates() {
            const rows =
                getRowsByStartAscending();

            rows.forEach(
                (
                    row,
                    index
                ) => {
                    const endInput =
                        getValueField(
                            row,
                            'denNgay'
                        );

                    if (!endInput) {
                        return;
                    }

                    const nextRow =
                        rows[index + 1];

                    /*
                    * Đây là giá trị mới nhất.
                    *
                    * Nếu trước đó "Đến ngày"
                    * là do hệ thống tự sinh thì
                    * bỏ nó để khoảng mới nhất
                    * được mở.
                    */
                    if (!nextRow) {
                        if (
                            endInput.dataset
                                .autoEnd ===
                            'true'
                        ) {
                            setDateFieldValue(
                                row,
                                'denNgay',
                                ''
                            );

                            endInput.dataset
                                .autoEnd =
                                'false';
                        }

                        return;
                    }

                    const nextStart =
                        getRowDateValue(
                            nextRow,
                            'tuNgay'
                        );

                    if (!nextStart) {
                        return;
                    }

                    const suggestedEnd =
                        addDateDays(
                            nextStart,
                            -1
                        );

                    const currentEnd =
                        getRowDateValue(
                            row,
                            'denNgay'
                        );

                    /*
                    * Chỉ tự sinh khi:
                    *
                    * - chưa có Đến ngày
                    * - user chưa chủ động xóa nó
                    *
                    * Hoặc:
                    * - đây vốn là ngày do FE
                    *   tự sinh và cần cập nhật
                    *   theo Từ ngày mới.
                    */
                    if (
                        (
                            !currentEnd &&
                            endInput.dataset
                                .userClearedEnd !==
                            'true'
                        ) ||
                        endInput.dataset
                            .autoEnd ===
                        'true'
                    ) {
                        setDateFieldValue(
                            row,
                            'denNgay',
                            suggestedEnd
                        );

                        endInput.dataset
                            .autoEnd =
                            'true';

                        endInput.dataset
                            .userClearedEnd =
                            'false';
                    }
                }
            );
        }

        function syncValueVisibility() {
            sortValueRowsForDisplay();

            const rows =
                getValueRows();

            const toolbar =
                document.querySelector(
                    '[data-thiet-lap-values-toolbar]'
                );

            const toggle =
                document.querySelector(
                    '[data-toggle-values]'
                );

            const label =
                document.querySelector(
                    '[data-toggle-values-label]'
                );

            const icon =
                document.querySelector(
                    '[data-toggle-values-icon]'
                );

            const hasMore =
                rows.length >
                VALUE_COLLAPSED_LIMIT;

            if (toolbar) {
                toolbar.hidden =
                    !hasMore;
            }

            rows.forEach(
                (
                    row,
                    index
                ) => {
                    row.hidden =
                        !valuesExpanded &&
                        index >=
                            VALUE_COLLAPSED_LIMIT;
                }
            );

            if (!toggle) {
                return;
            }

            toggle.setAttribute(
                'aria-expanded',
                String(
                    valuesExpanded
                )
            );

            if (label) {
                label.textContent =
                    valuesExpanded
                        ? 'Thu gọn'
                        : 'Hiển thị thêm';
            }

            if (icon) {
                icon.className =
                    valuesExpanded
                        ? 'fa-solid fa-chevron-up'
                        : 'fa-solid fa-chevron-down';
            }
        }

        /*
         * PostgreSQL / JSON có thể trả:
         *
         * 2026-09-12
         * 2026-09-12 00:00:00
         * 2026-09-12T00:00:00.000Z
         *
         * Date picker chỉ cần yyyy-MM-dd.
         */
        function normalizeDateValue(
            value
        ) {

            if (!value) {
                return '';
            }


            const text =
                String(
                    value
                ).trim();


            const match =
                text.match(
                    /^(\d{4}-\d{2}-\d{2})/
                );


            if (match) {

                return match[1];

            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return '';

            }


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() +
                    1
                )
                    .padStart(
                        2,
                        '0'
                    );


            const day =
                String(
                    date.getDate()
                )
                    .padStart(
                        2,
                        '0'
                    );


            return (
                `${year}-${month}-${day}`
            );

        }


        function formatDateDisplay(
            value
        ) {

            const normalized =
                normalizeDateValue(
                    value
                );


            if (!normalized) {
                return '';
            }


            const [
                year,
                month,
                day
            ] =
                normalized.split(
                    '-'
                );


            return (
                `${day}/${month}/${year}`
            );

        }


        /*
         * Template được clone sau DOMContentLoaded,
         * vì vậy phải init date picker thủ công.
         */
        function initializeDatePickers(
            scope
        ) {

            scope
                ?.querySelectorAll(
                    '[data-date-picker]'
                )
                .forEach(
                    root => {

                        if (
                            root.datePicker
                        ) {
                            return;
                        }


                        if (
                            typeof window
                                .initializeDatePicker ===
                            'function'
                        ) {

                            window
                                .initializeDatePicker(
                                    root
                                );

                            return;

                        }


                        if (
                            typeof initializeDatePicker ===
                            'function'
                        ) {

                            initializeDatePicker(
                                root
                            );

                        }

                    }
                );

        }


        function setDateFieldValue(
            row,
            fieldName,
            value
        ) {

            const input =
                row.querySelector(
                    `input[name$=".${fieldName}"]`
                );


            if (!input) {
                return;
            }


            const normalized =
                normalizeDateValue(
                    value
                );


            const root =
                input.closest(
                    '[data-date-picker]'
                );


            if (
                root?.datePicker &&
                typeof root
                    .datePicker
                    .setValue ===
                'function'
            ) {

                root.datePicker
                    .setValue(
                        normalized,
                        false
                    );

                return;

            }


            /*
             * Fallback.
             */
            input.value =
                normalized;


            const displayInput =
                root?.querySelector(
                    '[data-date-input]'
                );


            if (displayInput) {

                displayInput.value =
                    formatDateDisplay(
                        normalized
                    );

            }

        }


        function setValueRowMode(
            row
        ) {

            const readonly =
                currentMode ===
                'view';


            row
                .querySelectorAll(
                    'input, textarea, select'
                )
                .forEach(
                    field => {

                        if (
                            field.type ===
                            'hidden'
                        ) {
                            return;
                        }


                        field.disabled =
                            readonly;


                        if (
                            'readOnly' in
                            field
                        ) {

                            field.readOnly =
                                readonly;

                        }

                    }
                );

        }

        function createValueRow(
            item = {},
            {
                prepend = false
            } = {}
        ) {

            const container =
                getValueContainer();


            const template =
                getValueTemplate();


            if (
                !container ||
                !template
            ) {
                return null;
            }


            valueRowSequence +=
                1;


            const index =
                valueRowSequence;


            /*
             * Thay token trước khi
             * đưa DOM vào form để:
             *
             * - id không trùng
             * - name không trùng
             * - label for không trùng
             * - data-form-field không trùng
             */
            const html =
                template
                    .innerHTML
                    .replaceAll(
                        '__INDEX__',
                        String(
                            index
                        )
                    );


            const holder =
                document
                    .createElement(
                        'template'
                    );


            holder.innerHTML =
                html.trim();


            const row =
                holder
                    .content
                    .querySelector(
                        '[data-thiet-lap-value-row]'
                    );


            if (!row) {
                return null;
            }


            row.dataset
                .giaTriId =
                item?.id !==
                    undefined &&
                item?.id !==
                    null
                    ? String(
                        item.id
                    )
                    : '';

            if (prepend) {
                container.prepend(
                    row
                );
            } else {
                container.appendChild(
                    row
                );
            }

            /*
             * Init date picker trước
             * khi set giá trị.
             */
            initializeDatePickers(
                row
            );


            const giaTriInput =
                row.querySelector(
                    'input[name$=".giaTri"]'
                );


            if (giaTriInput) {

                giaTriInput.value =
                    item?.giaTri !==
                        undefined &&
                    item?.giaTri !==
                        null
                        ? String(
                            item.giaTri
                        )
                        : '';

            }


            setDateFieldValue(
                row,
                'tuNgay',
                item?.tuNgay
            );


            setDateFieldValue(
                row,
                'denNgay',
                item?.denNgay
            );

            const endInput =
                getValueField(
                    row,
                    'denNgay'
                );

            if (endInput) {
                endInput.dataset.autoEnd =
                    'false';

                endInput.dataset.userClearedEnd =
                    'false';
            }


            setValueRowMode(
                row
            );


            return row;

        }


        function renderValueRows(
            items = []
        ) {
            const container =
                getValueContainer();

            if (!container) {
                return;
            }

            container.replaceChildren();

            valueRowSequence =
                0;

            valuesExpanded =
                false;

            const activeValues =
                (
                    Array.isArray(items)
                        ? items
                        : []
                )
                    .filter(
                        item =>
                            item?.active !==
                            false
                    )
                    .sort(
                        (a, b) => {
                            const aStart =
                                normalizeDateValue(
                                    a?.tuNgay
                                );

                            const bStart =
                                normalizeDateValue(
                                    b?.tuNgay
                                );

                            if (
                                !aStart &&
                                !bStart
                            ) {
                                return 0;
                            }

                            if (!aStart) {
                                return -1;
                            }

                            if (!bStart) {
                                return 1;
                            }

                            return bStart
                                .localeCompare(
                                    aStart
                                );
                        }
                    );

            const values =
                activeValues.length > 0
                    ? activeValues
                    : [
                        {}
                    ];

            values.forEach(
                item => {
                    createValueRow(
                        item
                    );
                }
            );

            syncValueActions();

            syncValueVisibility();
        }


        /*
         * =========================================
         * LOGIC ICON + / -
         * =========================================
         *
         * 1 row:
         *      +
         *
         * >= 2 row:
         *      - +
         *      -
         *      -
         */
        function syncValueActions() {

            const rows =
                getValueRows();


            const count =
                rows.length;


            rows.forEach(
                (
                    row,
                    index
                ) => {

                    const addButton =
                        row.querySelector(
                            '[data-add-value]'
                        );


                    const removeButton =
                        row.querySelector(
                            '[data-remove-value]'
                        );


                    if (
                        currentMode ===
                        'view'
                    ) {

                        if (addButton) {
                            addButton.hidden =
                                true;
                        }


                        if (removeButton) {
                            removeButton.hidden =
                                true;
                        }


                        return;

                    }


                    /*
                     * + chỉ xuất hiện
                     * tại row đầu tiên.
                     */
                    if (addButton) {

                        addButton.hidden =
                            index !==
                            0;

                    }


                    /*
                     * Chỉ có 1 row:
                     * không có dấu -.
                     *
                     * Từ 2 row trở lên:
                     * mọi row đều có -.
                     */
                    if (removeButton) {

                        removeButton.hidden =
                            count <
                            2;

                    }

                }
            );
            syncValueVisibility();
        }


        function collectValueRows() {

            return getValueRows()
                .map(
                    row => {

                        const giaTri =
                            row.querySelector(
                                'input[name$=".giaTri"]'
                            )
                                ?.value ??
                            '';


                        const tuNgay =
                            row.querySelector(
                                'input[name$=".tuNgay"]'
                            )
                                ?.value ??
                            '';


                        const denNgay =
                            row.querySelector(
                                'input[name$=".denNgay"]'
                            )
                                ?.value ??
                            '';


                        const id =
                            Number(
                                row.dataset
                                    .giaTriId
                            );


                        return {
                            ...(
                                Number.isInteger(
                                    id
                                ) &&
                                id > 0
                                    ? {
                                        id
                                    }
                                    : {}
                            ),

                            giaTri:
                                String(
                                    giaTri
                                ).trim(),

                            tuNgay:
                                String(
                                    tuNgay
                                ).trim() ||
                                null,

                            denNgay:
                                String(
                                    denNgay
                                ).trim() ||
                                null,

                            active:
                                true
                        };

                    }
                );

        }

        function validateValueDateRanges(
            errors
        ) {
            const entries =
                getValueRows()
                    .map(
                        row => {
                            const giaTriInput =
                                getValueField(
                                    row,
                                    'giaTri'
                                );

                            return {
                                row,

                                giaTriInput,

                                tuNgay:
                                    getRowDateValue(
                                        row,
                                        'tuNgay'
                                    ),

                                denNgay:
                                    getRowDateValue(
                                        row,
                                        'denNgay'
                                    )
                            };
                        }
                    );


            /*
            * Một dòng duy nhất:
            * Từ/Đến đều được phép trống.
            */
            entries.forEach(
                item => {
                    if (
                        item.tuNgay &&
                        item.denNgay &&
                        item.tuNgay >
                            item.denNgay
                    ) {
                        if (
                            item.giaTriInput
                                ?.name
                        ) {
                            errors[
                                item.giaTriInput
                                    .name
                            ] =
                                'Khoảng thời gian không hợp lệ: Từ ngày phải nhỏ hơn hoặc bằng Đến ngày.';
                        }
                    }
                }
            );


            if (
                entries.length <=
                1
            ) {
                return;
            }


            /*
            * Xếp từ cũ → mới để kiểm tra:
            *
            * current.denNgay
            * phải nhỏ hơn
            * next.tuNgay.
            */
            const sorted =
                [...entries]
                    .sort(
                        (a, b) => {
                            if (
                                !a.tuNgay &&
                                !b.tuNgay
                            ) {
                                return 0;
                            }

                            if (!a.tuNgay) {
                                return -1;
                            }

                            if (!b.tuNgay) {
                                return 1;
                            }

                            return a.tuNgay
                                .localeCompare(
                                    b.tuNgay
                                );
                        }
                    );


            for (
                let index = 0;
                index <
                sorted.length - 1;
                index += 1
            ) {
                const current =
                    sorted[index];

                const next =
                    sorted[index + 1];


                /*
                * Không có Từ ngày ở value sau
                * thì không xác định được ranh giới.
                */
                if (!next.tuNgay) {
                    continue;
                }


                /*
                * Có value phía sau nhưng current
                * lại mở vô hạn => bị chồng.
                */
                if (!current.denNgay) {
                    if (
                        current.giaTriInput
                            ?.name
                    ) {
                        errors[
                            current.giaTriInput
                                .name
                        ] =
                            `Khoảng thời gian bị chồng. Đến ngày phải trước ${formatDateDisplay(next.tuNgay)}.`;
                    }

                    continue;
                }


                /*
                * Inclusive range:
                *
                * 31/08 < 01/09 => OK
                *
                * 01/09 >= 01/09 => overlap
                */
                if (
                    current.denNgay >=
                    next.tuNgay
                ) {
                    if (
                        current.giaTriInput
                            ?.name
                    ) {
                        errors[
                            current.giaTriInput
                                .name
                        ] =
                            `Khoảng thời gian bị chồng với giá trị bắt đầu từ ${formatDateDisplay(next.tuNgay)}.`;
                    }
                }
            }
        }

        function markFormDirty() {

            catalog
                ?.form
                ?.updateDirtyState
                ?.();

        }


        /*
         * =========================================
         * BIND SỰ KIỆN RIÊNG CỦA THIẾT LẬP
         * =========================================
         */
        function bindPageEvents() {

            const container =
                getValueContainer();


            if (
                container &&
                container.dataset
                    .valueEventsBound !==
                'true'
            ) {

                container.dataset
                    .valueEventsBound =
                    'true';


                container.addEventListener(
                    'click',
                    event => {

                        if (
                            currentMode ===
                            'view'
                        ) {
                            return;
                        }


                        const addButton =
                            event.target
                                .closest(
                                    '[data-add-value]'
                                );

                        if (addButton) {

                            valuesExpanded =
                                true;

                            createValueRow(
                                {},
                                {
                                    prepend: true
                                }
                            );

                            syncValueActions();

                            syncValueVisibility();

                            markFormDirty();

                            return;

                        }

                        const removeButton =
                            event.target
                                .closest(
                                    '[data-remove-value]'
                                );


                        if (!removeButton) {
                            return;
                        }


                        const rows =
                            getValueRows();


                        if (
                            rows.length <=
                            1
                        ) {
                            return;
                        }

                        removeButton
                            .closest(
                                '[data-thiet-lap-value-row]'
                            )
                            ?.remove();


                        if (
                            getValueRows()
                                .length <=
                            VALUE_COLLAPSED_LIMIT
                        ) {
                            valuesExpanded =
                                false;
                        }


                        syncAutomaticEndDates();

                        syncValueActions();

                        syncValueVisibility();

                        markFormDirty();
                    }
                );

            }


            /*
             * Khi người dùng nhập mã
             * trong CREATE/UPDATE:
             *
             * gọi BE để lấy rule cơ sở.
             */
            if (
                container &&
                container.dataset
                    .valueDateEventsBound !==
                'true'
            ) {
                container.dataset
                    .valueDateEventsBound =
                    'true';


                container.addEventListener(
                    'change',
                    event => {
                        const row =
                            event.target.closest(
                                '[data-thiet-lap-value-row]'
                            );

                        if (!row) {
                            return;
                        }


                        /*
                        * USER sửa / xóa Đến ngày.
                        *
                        * Từ thời điểm này FE không
                        * được tự sửa lại field đó nữa.
                        * Nếu overlap thì validation
                        * sẽ báo lỗi.
                        */
                        if (
                            event.target.matches(
                                'input[name$=".denNgay"]'
                            )
                        ) {
                            event.target.dataset
                                .autoEnd =
                                'false';

                            event.target.dataset
                                .userClearedEnd =
                                event.target.value
                                    ? 'false'
                                    : 'true';

                            markFormDirty();

                            return;
                        }


                        /*
                        * Khi thay Từ ngày:
                        *
                        * ví dụ:
                        *
                        * 01/09 → ...
                        *
                        * thêm:
                        *
                        * 01/08 → trống
                        *
                        * => FE tự sinh 31/08.
                        */
                        if (
                            event.target.matches(
                                'input[name$=".tuNgay"]'
                            )
                        ) {
                            syncAutomaticEndDates();

                            syncValueVisibility();

                            markFormDirty();
                        }
                    }
                );
            }

            const toggleValuesButton =
                document.querySelector(
                    '[data-toggle-values]'
                );


            if (
                toggleValuesButton &&
                toggleValuesButton.dataset
                    .bound !==
                'true'
            ) {
                toggleValuesButton.dataset
                    .bound =
                    'true';


                toggleValuesButton.addEventListener(
                    'click',
                    () => {
                        valuesExpanded =
                            !valuesExpanded;

                        syncValueVisibility();
                    }
                );
            }

            const maInput =
                document
                    .getElementById(
                        'maThietLap'
                    );


            if (
                maInput &&
                maInput.dataset
                    .cauHinhBound !==
                'true'
            ) {

                maInput.dataset
                    .cauHinhBound =
                    'true';


                const syncCauHinh =
                    async () => {

                        if (
                            currentMode ===
                            'view'
                        ) {
                            return;
                        }


                        const ma =
                            String(
                                maInput.value ||
                                ''
                            )
                                .trim()
                                .toUpperCase();


                        if (!ma) {

                            applyCauHinhCoSo(
                                {
                                    ...DEFAULT_CAU_HINH
                                },
                                currentMode
                            );

                            return;

                        }


                        try {

                            const cauHinh =
                                await getCauHinhFromBackend(
                                    ma
                                );


                            /*
                             * Trong lúc request chạy
                             * user có thể đổi mã.
                             */
                            const currentMa =
                                String(
                                    maInput.value ||
                                    ''
                                )
                                    .trim()
                                    .toUpperCase();


                            if (
                                currentMa !==
                                ma
                            ) {
                                return;
                            }


                            applyCauHinhCoSo(
                                cauHinh,
                                currentMode
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                'Không thể tải cấu hình thiết lập.',
                                error
                            );


                            window.MCS
                                ?.toast
                                ?.error(
                                    error?.message ||
                                    'Không thể tải cấu hình thiết lập.'
                                );

                        }

                    };


                maInput.addEventListener(
                    'change',
                    syncCauHinh
                );


                maInput.addEventListener(
                    'blur',
                    syncCauHinh
                );

            }


            /*
             * Form core chỉ reset field tĩnh.
             *
             * dsGiaTri là DOM động nên
             * phải phục hồi riêng.
             */
            const resetButton =
                catalog
                    ?.form
                    ?.elements
                    ?.reset;


            if (
                resetButton &&
                resetButton.dataset
                    .thietLapResetBound !==
                'true'
            ) {

                resetButton.dataset
                    .thietLapResetBound =
                    'true';


                resetButton
                    .addEventListener(
                        'click',
                        () => {

                            window.setTimeout(
                                () => {

                                    const initial =
                                        catalog
                                            ?.form
                                            ?.initialData ||
                                        {};


                                    renderValueRows(
                                        initial
                                            ?.dsGiaTri ||
                                        []
                                    );


                                    coSoSelect.render(
                                        initial
                                            ?.dsCoSoId ||
                                        []
                                    );


                                    nhomTinhNangSelect
                                        .render(
                                            initial
                                                ?.dsNhomTinhNangId ||
                                            []
                                        );


                                    applyCauHinhCoSo(
                                        initial
                                            ?.cauHinh ||
                                        {
                                            ...DEFAULT_CAU_HINH
                                        },
                                        currentMode
                                    );

                                },
                                0
                            );

                        }
                    );

            }

        }


        /*
         * =========================================
         * GIÁ TRỊ HIỂN THỊ Ở TABLE
         * =========================================
         */
        function getGiaTriListText(
            record
        ) {

            const values =
                (
                    Array.isArray(
                        record
                            ?.dsGiaTri
                    )
                        ? record.dsGiaTri
                        : []
                )
                    .filter(
                        item =>
                            item?.active !==
                            false
                    )
                    .map(
                        item =>
                            String(
                                item?.giaTri ??
                                ''
                            ).trim()
                    )
                    .filter(
                        Boolean
                    );


            return values.length >
                0
                ? values.join(
                    ' | '
                )
                : '';

        }

        /*
        * =========================================
        * NÚT CẬP NHẬT TOÀN BỘ THIẾT LẬP
        * =========================================
        */
        function renderCapNhatTatCaButton() {

            const actions =
                document.querySelector(
                    '[data-catalog-toolbar] .catalog-toolbar__actions'
                );


            if (!actions) {
                return;
            }


            /*
            * Tránh render trùng khi init lại.
            */
            if (
                actions.querySelector(
                    '[data-cap-nhat-tat-ca-thiet-lap]'
                )
            ) {
                return;
            }


            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                [
                    'catalog-toolbar__button',
                    'catalog-toolbar__button--secondary',
                    'thiet-lap-update-all-button'
                ].join(
                    ' '
                );


            button.dataset
                .capNhatTatCaThietLap =
                'true';


            button.innerHTML = `
                <i
                    class="fa-solid fa-arrows-rotate"
                    aria-hidden="true">
                </i>

                <span>
                    Cập nhật toàn bộ thiết lập
                </span>
            `;


            /*
            * Đặt ngay TRƯỚC Tiện ích:
            *
            * [Cập nhật toàn bộ] [Tiện ích] [↔] [▥] [+ Thêm mới]
            */
            const utility =
                actions.querySelector(
                    '[data-catalog-utility]'
                );


            if (utility) {

                actions.insertBefore(
                    button,
                    utility
                );

            } else {

                actions.prepend(
                    button
                );

            }


            button.addEventListener(
                'click',
                () => {

                    capNhatToanBoThietLap(
                        button
                    );

                }
            );

        }

        async function capNhatToanBoThietLap(
            button
        ) {

            if (
                !button ||
                button.disabled
            ) {
                return;
            }


            const oldHtml =
                button.innerHTML;


            try {

                button.disabled =
                    true;


                button.innerHTML = `
                    <i
                        class="fa-solid fa-arrows-rotate fa-spin"
                        aria-hidden="true">
                    </i>

                    <span>
                        Đang cập nhật...
                    </span>
                `;


                const result =
                    await window.MCS
                        .api
                        .request(
                            `${API_BASE}/dong-bo-tat-ca`,
                            {
                                method:
                                    'POST'
                            }
                        );


                const data =
                    result?.data ||
                    {};


                const tongSo =
                    Number(
                        data.tongSo
                    ) || 0;


                const thanhCong =
                    Number(
                        data.thanhCong
                    ) || 0;


                const thatBai =
                    Number(
                        data.thatBai
                    ) || 0;


                if (
                    thatBai >
                    0
                ) {

                    window.MCS
                        ?.toast
                        ?.error(
                            `Đã cập nhật ${thanhCong}/${tongSo} thiết lập. Có ${thatBai} thiết lập cập nhật thất bại.`
                        );

                } else {

                    window.MCS
                        ?.toast
                        ?.success(
                            result?.message ||
                            `Đã cập nhật ${thanhCong}/${tongSo} thiết lập.`
                        );

                }


                /*
                * Load lại bảng sau khi
                * toàn bộ thiết lập được xử lý.
                */
                await catalog
                    ?.load
                    ?.();

            } catch (
                error
            ) {

                console.error(
                    'Cập nhật toàn bộ thiết lập thất bại:',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Cập nhật toàn bộ thiết lập thất bại.'
                    );

            } finally {

                button.disabled =
                    false;


                button.innerHTML =
                    oldHtml;

            }

        }

        /*
         * =========================================
         * CATALOG
         * =========================================
         */
        async function initializeCatalog() {

            try {

                catalog =
                    await window.MCS
                        .pages
                        .createCatalogPage({

                            moduleName:
                                'thiet-lap',


                            permissionCodes: {
                                view:
                                    'Q000532',

                                create:
                                    'Q000533',

                                update:
                                    'Q000534'
                            },


                            columns: [

                                {
                                    key:
                                        'maThietLap',

                                    label:
                                        'Mã thiết lập',

                                    width:
                                        '230px',

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },

                                {
                                    key:
                                        'tenThietLap',

                                    label:
                                        'Tên thiết lập',

                                    width:
                                        '220px',

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },

                                {
                                    key:
                                        'giaTri',

                                    label:
                                        'Giá trị',

                                    width:
                                        '200px',

                                    filterable:
                                        true
                                },

                                {
                                    key:
                                        'nhomTinhNang',

                                    label:
                                        'Nhóm tính năng',

                                    width:
                                        '220px',

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },

                                {
                                    key:
                                        'moTa',

                                    label:
                                        'Mô tả',

                                    width:
                                        '250px',

                                    filterable:
                                        true
                                },

                                {
                                    key:
                                        'active',

                                    label:
                                        'Hiệu lực',

                                    width:
                                        '130px',

                                    sortable:
                                        true,

                                    className:
                                        'catalog-table__cell--center',

                                    isBoolean:
                                        true,

                                    trueLabel:
                                        'TRUE',

                                    falseLabel:
                                        'FALSE'
                                }

                            ],


                            /*
                             * Không còn giaTri root.
                             */
                            defaultValues: {

                                maThietLap:
                                    '',

                                tenThietLap:
                                    '',

                                dsGiaTri: [
                                    {}
                                ],

                                dsNhomTinhNangId:
                                    [],

                                dsCoSoId:
                                    [],

                                moTa:
                                    '',

                                active:
                                    true,

                                cauHinh: {
                                    ...DEFAULT_CAU_HINH
                                }

                            },


                            /*
                             * Chỉ validation
                             * các field tĩnh.
                             *
                             * dsGiaTri xử lý
                             * ở validate() riêng.
                             */
                            validation: {

                                maThietLap: {

                                    label:
                                        'Mã thiết lập',

                                    required:
                                        true,

                                    maxLength:
                                        100,

                                    unique:
                                        true,

                                    requiredMessage:
                                        'Vui lòng điền vào trường này.',

                                    maxLengthMessage:
                                        'Mã thiết lập không được vượt quá 100 ký tự.',

                                    uniqueMessage:
                                        'Mã thiết lập đã tồn tại.'

                                },


                                tenThietLap: {

                                    label:
                                        'Tên thiết lập',

                                    required:
                                        true,

                                    maxLength:
                                        255,

                                    unique:
                                        true,

                                    requiredMessage:
                                        'Vui lòng điền vào trường này.',

                                    maxLengthMessage:
                                        'Tên thiết lập không được vượt quá 255 ký tự.',

                                    uniqueMessage:
                                        'Tên thiết lập đã tồn tại.'

                                },


                                dsNhomTinhNangId: {

                                    label:
                                        'Nhóm tính năng',

                                    required:
                                        true,

                                    requiredMessage:
                                        'Vui lòng chọn ít nhất một nhóm tính năng.'

                                },


                                moTa: {

                                    label:
                                        'Mô tả',

                                    maxLength:
                                        500,

                                    maxLengthMessage:
                                        'Mô tả không được vượt quá 500 ký tự.'

                                }

                            },


                            /*
                             * =====================================
                             * VALIDATION NGHIỆP VỤ FE
                             * =====================================
                             */
                            async validate(
                                formData
                            ) {

                                const errors =
                                    {};


                                const rows =
                                    getValueRows();


                                /*
                                 * Bắt buộc có ít nhất
                                 * một giá trị.
                                 */
                                if (
                                    !Array.isArray(
                                        formData
                                            .dsGiaTri
                                    ) ||
                                    formData
                                        .dsGiaTri
                                        .length ===
                                    0
                                ) {

                                    errors.maThietLap =
                                        'Phải có ít nhất một giá trị thiết lập.';

                                }


                                rows.forEach(
                                    (
                                        row,
                                        index
                                    ) => {

                                        const item =
                                            formData
                                                .dsGiaTri
                                                ?.[
                                                    index
                                                ] ||
                                            {};


                                        const giaTriInput =
                                            row.querySelector(
                                                'input[name$=".giaTri"]'
                                            );


                                        const tuNgayInput =
                                            row.querySelector(
                                                'input[name$=".tuNgay"]'
                                            );


                                        const denNgayInput =
                                            row.querySelector(
                                                'input[name$=".denNgay"]'
                                            );


                                        /*
                                         * Giá trị required.
                                         */
                                        if (
                                            !String(
                                                item
                                                    .giaTri ??
                                                ''
                                            ).trim()
                                        ) {

                                            if (
                                                giaTriInput
                                                    ?.name
                                            ) {

                                                errors[
                                                    giaTriInput
                                                        .name
                                                ] =
                                                    'Vui lòng điền vào trường này.';

                                            }

                                        } else if (
                                            String(
                                                item
                                                    .giaTri
                                            )
                                                .length >
                                            500
                                        ) {

                                            if (
                                                giaTriInput
                                                    ?.name
                                            ) {

                                                errors[
                                                    giaTriInput
                                                        .name
                                                ] =
                                                    'Giá trị không được vượt quá 500 ký tự.';

                                            }

                                        }


                                        /*
                                         * Từ ngày <= Đến ngày.
                                         *
                                         * yyyy-MM-dd so sánh
                                         * trực tiếp được.
                                         */
                                        if (
                                            item
                                                .tuNgay &&
                                            item
                                                .denNgay &&
                                            item
                                                .tuNgay >
                                            item
                                                .denNgay
                                        ) {

                                            const errorName =
                                                denNgayInput
                                                    ?.name ||
                                                tuNgayInput
                                                    ?.name;


                                            if (
                                                errorName
                                            ) {

                                                errors[
                                                    errorName
                                                ] =
                                                    'Từ ngày phải nhỏ hơn hoặc bằng đến ngày.';

                                            }

                                        }

                                    }
                                );

                                validateValueDateRanges(
                                    errors
                                );
                                /*
                                 * =================================
                                 * CƠ SỞ:
                                 * LUÔN HỎI BE
                                 * =================================
                                 */
                                try {

                                    const cauHinh =
                                        await getCauHinhFromBackend(
                                            formData
                                                .maThietLap
                                        );


                                    applyCauHinhCoSo(
                                        cauHinh,
                                        currentMode
                                    );


                                    /*
                                     * BE nói không cho chọn
                                     * => cưỡng chế gửi [].
                                     */
                                    if (
                                        cauHinh
                                            .quyTacCoSo ===
                                        QUY_TAC_CO_SO
                                            .KHONG_CHO_CHON
                                    ) {

                                        formData
                                            .dsCoSoId =
                                            [];

                                    }


                                    /*
                                     * BE nói bắt buộc
                                     * => FE validate.
                                     */
                                    if (
                                        cauHinh
                                            .quyTacCoSo ===
                                            QUY_TAC_CO_SO
                                                .BAT_BUOC &&
                                        (
                                            !Array.isArray(
                                                formData
                                                    .dsCoSoId
                                            ) ||
                                            formData
                                                .dsCoSoId
                                                .length ===
                                            0
                                        )
                                    ) {

                                        errors
                                            .dsCoSoId =
                                            'Thiết lập này bắt buộc phải chọn ít nhất một cơ sở.';

                                    }

                                } catch (
                                    error
                                ) {

                                    console.error(
                                        'Không thể kiểm tra cấu hình thiết lập.',
                                        error
                                    );


                                    errors
                                        .maThietLap =
                                        error
                                            ?.message ||
                                        'Không thể kiểm tra cấu hình của mã thiết lập.';

                                }


                                return errors;

                            },

                            detailTitle:
                                'Thông tin thiết lập',

                            createTitle:
                                'Thêm thiết lập',

                            updateTitle:
                                'Cập nhật thiết lập',


                            headerActions: [
                                {
                                    action:
                                        'cap-nhat-thiet-lap',

                                    label:
                                        'Cập nhật thiết lập',

                                    icon:
                                        'fa-solid fa-arrows-rotate',

                                    variant:
                                        'primary',

                                    modes: [
                                        'view',
                                        'update'
                                    ],

                                    permission:
                                        'Q000534'
                                }
                            ],


                            getRecordSubtitle(
                                record
                            ) {

                                return (
                                    record
                                        ?.maThietLap ||
                                    ''
                                );

                            },


                            mapListResponse(
                                result
                            ) {

                                const records =
                                    Array.isArray(
                                        result
                                            ?.data
                                    )
                                        ? result.data
                                        : [];


                                return records
                                    .map(
                                        record => ({
                                            ...record,

                                            giaTri:
                                                getGiaTriListText(
                                                    record
                                                )
                                        })
                                    );

                            },


                            mapDetailResponse(
                                result
                            ) {

                                return (
                                    result
                                        ?.data ||
                                    null
                                );

                            },


                            mapRecordToForm(
                                record
                            ) {

                                return {

                                    id:
                                        record
                                            ?.id ??
                                        '',

                                    maThietLap:
                                        record
                                            ?.maThietLap ||
                                        '',

                                    tenThietLap:
                                        record
                                            ?.tenThietLap ||
                                        '',

                                    dsGiaTri:
                                        Array.isArray(
                                            record
                                                ?.dsGiaTri
                                        )
                                            ? record.dsGiaTri
                                            : [],

                                    dsCoSoId:
                                        Array.isArray(
                                            record
                                                ?.dsCoSoId
                                        )
                                            ? record.dsCoSoId
                                            : [],

                                    dsNhomTinhNangId:
                                        Array.isArray(
                                            record
                                                ?.dsNhomTinhNangId
                                        )
                                            ? record.dsNhomTinhNangId
                                            : [],

                                    moTa:
                                        record
                                            ?.moTa ||
                                        '',

                                    active:
                                        record
                                            ?.active ===
                                        true,

                                    cauHinh:
                                        record
                                            ?.cauHinh ||
                                        {
                                            ...DEFAULT_CAU_HINH
                                        }

                                };

                            },


                            transformPayload(
                                formData
                            ) {

                                return {

                                    maThietLap:
                                        String(
                                            formData
                                                .maThietLap ||
                                            ''
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenThietLap:
                                        String(
                                            formData
                                                .tenThietLap ||
                                            ''
                                        )
                                            .trim(),

                                    dsGiaTri:
                                        collectValueRows(),

                                    dsCoSoId:
                                        coSoSelect
                                            .getValues(),

                                    dsNhomTinhNangId:
                                        nhomTinhNangSelect
                                            .getValues(),

                                    moTa:
                                        String(
                                            formData
                                                .moTa ||
                                            ''
                                        )
                                            .trim() ||
                                        null,

                                    active:
                                        formData
                                            .active ===
                                        true

                                };

                            },


                            onRecordLoaded(
                                record,
                                mode
                            ) {

                                currentMode =
                                    mode;


                                const dsCoSoId =
                                    Array.isArray(
                                        record
                                            ?.dsCoSoId
                                    )
                                        ? record.dsCoSoId
                                        : [];


                                const dsNhomTinhNangId =
                                    Array.isArray(
                                        record
                                            ?.dsNhomTinhNangId
                                    )
                                        ? record.dsNhomTinhNangId
                                        : [];


                                coSoSelect
                                    .render(
                                        dsCoSoId
                                    );


                                nhomTinhNangSelect
                                    .render(
                                        dsNhomTinhNangId
                                    );


                                renderValueRows(
                                    record
                                        ?.dsGiaTri ||
                                    []
                                );


                                nhomTinhNangSelect
                                    .setDisabled(
                                        mode ===
                                        'view'
                                    );


                                const cauHinh =
                                    record
                                        ?.cauHinh ||
                                    {
                                        ...DEFAULT_CAU_HINH,

                                        maThietLap:
                                            record
                                                ?.maThietLap ||
                                            ''
                                    };


                                if (
                                    record
                                        ?.maThietLap &&
                                    record
                                        ?.cauHinh
                                ) {

                                    cauHinhCache
                                        .set(
                                            String(
                                                record.maThietLap
                                            )
                                                .trim()
                                                .toUpperCase(),

                                            cauHinh
                                        );

                                }


                                applyCauHinhCoSo(
                                    cauHinh,
                                    mode
                                );


                                syncValueActions();

                            },


                            onHeaderAction(
                                {
                                    action,
                                    record
                                },
                                catalogInstance
                            ) {

                                if (
                                    action ===
                                    'cap-nhat-thiet-lap'
                                ) {

                                    capNhatThietLap(
                                        record,
                                        catalogInstance
                                    );

                                }

                            },


                            toolbarActions: [

                                {
                                    action:
                                        'filter',

                                    label:
                                        'Tìm kiếm chi tiết',

                                    icon:
                                        'search'
                                },

                                {
                                    action:
                                        'export-thiet-lap',

                                    label:
                                        'Xuất danh mục thiết lập',

                                    icon:
                                        'download'
                                },

                                {
                                    action:
                                        'import-thiet-lap',

                                    label:
                                        'Nhập danh mục thiết lập',

                                    icon:
                                        'upload'
                                }

                            ],


                            onAction(
                                action,
                                id,
                                catalogInstance
                            ) {

                                if (
                                    action ===
                                    'export-thiet-lap'
                                ) {

                                    exportData();

                                    return;

                                }


                                if (
                                    action ===
                                    'import-thiet-lap'
                                ) {

                                    importData(
                                        catalogInstance
                                    );

                                }

                            }

                        });

            } catch (
                error
            ) {

                console.error(
                    'Không thể khởi tạo danh mục thiết lập.',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Không thể tải danh mục thiết lập.'
                    );

            }

        }


        /*
         * =========================================
         * DATA SOURCE
         * =========================================
         */
        function normalizeActiveRecords(
            data
        ) {

            const records =
                Array.isArray(
                    data
                )
                    ? data
                    : (
                        data?.items ||
                        data?.rows ||
                        data?.danhSach ||
                        data?.data ||
                        []
                    );


            return records
                .filter(
                    item => {

                        const active =
                            item?.active;


                        return (
                            active ===
                                true ||

                            active ===
                                1 ||

                            active ===
                                '1' ||

                            String(
                                active
                            )
                                .trim()
                                .toLowerCase() ===
                            'true'
                        );

                    }
                );

        }


        async function loadNhomTinhNang() {

            try {

                const response =
                    await window.MCS
                        .api
                        .request(
                            API_NHOM_TINH_NANG
                        );


                dsNhomTinhNang =
                    normalizeActiveRecords(
                        response
                            ?.data
                    );

            } catch (
                error
            ) {

                dsNhomTinhNang =
                    [];


                console.error(
                    'Không thể tải nhóm tính năng.',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Không thể tải danh sách nhóm tính năng.'
                    );

            }

        }


        async function loadCoSo() {

            try {

                const response =
                    await window.MCS
                        .api
                        .request(
                            API_CO_SO
                        );


                dsCoSo =
                    normalizeActiveRecords(
                        response
                            ?.data
                    );

            } catch (
                error
            ) {

                dsCoSo =
                    [];


                console.error(
                    'Không thể tải cơ sở.',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Không thể tải danh sách cơ sở.'
                    );

            }

        }


        /*
         * =========================================
         * SYNC SELECT BAN ĐẦU
         * =========================================
         */
        function syncCurrentNhomTinhNang() {

            if (!catalog) {
                return;
            }


            const record =
                catalog
                    .state
                    .selectedId !==
                null

                    ? catalog
                        .state
                        .allData
                        .find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    catalog
                                        .state
                                        .selectedId
                                )
                        )

                    : null;


            nhomTinhNangSelect
                .render(
                    record
                        ?.dsNhomTinhNangId ||
                    []
                );

        }


        function syncCurrentCoSo() {

            if (!catalog) {
                return;
            }


            const record =
                catalog
                    .state
                    .selectedId !==
                null

                    ? catalog
                        .state
                        .allData
                        .find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    catalog
                                        .state
                                        .selectedId
                                )
                        )

                    : null;


            coSoSelect
                .render(
                    record
                        ?.dsCoSoId ||
                    []
                );

        }

        /*
        * =========================================
        * CẬP NHẬT 1 THIẾT LẬP
        * =========================================
        */
        async function capNhatThietLap(
            record,
            catalogInstance
        ) {

            const thietLapId =
                Number(
                    record?.id
                );


            if (
                !Number.isInteger(
                    thietLapId
                ) ||
                thietLapId <= 0
            ) {

                window.MCS
                    ?.toast
                    ?.error(
                        'Không xác định được thiết lập cần cập nhật.'
                    );

                return;

            }


            try {

                const result =
                    await window.MCS
                        .api
                        .request(
                            `${API_BASE}/dong-bo/${encodeURIComponent(
                                thietLapId
                            )}`,
                            {
                                method:
                                    'POST'
                            }
                        );


                window.MCS
                    ?.toast
                    ?.success(
                        result?.message ||
                        'Cập nhật thiết lập thành công.'
                    );


                /*
                * Load lại danh sách
                * để nhận dữ liệu mới nhất.
                */
                await catalogInstance
                    ?.load
                    ?.();


                /*
                * Giống luồng cập nhật giá món ăn:
                * sau khi xử lý xong,
                * mở lại thiết lập vừa xử lý.
                */
                await catalogInstance
                    ?.openUpdate
                    ?.(
                        thietLapId
                    );

            } catch (
                error
            ) {

                console.error(
                    'Cập nhật thiết lập thất bại:',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Cập nhật thiết lập thất bại.'
                    );

            }

        }

        /*
         * =========================================
         * EXPORT
         * =========================================
         */
        async function exportData() {

            try {

                const result =
                    await window.MCS
                        .api
                        .requestFile(
                            `${API_BASE}/xuat-du-lieu`,
                            {
                                method:
                                    'GET'
                            }
                        );


                window.MCS
                    .api
                    .downloadBlob(
                        result.blob,

                        result.fileName ||
                        'dm_thiet_lap.xlsx'
                    );


                window.MCS
                    ?.toast
                    ?.success(
                        'Xuất dữ liệu thành công.'
                    );

            } catch (
                error
            ) {

                console.error(
                    'Xuất dữ liệu thiết lập thất bại:',
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        'Xuất dữ liệu thất bại.'
                    );

            }

        }


        /*
         * =========================================
         * IMPORT
         * =========================================
         */
        function importData(
            catalogInstance
        ) {

            const input =
                document
                    .createElement(
                        'input'
                    );


            input.type =
                'file';

            input.accept =
                '.xlsx,.xls,.xlsm';

            input.hidden =
                true;


            document.body
                .appendChild(
                    input
                );


            input.addEventListener(
                'change',
                async () => {

                    const file =
                        input.files
                            ?.[0];


                    if (!file) {

                        input.remove();

                        return;

                    }


                    try {

                        const body =
                            new FormData();


                        body.append(
                            'file',
                            file
                        );


                        const result =
                            await window.MCS
                                .api
                                .requestFile(
                                    `${API_BASE}/import-du-lieu`,
                                    {
                                        method:
                                            'POST',

                                        body
                                    }
                                );


                        window.MCS
                            .api
                            .downloadBlob(
                                result.blob,

                                result.fileName ||
                                `dm_thiet_lap_import_${Date.now()}.xlsx`
                            );


                        if (
                            catalogInstance
                                ?.load
                        ) {

                            await catalogInstance
                                .load();

                        }


                        window.MCS
                            ?.toast
                            ?.success(
                                'Đã xử lý import. Vui lòng kiểm tra file kết quả.'
                            );

                    } catch (
                        error
                    ) {

                        console.error(
                            'Import dữ liệu thiết lập thất bại:',
                            error
                        );


                        window.MCS
                            ?.toast
                            ?.error(
                                error?.message ||
                                'Import dữ liệu thất bại.'
                            );

                    } finally {

                        input.remove();

                    }

                }
            );


            input.click();

        }

    }
);
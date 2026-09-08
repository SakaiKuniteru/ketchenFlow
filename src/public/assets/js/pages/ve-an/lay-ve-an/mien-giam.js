"use strict";

(() => {
    const app = window.KitchenFlowLayVeAn;

    if (!app) {
        return;
    }

    const {
        root,
        permission,
        API,
        state,
        el
    } = app;

    const byId = (...args) => app.byId(...args);
    const confirmAction = (...args) => app.confirmAction(...args);
    const escapeHtml = (...args) => app.escapeHtml(...args);
    const formatMoney = (...args) => app.formatMoney(...args);
    const normalizeList = (...args) => app.normalizeList(...args);
    const nullableNumber = (...args) => app.nullableNumber(...args);
    const nullableText = (...args) => app.nullableText(...args);
    const reloadPhieu = (...args) => app.reloadPhieu(...args);
    const renderSummary = (...args) => app.renderSummary(...args);
    const request = (...args) => app.request(...args);
    const saveDraft = (...args) => app.saveDraft(...args);
    const setLoading = (...args) => app.setLoading(...args);
    const isFinancialLocked = (...args) => app.isFinancialLocked(...args);
    const renderEditLocks = (...args) => app.renderEditLocks(...args);
    const setSelectValue = (...args) => app.setSelectValue(...args);
    const showError = (...args) => app.showError(...args);

    async function openDiscountModal() {
        if (
            !permission.canCreateDiscount(
                state.permissions
            )
        ) {
            return;
        }

        if (isFinancialLocked()) {
            return;
        }

        try {
            setLoading(true);

            await saveDraft();

            if (el.discountSearch) {
                el.discountSearch.value = "";
            }

            changeDiscountTab(
                "available"
            );

            el.discountModal.hidden = false;

            await reloadDiscounts();
            await loadAvailableDiscounts();
        } catch (error) {
            showError(
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function getManualDiscount() {
        return state.discounts.find(
            item =>
                !item.voucherId &&
                !item.chinhSachId
        ) ||
        null;
    }

    function closeDiscountModal() {
        if (el.discountModal) {
            el.discountModal.hidden = true;
        }
    }

    function changeDiscountTab(name) {
        root.querySelectorAll(
            "[data-discount-tab]"
        )
            .forEach(
                button => {
                    button.classList.toggle(
                        "is-active",
                        button.dataset.discountTab === name
                    );
                }
            );

        root.querySelectorAll(
            "[data-discount-panel]"
        )
            .forEach(
                panel => {
                    panel.hidden = panel.dataset.discountPanel !== name;
                }
            );

        if (
            name ===
            "manual"
        ) {
            renderManualDiscountForm();
        }
    }

    function renderManualDiscountForm() {
        const manual = getManualDiscount();

        const maInput = byId(
            "maMienGiam"
        );

        const tenInput = byId(
            "tenMienGiam"
        );

        const giaTriInput = byId(
            "giaTriMienGiam"
        );

        const lyDoInput = byId(
            "lyDoMienGiam"
        );

        if (maInput) {
            maInput.value =
                manual?.maMienGiam ||
                "";
        }

        if (tenInput) {
            tenInput.value =
                manual?.tenMienGiam ||
                "";
        }

        setSelectValue(
            el.discountType,
            manual?.loaiMienGiam ??
                "",
            false
        );

        if (giaTriInput) {
            giaTriInput.value = formatVietnameseNumberInput(
                manual?.giaTri
            );
        }

        if (lyDoInput) {
            lyDoInput.value =
                manual?.lyDoMienGiam ||
                "";
        }

        if (el.discountCreate) {
            const canSave =
                manual
                    ? permission.canUpdateDiscount(
                        state.permissions
                    )
                    : permission.canCreateDiscount(
                        state.permissions
                    );

            el.discountCreate.hidden =
                !canSave;

            el.discountCreate.textContent =
                manual
                    ? "Cập nhật miễn giảm"
                    : "Thêm miễn giảm";

            el.discountCreate.dataset.manualDiscountId =
                manual?.id ||
                "";
        }
    }

    function bindDiscountSearch() {
        const searchRoot = root.querySelector(
            ".lva-discount-search"
        );

        const input =
            searchRoot?.querySelector(
                "[data-list-search]"
            ) ||
            document.getElementById(
                "mienGiamSearch"
            );

        const clearButton = searchRoot?.querySelector(
            "[data-list-clear-search]"
        );

        if (
            !input ||
            input.dataset.layVeDiscountSearchBound ===
                "true"
        ) {
            return;
        }

        input.dataset.layVeDiscountSearchBound = "true";

        input.addEventListener(
            "input",
            () => {
                const keyword = input.value.trim();

                if (clearButton) {
                    clearButton.hidden = !keyword;
                }

                renderAvailableDiscounts(
                    keyword
                );
            }
        );

        clearButton
            ?.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    input.value = "";
                    clearButton.hidden = true;

                    renderAvailableDiscounts(
                        ""
                    );

                    input.focus();
                }
            );
    }

    function bindGiaTriMienGiamInput() {
        const input = byId(
            "giaTriMienGiam"
        );

        if (
            !input ||
            input.dataset.giaTriMienGiamBound ===
                "true"
        ) {
            return;
        }

        input.dataset.giaTriMienGiamBound = "true";

        input.addEventListener(
            "input",
            () => {
                const raw = String(
                    input.value ||
                    ""
                )
                    .replace(
                        /\s/g,
                        ""
                    );

                const commaIndex = raw.indexOf(
                    ","
                );

                let integerPart =
                    commaIndex ===
                        -1
                        ? raw
                        : raw.slice(
                            0,
                            commaIndex
                        );

                let decimalPart =
                    commaIndex ===
                        -1
                        ? ""
                        : raw.slice(
                            commaIndex +
                            1
                        );

                integerPart =
                    integerPart
                        .replace(
                            /\D/g,
                            ""
                        )
                        .replace(
                            /^0+(?=\d)/,
                            ""
                        );

                decimalPart =
                    decimalPart
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            5
                        );

                const formattedInteger =
                    integerPart
                        .replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            "."
                        );

                input.value =
                    commaIndex !==
                        -1
                        ? `${formattedInteger},${decimalPart}`
                        : formattedInteger;
            }
        );
    }

    function parseVietnameseNumber(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const text = String(
            value
        )
            .trim()
            .replace(
                /\s/g,
                ""
            );

        if (!text) {
            return null;
        }

        const normalized =
            text
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

        const number = Number(
            normalized
        );

        return Number.isFinite(
            number
        )
            ? number
            : null;
    }

    function formatVietnameseNumberInput(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const text = String(
            value
        )
            .trim()
            .replace(
                ",",
                "."
            );

        const parts = text.split(
            "."
        );

        const integerPart = String(
            parts[0] ||
            "0"
        )
            .replace(
                /\D/g,
                ""
            )
            .replace(
                /\B(?=(\d{3})+(?!\d))/g,
                "."
            );

        const decimalPart =
            (
                parts[1] ??
                ""
            )
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    5
                );

        return decimalPart
            ? `${integerPart},${decimalPart}`
            : integerPart;
    }

    async function loadAvailableDiscounts() {
        if (
            !state.phieu ||
            !permission.canLoadAvailableDiscount(
                state.permissions
            )
        ) {
            state.availableDiscounts = [];

            renderAvailableDiscounts(
                ""
            );

            return;
        }

        const response = await request(
            `${API.discount}/kha-dung?phieuLayVeId=${state.phieu.id}`
        );

        state.availableDiscounts = normalizeList(
            response?.data
        );

        renderAvailableDiscounts(
            el.discountSearch?.value ||
            ""
        );
    }

    function getAppliedVoucherDiscount(voucherId) {
        if (!voucherId) {
            return null;
        }

        return state.discounts.find(
            item =>
                Number(
                    item.voucherId
                ) ===
                Number(
                    voucherId
                )
        ) ||
        null;
    }

    function renderAvailableDiscounts(
        searchValue = ""
    ) {
        if (!el.discountAvailable) {
            return;
        }

        const keyword = normalizeSearchText(
            searchValue
        );

        const items =
            !keyword
                ? state.availableDiscounts
                : state.availableDiscounts
                    .filter(
                        item => {
                            const searchText = normalizeSearchText(
                                [
                                    item.tenVoucher,
                                    item.maVoucher,
                                    item.tenChinhSach,
                                    item.maChinhSach,
                                    item.tenMienGiam,
                                    item.maMienGiam,
                                    item.giaTri,
                                    formatDiscountDescription(
                                        item
                                    )
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        " "
                                    )
                            );

                            return searchText
                                .includes(
                                    keyword
                                );
                        }
                    );

        el.discountAvailable.innerHTML = "";

        if (!items.length) {
            el.discountAvailable.innerHTML =
                `
                    <span class="lva-empty">
                        Không tìm thấy miễn giảm phù hợp.
                    </span>
                `;

            return;
        }

        items.forEach(
            item => {
                const appliedDiscount = getAppliedVoucherDiscount(
                    item.voucherId
                );

                const isApplied = Boolean(
                    appliedDiscount
                );

                const row = document.createElement(
                    "div"
                );

                row.className =
                    isApplied
                        ? "lva-available-item is-applied"
                        : "lva-available-item";

                row.className = "lva-available-item";

                const canAction = isApplied
                    ? permission.canDeleteDiscount(
                        state.permissions
                    )
                    : permission.canApplyDiscount(
                        state.permissions
                    );

                row.innerHTML =
                    `
                        <div>

                            <strong>
                                ${escapeHtml(
                                    item.tenVoucher ||
                                    item.maVoucher ||
                                    "Miễn giảm"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    formatDiscountDescription(item)
                                )}
                            </small>

                        </div>

                        ${canAction
                            ? `
                                <button
                                    type="button"
                                    class="
                                        lva-btn
                                        ${isApplied
                                            ? "lva-btn--danger-soft"
                                            : "lva-btn--primary"
                                        }
                                        lva-btn--sm
                                    "
                                    data-voucher-action>

                                    ${
                                        isApplied
                                            ? "Hủy bỏ"
                                            : "Áp dụng"
                                    }

                                </button>
                            `
                            : ""
                        }
                    `;

                row.querySelector(
                    "[data-voucher-action]"
                )
                    ?.addEventListener(
                        "click",
                        async () => {
                            if (appliedDiscount) {
                                if (
                                    !permission.canDeleteDiscount(
                                        state.permissions
                                    )
                                ) {
                                    return;
                                }

                                deleteDiscount(
                                    appliedDiscount.id
                                );

                                return;
                            }

                            try {
                                setLoading(true);

                                if (
                                    !permission.canApplyDiscount(
                                        state.permissions
                                    )
                                ) {
                                    return;
                                }

                                await request(
                                    `${API.discount}/ap-dung`,
                                    "POST",
                                    {
                                        phieuLayVeId: state.phieu.id,
                                        chinhSachId:
                                            item.chinhSachId ??
                                            null,
                                        voucherId: item.voucherId
                                    }
                                );
                                await refreshAfterDiscount();
                                await loadAvailableDiscounts();
                            } catch (error) {
                                showError(
                                    error
                                );
                            } finally {
                                setLoading(false);
                            }
                        }
                    );

                el.discountAvailable
                    .appendChild(
                        row
                    );
            }
        );
    }

    function formatDiscountDescription(item) {
        const loai = Number(
            item?.loaiMienGiam
        );

        const giaTri = Number(
            item?.giaTri
        );

        if (
            !Number.isFinite(
                giaTri
            )
        ) {
            return "Giá trị không hợp lệ";
        }

        let giaTriText = "";

        if (
            loai === 10
        ) {
            giaTriText =
                `Giảm ${giaTri.toLocaleString(
                    "vi-VN",
                    {
                        maximumFractionDigits:
                            5
                    }
                )}%`;
        }
        else if (
            loai === 20
        ) {
            giaTriText =
                `Giảm ${formatMoney(
                    giaTri
                )}`;
        }
        else {
            giaTriText =
                "Loại miễn giảm không hợp lệ";
        }

        if (
            Number.isFinite(
                Number(
                    item?.soTienGiamDuKien
                )
            )
        ) {
            return (
                `${giaTriText} · ` +
                `Dự kiến -${formatMoney(
                    item.soTienGiamDuKien
                )}`
            );
        }

        return giaTriText;
    }

    function normalizeSearchText(value) {
        return String(
            value ??
            ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /đ/g,
                "d"
            )
            .replace(
                /Đ/g,
                "D"
            )
            .toLowerCase()
            .trim();
    }

    async function createManualDiscount() {

        if (isFinancialLocked()) {
            return;
        }

        try {
            setLoading(true);
            await saveDraft();
            await reloadDiscounts();
            const manual = getManualDiscount();
            if (
                manual &&
                !permission.canUpdateDiscount(
                    state.permissions
                )
            ) {
                return;
            }

            if (
                !manual &&
                !permission.canCreateDiscount(
                    state.permissions
                )
            ) {
                return;
            }
            const data = {
                maMienGiam: nullableText(
                    byId(
                        "maMienGiam"
                    )
                        ?.value
                ),
                tenMienGiam: nullableText(
                    byId(
                        "tenMienGiam"
                    )
                        ?.value
                ),
                loaiMienGiam: nullableNumber(
                    byId(
                        "loaiMienGiam"
                    )
                        ?.value
                ),
                giaTri: parseVietnameseNumber(
                    byId(
                        "giaTriMienGiam"
                    )
                        ?.value
                ),
                lyDoMienGiam: nullableText(
                    byId(
                        "lyDoMienGiam"
                    )
                        ?.value
                )
            };

            if (!data.tenMienGiam) {
                throw new Error(
                    "Vui lòng nhập tên miễn giảm."
                );
            }

            if (!data.loaiMienGiam) {
                throw new Error(
                    "Vui lòng chọn loại miễn giảm."
                );
            }

            if (
                !Number.isFinite(
                    data.giaTri
                ) ||
                data.giaTri <= 0
            ) {
                throw new Error(
                    "Giá trị miễn giảm phải lớn hơn 0."
                );
            }

            if (
                Number(
                    data.loaiMienGiam
                ) ===
                    10 &&
                data.giaTri >
                    100
            ) {
                throw new Error(
                    "Miễn giảm phần trăm không được vượt quá 100%."
                );
            }

            if (!data.lyDoMienGiam) {
                throw new Error(
                    "Vui lòng nhập lý do miễn giảm."
                );
            }

            let response;
            if (manual) {
                response = await request(
                    `${API.discount}/cap-nhat/${manual.id}`,
                    "PATCH",
                    data
                );
            }
            else {
                response = await request(
                    `${API.discount}/them-moi`,
                    "POST",
                    {
                        phieuLayVeId: state.phieu.id,
                        ...data
                    }
                );
            }

            await refreshAfterDiscount();

            renderManualDiscountForm();

            window.MCS
                ?.toast
                ?.success
                ?.(
                    response?.message ||
                    (
                        manual
                            ? "Cập nhật miễn giảm thành công."
                            : "Thêm miễn giảm thành công."
                    )
                );

            closeDiscountModal();
        } catch (error) {
            showError(
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function reloadDiscounts() {
        if (
            !state.phieu ||
            !permission.canViewDiscount(state.permissions)
        ) {
            state.discounts = [];
            renderDiscounts();
            return;
        }

        const response = await request(
            `${API.discount}/tong-hop?phieuLayVeId=${state.phieu.id}`
        );

        state.discounts = normalizeList(response?.data);
        renderDiscounts();
    }

    function renderDiscounts() {
        if (!el.discountList) {
            return;
        }

        el.discountList.innerHTML = "";

        const locked = isFinancialLocked();

        if (!state.discounts.length) {
            el.discountList.innerHTML =
                '<span class="lva-empty">Chưa có miễn giảm.</span>';

            renderEditLocks();

            return;
        }

        state.discounts.forEach(
            item => {
                const chip = document.createElement(
                    "div"
                );

                chip.className = "lva-discount-chip";

                chip.innerHTML =
                    `
                        <i class="fa-regular fa-circle-check"></i>

                        <span>
                            ${escapeHtml(
                                item.tenMienGiam ||
                                item.tenVoucher ||
                                item.maMienGiam ||
                                "Miễn giảm"
                            )}
                        </span>

                        <strong>
                            -${escapeHtml(
                                formatMoney(
                                    item.soTienGiam ||
                                    0
                                )
                            )}
                        </strong>
                    `;

                if (
                    permission.canDeleteDiscount(
                        state.permissions
                    )
                ) {
                    const remove = document.createElement(
                        "button"
                    );

                    remove.type = "button";
                    remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    remove.title = "Xóa miễn giảm";
                    remove.disabled = locked;

                    remove.addEventListener(
                        "click",
                        () => {
                            if (isFinancialLocked()) {
                                return;
                            }

                            deleteDiscount(
                                item.id
                            );
                        }
                    );

                    chip.appendChild(
                        remove
                    );
                }

                el.discountList.appendChild(
                    chip
                );
            }
        );

        renderEditLocks();
    }

    async function deleteDiscount(id) {
        if (!permission.canDeleteDiscount(state.permissions)) {
            return;
        }

        if (isFinancialLocked()) {
            return;
        }

        const execute = async () => {
            try {
                setLoading(true);

                await request(
                    `${API.discount}/xoa/${id}`,
                    "DELETE"
                );

                await refreshAfterDiscount();

                if (
                    el.discountModal &&
                    !el.discountModal.hidden
                ) {
                    await loadAvailableDiscounts();
                }
            } catch (error) {
                showError(error);
            } finally {
                setLoading(false);
            }
        };

        confirmAction(
            "Xóa miễn giảm",
            "Bạn có chắc chắn muốn xóa miễn giảm này?",
            "Xóa",
            "danger",
            execute
        );
    }

    async function refreshAfterDiscount() {
        await Promise.all([
            reloadPhieu(),
            reloadDiscounts()
        ]);

        renderSummary();
    }

    Object.assign(
        app,
        {
            openDiscountModal,
            getManualDiscount,
            closeDiscountModal,
            changeDiscountTab,
            renderManualDiscountForm,
            bindDiscountSearch,
            bindGiaTriMienGiamInput,
            parseVietnameseNumber,
            formatVietnameseNumberInput,
            loadAvailableDiscounts,
            getAppliedVoucherDiscount,
            renderAvailableDiscounts,
            formatDiscountDescription,
            normalizeSearchText,
            createManualDiscount,
            reloadDiscounts,
            renderDiscounts,
            deleteDiscount,
            refreshAfterDiscount
        }
    );
})();